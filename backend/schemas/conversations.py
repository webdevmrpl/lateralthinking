import json

from enum import Enum
from typing import Optional, Union
from pydantic import BaseModel, Field, field_serializer

from backend.schemas.story import Story
from backend.schemas.base import LateralBase

import logging

logger = logging.getLogger(__name__)


class ModelData(BaseModel):
    guessed_key_points_indexes: list[int]
    hint_given: bool


class ModelResponse(ModelData):
    response_to_user: str


class ConversationRoles(str, Enum):
    system = "system"
    assistant = "assistant"
    user = "user"


class ConversationMessage(BaseModel):
    role: ConversationRoles
    content: str
    model_data: Optional[ModelData] = None

    def model_dump_with_data(self):
        data = json.loads(self.model_dump_json(exclude={"model_data"}))
        if self.model_data:
            model_data_dict = json.loads(self.model_data.model_dump_json())
            model_data_dict["content"] = data["content"]
            data["content"] = json.dumps(model_data_dict)
        return data


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
    score: int = Field(default=0)
    username: Optional[str] = None

    def model_dump_for_db(self):
        """Serialize for database storage, including model_data in messages"""
        data = self.model_dump(exclude={"id"}, exclude_none=True)
        # Replace messages with their database representation
        data["messages"] = [msg.model_dump_for_db() for msg in self.messages]
        return data

    def update_game_state(self, response: ModelResponse):
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

        user_messages = [msg for msg in self.messages if msg.role == "user"]
        self.score = self.calculate_score(self.hints_used, len(user_messages))

    def calculate_score(
        self,
        hints_used: int,
        total_turns: int,
        *,
        max_hints: int = 3,
    ) -> int:
        h = max(0, min(hints_used, max_hints))
        t = max(1, total_turns)

        base_score = 10_000
        hint_cost_rate = 0.2
        length_penalty_scaling = 8

        score = (
            base_score
            * (1 - h * hint_cost_rate)
            * (1 / (1 + (t - 1) / length_penalty_scaling))
        )
        return int(max(0.0, score))

    def reset_game(self, system_prompt: str):
        self.guessed_key_points = [False for _ in self.story.key_points]
        self.hints_used = 0
        self.progress_percent = 0.0
        self.messages = [
            ConversationMessage(
                role="system",
                content=system_prompt,
            )
        ]


class UserMessage(BaseModel):
    session_id: str
    message: str


class LeaderboardEntry(BaseModel):
    username: str
    total_score: int
    total_games_completed: int
