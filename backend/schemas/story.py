from pydantic import BaseModel, Field


class KeyPoint(BaseModel):
    key_point: str = Field(..., title="Key point of the story")
    hint: str = Field(..., title="Hint for the key point")


class Story(BaseModel):
    title: str = Field(..., title="Title of the story")
    situation: str = Field(..., title="Situation of the story")
    solution: str = Field(..., title="Solution of the story")
    key_points: list[KeyPoint]
