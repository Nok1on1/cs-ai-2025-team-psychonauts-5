from typing import List, Dict
from datetime import datetime, timezone
import itertools

from models.pydantic_models import (
    TestGenerationRequest,
    TestSession,
    GeneratedQuestion,
    AnswerChoice,
    QuestionBankItem,
    QuestionMetadata,
    SubjectType,
    DifficultyLevel,
    TestResults,
    QuestionResult,
    AnswerSubmission,
    StudentAnswer,
    SocraticFeedbackRequest,
    SocraticFeedbackResponse,
)

# --- In-memory mock database (minimal) ---
# Minimal question bank (2 sample questions per subject)
_QUESTION_BANK: Dict[int, QuestionBankItem] = {}

def _seed_question_bank():
    if _QUESTION_BANK:
        return
    now = datetime.now(timezone.utc)
    q1 = QuestionBankItem(
        id=1,
        subject=SubjectType.MATH,
        difficulty=DifficultyLevel.LEVEL_2,
        question_text="Solve: 2 + 2",
        answer_choices=[
            AnswerChoice(option_id="A", text="3", is_correct=False),
            AnswerChoice(option_id="B", text="4", is_correct=True),
            AnswerChoice(option_id="C", text="22", is_correct=False),
            AnswerChoice(option_id="D", text="5", is_correct=False),
        ],
        correct_answer_id="B",
        explanation="2+2=4",
        metadata=QuestionMetadata(topic_tags=["arithmetic"], estimated_time_seconds=30),
        created_at=now,
        updated_at=now,
    )
    q2 = QuestionBankItem(
        id=2,
        subject=SubjectType.MATH,
        difficulty=DifficultyLevel.LEVEL_3,
        question_text="Solve for x: x^2 - 5x + 6 = 0",
        answer_choices=[
            AnswerChoice(option_id="A", text="x = 1 or x = 6", is_correct=False),
            AnswerChoice(option_id="B", text="x = 2 or x = 3", is_correct=True),
            AnswerChoice(option_id="C", text="x = -2 or x = -3", is_correct=False),
            AnswerChoice(option_id="D", text="x = 5 or x = 1", is_correct=False),
        ],
        correct_answer_id="B",
        explanation="Factor: (x-2)(x-3)=0",
        metadata=QuestionMetadata(topic_tags=["algebra"], estimated_time_seconds=120),
        created_at=now,
        updated_at=now,
    )
    q3 = QuestionBankItem(
        id=3,
        subject=SubjectType.LOGIC,
        difficulty=DifficultyLevel.LEVEL_2,
        question_text="True or False: If all A are B and all B are C, then all A are C.",
        answer_choices=[
            AnswerChoice(option_id="A", text="True", is_correct=True),
            AnswerChoice(option_id="B", text="False", is_correct=False),
            AnswerChoice(option_id="C", text="Depends", is_correct=False),
            AnswerChoice(option_id="D", text="Cannot say", is_correct=False),
        ],
        correct_answer_id="A",
        explanation="Syllogism transitivity.",
        metadata=QuestionMetadata(topic_tags=["syllogism"], estimated_time_seconds=45),
        created_at=now,
        updated_at=now,
    )
    q4 = QuestionBankItem(
        id=4,
        subject=SubjectType.LOGIC,
        difficulty=DifficultyLevel.LEVEL_4,
        question_text="Which of these statements is a contradiction?",
        answer_choices=[
            AnswerChoice(option_id="A", text="A and not A", is_correct=True),
            AnswerChoice(option_id="B", text="A or not A", is_correct=False),
            AnswerChoice(option_id="C", text="If A then A", is_correct=False),
            AnswerChoice(option_id="D", text="If A then B", is_correct=False),
        ],
        correct_answer_id="A",
        explanation="A and not A is always false.",
        metadata=QuestionMetadata(topic_tags=["logic_forms"], estimated_time_seconds=90),
        created_at=now,
        updated_at=now,
    )

    for q in (q1, q2, q3, q4):
        _QUESTION_BANK[q.id] = q

_seed_question_bank()

# Simple store for test sessions
_TEST_SESSIONS: Dict[int, TestSession] = {}
_TEST_ID_COUNTER = itertools.count(1000)


