"""
Mock agent/orchestrator demonstrating how to register JSON tool schemas
and handle model-initiated function calls using Pydantic validation.

Replace `call_gemini_model` with a real call to Gemini.
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict
from pydantic import BaseModel, ValidationError

from capstone.functions import (
    FUNCTION_REGISTRY,
    TestGenerationRequest,
    AnswerSubmission,
    SocraticFeedbackRequest,
)


TOOLS_DIR = Path("tool_schemas")


def load_tool_schemas() -> Dict[str, Dict[str, Any]]:
    schemas: Dict[str, Dict[str, Any]] = {}
    if TOOLS_DIR.exists():
        for p in TOOLS_DIR.glob("*.json"):
            data = json.loads(p.read_text(encoding="utf-8"))
            name = data.get("name") or p.stem
            schemas[name] = data
    return schemas


def call_gemini_model(system_prompt: str, tool_schemas: Dict[str, Dict[str, Any]], user_msg: str) -> Dict[str, Any]:
    """Mock: Return a synthetic function call instruction based on keywords in user_msg."""
    user = user_msg.lower()
    if "generate test" in user or "start test" in user:
        return {
            "tool": "generate_test",
            "arguments": {"subject": "math", "difficulty": 1, "num_questions": 2},
        }
    if "grade" in user:
        # This is just a placeholder; real flow would include prior session id
        return {
            "tool": "grade_test",
            "arguments": {"session_id": "session_1", "answers": []},
        }
    if "explain" in user or "why" in user:
        return {
            "tool": "generate_socratic_feedback",
            "arguments": {
                "question": {
                    "id": "q_math_1",
                    "text": "What is 2 + 2?",
                    "choices": ["3", "4", "5", "22"],
                    "correct_index": 1,
                    "subject": "math",
                    "difficulty": 1,
                },
                "selected_index": 0,
            },
        }
    return {"text": "I can generate tests, grade submissions, and provide Socratic feedback."}


def _model_for_tool(name: str) -> type[BaseModel] | None:
    return {
        "generate_test": TestGenerationRequest,
        "grade_test": AnswerSubmission,
        "generate_socratic_feedback": SocraticFeedbackRequest,
    }.get(name)


def run(user_message: str) -> Dict[str, Any]:
    schemas = load_tool_schemas()
    instruction = call_gemini_model("You are Dialogos.", schemas, user_message)

    tool = instruction.get("tool")
    if not tool:
        return instruction

    model = _model_for_tool(tool)
    fn = FUNCTION_REGISTRY.get(tool)
    if not model or not fn:
        return {"error": f"Unknown tool: {tool}"}

    try:
        args = model.model_validate(instruction.get("arguments", {}))
    except ValidationError as ve:
        return {"error": "Validation failed", "details": json.loads(ve.json())}

    result = fn(args)  # type: ignore[arg-type]
    return json.loads(result.model_dump_json()) if isinstance(result, BaseModel) else result


if __name__ == "__main__":
    print(json.dumps(run("please generate test"), indent=2))
