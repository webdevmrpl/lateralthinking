from enum import Enum
from pathlib import Path
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field

from backend.schemas.story import Story
from backend.schemas.base import LateralBase

import logging

logger = logging.getLogger(__name__)


class ModelResponse(BaseModel):
    response_to_user: str
    guessed_key_points_indexes: Optional[list[int]]
    hint_given: bool


class ConversationRoles(str, Enum):
    system = "system"
    assistant = "assistant"
    user = "user"


class ConversationMessage(BaseModel):
    role: ConversationRoles
    content: str


class KeyPoint(BaseModel):
    key_point: str
    guessed: bool = Field(default=False)


class Conversation(LateralBase):
    id: Optional[str] = Field(default=None, serialization_alias="_id")
    session_id: str
    messages: list[ConversationMessage] = Field(default=[])
    guessed_key_points: list[bool] = Field(default=[])
    hints_used: int = Field(default=0)
    progress_percent: float = Field(default=0.0)
    story: Optional[Story] = None

    def update_system_prompt_with_game_state(self, prompt: str):
        with open(Path(__file__).parent.parent / "prompts" / "game_state.txt") as f:
            game_state = f.read()

        game_state = game_state.format(
            indexes=[
                index for index, value in enumerate(self.guessed_key_points) if value
            ],
            hints_used=self.hints_used,
        )
        for msg in self.messages:
            if msg.role == ConversationRoles.system:
                msg.content = prompt + game_state
                break
        return self

    def update_game_state(self, response: ModelResponse):
        logger.info(f"GPT response: {response}")
        if response.guessed_key_points_indexes:
            for index in response.guessed_key_points_indexes:
                if 0 <= index < len(self.guessed_key_points):
                    self.guessed_key_points[index] = True
                    self.progress_percent = (
                        sum(self.guessed_key_points)
                        / len(self.guessed_key_points)
                        * 100
                    )

        if response.hint_given:
            self.hints_used += 1


class UserMessage(BaseModel):
    session_id: str
    message: str
