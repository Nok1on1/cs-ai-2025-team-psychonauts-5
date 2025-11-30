"""
Simple demo script to showcase the function-calling flow end-to-end.
Run: python demo_script.py
"""
from __future__ import annotations

import json

from capstone.functions import (
    generate_test,
    grade_test,
    generate_socratic_feedback,
    TestGenerationRequest,
    AnswerSubmission,
    Answer,
    Subject,
    Difficulty,
)


def main() -> None:
    # 1) Generate a test
    session = generate_test(TestGenerationRequest(subject=Subject.math, difficulty=Difficulty.level_1, num_questions=2))
    print("Generated session:\n", json.dumps(json.loads(session.model_dump_json()), indent=2))

    # 2) Simulate student answers (pick index 0 for all)
    submission = AnswerSubmission(
        session_id=session.session_id,
        answers=[Answer(question_id=q.id, selected_index=0) for q in session.questions],
    )
    results = grade_test(submission)
    print("\nGraded results:\n", json.dumps(json.loads(results.model_dump_json()), indent=2))

    # 3) Generate Socratic feedback for the first question
    fb = generate_socratic_feedback(type("_Req", (), {"question": session.questions[0], "selected_index": 0}))
    print("\nSocratic feedback:\n", json.dumps(json.loads(fb.model_dump_json()), indent=2))


if __name__ == "__main__":
    main()
