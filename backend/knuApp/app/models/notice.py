from sqlalchemy import Column, String, Integer, DateTime, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(String(20), unique=True, index=True) # 학교 사이트 고유 번호
    title = Column(String(500), nullable=False)
    category = Column(String(50), index=True) # 학사, 장학, 취업 등
    posted_at = Column(DateTime, default=datetime.datetime.utcnow)
    url = Column(String(1000))
    content_preview = Column(Text) # 요약 내용
    is_important = Column(Boolean, default=False)