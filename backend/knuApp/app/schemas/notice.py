from pydantic import BaseModel
from datetime import datetime
from typing import List

class NoticeRead(BaseModel):
    articleId: str
    postedDate: str
    subject: str
    category: str
    url: str

    class Config:
        from_attributes = True

class NoticeListResponse(BaseModel):
    notices: List[NoticeRead]