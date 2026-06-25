from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
import os
from config import DATA_DIR

DATABASE_PATH = os.path.join(DATA_DIR, 'database.db')

engine = create_engine(f'sqlite:///{DATABASE_PATH}')
Session = sessionmaker(bind=engine)
Base = declarative_base()


class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    upload_time = Column(DateTime, default=datetime.utcnow)

    questions = relationship('Question', back_populates='document', cascade='all, delete-orphan')
    results = relationship('Result', back_populates='document', cascade='all, delete-orphan')


class Question(Base):
    __tablename__ = 'questions'

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
    question = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_answer = Column(String(1), nullable=False)
    explanation = Column(Text, nullable=False)

    document = relationship('Document', back_populates='questions')


class Result(Base):
    __tablename__ = 'results'

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey('documents.id'), nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    wrong_answers = Column(Integer, nullable=False)
    percentage = Column(Float, nullable=False)
    submit_time = Column(DateTime, default=datetime.utcnow)
    answers = Column(JSON, nullable=False)

    document = relationship('Document', back_populates='results')


def init_db():
    Base.metadata.create_all(engine)


def get_session():
    return Session()
