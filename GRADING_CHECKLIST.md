# Grading Checklist - Week 6 & 7 Combined Homework

**Team Name:** psychonauts 5
**Project Title:** dialogos  
**Submission Date:** 12/01/2025  
**Team Members:** G. Mikaberidze, LG. Tskadadze, S. Arabidze, L. Mekoshvili, N. Kvirikashvili

## Part A: Week 6 - Function Calling (110 points)

### Functions Implementation (40 points)
- [ ] **Function 1:** [Name] - Located at: [path/to/file.py]
- [ ] **Function 2:** [Name] - Located at: [path/to/file.py]
- [ ] **Function 3 (if applicable):** [Name] - Located at: [path/to/file.py]
- [ ] Pydantic models defined at: [pydantic-models.py](capstone/models/pydantic_models.py)
- [ ] JSON schemas defined at: [path/to/schemas or agent.py]

**Quick Navigation:**
- Functions code: [Direct link to GitHub file]
- Models code: [Direct link to GitHub file]
- Agent/orchestration: [Direct link to GitHub file]

### Tests & Demo (30 points)
- [ ] Test file located at: [path/to/test_functions.py]
- [ ] All tests pass (screenshot/evidence at: [path or link])
- [ ] Demo video link: [YouTube/Drive URL]
- [ ] Demo video shows: ✅ AI calling functions ✅ Multiple scenarios ✅ Error handling

### Documentation & Code Quality (20 points)
- [ ] README updated with Week 6 section: [Direct link to section]
- [ ] All functions have docstrings: ✅ Yes / ❌ No
- [ ] Type hints present: ✅ Yes / ❌ No
- [ ] Error handling implemented: ✅ Yes / ❌ No
- [ ] No hard-coded API keys: ✅ Confirmed / ❌ Found issues

### GitHub (10 points)
- [ ] Descriptive commit messages used: ✅ Yes
- [ ] .env is NOT in repo: ✅ Confirmed
- [ ] .env.example exists: ✅ Yes
- [ ] All files pushed to main branch: ✅ Confirmed

### Evaluation & Safety Logs (10 points)
Located in: `course-pack/labs/lab-6/`
- [ ] `evaluation_notes.md`: [Direct link]
- [ ] `safety_checklist.md`: [Direct link]
- [ ] `ai_use_log.md`: [Direct link]
- [ ] `capstone_link.md`: [Direct link]

---

## Part B: Week 7 - Design Review (5 points)

### Main Documents
- [ ] Design Review Document: `docs/design-review-week7.md` - [Direct link]
- [ ] Event Schemas: `docs/event-schemas.md` - [Direct link]
- [ ] Updated Architecture Diagram: `docs/architecture-week7.[png/pdf]` - [Direct link]

### Design Review Sections Completed (check all 6)
- [ ] Section 1: Architecture Validation (1-2 pages)
- [ ] Section 2: Event Schema Documentation (2-3 pages)
- [ ] Section 3: Smoke Test Results (1-2 pages)
- [ ] Section 4: Performance Baseline (1 page)
- [ ] Section 5: Hypothesis Validation (1-2 pages)
- [ ] Section 6: Readiness Assessment (1 page)

### Evidence Folder
- [ ] Evidence folder exists at: `docs/evidence/`
- [ ] Contains: Logs, screenshots, performance data, validation results

### README Update
- [ ] README links to design review: [Direct link to README section]
- [ ] README notes architectural changes (if any): ✅ Yes / ❌ No changes

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
