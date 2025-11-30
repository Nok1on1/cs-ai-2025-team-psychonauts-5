## Week 6 — Function Calling (Gemini)

Implemented functions (capstone/functions.py):
1. `generate_test(request: TestGenerationRequest) -> TestSession`
   - Produces a test session from an in-memory question bank.

2. `grade_test(submission: AnswerSubmission) -> TestResults`
   - Grades a TestSession saved in memory and returns detailed results.

3. `generate_socratic_feedback(req: SocraticFeedbackRequest) -> SocraticFeedbackResponse`
   - Deterministic, safe Socratic feedback generator.

Files added:
- `capstone/functions.py` — function implementations and in-memory stores
- `agent_gemini.py` — sample Gemini-compatible tool registration and runner (mock)
- `tool_schemas/*.json` — JSON schemas for function registration (used by the LLM)
- `tests/test_functions.py` — pytest coverage for the three functions
- `demo_script.py` — script to run the end-to-end demo locally

How to run:
1. `python demo_script.py` — run the demo (shows example model-driven function calls).
2. `pytest -q` — run unit tests.

Notes:
- The `agent_gemini.py` includes a mock `call_gemini_model()` function. Replace with your real Gemini call:
  - Send the model your system prompt plus the registered function JSON schemas.
  - Accept the model's function call, validate with Pydantic, execute local function, return the result.

Direct links:
- Functions code: capstone/functions.py
- Models (if needed): capstone/models/pydantic_models.py
- Agent/orchestration: agent_gemini.py
- Tool schemas: tool_schemas/
- Tests: tests/test_functions.py
- Demo: demo_script.py
