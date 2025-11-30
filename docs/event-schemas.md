Event Schemas

Test Lifecycle Events
- test.session.created
  - session_id: string
  - subject: enum(math|logic)
  - difficulty: int(1-3)
  - num_questions: int

- test.session.graded
  - session_id: string
  - total: int
  - correct: int
  - details: array of { question_id, correct, correct_index, selected_index }

- test.feedback.generated
  - question_id: string
  - selected_index: int
  - message: string
