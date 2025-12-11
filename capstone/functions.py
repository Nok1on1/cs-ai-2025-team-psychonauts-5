"""
Project-specific function-calling implementations for Dialogos (Week 6-9 Optimized).

Functions:
 - generate_test(request: TestGenerationRequest) -> TestSession
 - grade_test(submission: AnswerSubmission) -> TestResults
 - generate_socratic_feedback(req: SocraticFeedbackRequest) -> SocraticFeedbackResponse

Week 9 Optimizations:
 - Hybrid model selection (80% Gemini Flash, 20% Pro)
 - Cost tracking with token estimation
 - Performance monitoring (latency)
 - Quality validation for AI-generated questions
 - Structured error handling with error codes
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Optional, Any, Tuple
from pydantic import BaseModel, Field, field_validator, model_validator
from enum import Enum
import itertools
import os
import json
import time
from datetime import datetime


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


class DialogosError(Exception):
    """Base exception for Dialogos-specific errors with structured error codes."""
    
    def __init__(
        self,
        error_code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None
    ):
        self.error_code = error_code
        self.message = message
        self.details = details or {}
        super().__init__(message)
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "status": "error",
            "error_code": self.error_code,
            "error_message": self.message,
            "details": self.details,
        }


# In-memory stores for demo scope only
_SESSIONS: Dict[str, TestSession] = {}
_ID_COUNTER = itertools.count(1)


def _next_id(prefix: str) -> str:
    return f"{prefix}_{next(_ID_COUNTER)}"


def _question_bank() -> List[Question]:
    """Tiny question bank for demonstration and fallback."""
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


# ============================================================================
# OPTIMIZATION: Hybrid Model Selection (80% Flash, 20% Pro)
# ============================================================================

def _assess_question_complexity(difficulty: Difficulty, subject: Subject) -> str:
    """
    Route to Flash (80%) or Pro (20%) based on complexity.
    
    This implements the hybrid model strategy from Week 9 optimization:
    - Flash: 16.7x cheaper, suitable for 80% of questions
    - Pro: Better reasoning for complex problems (20% of questions)
    
    Strategy:
    - High difficulty math (level 3) → Pro (complex multi-step reasoning)
    - Everything else → Flash (simple/medium questions)
    
    Returns:
        Model name: "gemini-1.5-flash" or "gemini-1.5-pro"
    """
    # High difficulty math requires advanced reasoning → Pro
    if difficulty == Difficulty.level_3 and subject == Subject.math:
        return "gemini-1.5-pro"
    
    # Everything else → Flash (80% of questions)
    return "gemini-1.5-flash"


# ============================================================================
# OPTIMIZATION: Cost & Performance Tracking
# ============================================================================

def _estimate_tokens(text: str) -> int:
    """
    Rough token estimation for cost tracking.
    Rule of thumb: ~1.3 tokens per word in English.
    """
    if not text:
        return 0
    return int(len(text.split()) * 1.3)


def _log_api_usage(
    model: str,
    input_tokens: int,
    output_tokens: int,
    latency: float,
    success: bool = True,
    error_message: Optional[str] = None
):
    """
    Log API usage for cost tracking and performance monitoring.
    
    Calculates costs based on actual Gemini pricing:
    - Flash: $0.075/1M input, $0.30/1M output
    - Pro: $1.25/1M input, $5.00/1M output
    
    Logs to: docs/evidence/api-usage-log.jsonl (append-only JSONL format)
    """
    # Calculate costs based on model
    if "flash" in model.lower():
        input_cost_usd = (input_tokens / 1_000_000) * 0.075
        output_cost_usd = (output_tokens / 1_000_000) * 0.30
    else:  # Pro
        input_cost_usd = (input_tokens / 1_000_000) * 1.25
        output_cost_usd = (output_tokens / 1_000_000) * 5.00
    
    total_cost_usd = input_cost_usd + output_cost_usd
    total_cost_gel = total_cost_usd * 3.0  # ₾3 = $1 USD
    
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "latency_seconds": round(latency, 3),
        "cost_usd": round(total_cost_usd, 6),
        "cost_gel": round(total_cost_gel, 6),
        "success": success,
        "error": error_message if not success else None,
    }
    
    # Append to log file (create directories if needed)
    try:
        os.makedirs("docs/evidence", exist_ok=True)
        with open("docs/evidence/api-usage-log.jsonl", "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        # Don't fail function if logging fails
        print(f"[WARNING] Failed to log API usage: {e}")


# ============================================================================
# OPTIMIZATION: Quality Validation
# ============================================================================

def _validate_ai_question_quality(questions: List[Question]) -> bool:
    """
    Validate AI-generated questions meet quality standards.
    
    Quality checks (5 criteria):
    1. Question text substantive (min 10 chars)
    2. Appropriate number of choices (2-5)
    3. No empty choices
    4. Valid correct_index
    5. No duplicate choices
    
    Returns:
        True if all questions pass validation, False otherwise
    """
    if not questions:
        return False
    
    for q in questions:
        # Check 1: Question text not empty or too short
        if len(q.text.strip()) < 10:
            print(f"[QUALITY FAIL] Question text too short: '{q.text}'")
            return False
        
        # Check 2: Appropriate number of choices
        if not (2 <= len(q.choices) <= 5):
            print(f"[QUALITY FAIL] Invalid choice count: {len(q.choices)} for question {q.id}")
            return False
        
        # Check 3: No empty choices
        if any(not choice.strip() for choice in q.choices):
            print(f"[QUALITY FAIL] Empty choice detected in question {q.id}")
            return False
        
        # Check 4: Valid correct_index
        if not (0 <= q.correct_index < len(q.choices)):
            print(f"[QUALITY FAIL] Invalid correct_index: {q.correct_index} for question {q.id}")
            return False
        
        # Check 5: No duplicate choices
        if len(set(q.choices)) != len(q.choices):
            print(f"[QUALITY FAIL] Duplicate choices in question {q.id}: {q.choices}")
            return False
    
    return True


# ============================================================================
# Gemini SDK Helpers
# ============================================================================

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

    return None


# ============================================================================
# AI Question Generation (OPTIMIZED)
# ============================================================================

def _gemini_generate_questions(req: TestGenerationRequest) -> Optional[List[Question]]:
    """
    Use Gemini to synthesize questions matching our Question schema.
    
    Week 9 Optimizations:
    - Hybrid model selection (80% Flash, 20% Pro)
    - Cost tracking with token estimation
    - Performance monitoring (latency)
    - Quality validation
    
    Returns:
        List of validated Question objects, or None on failure.
    """
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("[INFO] No Gemini API key found, will use fallback")
        return None

    genai_mod, sdk_kind = _try_import_gemini()
    if not genai_mod:
        print("[INFO] Gemini SDK not installed, will use fallback")
        return None

    # OPTIMIZATION: Select model based on complexity
    model_name = _assess_question_complexity(req.difficulty, req.subject)
    print(f"[OPTIMIZATION] Selected model: {model_name} (difficulty={req.difficulty.value}, subject={req.subject.value})")

    system_inst = (
        "You are Dialogos, an AI tutor for Georgian entrance exams. "
        "Create clear, pedagogically sound multiple-choice questions."
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
        "- Keep questions concise and unambiguous.\n"
        "- No duplicate questions.\n\n"
        "Output shape: { 'questions': [ {question}, ... ] }"
    )

    # OPTIMIZATION: Estimate input tokens for cost tracking
    estimated_input_tokens = _estimate_tokens(system_inst) + _estimate_tokens(instructions)
    print(f"[COST] Estimated input tokens: {estimated_input_tokens}")

    # OPTIMIZATION: Start timer for latency measurement
    start_time = time.time()

    try:
        # Call Gemini API
        if sdk_kind == "genai":
            client = genai_mod.Client(api_key=api_key)
            resp = client.responses.generate(
                model=model_name,
                input=instructions,
                system_instruction=system_inst
            )
        else:
            genai_mod.configure(api_key=api_key)
            model = genai_mod.GenerativeModel(model_name, system_instruction=system_inst)
            resp = model.generate_content(instructions)

        # OPTIMIZATION: Measure latency
        latency = time.time() - start_time

        # Extract text
        text = _extract_text_from_gemini_response(resp)
        if not text:
            _log_api_usage(model_name, estimated_input_tokens, 0, latency, success=False, error_message="No text in response")
            return None

        # OPTIMIZATION: Estimate output tokens
        estimated_output_tokens = _estimate_tokens(text)

        # OPTIMIZATION: Log API usage for cost tracking
        _log_api_usage(
            model_name,
            estimated_input_tokens,
            estimated_output_tokens,
            latency,
            success=True
        )

        print(f"[PERFORMANCE] Latency: {latency:.2f}s | Input: {estimated_input_tokens} tokens | "
              f"Output: {estimated_output_tokens} tokens | Model: {model_name}")

        # Parse JSON
        data = None
        try:
            data = json.loads(text)
        except Exception:
            # Try to extract JSON from markdown code fence
            start = text.find("{")
            end = text.rfind("}")
            if start != -1 and end != -1 and end > start:
                try:
                    data = json.loads(text[start : end + 1])
                except Exception:
                    pass
        
        if not isinstance(data, dict) or "questions" not in data or not isinstance(data["questions"], list):
            print("[ERROR] Invalid JSON structure from Gemini")
            return None

        # Validate and build questions
        questions: List[Question] = []
        for q in data["questions"][: req.num_questions]:
            if not isinstance(q, dict):
                continue
            
            # Ensure required fields exist
            q.setdefault("id", _next_id("q_ai"))
            q.setdefault("subject", req.subject.value)
            q.setdefault("difficulty", int(req.difficulty.value))
            
            try:
                questions.append(Question.model_validate(q))
            except Exception as e:
                print(f"[WARNING] Skipping invalid question: {e}")
                continue

        if not questions:
            print("[ERROR] No valid questions generated")
            return None

        # OPTIMIZATION: Validate quality before returning
        if not _validate_ai_question_quality(questions):
            print("[ERROR] Generated questions failed quality validation")
            return None

        print(f"[SUCCESS] Generated {len(questions)} validated questions")
        return questions[: req.num_questions]

    except Exception as e:
        latency = time.time() - start_time
        _log_api_usage(model_name, estimated_input_tokens, 0, latency, success=False, error_message=str(e))
        print(f"[ERROR] Gemini API call failed: {e}")
        return None


# ============================================================================
# Main Functions
# ============================================================================

def generate_test(request: TestGenerationRequest) -> TestSession:
    """
    Create a test session from the in-memory bank filtered by subject/difficulty.
    
    This is the deterministic fallback when AI generation is unavailable.
    """
    bank = [
        q for q in _question_bank()
        if q.subject == request.subject and q.difficulty <= request.difficulty
    ]
    if not bank:
        raise DialogosError(
            error_code="NO_QUESTIONS_AVAILABLE",
            message=f"No questions available for {request.subject.value} at difficulty {request.difficulty.value}",
            details={
                "subject": request.subject.value,
                "difficulty": request.difficulty.value,
            }
        )
    
    questions = bank[: request.num_questions]
    session = TestSession(session_id=_next_id("session"), questions=questions)
    _SESSIONS[session.session_id] = session
    print(f"[INFO] Generated deterministic test: {session.session_id} with {len(questions)} questions")
    return session


def generate_test_ai(request: TestGenerationRequest) -> TestSession:
    """
    Generate a test session with AI-synthesized questions when possible.
    
    Week 9 Optimizations:
    - Hybrid model selection (80% Flash, 20% Pro)
    - Cost tracking
    - Quality validation
    
    Fallbacks to deterministic question bank when AI unavailable or fails.
    """
    questions = _gemini_generate_questions(request)
    if not questions:
        print("[FALLBACK] AI generation failed, using deterministic question bank")
        return generate_test(request)

    session = TestSession(session_id=_next_id("session"), questions=questions)
    _SESSIONS[session.session_id] = session
    print(f"[SUCCESS] Generated AI test: {session.session_id} with {len(questions)} questions")
    return session


def grade_test(submission: AnswerSubmission) -> TestResults:
    """Grade submitted test answers and return detailed results."""
    session = _SESSIONS.get(submission.session_id)
    if not session:
        raise DialogosError(
            error_code="SESSION_NOT_FOUND",
            message=f"Test session '{submission.session_id}' not found or expired",
            details={"session_id": submission.session_id}
        )

    selected_by_qid: Dict[str, int] = {
        a.question_id: a.selected_index for a in submission.answers
    }

    details: List[QuestionResult] = []
    correct_count = 0

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

    results = TestResults(
        session_id=session.session_id,
        total=len(session.questions),
        correct=correct_count,
        details=details
    )
    
    print(f"[GRADING] Session {session.session_id}: {correct_count}/{len(session.questions)} correct ({results.correct/results.total*100:.1f}%)")
    return results


def generate_socratic_feedback(req: SocraticFeedbackRequest) -> SocraticFeedbackResponse:
    """Generate Socratic-style feedback for student answers."""
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


# Simple registry for LLM tool system
FUNCTION_REGISTRY = {
    "generate_test": generate_test,
    "generate_test_ai": generate_test_ai,
    "grade_test": grade_test,
    "generate_socratic_feedback": generate_socratic_feedback,
}
