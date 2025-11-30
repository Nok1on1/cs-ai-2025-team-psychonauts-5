Architecture — Week 7 (Placeholder)

Current Demo Architecture
- Client triggers agent with user intent (generate test / grade / feedback)
- Agent selects tool and validates args via Pydantic
- Function executes against in-memory store and returns structured result

Next Steps (Planned)
- Persist sessions and results in database
- Integrate real LLM calls (Gemini) and telemetry
- Expand question bank and adaptivity logic
