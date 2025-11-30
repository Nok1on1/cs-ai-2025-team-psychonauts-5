Safety Checklist (Week 6)

- Data sensitivity: No user PII in demo scope
- API keys: Stored in .env locally; .env.example in repo
- LLM tool safety:
  - Strict JSON schema and Pydantic validation on inputs
  - Deterministic functions; no external side effects
- Logging: Test outputs stored locally (see docs/evidence)
- Prompt injection: Not applicable in demo; validate tool names and args
