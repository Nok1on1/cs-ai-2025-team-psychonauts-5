# tests/test_functions.py
import pytest
from ..functions import generate_test, grade_test, generate_socratic_feedback, _TEST_SESSIONS
from ..models.pydantic_models import TestGenerationRequest, AnswerSubmission, StudentAnswer

def test_generate_test_basic():
    req = TestGenerationRequest(subject="math", target_difficulty=3, num_questions=3)
    sess = generate_test(req)
    assert sess.id in _TEST_SESSIONS
    assert len(sess.questions) == 3
    assert sess.subject == req.subject

def test_grade_test_basic():
    req = TestGenerationRequest(subject="math", target_difficulty=3, num_questions=2)
    sess = generate_test(req)
    # prepare answers: pick the correct IDs from generated questions
    answers = []
    for idx, q in enumerate(sess.questions):
        answers.append(StudentAnswer(question_index=idx, selected_answer_id=q.correct_answer_id, time_spent_seconds=10))
    submission = AnswerSubmission(test_session_id=sess.id, answers=answers)
    results = grade_test(submission)
    assert results.correct_answers == results.total_questions
    assert results.score_percentage == 100.0

def test_socratic_feedback_min_length():
    req = {
        "question_text": "2+2",
        "correct_answer_id": "B",
        "student_answer_id": "A",
        "topic_tags": ["arithmetic"]
    }
    feedback = generate_socratic_feedback(__import__('models.pydantic', fromlist=['SocraticFeedbackRequest']).SocraticFeedbackRequest(**req))
    assert len(feedback.feedback_text) >= 50
    assert feedback.hint_level in ("gentle", "moderate", "explicit")
