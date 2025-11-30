"""
Agent/orchestrator that registers JSON tool schemas and executes model-initiated
function calls using Pydantic validation.

Now supports real AI via Google Gemini when configured. Fallbacks to a simple
local heuristic if no API key or SDK is available.

Setup for real AI:
  - Install one of the official Gemini SDKs:
      pip install google-genai    # new SDK (preferred)
      # or
      pip install google-generativeai  # classic SDK
  - Set environment variable:
      GOOGLE_API_KEY=your_api_key_here
  - Optional env vars:
      GEMINI_MODEL=gemini-2.0-flash         # default
      GEMINI_SYSTEM_PROMPT="You are Dialogos."  # default
"""
from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
from copy import deepcopy

from dotenv import load_dotenv
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


def _sanitize_json_schema(schema: Any, *, _in_properties: bool = False) -> Any:
    """Recursively sanitize a JSON Schema for Gemini function parameters.

    Gemini tool/function parameter schemas are a simplified subset. They do not
    accept many JSON Schema validation keywords (e.g., additionalProperties,
    minimum/maximum, minLength/maxLength, pattern, format, etc.). This sanitizer
    applies a strict whitelist of commonly accepted fields and drops everything
    else to prevent errors like "Unknown field for Schema: minimum".

    Kept keys (whitelist):
      - type, properties, items, required, enum, description, title, default
    """
    if isinstance(schema, dict):
        # If we're inside the value of a "properties" object, the keys are user-defined
        # property names (e.g., "subject", "difficulty"). We must preserve those keys
        # and only sanitize their subschemas.
        if _in_properties:
            out_props: Dict[str, Any] = {}
            for prop_name, prop_schema in schema.items():
                out_props[prop_name] = _sanitize_json_schema(prop_schema, _in_properties=False)
            return out_props

        allowed_keys = {"type", "properties", "items", "required", "enum", "description", "title", "default"}

        out: Dict[str, Any] = {}
        for k, v in schema.items():
            if k == "properties" and isinstance(v, dict):
                # Enter properties mapping preserving its keys
                out[k] = _sanitize_json_schema(v, _in_properties=True)
                continue
            if k in allowed_keys:
                out[k] = _sanitize_json_schema(v, _in_properties=False)
            # else drop unsupported key silently

        # Normalize and prune required list to avoid Gemini errors like
        # "parameters.required[i]: property is not defined"
        req = out.get("required")
        props = out.get("properties")
        if isinstance(req, list):
            # keep only string names
            req_names = [x for x in req if isinstance(x, str)]
            if isinstance(props, dict):
                prop_keys = set(props.keys())
                req_names = [x for x in req_names if x in prop_keys]
            if req_names:
                out["required"] = req_names
            else:
                # remove empty or invalid required
                out.pop("required", None)

        return out
    if isinstance(schema, list):
        return [_sanitize_json_schema(x, _in_properties=_in_properties) for x in schema]
    return schema


def _to_gemini_tools(tool_schemas: Dict[str, Dict[str, Any]]) -> Any:
    """Convert our JSON tool schemas into Gemini function declarations.

    Supports both the new `google.genai` (google-genai) and the classic
    `google.generativeai` (google-generativeai) clients by returning a plain
    Python dict structure that both accept.
    """
    # Build in a stable, preference-ordered way: prefer AI generator first
    # so the model is more likely to pick it when creating questions.
    ordered_items = list(tool_schemas.items())
    ordered_items.sort(
        key=lambda kv: (
            0 if kv[0] == "generate_test_ai" else 1,
            kv[0],
        )
    )

    fns = []
    for name, schema in ordered_items:
        fn_decl = {
            "name": schema.get("name", name),
            "description": schema.get("description", ""),
            # Pass a sanitized JSON Schema to satisfy Gemini requirements
            "parameters": _sanitize_json_schema(
                schema.get("parameters", {"type": "object", "properties": {}})
            ),
        }
        fns.append(fn_decl)
    # Both SDKs accept {"function_declarations": [ ... ]} wrapped in a list under "tools"
    return [{"function_declarations": fns}]


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