# ---------------------------
# Function A: generate_test
# ---------------------------
def generate_test(request: TestGenerationRequest) -> TestSession:
    """Create a TestSession populated with GeneratedQuestion objects.
    This uses the in-memory question bank and simple selection rules:
    - Prefer matching subject and close difficulty.
    - If not enough, fill from same subject.
    """
    _seed_question_bank()
    # find candidate questions
    candidates = [
        q for q in _QUESTION_BANK.values() if q.subject == request.subject
    ]
    # sort by closeness to target difficulty
    def diff_score(q):
        return abs(q.difficulty.value - request.target_difficulty.value)

    candidates.sort(key=diff_score)
    selected = candidates[: request.num_questions]
    # if not enough, repeat some mock generation (duplicate allowed for demo)
    generated_questions: List[GeneratedQuestion] = []
    for q in selected:
        gen = GeneratedQuestion(
            question_text=q.question_text,
            answer_choices=q.answer_choices,
            correct_answer_id=q.correct_answer_id,
            difficulty=q.difficulty,
            topic_tags=q.metadata.topic_tags,
            source_question_ids=[q.id],
            retrieval_scores=[1.0],
            generation_timestamp=datetime.now(timezone.utc),
        )
        generated_questions.append(gen)

    # If still short, duplicate the easiest candidate (mock)
    while len(generated_questions) < request.num_questions:
        q = selected[0]
        generated_questions.append(
            GeneratedQuestion(
                question_text=q.question_text,
                answer_choices=q.answer_choices,
                correct_answer_id=q.correct_answer_id,
                difficulty=q.difficulty,
                topic_tags=q.metadata.topic_tags,
                source_question_ids=[q.id],
                retrieval_scores=[0.9],
                generation_timestamp=datetime.now(timezone.utc),
            )
        )

    session_id = next(_TEST_ID_COUNTER)
    session = TestSession(
        id=session_id,
        user_id=0,
        subject=request.subject,
        target_difficulty=request.target_difficulty,
        questions=generated_questions,
        started_at=datetime.now(timezone.utc),
        completed_at=None,
        is_completed=False,
        total_score=None,
    )
    _TEST_SESSIONS[session_id] = session
    return session


# ---------------------------
# Function B: grade_test
# ---------------------------
def grade_test(submission: AnswerSubmission) -> TestResults:
    """Grade a submitted test. Expects the test session to be present in _TEST_SESSIONS."""
    if submission.test_session_id not in _TEST_SESSIONS:
        raise ValueError("Unknown test_session_id")

    session = _TEST_SESSIONS[submission.test_session_id]
    question_results: List[QuestionResult] = []
    correct = 0
    total = len(session.questions)
    # build map index -> correct id
    for ans in submission.answers:
        if ans.question_index < 0 or ans.question_index >= total:
            raise ValueError("Invalid question_index in submission")
        q = session.questions[ans.question_index]
        is_correct = ans.selected_answer_id == q.correct_answer_id
        if is_correct:
            correct += 1
        qr = QuestionResult(
            question_index=ans.question_index,
            question_text=q.question_text,
            student_answer_id=ans.selected_answer_id,
            correct_answer_id=q.correct_answer_id,
            is_correct=is_correct,
            explanation=q.answer_choices[[c.option_id for c in q.answer_choices].index(q.correct_answer_id)].text
            if q.answer_choices
            else None,
            socratic_feedback=None,
        )
        question_results.append(qr)

    score_pct = (correct / total) * 100 if total > 0 else 0.0
    results = TestResults(
        test_session_id=session.id,
        user_id=session.user_id,
        subject=session.subject,
        total_questions=total,
        correct_answers=correct,
        score_percentage=score_pct,
        question_results=question_results,
        completed_at=datetime.now(timezone.utc),
        new_difficulty_estimate=session.target_difficulty,  # naive
    )
    # mark session completed
    session.is_completed = True
    session.completed_at = results.completed_at
    session.total_score = score_pct
    _TEST_SESSIONS[session.id] = session
    return results


# ---------------------------
# Function C: generate_socratic_feedback
# ---------------------------
def generate_socratic_feedback(req: SocraticFeedbackRequest) -> SocraticFeedbackResponse:
    """
    Return a templated Socratic-style feedback string that:
      - Avoids giving the final answer outright (unless hint_level explicit).
      - Asks a short follow-up question.
    For Week 6 demo this is deterministic and uses the question topic.
    """
    # Build a short multi-step hint depending on topic tags
    topics = ", ".join(req.topic_tags) if req.topic_tags else "the topic"
    # gentle hint: point to concept
    hint_text = (
        f"You got a different answer than the correct one. Consider revisiting the underlying concept(s): {topics}. "
        "Which definitions or formulas do you think relate to this problem? "
        "Try to outline the steps you'd take rather than compute the final number right away. "
        "If you want a more explicit nudge, request 'explicit' hint level."
    )
    follow_up = "Which step did you try first?"
    return SocraticFeedbackResponse(
        feedback_text=hint_text,
        hint_level="gentle",
        follow_up_question=follow_up,
        related_concepts=req.topic_tags,
        citations=[],
    )