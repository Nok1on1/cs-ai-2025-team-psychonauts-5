import pytest

from capstone.functions import (
    generate_test,
    grade_test,
    generate_socratic_feedback,
    TestGenerationRequest,
    AnswerSubmission,
    Answer,
    Subject,
    Difficulty,
    SocraticFeedbackRequest,
)


def test_generate_test_produces_session_math():
    req = TestGenerationRequest(subject=Subject.math, difficulty=Difficulty.level_1, num_questions=2)
    session = generate_test(req)
    assert session.session_id.startswith("session_")
    assert len(session.questions) == 2
    assert all(q.subject == Subject.math for q in session.questions)


def test_grade_test_basic_flow():
    session = generate_test(TestGenerationRequest(subject=Subject.logic, difficulty=Difficulty.level_2, num_questions=2))
    # Choose first option for both
    submission = AnswerSubmission(
        session_id=session.session_id,
        answers=[
            Answer(question_id=session.questions[0].id, selected_index=0),
            Answer(question_id=session.questions[1].id, selected_index=0),
        ],
    )
    results = grade_test(submission)
    assert results.total == 2
    assert results.correct in (0, 1, 2)
    assert len(results.details) == 2


def test_socratic_feedback_correct_and_incorrect():
    session = generate_test(TestGenerationRequest(subject=Subject.math, difficulty=Difficulty.level_1, num_questions=1))
    q = session.questions[0]
    # Incorrect pick
    fb_bad = generate_socratic_feedback(SocraticFeedbackRequest(question=q, selected_index=0))
    assert q.choices[0] in fb_bad.message
    # Correct pick
    fb_good = generate_socratic_feedback(
        SocraticFeedbackRequest(question=q, selected_index=q.correct_index)
    )
    assert "Great job" in fb_good.message