def _parse_gemini_tool_call(resp: Any) -> Optional[Dict[str, Any]]:
    """Extract a single function call {tool, arguments} from a Gemini response.

    Handles both SDK variants with different response shapes.
    """
    # New SDK (google-genai): response has candidates -> content -> parts with functionCall
    try:
        candidates = getattr(resp, "candidates", None)
        if candidates:
            for cand in candidates:
                content = getattr(cand, "content", None)
                parts = getattr(content, "parts", None) if content else None
                if parts:
                    for p in parts:
                        # New SDK exposes p.function_call or p.functionCall
                        fn_call = getattr(p, "function_call", None) or getattr(p, "functionCall", None)
                        if fn_call:
                            name = getattr(fn_call, "name", None) or fn_call.get("name")
                            args = getattr(fn_call, "args", None) or fn_call.get("args") or {}
                            return {"tool": name, "arguments": args}
                        # Classic dict-like
                        if isinstance(p, dict) and "functionCall" in p:
                            fc = p["functionCall"]
                            return {"tool": fc.get("name"), "arguments": fc.get("args", {})}
        # Classic SDK sometimes puts in resp.candidates[0].content.parts[...] similarly
    except Exception:
        pass

    # Classic SDK: response may have .parts at top-level
    try:
        parts = getattr(resp, "parts", None)
        if parts:
            for p in parts:
                if hasattr(p, "functionCall"):
                    fc = getattr(p, "functionCall")
                    name = getattr(fc, "name", None) or (fc.get("name") if isinstance(fc, dict) else None)
                    args = getattr(fc, "args", None) or (fc.get("args") if isinstance(fc, dict) else {})
                    return {"tool": name, "arguments": args}
                if isinstance(p, dict) and "functionCall" in p:
                    fc = p["functionCall"]
                    return {"tool": fc.get("name"), "arguments": fc.get("args", {})}
    except Exception:
        pass

    return None


def call_gemini_model(system_prompt: str, tool_schemas: Dict[str, Dict[str, Any]], user_msg: str) -> Dict[str, Any]:
    """Call Google Gemini with tool/function calling if available; else fallback.

    Returns either a tool invocation instruction of form:
      {"tool": <name>, "arguments": {..}}
    or a plain assistant message: {"text": "..."}
    """
    load_dotenv()
    # Accept both common env var names for convenience
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("GEMINI_API_KEY/GOOGLE_API_KEY not set, falling back to local heuristic")
        return {"text": user_msg}

    genai_mod, sdk_kind = _try_import_gemini()
    if not genai_mod:
        return {"error": "Gemini SDK not installed. Run 'pip install google-genai' or 'pip install google-generativeai'."}

    model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    system_inst = os.getenv("GEMINI_SYSTEM_PROMPT", system_prompt)
    tools = _to_gemini_tools(tool_schemas)

    try:
        if sdk_kind == "genai":
            # New SDK
            client = genai_mod.Client(api_key=api_key)
            # New SDK supports system_instruction & tools on responses.generate
            resp = client.responses.generate(
                model=model_name,
                input=user_msg,
                system_instruction=system_inst,
                tools=tools,
            )
        else:
            # Classic SDK
            genai_mod.configure(api_key=api_key)
            model = genai_mod.GenerativeModel(model_name, tools=tools, system_instruction=system_inst)
            resp = model.generate_content(user_msg)

        tool_call = _parse_gemini_tool_call(resp)
        if tool_call:
            return tool_call

        # Otherwise return text
        # Try to extract text across SDKs
        text = None
        try:
            text = getattr(resp, "text", None)
        except Exception:
            text = None
        if not text:
            try:
                # Classic/combined: resp.candidates[0].content.parts -> text
                cands = getattr(resp, "candidates", [])
                if cands:
                    parts = getattr(cands[0].content, "parts", []) if getattr(cands[0], "content", None) else []
                    chunks = []
                    for p in parts:
                        if hasattr(p, "text"):
                            chunks.append(getattr(p, "text"))
                        elif isinstance(p, dict) and "text" in p:
                            chunks.append(p["text"])
                    text = "".join(chunks) if chunks else None
            except Exception:
                text = None

        return {"text": text or "(no response)"}
    except Exception as e:
        return {"error": "Gemini call failed", "details": str(e)}


def _model_for_tool(name: str) -> type[BaseModel] | None:
    return {
        "generate_test": TestGenerationRequest,
        "generate_test_ai": TestGenerationRequest,
        "grade_test": AnswerSubmission,
        "generate_socratic_feedback": SocraticFeedbackRequest,
    }.get(name)


def run(user_message: str) -> Dict[str, Any]:
    schemas = load_tool_schemas()
    instruction = call_gemini_model(
        (
            "You are Dialogos. Use tools when helpful. "
            "When the user asks to generate tests or create questions, prefer the function 'generate_test_ai' "
            "over 'generate_test'. Only use 'generate_test' if the user explicitly requests the deterministic bank."
        ),
        schemas,
        user_message,
    )

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
    prompt = input("start Typing Question "
                   "\n example: please generate test of Math Test with Difficulty 1\n")
    print(json.dumps(run(prompt), indent=2))
