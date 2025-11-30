"""
Project-specific function-calling implementations for Dialogos (Week 6).

Functions:
 - generate_test(request: TestGenerationRequest) -> TestSession
 - grade_test(submission: AnswerSubmission) -> TestResults
 - generate_socratic_feedback(req: SocraticFeedbackRequest) -> SocraticFeedbackResponse

These are self-contained, use in-memory stores, and are safe for demo/testing.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator
from enum import Enum
import itertools


class Subject(str, Enum):
    math = "math"
    logic = "logic"


class Difficulty(int, Enum):
    level_1 = 1
    level_2 = 2
    level_3 = 3


class Question(BaseModel):
    id: str
    text: str
    choices: List[str]
    correct_index: int = Field(ge=0)
    subject: Subject
    difficulty: Difficulty

    @model_validator(mode="after")
    def _validate_indices(self):
        if not 0 <= self.correct_index < len(self.choices):
            raise ValueError("correct_index must point to one of the provided choices")
        return self


class TestGenerationRequest(BaseModel):
    subject: Subject
    difficulty: Difficulty = Difficulty.level_1
    num_questions: int = Field(ge=1, le=20, default=5)


class TestSession(BaseModel):
    session_id: str
    questions: List[Question]


class Answer(BaseModel):
    question_id: str
    selected_index: int


class AnswerSubmission(BaseModel):
    session_id: str
    answers: List[Answer]


class QuestionResult(BaseModel):
    question_id: str
    correct: bool
    correct_index: int
    selected_index: Optional[int]


class TestResults(BaseModel):
    session_id: str
    total: int
    correct: int
    details: List[QuestionResult]


class SocraticFeedbackRequest(BaseModel):
    question: Question
    selected_index: int


class SocraticFeedbackResponse(BaseModel):
    question_id: str
    message: str


# In-memory stores for demo scope only
_SESSIONS: Dict[str, TestSession] = {}
_ID_COUNTER = itertools.count(1)


def _next_id(prefix: str) -> str:
    return f"{prefix}_{next(_ID_COUNTER)}"


def _question_bank() -> List[Question]:
    # Tiny question bank just for demonstration
    return [
        Question(
            id="q_math_1",
            text="What is 2 + 2?",
            choices=["3", "4", "5", "22"],
            correct_index=1,
            subject=Subject.math,
            difficulty=Difficulty.level_1,
        ),
        Question(
            id="q_math_2",
            text="What is 3 * 3?",
            choices=["6", "7", "8", "9"],
            correct_index=3,
            subject=Subject.math,
            difficulty=Difficulty.level_1,
        ),
        Question(
            id="q_logic_1",
            text="If all A are B and all B are C, are all A C?",
            choices=["Yes", "No"],
            correct_index=0,
            subject=Subject.logic,
            difficulty=Difficulty.level_1,
        ),
        Question(
            id="q_logic_2",
            text="Which does not belong: 2, 4, 6, 9, 10?",
            choices=["2", "4", "6", "9", "10"],
            correct_index=3,
            subject=Subject.logic,
            difficulty=Difficulty.level_2,
        ),
    ]


def generate_test(request: TestGenerationRequest) -> TestSession:
    """Create a test session from the in-memory bank filtered by subject/difficulty.

    The function does not randomize to keep tests deterministic.
    """
    bank = [
        q for q in _question_bank() if q.subject == request.subject and q.difficulty <= request.difficulty
    ]
    if not bank:
        raise ValueError("No questions available for given subject/difficulty")
    questions = bank[: request.num_questions]
    session = TestSession(session_id=_next_id("session"), questions=questions)
    _SESSIONS[session.session_id] = session
    return session


def grade_test(submission: AnswerSubmission) -> TestResults:
    session = _SESSIONS.get(submission.session_id)
    if not session:
        raise ValueError("Unknown session_id")

    by_id = {q.id: q for q in session.questions}
    details: List[QuestionResult] = []
    correct_count = 0

    selected_by_qid: Dict[str, int] = {a.question_id: a.selected_index for a in submission.answers}

    for q in session.questions:
        sel = selected_by_qid.get(q.id)
        is_correct = sel == q.correct_index
        if is_correct:
            correct_count += 1
        details.append(
            QuestionResult(
                question_id=q.id,
                correct=is_correct,
                correct_index=q.correct_index,
                selected_index=sel if sel is not None else None,
            )
        )

    return TestResults(
        session_id=session.session_id, total=len(session.questions), correct=correct_count, details=details
    )


def generate_socratic_feedback(req: SocraticFeedbackRequest) -> SocraticFeedbackResponse:
    q = req.question
    if req.selected_index == q.correct_index:
        msg = "Great job! You chose the correct answer. Can you explain why it is correct in your own words?"
    else:
        chosen = q.choices[req.selected_index] if 0 <= req.selected_index < len(q.choices) else "(invalid choice)"
        correct = q.choices[q.correct_index]
        msg = (
            f"Let's reflect. You chose '{chosen}'. What evidence in the question text supports that choice? "
            f"Now compare it to the correct reasoning that leads to '{correct}'. Which assumption might have misled you?"
        )
    return SocraticFeedbackResponse(question_id=q.id, message=msg)


# Simple registry that could be exposed to an LLM tool system (for demo only)
FUNCTION_REGISTRY = {
    "generate_test": generate_test,
    "grade_test": grade_test,
    "generate_socratic_feedback": generate_socratic_feedback,
}
