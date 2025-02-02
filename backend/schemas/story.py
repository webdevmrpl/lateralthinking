from typing import Optional
from pydantic import BaseModel, Field
from backend.schemas.base import LateralBase


class KeyPoint(BaseModel):
    key_point: str = Field(..., title="Key point of the story")
    hint: str = Field(..., title="Hint for the key point")


class Story(LateralBase):
    id: Optional[str] = Field(default=None, serialization_alias="_id")
    title: str = Field(..., title="Title of the story")
    situation: str = Field(..., title="Situation of the story")
    solution: str = Field(..., title="Solution of the story")
    key_points: list[KeyPoint]
