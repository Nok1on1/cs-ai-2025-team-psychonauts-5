# Grading Checklist - Week 6 & 7 Combined Homework

**Team Name:** psychonauts 5
**Project Title:** dialogos  
**Submission Date:** 12/01/2025  
**Team Members:** G. Mikaberidze, LG. Tskhadadze, S. Arabidze, L. Mekoshvili, N. Kvirikashvili

## Part A: Week 6 - Function Calling (110 points)

### Functions Implementation (40 points)
- [x] **Function 1:** generate_test - Located at: capstone/functions.py
- [x] **Function 2:** grade_test - Located at: capstone/functions.py
- [x] **Function 3 (if applicable):** generate_socratic_feedback - Located at: capstone/functions.py
- [x] Pydantic models defined at: [pydantic-models.py](capstone/models/pydantic_models.py) and lightweight models in capstone/functions.py
- [x] JSON schemas defined at: tool_schemas/*.json

**Quick Navigation:**
- Functions code: capstone/functions.py
- Models code: capstone/models/pydantic_models.py
- Agent/orchestration: agent_gemini.py

### Tests & Demo (30 points)
- [x] Test file located at: tests/test_functions.py
- [ ] All tests pass (screenshot/evidence at: docs/evidence/tests-output.txt)
- [ ] Demo video link: [TBD – upload link]
- [x] Demo video shows: ✅ AI calling functions ✅ Multiple scenarios ✅ Error handling

### Documentation & Code Quality (20 points)
- [x] README updated with Week 6 section: readme.md (Week 6 — Function Calling)
- [x] All functions have docstrings: ✅ Yes
- [x] Type hints present: ✅ Yes
- [x] Error handling implemented: ✅ Yes
- [x] No hard-coded API keys: ✅ Confirmed

### GitHub (10 points)
- [ ] Descriptive commit messages used: ✅ Yes
- [ ] .env is NOT in repo: ✅ Confirmed (currently sanitized but tracked; remove from VCS and keep locally)
- [x] .env.example exists: ✅ Yes
- [ ] All files pushed to main branch: ✅ Confirmed

### Evaluation & Safety Logs (10 points)
Located in: `course-pack/labs/lab-6/`
- [x] `evaluation_notes.md`: course-pack/labs/lab-6/evaluation_notes.md
- [x] `safety_checklist.md`: course-pack/labs/lab-6/safety_checklist.md
- [x] `ai_use_log.md`: course-pack/labs/lab-6/ai_use_log.md
- [x] `capstone_link.md`: course-pack/labs/lab-6/capstone_link.md

---

## Part B: Week 7 - Design Review (5 points)

### Main Documents
- [x] Design Review Document: `docs/design-review-week7.md` - docs/design-review-week7.md
- [x] Event Schemas: `docs/event-schemas.md` - docs/event-schemas.md
- [ ] Updated Architecture Diagram: `docs/architecture-week7.[png/pdf]` - [TBD]

### Design Review Sections Completed (check all 6)
- [x] Section 1: Architecture Validation (1-2 pages)
- [x] Section 2: Event Schema Documentation (2-3 pages)
- [x] Section 3: Smoke Test Results (1-2 pages)
- [x] Section 4: Performance Baseline (1 page)
- [x] Section 5: Hypothesis Validation (1-2 pages)
- [x] Section 6: Readiness Assessment (1 page)

### Evidence Folder
- [x] Evidence folder exists at: `docs/evidence/`
- [ ] Contains: Logs, screenshots, performance data, validation results (add test run output/screenshots)

### README Update
- [x] README links to design review: readme.md (Design Review — Week 7)
- [x] README notes architectural changes (if any): ✅ Yes

---

## Part A: Week 6 - Function Calling Implementation (110 points)

By the end of Week 6, your capstone must demonstrate working function calling with proper validation, error handling, and integration.

### 1. Function Implementations (40 points)

Create **2–3 functions** that are specific to your project and integrate them into your capstone. Each function must have clearly defined inputs and outputs, validated with Pydantic.

**Requirements:**
- ✅ Functions are specific to your project (not generic examples)
- ✅ Located in your capstone repository (not in lab folders)
- ✅ Pydantic models defined for all inputs and outputs
- ✅ JSON schemas correctly defined for the LLM
- ✅ Functions execute without errors (mock data OK for Week 6)
- ✅ AI successfully calls your functions in conversations

**Recommended File Structure:**
