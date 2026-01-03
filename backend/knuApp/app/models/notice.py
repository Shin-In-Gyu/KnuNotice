from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.config import Base  # 기존 DB 설정 파일 참고

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)  # 예: bachelor, scholarship
    display_name = Column(String(50), nullable=False)      # 예: 학사공지, 장학공지
    
    notices = relationship("Notice", back_populates="category")

class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(String(50), unique=True, index=True) # 강남대 고유 글 번호 (중복 방지용)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=True)
    url = Column(String(500), nullable=False)
    posted_at = Column(DateTime, nullable=False) # 공지 게시일
    created_at = Column(DateTime(timezone=True), server_default=func.now()) # DB 저장일
    
    # AI 요약 필드 (PDF 요구사항 반영)
    summary_1_line = Column(String(255), nullable=True)
    summary_3_line = Column(Text, nullable=True)
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    category = relationship("Category", back_populates="notices")

class UserSubscription(Base):
    __tablename__ = "user_subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    fcm_token = Column(String(255), index=True, nullable=False) # 푸시용 토큰
    category_id = Column(Integer, ForeignKey("categories.id"))