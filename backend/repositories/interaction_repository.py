import uuid
import logging

from pathlib import Path
from bson import ObjectId
from openai import OpenAI

from backend.schemas.story import Story
from backend.mongo_client import MongoMotorClient
from backend.schemas.conversations import (
    Conversation,
    ConversationMessage,
    ModelResponse,
)

logger = logging.getLogger(__name__)


class InteractionRepository:
    def __init__(self, db):
        self.client = MongoMotorClient(db, "chats")
        self.stories_client = MongoMotorClient(db, "stories")
        self.openai_client = OpenAI()

    async def create_session_id(self):
        return str(uuid.uuid4())

    async def create_system_prompt(
        self,
        story: Story,
    ):
        with open(Path(__file__).parent.parent / "prompts" / "system_prompt.txt") as f:
            template_text = f.read()

        key_points = "; ".join(
            [
                f"Index: {ind}, Key Point: {kp.key_point}, Hint: {kp.hint}"
                for ind, kp in enumerate(story.key_points)
            ]
        )
        filled_text = template_text.format(key_points=key_points, puzzle=story)
        return filled_text

    async def create_conversation_from_story_id(self, story_id: str):
        story_from_db = await self.stories_client.get_item({"_id": ObjectId(story_id)})
        story = Story.model_validate(story_from_db)

        system_promt = await self.create_system_prompt(story=story)

        conversation = Conversation(
            session_id=await self.create_session_id(),
            messages=[
                ConversationMessage(
                    role="system",
                    content=system_promt,
                )
            ],
            story=story,
            guessed_key_points=[False for _ in story.key_points],
        ).update_system_prompt_with_game_state(system_promt)

        await self.client.put_item(conversation.model_dump(exclude={"id"}))

        return conversation

    async def invoke_gpt(self, messages) -> ModelResponse:
        response = self.openai_client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=messages,
            response_format=ModelResponse,
        )
        return response.choices[0].message.parsed

    async def send_message_to_model(self, session_id: str, message: str):
        conversation_json = await self.client.get_item({"session_id": session_id})
        conversation = Conversation.model_validate(conversation_json)
        conversation.messages.append(ConversationMessage(role="user", content=message))

        response = await self.invoke_gpt(
            [msg.model_dump() for msg in conversation.messages]
        )

        conversation.messages.append(
            ConversationMessage(role="assistant", content=response.response_to_user)
        )
        conversation.update_game_state(response)
        conversation.update_system_prompt_with_game_state(
            await self.create_system_prompt(conversation.story)
        )

        await self.client.replace_item(
            conversation.id, conversation.model_dump(exclude={"id"})
        )

        return conversation

    async def get_chat_by_session(self, session_id: str) -> Conversation:
        if resp := await self.client.get_item({"session_id": session_id}):
            return Conversation.model_validate(resp)
        return None
