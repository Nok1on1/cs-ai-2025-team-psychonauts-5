# agent_gemini.py
import os
import google.generativeai as genai
from functions import generate_test, grade_test, generate_socratic_feedback
from models.pydantic_models import TestGenerationRequest, AnswerSubmission, SocraticFeedbackRequest

# ---------------------------
# 1. Configure Gemini
# ---------------------------
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# ---------------------------
# 2. Define tools for function calling
# ---------------------------
TOOLS = [
    {
        "name": "generate_test",
        "description": "Generates an entrance exam test",
        "parameters": {
            "type": "object",
            "properties": {
                "subject": {"type": "string"},
                "target_difficulty": {"type": "number"},
                "num_questions": {"type": "number", "default": 10},
                "focus_topics": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["subject", "target_difficulty"]
        },
    },
    {
        "name": "grade_test",
        "description": "Grades a student's test submission",
        "parameters": {
            "type": "object",
            "properties": {
                "test_session_id": {"type": "number"},
                "answers": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "question_index": {"type": "number"},
                            "selected_answer_id": {"type": "string"},
                            "time_spent_seconds": {"type": "number"},
                        },
                        "required": ["question_index", "selected_answer_id", "time_spent_seconds"],
                    },
                },
            },
            "required": ["test_session_id", "answers"],
        },
    },
    {
        "name": "generate_socratic_feedback",
        "description": "Generates Socratic feedback for a student question",
        "parameters": {
            "type": "object",
            "properties": {
                "question_text": {"type": "string"},
                "correct_answer_id": {"type": "string"},
                "student_answer_id": {"type": "string"},
                "topic_tags": {"type": "array", "items": {"type": "string"}}
            },
            "required": ["question_text", "correct_answer_id", "student_answer_id", "topic_tags"],
        },
    },
]

# ---------------------------
# 3. Handle prompts and function calls
# ---------------------------
def handle_prompt_with_tools(prompt: str):
    """
    Sends a prompt to Gemini, executes requested functions, and returns the final response.
    """
    # Ask Gemini
    response = genai.generate(
        model="gemini-1.5-flash",
        prompt=prompt,
        temperature=0,
        max_output_tokens=1000,
        tools=TOOLS,
        tool_calling="auto"  # lets Gemini decide which tool to call
    )

    # Check if Gemini wants to call a function
    candidate = response.output[0]
    function_call = candidate.get("function_call")
    if function_call:
        name = function_call["name"]
        args = function_call.get("arguments", {})

        # Map to Python functions
        if name == "generate_test":
            model_obj = TestGenerationRequest(**args)
            result = generate_test(model_obj).model_dump()
        elif name == "grade_test":
            submission = AnswerSubmission(**args)
            result = grade_test(submission).model_dump()
        elif name == "generate_socratic_feedback":
            req = SocraticFeedbackRequest(**args)
            result = generate_socratic_feedback(req).model_dump()
        else:
            result = {"error": f"Unknown function '{name}'"}

        # Send result back to Gemini for continuation
        followup = genai.generate(
            model="gemini-1.5-flash",
            messages=[candidate, {"function_response": {"name": name, "response": result}}],
            temperature=0,
            max_output_tokens=1000
        )
        return followup.output_text

    # No function call? just return Gemini text
    return candidate.get("content", "")

# ---------------------------
# 4. Quick demo
# ---------------------------
if __name__ == "__main__":
    prompt = "Please generate a math test with difficulty 3"
    output = handle_prompt_with_tools(prompt)
    print("\n=== Gemini Output ===\n")
    print(output)
