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
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel, Field, field_validator, model_validator
from enum import Enum
import itertools
import os
import json


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


def _try_import_gemini() -> Tuple[Optional[Any], str]:
    """Try to import a Gemini SDK. Returns (module, sdk_kind)."""
    try:
        from google import genai as genai_mod  # type: ignore
        return genai_mod, "genai"
    except Exception:
        pass
    try:
        import google.generativeai as genai_mod  # type: ignore
        return genai_mod, "generativeai"
    except Exception:
        return None, ""


def _extract_text_from_gemini_response(resp: Any) -> Optional[str]:
    """Best-effort text extraction across SDK variants."""
    # resp.text on some versions
    try:
        t = getattr(resp, "text", None)
        if t:
            return t
    except Exception:
        pass

    # candidates[0].content.parts[*].text
    try:
        candidates = getattr(resp, "candidates", [])
        if candidates:
            content = getattr(candidates[0], "content", None)
            parts = getattr(content, "parts", None) if content else None
            if parts:
                chunks: List[str] = []
                for p in parts:
                    if hasattr(p, "text"):
                        chunks.append(getattr(p, "text"))
                    elif isinstance(p, dict) and "text" in p:
                        chunks.append(p["text"])
                if chunks:
                    return "".join(chunks)
    except Exception:
        pass

    # fallback None
    return None


def _gemini_generate_questions(req: TestGenerationRequest) -> Optional[List[Question]]:
    """Use Gemini to synthesize questions matching our Question schema.

    Returns a list of validated Question objects, or None on failure.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    genai_mod, sdk_kind = _try_import_gemini()
    if not genai_mod:
        return None

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    system_inst = os.getenv(
        "GEMINI_SYSTEM_PROMPT",
        "You are Dialogos. You create short, clear multiple-choice questions.",
    )

    instructions = (
        "Create strictly-formatted JSON for multiple-choice questions.\n"
        "Return ONLY JSON, no prose.\n\n"
        "Schema for each question object: {\n"
        "  'id': string,\n"
        "  'text': string,\n"
        "  'choices': array of 2-5 short strings,\n"
        "  'correct_index': integer index into choices (0-based),\n"
        "  'subject': 'math' | 'logic',\n"
        "  'difficulty': 1 | 2 | 3\n"
        "}.\n\n"
        "Requirements:\n"
        f"- subject must be '{req.subject.value}'.\n"
        f"- difficulty should be {req.difficulty.value}.\n"
        f"- Generate exactly {req.num_questions} questions.\n"
        "- Ensure correct_index points to the correct choice.\n"
        "- Keep questions concise and unambiguous.\n\n"
        "Output shape: { 'questions': [ {question}, ... ] }"
    )

    try:
        if sdk_kind == "genai":
            client = genai_mod.Client(api_key=api_key)
            resp = client.responses.generate(
                model=model_name, input=instructions, system_instruction=system_inst
            )
        else:
            genai_mod.configure(api_key=api_key)
            model = genai_mod.GenerativeModel(model_name, system_instruction=system_inst)
            resp = model.generate_content(instructions)

        text = _extract_text_from_gemini_response(resp)
        if not text:
            return None

        # Find JSON block
        data = None
        try:
            data = json.loads(text)
        except Exception:
            # attempt to find code fence
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                data = json.loads(text[start : end + 1])
        if not isinstance(data, dict) or "questions" not in data or not isinstance(data["questions"], list):
            return None

        questions: List[Question] = []
        for i, q in enumerate(data["questions"][: req.num_questions]):  # type: ignore[index]
            # Ensure an id exists
            if not isinstance(q, dict):
                continue
            q.setdefault("id", _next_id("q_ai"))
            q.setdefault("subject", req.subject.value)
            q.setdefault("difficulty", int(req.difficulty.value))
            try:
                questions.append(Question.model_validate(q))
            except Exception:
                # skip invalid
                continue

        if not questions:
            return None
        return questions[: req.num_questions]
    except Exception:
        return None


def generate_test_ai(request: TestGenerationRequest) -> TestSession:
    """Generate a test session with AI-synthesized questions when possible.

    Fallbacks to the deterministic question bank when AI is unavailable or
    generation fails.
    """
    questions = _gemini_generate_questions(request)
    if not questions:
        # Fallback to existing deterministic generator
        return generate_test(request)

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
    "generate_test_ai": generate_test_ai,
    "grade_test": grade_test,
    "generate_socratic_feedback": generate_socratic_feedback,
}
