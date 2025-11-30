# demo_script.py
from agent_gemini import handle_prompt_with_tools
import json

def pretty(obj):
    print(json.dumps(obj, indent=2, default=str))

print("=== Generate Test via Gemini ===")
res = handle_prompt_with_tools("generate test")
pretty(res)

print("\n=== Grade Test via Gemini ===")
res = handle_prompt_with_tools("grade test")
pretty(res)

print("\n=== Socratic Feedback via Gemini ===")
res = handle_prompt_with_tools("feedback")
pretty(res)
