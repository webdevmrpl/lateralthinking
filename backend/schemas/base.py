import logging
from typing import Any
from pydantic import BaseModel, model_validator

logger = logging.getLogger(__name__)


class LateralBase(BaseModel):

    @model_validator(mode="before")
    @classmethod
    def validate_model(cls, data: Any):
        if "_id" in data:
            data["id"] = str(data.pop("_id"))
        return data

    def model_dump(self, **kwargs) -> dict[str, Any]:
        kwargs.pop("by_alias", None)
        return super().model_dump(by_alias=True, **kwargs)
