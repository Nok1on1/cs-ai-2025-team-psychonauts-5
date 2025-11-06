# Dialogos — AI-Driven Entrance Exam Tutor

**Project Name:** Dialogos  
**Team Members:** Giorgi Mikaberidze, Nikoloz Kvirikashvili, Sergi Arabidze, Luka Mekoshvili, Lasha Giorgi Tskhadadze  
**Course:** Building AI-Powered Applications  
**Date:** Week 4, November 6, 2025  
**Version:** 2.0 (Updated from Week 2 submission)

---

## 📋 Document Change Log

### What Changed Since Week 2?

| Section | Change Type | Summary |
|---------|-------------|---------|
| Problem Statement | **Refined** | Narrowed focus to Georgian National Entrance Exams based on 8 student and 3 teacher interviews |
| Technical Architecture | **Updated** | Added streaming responses, cost optimization (Gemini Flash vs Pro), deployment delayed to Week 5 |
| Success Criteria | **Enhanced** | Added measurable targets: >75% completion, <3s latency, >85% question quality |
| Risk Assessment | **Expanded** | Added 4 new risks from prototyping: API costs, prompt quality, latency, team capacity |
| Timeline | **Realistic** | Adjusted based on actual velocity: ~40 hours/week capacity (not 50 as planned) |

---

## 1. Problem Statement (Updated)

### The Problem

Georgian students preparing for National Entrance Exams face a critical challenge: existing study resources are either prohibitively expensive (private tutoring at ₾50-80/hour), inflexible (static prep books), or provide minimal meaningful feedback (online platforms with only answer keys).

**Who experiences this?**  
High school students (ages 17-18) in their final year, particularly from middle-income families. Our user research (8 students, 3 teachers) revealed that 7/8 students spend 15+ hours weekly on practice tests that feel "either too easy or impossibly hard" with no calibration to their level.

**Why significant?**  
The Georgian National Entrance Exam determines university placement for ~30,000 students annually. Poor preparation directly impacts academic futures. Students described feeling "stuck in the middle"—bored with trivial questions, discouraged by impossible ones.

**Current solutions & limitations:**
- **Private tutors:** Effective but expensive (₾3,200-5,000/semester)
- **Printed prep books:** Static difficulty, no personalization
- **Existing Georgian EdTech:** Fixed question banks, minimal feedback
- **YouTube tutorials:** Free but generic, not personalized

**Why AI appropriate?**  
AI can dynamically generate unlimited practice questions tailored to weak areas, adapt difficulty in real-time, and provide Socratic-style reasoning prompts that guide students to discover answers themselves.

**Scope:**
- **In Scope:** Adaptive mock exams (Math, Logic, English), Socratic feedback, performance tracking, difficulty calibration
- **Out of Scope:** Live tutoring, LMS integration, mobile apps, multiplayer features

---

## 2. Target Users (Updated)

### User Personas

**Primary User: Mariam the Exam Candidate**
- **Demographics:** 17 years old, 12th grade, Tbilisi public school
- **Context:** Preparing for June 2026 exams, family income ~₾2,000/month, cannot afford private tutoring
- **Goals:** Practice at appropriate difficulty level, understand reasoning behind answers, track progress efficiently
- **Pain Points:** "Most practice tests are too easy or way too hard. I waste time either way."
- **Current Behavior:** 15-20 hours/week on practice problems, handwritten notes, asks teachers during limited hours
- **Success Criteria:** Saves 5+ hours/week, understands concepts not just answers, sees measurable improvement

**Secondary User: Nino the Exam Prep Teacher**
- **Demographics:** 35 years old, private tutor and exam prep instructor, 10 years experience
- **Context:** Teaches 30-40 students per semester, struggles with personalized feedback
- **Goals:** Assign adaptive homework, monitor struggling students, free up grading time
- **Pain Points:** "I can't create different difficulty tests for 40 students. Everyone gets the same worksheet."

### User Validation

**Research Conducted:**
- ✅ Interviewed 8 students (Week 3) - ages 17-18, actively preparing for exams
- ✅ Interviewed 3 teachers (Week 3-4) - private tutors and prep center instructors
- ✅ Observed 2 students using current platforms

**Key Insights:**
1. **Adaptive difficulty is #1 requested feature** - 7/8 students said questions are always too hard or too easy
2. **Students want understanding, not memorization** - 6/8 said they "don't learn anything" from just seeing correct answers
3. **Affordability is major barrier** - All 3 teachers said 60-70% of students cannot afford private tutoring
4. **Performance tracking is highly desired** - Teachers said students don't know where they're weak

---

## 3. Success Criteria (Updated & Measurable)

### Product Success Metrics

| Metric | Target (Week 15) | Measurement Method | Current Baseline |
|--------|------------------|-------------------|------------------|
| **Task Completion Rate** | >75% | User testing: % who generate + complete mock test without help | Not yet measured |
| **Time to Complete Test** | <15 minutes | Timed during user testing (10-question test) | Not yet measured |
| **User Satisfaction** | >4.0/5.0 | Post-test survey (Week 7 & 14) | Not yet measured |
| **Would Recommend** | >70% | "Would you recommend to a friend?" (Yes/No) | Not yet measured |
| **Repeat Usage** | 20+ students complete 3+ tests | Analytics tracking during pilot | 0 users |

### Technical Success Metrics

| Metric | Target | Measurement Method | Current Performance |
|--------|--------|-------------------|---------------------|
| **Question Quality (Relevance)** | >85% | Expert review: teachers rate generated questions | Not yet tested |
| **Question Quality (Correctness)** | 100% | Manual review for mathematical errors | Not yet tested |
| **Response Latency (P95)** | <3 seconds | Backend logging for full request-response | ~4.2 seconds |
| **Cost per Test Generation** | <₾0.30 | Cost tracking logs (Gemini API usage) | ~₾0.45 estimated |

**Critical Finding:** Current latency (4.2s) exceeds target (3s) by 40%. Root cause: verbose prompts (~1500 tokens). **#1 technical priority** for Week 5.

---

## 4. Technical Architecture (Updated)

### Architecture Evolution

**What Changed Since Week 2:**

| Component | Week 2 Plan | Week 4 Reality | Why We Changed |
|-----------|-------------|----------------|----------------|
| **Frontend** | React on Azure Static Web Apps | React (Vite) on Vercel (planned) | Vercel has superior developer experience, faster deployments, better integration with modern tooling |
| **Backend** | Express on Azure App Service | Express on Azure App Service | ✅ No change—Express works well, team is comfortable with Node.js |
| **Database** | MSSQL on Azure | MSSQL on Azure | ✅ No change—relational model fits our data (users → tests → responses hierarchy) |
| **AI Model** | Gemini API | Gemini 1.5 Flash (fast, 80% of queries) + Gemini 1.5 Pro (complex reasoning, 20% of queries) | Cost optimization: Flash is 20x cheaper than Pro; Pro reserved for multi-step logic problems |
| **Deployment** | Planned Week 4 | **Delayed to Week 5** | Prioritized core functionality over deployment; staging environment next week |

**Biggest Learning:**  
We initially underestimated prompt engineering complexity. Generating pedagogically sound questions with appropriate difficulty requires far more careful prompt design than we anticipated. This is now Sergi's primary focus for Week 5-6.

---

### Current Architecture Diagram

```
                 ┌──────────────────────┐
                 │   Student User        │
                 │   (Browser: Desktop   │
                 │    or Mobile Web)     │
                 └──────────┬────────────┘
                            │ HTTPS
                            ▼
                 ┌──────────────────────┐
                 │   React Frontend      │
                 │   (Vite build)        │
                 │   React Router,       │
                 │   Tailwind CSS        │
                 │   Deployed: Vercel    │
                 └──────────┬────────────┘
                            │ REST API (JSON)
                            ▼
                 ┌──────────────────────┐
                 │   Express Backend     │
                 │   (Node.js + JWT)     │
                 │   Hosted: Azure       │
                 │   App Service         │
                 └─────┬──────────┬──────┘
                       │          │
            ┌──────────┘          └───────────┐
            ▼                                 ▼
   ┌─────────────────┐           ┌──────────────────────┐
   │   MSSQL DB       │           │  Gemini API          │
   │   (Azure)        │           │  (Google)            │
   │                  │           │                      │
   │   Tables:        │           │  Models:             │
   │   - Users        │           │  - gemini-1.5-flash  │
   │   - Tests        │           │    (80%, fast+cheap) │
   │   - Responses    │           │  - gemini-1.5-pro    │
   │   - Performance  │           │    (20%, complex)    │
   └─────────────────┘           │                      │
                                  │  Functions:          │
                                  │  - Question gen      │
                                  │  - Feedback gen      │
                                  │  - Difficulty calibr │
                                  └──────────────────────┘
```

---

### Key Components

**1. Frontend (React + Vite)**

**Purpose:** User interface for test configuration, question display, feedback review, performance tracking

**Tech Stack:**
- **React 18:** Component-based UI library
- **Vite:** Build tool (faster than Create React App, modern ES modules)
- **React Router:** Multi-page navigation (dashboard → test → results)
- **Tailwind CSS:** Utility-first styling, responsive design
- **Axios:** HTTP client for API communication
- **Chart.js:** Performance visualizations (accuracy over time, weak topics)

**Key Features:**
- **Test Configuration Screen:** Select subject (Math/Logic/English), difficulty (1-5), number of questions (5/10/15)
- **Question Display:** One question at a time, multiple choice or numeric input, timer optional
- **Feedback Panel:** Socratic prompts for incorrect answers, explanations for correct answers
- **Performance Dashboard:** Line chart (accuracy over time), bar chart (accuracy by topic), weak topic recommendations

**Deployment:** Vercel (free tier, automatic deployment from GitHub main branch)

**Planned URL:** https://dialogos.vercel.app (staging), https://dialogos.ge (production domain if budget allows)

---

**2. Backend (Express + Node.js)**

**Purpose:** API server, business logic orchestration, AI integration, data persistence

**Tech Stack:**
- **Express 4.18:** Web framework for Node.js
- **Node.js 20 LTS:** JavaScript runtime
- **JWT (jsonwebtoken):** Authentication tokens
- **Sequelize:** ORM for MSSQL (SQL query builder, migrations)
- **Google Generative AI SDK:** Official Gemini API client
- **Winston:** Logging library (debug, info, error levels)

**Key API Endpoints:**

| Method | Endpoint | Purpose | Auth Required | Expected Latency |
|--------|----------|---------|---------------|------------------|
| POST | `/api/auth/signup` | Create new user account | No | <500ms |
| POST | `/api/auth/login` | User login, return JWT | No | <300ms |
| POST | `/api/tests/generate` | Generate new adaptive test | Yes | <3s (target), ~4.2s (current) |
| GET | `/api/tests/:id` | Retrieve specific test | Yes | <200ms |
| POST | `/api/tests/:id/submit` | Submit answers, get results | Yes | <2s |
| GET | `/api/tests/:id/feedback` | Get Socratic feedback for incorrect answers | Yes | <2.5s |
| GET | `/api/users/:id/dashboard` | Performance statistics and recommendations | Yes | <500ms |
| GET | `/api/health` | Health check endpoint | No | <100ms |

**Deployment:** Azure App Service (free/student tier for MVP, can scale if needed)

**Planned URL:** https://dialogos-api.azurewebsites.net

---

**3. Database (MSSQL on Azure)**

**Purpose:** Store user accounts, test history, student responses, performance analytics

**Schema (Simplified):**

```sql
-- Users table
CREATE TABLE Users (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) UNIQUE NOT NULL,
    name NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    last_login DATETIME
);

-- Tests table
CREATE TABLE Tests (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    subject NVARCHAR(50) NOT NULL, -- 'Math', 'Logic', 'English'
    difficulty_level TINYINT NOT NULL, -- 1-5 scale
    questions NVARCHAR(MAX) NOT NULL, -- JSON array of question objects
    created_at DATETIME DEFAULT GETDATE(),
    completed_at DATETIME NULL
);

-- Responses table
CREATE TABLE Responses (
    id INT PRIMARY KEY IDENTITY(1,1),
    test_id INT FOREIGN KEY REFERENCES Tests(id) ON DELETE CASCADE,
    question_index INT NOT NULL,
    question_text NVARCHAR(MAX) NOT NULL,
    question_topic NVARCHAR(100) NOT NULL, -- e.g., 'Quadratic Equations', 'Geometry'
    user_answer NVARCHAR(500),
    correct_answer NVARCHAR(500) NOT NULL,
    is_correct BIT NOT NULL,
    time_spent_seconds INT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Performance table (aggregated analytics)
CREATE TABLE Performance (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT FOREIGN KEY REFERENCES Users(id) ON DELETE CASCADE,
    subject NVARCHAR(50) NOT NULL,
    topic NVARCHAR(100) NOT NULL, -- e.g., 'Algebra', 'Geometry', 'Grammar'
    accuracy_percentage DECIMAL(5,2) NOT NULL, -- 0.00 to 100.00
    total_questions INT NOT NULL,
    correct_questions INT NOT NULL,
    updated_at DATETIME DEFAULT GETDATE()
);

-- Indexes for query performance
CREATE INDEX idx_user_tests ON Tests(user_id, created_at DESC);
CREATE INDEX idx_test_responses ON Responses(test_id);
CREATE INDEX idx_user_performance ON Performance(user_id, subject, topic);
```

**Why MSSQL:**
- **Relational structure fits data model:** Users have many tests, tests have many responses, performance is aggregated from responses
- **Strong consistency guarantees:** ACID compliance ensures no data loss (critical for tracking student progress)
- **Familiar to team:** Nikoloz has MSSQL experience from previous projects
- **Free Azure student tier:** $100 Azure credit covers database hosting for entire semester

---

**4. AI Services (Gemini API)**

**Model Selection Strategy:**

We use a **hybrid approach** to balance cost and quality:

```javascript
function selectModel(questionComplexity) {
  // 80% of questions use Flash (fast, cheap)
  // 20% of questions use Pro (slower, expensive, better reasoning)
  
  if (questionComplexity === 'simple' || questionComplexity === 'medium') {
    return 'gemini-1.5-flash'; // Math facts, grammar rules, basic logic
  } else if (questionComplexity === 'complex') {
    return 'gemini-1.5-pro'; // Multi-step proofs, advanced logic puzzles
  }
}
```

**Prompt Structure (Optimized for Token Efficiency):**

**System Prompt (200 tokens, reusable across requests):**
```
You are an expert Georgian National Entrance Exam tutor. 
Generate 10 multiple-choice questions for {subject} at difficulty level {difficulty}/5.
Focus on topics: {weak_topics}.
Format: JSON array with fields: question, options (A-D), correct_answer, topic, explanation.
Ensure pedagogically sound, age-appropriate, aligned with Georgian exam standards.
```

**User Prompt (variable, based on context):**
```
Student performance context:
- Recent accuracy: {accuracy}%
- Weak topics: {topics}
- Strong topics: {strong_topics}

Generate questions that:
1. Target weak areas (60% of questions)
2. Reinforce strong areas (40% of questions)
3. Are appropriately challenging (not too easy, not impossible)
```

**Estimated Token Usage:**
- System prompt: ~200 tokens
- User prompt (with context): ~300 tokens
- AI output (10 questions in JSON): ~2000 tokens
- **Total per request: ~2500 tokens**

**Cost Calculation:**

| Model | Token Price (Input) | Token Price (Output) | Per-Request Cost | Monthly Cost (1000 tests) |
|-------|---------------------|----------------------|------------------|---------------------------|
| Gemini 1.5 Flash | $0.075/1M tokens | $0.30/1M tokens | ~$0.0008 | $0.80 |
| Gemini 1.5 Pro | $1.25/1M tokens | $5.00/1M tokens | ~$0.012 | $12.00 |
| **Blended (80% Flash, 20% Pro)** | — | — | **~$0.003** | **~$3.00** |

**Target:** <₾0.30 ($0.10) per test ✅ **Current estimate:** ₾0.09 ($0.03) per test (well within budget)

---

**5. Authentication (Simple JWT)**

**Purpose:** Secure user accounts, prevent unauthorized access

**Approach:**
- User signs up → backend hashes password (bcrypt), stores in database
- User logs in → backend verifies password, issues JWT token (expires in 7 days)
- Frontend stores JWT in localStorage, includes in Authorization header for all API requests
- Backend middleware verifies JWT on protected routes

**Why not OAuth (Google, Facebook)?**
- **Simplicity:** Building our own auth is faster for MVP, fewer dependencies
- **Learning opportunity:** Team wants to understand authentication fundamentals
- **Future:** Can add OAuth in post-course iteration if users request it

**Security Considerations:**
- Passwords hashed with bcrypt (cost factor 10)
- JWT secret stored in environment variables (not committed to Git)
- HTTPS enforced for all requests (prevents token interception)
- Rate limiting on login endpoint (prevent brute force: max 5 attempts/minute)

---

### Data Flow for Core User Action

**User Flow: Generate and Complete Mock Test**

```
1. User logs in, navigates to "New Test" page
   ↓
2. User selects:
   - Subject: Math
   - Difficulty: Medium (Level 3/5)
   - Number of questions: 10
   ↓
3. User clicks "Generate Test"
   ↓
4. Frontend:
   a. Validates input (subject required, difficulty 1-5)
   b. Shows loading spinner: "Generating personalized questions..."
   c. POST /api/tests/generate with {userId, subject, difficulty, numQuestions}
   ↓
5. Backend (Express):
   a. Authenticates user (verify JWT token)
   b. Query database: retrieve user's recent performance
      - Recent accuracy: 68% (suggests Medium difficulty appropriate)
      - Weak topics: "Quadratic Equations" (45% accuracy), "Geometry Proofs" (52%)
      - Strong topics: "Linear Equations" (88%), "Basic Algebra" (92%)
   c. Build Gemini prompt with context:
      - System: "Generate 10 Math questions at difficulty 3/5"
      - User: "Focus 60% on Quadratic Equations and Geometry, 40% on review"
   d. Determine question complexity distribution:
      - 8 questions: simple/medium → use gemini-1.5-flash
      - 2 questions: complex multi-step → use gemini-1.5-pro
   e. Call Gemini API (2 separate calls for Flash and Pro)
      - Flash call: ~1.5s for 8 questions
      - Pro call: ~2s for 2 questions
      - Parallel execution (Promise.all) → total ~2s
   f. Receive JSON responses:
      [{question: "...", options: ["A", "B", "C", "D"], correctAnswer: "B", topic: "Quadratic Equations", explanation: "..."}]
   g. Validate AI output (all required fields present, 10 questions total)
   h. Store test in database (Tests table) with questions as JSON
   i. Return {testId, questions[]} to frontend
   ↓
6. Frontend:
   a. Hide loading spinner (~2-2.5s total wait time)
   b. Display Question 1 of 10:
      - Question text
      - Multiple choice options (radio buttons)
      - "Next" button
      - Timer (optional, can be toggled off)
   ↓
7. User reads question, selects answer, clicks "Next"
   ↓
8. Frontend:
   a. Store answer in local state
   b. Display Question 2 of 10
   c. Repeat until all 10 questions answered
   ↓
9. User completes all 10 questions (average time: 12-15 minutes)
   ↓
10. Frontend shows "Review Answers" screen with option to change answers
    ↓
11. User clicks "Submit Test"
    ↓
12. Frontend:
    a. POST /api/tests/:id/submit with {answers: [{questionIndex: 0, userAnswer: "B"}, ...]}
    b. Show loading: "Grading your test..."
    ↓
13. Backend:
    a. Retrieve test from database
    b. Grade answers (compare userAnswer with correctAnswer)
    c. Calculate score: 7/10 = 70%
    d. Store each answer in Responses table with:
       - is_correct (true/false)
       - question_topic
       - time_spent (if tracked)
    e. Update Performance table:
       - Recalculate accuracy per topic
       - Example: "Quadratic Equations" accuracy now 48% (was 45%)
    f. For incorrect answers: call Gemini API for Socratic feedback
       - Prompt: "Student answered '{userAnswer}' but correct is '{correctAnswer}'. 
                  Provide a Socratic hint that guides them to discover why, without 
                  giving away the answer directly."
       - Example response: "What happens when you substitute x=2 into the equation? 
                           What does the result tell you about whether x=2 is a solution?"
    g. Return to frontend:
       - Score: 7/10 (70%)
       - Results per question: [{correct: true/false, userAnswer, correctAnswer, feedback}]
       - Suggested next difficulty: "Stay at Medium" (since 70% is good but not mastered)
       - Updated weak topics: ["Quadratic Equations" (48%), "Geometry Proofs" (52%)]
    ↓
14. Frontend displays Results Screen:
    a. Score banner: "7 out of 10 correct! (70%)"
    b. Per-question breakdown:
       - ✅ Question 1: Correct
       - ❌ Question 2: Incorrect → Show Socratic feedback in expandable card
       - ✅ Question 3: Correct
       - (etc.)
    c. Feedback interaction:
       - User clicks "Show Hint" for incorrect answers
       - Socratic prompt appears: "Think about what happens when..."
       - User can click "Show Full Explanation" if still stuck
    d. Recommendation box:
       - "You're making progress! Try another Medium test to solidify these concepts."
       - "Focus on: Quadratic Equations (48% accuracy)"
    e. Buttons:
       - "Take Another Test"
       - "View Dashboard"
    ↓
15. User clicks "View Dashboard"
    ↓
16. Frontend: GET /api/users/:id/dashboard
    ↓
17. Backend:
    a. Query Performance table for user's all-time statistics
    b. Calculate:
       - Accuracy over time (group by week)
       - Accuracy by subject and topic
       - Improvement trends
    c. Return:
       - Line chart data: [{week: "Week 1", accuracy: 58%}, {week: "Week 2", accuracy: 65%}, ...]
       - Bar chart data: [{topic: "Algebra", accuracy: 88%}, {topic: "Geometry", accuracy: 52%}, ...]
       - Weak topics: ["Geometry Proofs", "Quadratic Equations"]
       - Recommended focus: "Practice more Geometry Proofs (52% → goal: 75%)"
    ↓
18. Frontend displays Performance Dashboard:
    a. Line chart: Accuracy improving from 58% → 70% over 4 weeks
    b. Bar chart: Topic-level breakdown
    c. Weak topics highlighted in red
    d. "Generate Focused Test" button → auto-fills test config with weak topics
```

---

### Latency Budget (Critical Path Analysis)

| Step | Target Latency | Current Performance (Week 4) | Status | Optimization Plan |
|------|----------------|------------------------------|--------|-------------------|
| Frontend validation | <100ms | ~50ms | ✅ On track | None needed |
| API request (network) | <200ms | ~150ms | ✅ On track | None needed |
| Database query (user history) | <100ms | Not yet tested | ⚠️ Unknown | Add indexes Week 5 |
| Gemini API call (Flash) | <1500ms | ~2000ms | 🔴 TOO SLOW | Optimize prompt Week 5 (reduce 1500→800 tokens) |
| Gemini API call (Pro) | <2500ms | Not yet tested | ⚠️ Unknown | Acceptable for 20% of queries |
| Database write (store test) | <100ms | Not yet tested | ⚠️ Unknown | Should be fast with indexes |
| Frontend render results | <200ms | ~300ms | ⚠️ SLOW | Optimize React rendering Week 6 |
| **Total (P95, Flash path)** | **<3000ms** | **~4200ms** | 🔴 **MUST OPTIMIZE** | Target: 2.5s after Week 5 optimizations |

**Primary Bottleneck:** Gemini API latency (2s out of 4.2s = 48% of total time)

**Optimization Strategy (Week 5):**
1. **Reduce prompt tokens:** 1500 tokens → 800 tokens (expect 30% latency reduction)
   - Remove verbose instructions
   - Use more concise system prompt
   - Cache user performance summary (don't recalculate every time)
2. **Streaming responses:** Display questions as they're generated (perceived speed improvement)
3. **Database indexing:** Add indexes on user_id, test_id, created_at (expect queries <50ms)
4. **Frontend optimization:** Use React.memo to prevent unnecessary re-renders

**Target After Optimization:** <2.5 seconds (17% better than 3s goal) 🎯

---

### Technology Stack Justification

| Technology | Why We Chose It | Alternatives Considered | Tradeoff |
|------------|-----------------|-------------------------|----------|
| **React** | Team familiar, large ecosystem, component reusability | Vue (simpler), Svelte (faster) | Pro: Fast development; Con: Larger bundle size |
| **Express** | Simple, lightweight, team knows Node.js well | FastAPI (Python, async native), Django | Pro: Team velocity; Con: Less structured than Django |
| **MSSQL** | Free Azure tier, relational fits data model, team experience | PostgreSQL (better features), MongoDB (flexible schema) | Pro: Familiar + free; Con: Azure lock-in |
| **Gemini API** | Best cost/quality ratio, structured output, educational use case | GPT-4 (more expensive), Claude (better reasoning but pricier) | Pro: Cheap + good quality; Con: Newer, less community support |
| **Vercel** | Free tier, excellent DX, auto-deploy from GitHub | Netlify (similar), Azure Static Web Apps (ecosystem consistency) | Pro: Zero config; Con: Vendor lock-in |
| **Azure App Service** | Free student tier, MSSQL integration, team has Azure credits | Railway (better UX), Heroku (deprecated free tier) | Pro: All Azure ecosystem; Con: Slower than Railway |

**Key Decision Rationale:**
- **Gemini over GPT-4:** 10-20x cheaper for comparable quality on educational content generation
- **MSSQL over PostgreSQL:** Team already has MSSQL experience, free Azure credits available
- **React over Vue:** All team members know React from previous coursework

---

### Security & Privacy Considerations

**Implemented (Week 4):**
- ✅ HTTPS enforced for all API requests (no plaintext data transmission)
- ✅ JWT authentication (users must log in, tokens expire after 7 days)
- ✅ Environment variables for API keys (`.env` file not committed to Git)
- ✅ Input validation on all endpoints (sanitize user input, prevent injection)
- ✅ Password hashing with bcrypt (cost factor 10, cannot reverse-engineer passwords)

**Planned (Week 5-7):**
- 📅 **Rate limiting** (Week 5): Max 20 test generations per user per day (prevent API abuse)
- 📅 **API cost caps** (Week 5): Hard limit ₾60 ($20) per day to prevent budget exhaustion
- 📅 **CORS configuration** (Week 6): Allow only frontend domain (prevent unauthorized access)
- 📅 **SQL injection protection** (Week 6): Using Sequelize ORM with parameterized queries
- 📅 **Student data minimization** (Week 7): Store only essential data (email, name, test history)
  - Do NOT store: physical address, phone numbers, payment info, sensitive personal details
- 📅 **Data retention policy** (Week 10): Test history kept for 6 months, then archived/deleted

**Known Technical Debt (Week 4):**
1. ❌ **No caching layer** → Planned Week 6 (Redis for user performance summaries, reduce DB load)
2. ❌ **No automated testing** → Planned Week 6 (Jest for backend unit tests, Cypress for frontend E2E)
3. ❌ **No monitoring/alerting** → Planned Week 8 (Azure Application Insights for error tracking)
4. ❌ **No database backups** → Planned Week 7 (daily automated backups to Azure Blob Storage)
5. ❌ **Hardcoded prompts in code** → Planned Week 6 (move to config file for A/B testing)

---

## 5. Risk Assessment (Updated & Expanded)

### Risk Matrix

| Risk ID | Risk | Likelihood | Impact | Severity | Status |
|---------|------|------------|--------|----------|--------|
| **R1** | API cost overruns | HIGH | HIGH | 🔴 CRITICAL | Mitigating |
| **R2** | Low quality AI questions | MEDIUM | HIGH | 🔴 CRITICAL | Monitoring |
| **R3** | Unacceptable latency (>3s) | HIGH | MEDIUM | 🟡 HIGH | Mitigating |
| **R4** | Team availability during midterms | HIGH | MEDIUM | 🟡 HIGH | Planning |
| **R5** | Students don't find it useful | MEDIUM | HIGH | 🔴 CRITICAL | Validating |

# Risk Assessment for Dialogos AI Tutor

## Project Overview
**Dialogos** is an AI-powered entrance exam tutor for Georgian students, providing adaptive practice tests with Socratic feedback.

**Technical Stack**: React/Vercel frontend, Express/Azure backend, MSSQL database, Gemini API  
**Team**: 5 students with varying experience levels  
**Timeline**: 15-week capstone with major milestones at Weeks 7, 11, and 15

---

## 🔧 Technical Risks

### API Cost Overruns
**Likelihood**: HIGH | **Impact**: HIGH | **Severity**: 🔴 CRITICAL

**Description**: Gemini API costs could exhaust ₾150 semester budget within days due to unoptimized prompts and no usage controls

**Current Status**: 
- ₾0.45 per test (unoptimized)
- Would exceed budget with 30 pilot users

**Preventive Mitigation**:
- Implement rate limiting (20 tests/user/day)
- Switch to 80% Gemini Flash / 20% Pro model split
- Optimize prompts from 2800→1500 tokens
- Set up automated cost alerts at ₾6/day threshold

**Contingency Plan**:
- Switch to Flash-only model
- Reduce test length from 10→5 questions
- Use pre-written question bank as fallback

**Monitoring**: Daily cost dashboard, weekly budget reviews, usage analytics

---

### Unacceptable Latency (>3s)
**Likelihood**: HIGH | **Impact**: MEDIUM | **Severity**: 🟡 HIGH

**Description**: Current 4.2s response time exceeds user attention threshold, risking abandonment

**Root Cause**: Verbose prompts (2800 tokens), unoptimized database queries

**Preventive Mitigation**:
- Prompt optimization (target: 1500 tokens)
- Database indexing on user_id, test_id, created_at
- Implement streaming responses for perceived speed
- Add progress indicators during generation

**Contingency Plan**:
- Background job queue with polling
- Reduce test complexity
- Accept 3.5s as temporary compromise

**Monitoring**: P95 latency tracking, user satisfaction scores, abandonment rates

---

### Low Quality AI-Generated Questions
**Likelihood**: MEDIUM | **Impact**: HIGH | **Severity**: 🔴 CRITICAL

**Description**: AI may generate incorrect, ambiguous, or pedagogically poor questions, destroying user trust

**Current Status**: ~60-70% quality estimate from prototyping (below 85% target)

**Preventive Mitigation**:
- Create golden set of 50 expert-reviewed questions
- Implement multi-pass generation for math problems
- Add confidence scoring (<0.7 requires review)
- Improve prompt specificity with examples

**Contingency Plan**:
- Hybrid approach: AI generates, teacher reviews
- Manual question bank fallback
- "Beta" warning for AI-generated content

**Monitoring**: Weekly quality audits, user flag rates, teacher approval ratings

---

### Database Performance Issues
**Likelihood**: LOW | **Impact**: MEDIUM | **Severity**: 🟢 MEDIUM

**Description**: MSSQL may struggle with 100+ concurrent users, slow query performance

**Preventive Mitigation**:
- Implement proper indexing strategy
- Use connection pooling
- Add Redis caching for user performance summaries
- Query optimization and monitoring

**Contingency Plan**:
- Scale Azure database tier
- Implement read replicas
- Add query timeouts and circuit breakers

**Monitoring**: Query performance metrics, connection pool usage, response times

---

## 📊 Product Risks

### Students Don't Find It Useful
**Likelihood**: MEDIUM | **Impact**: HIGH | **Severity**: 🔴 CRITICAL

**Description**: Poor UX, confusing feedback, or misaligned difficulty could lead to low adoption

**Preventive Mitigation**:
- Week 7 user testing with 5 students
- Iterative design based on feedback
- Clear value proposition: "adaptive questions at your level"
- Simple, intuitive interface

**Contingency Plan**:
- Emergency UX redesign (Weeks 8-9)
- Simplify to core features only
- Pivot feedback approach based on user preferences

**Monitoring**: Task completion rates, satisfaction scores, repeat usage metrics

---

### Difficulty Calibration Failure
**Likelihood**: MEDIUM | **Impact**: HIGH | **Severity**: 🔴 CRITICAL

**Description**: Adaptive algorithm may not correctly match questions to student skill level

**Current Approach**: Simple rule-based (accuracy >80% → increase difficulty)

**Preventive Mitigation**:
- Research Item Response Theory and Elo rating systems
- Implement rolling averages (last 5 tests)
- Add confidence intervals for adjustments
- Week 8 simulation with synthetic users

**Contingency Plan**:
- Fall back to manual difficulty selection
- Teacher-set difficulty levels
- Fixed difficulty test banks

**Monitoring**: Accuracy distributions per level, user feedback on challenge level

---

### Scope Creep
**Likelihood**: MEDIUM | **Impact**: MEDIUM | **Severity**: 🟡 HIGH

**Description**: Adding features beyond core MVP risks missing deadlines

**Preventive Mitigation**:
- Feature freeze after Week 8
- Weekly scope review in standups
- Prioritization framework (P1/P2/P3)
- Team veto power for scope changes

**Contingency Plan**:
- Cut features in predefined priority order
- Focus on core test generation + feedback
- Defer dashboard, analytics, English subject

**Monitoring**: Milestone completion rates, feature completion vs. plan

---

## 👥 Team Risks

### Midterm Exam Impact (Week 9)
**Likelihood**: HIGH | **Impact**: MEDIUM | **Severity**: 🟡 HIGH

**Description**: Team capacity drops significantly during midterm week

**Preventive Mitigation**:
- Frontload critical work to Weeks 5-8
- Cross-training sessions (Week 5)
- Buffer tasks allocated for Week 9
- Reduce meeting overhead

**Contingency Plan**:
- Redistribute tasks among available members
- Push deployment to Week 11 if needed
- Accept reduced velocity for one week

**Monitoring**: Individual availability schedules, task completion rates

---

### No Production Deployment Experience
**Likelihood**: HIGH | **Impact**: MEDIUM | **Severity**: 🟡 HIGH

**Description**: Team lacks experience deploying full-stack applications to production

**Preventive Mitigation**:
- Deploy to staging in Week 5 (not Week 10)
- Pair with instructor during office hours
- Document deployment process thoroughly
- Allocate 2 full days for deployment troubleshooting

**Contingency Plan**:
- Switch to simpler hosting (Vercel + Railway)
- Demo on localhost as last resort
- Seek external deployment help

**Monitoring**: Staging deployment success, deployment documentation completeness

---

### Key Person Dependencies
**Likelihood**: MEDIUM | **Impact**: MEDIUM | **Severity**: 🟡 HIGH

**Description**: Critical knowledge concentrated with individual team members

**Current State**: Giorgi (backend/API), Sergi (AI/prompts), Nikoloz (database)

**Preventive Mitigation**:
- Cross-training sessions in Week 5
- Comprehensive documentation
- Pair programming on critical components
- Code reviews with knowledge sharing

**Contingency Plan**:
- Redistribute tasks based on available skills
- Focus on core functionality if experts unavailable
- Seek instructor guidance for critical issues

**Monitoring**: Documentation coverage, cross-training completion, bus factor assessment

---

## 🛡️ Ethical & Safety Risks

### Mathematical Errors in Questions
**Likelihood**: MEDIUM | **Impact**: HIGH | **Severity**: 🔴 CRITICAL

**Description**: AI-generated math questions with incorrect answers could mislead students

**Preventive Mitigation**:
- Multi-pass verification for math problems
- Zero tolerance for mathematical errors
- Teacher review of math question patterns
- Confidence scoring with manual review threshold

**Contingency Plan**:
- Disable math question generation if error rate >1%
- Use verified question bank for math
- Clear labeling of AI-generated content

**Monitoring**: Error rates in golden set, user-reported issues, teacher validation

---

### Prompt Injection Attacks
**Likelihood**: LOW | **Impact**: MEDIUM | **Severity**: 🟢 MEDIUM

**Description**: Malicious users could manipulate prompts to generate inappropriate content

**Preventive Mitigation**:
- Input sanitization and validation
- System prompt guardrails
- Rate limiting and usage monitoring
- Separate user content from system prompts

**Contingency Plan**:
- Immediate blocking of abusive users
- Prompt revision and hardening
- Content filtering on outputs

**Monitoring**: Unusual prompt patterns, user reports, content quality checks

---

### Student Data Privacy
**Likelihood**: LOW | **Impact**: HIGH | **Severity**: 🟡 HIGH

**Description**: Sensitive student performance data could be exposed

**Preventive Mitigation**:
- Data minimization (store only essential information)
- 6-month data retention policy
- Secure authentication (JWT + HTTPS)
- Environment variables for secrets

**Contingency Plan**:
- Immediate data purge if breach suspected
- User notification procedures
- Security audit and hardening

**Monitoring**: Access logs, security scanning, compliance checks

---

## Risk Mitigation Roadmap

### Immediate Actions (Week 5)
- [ ] Implement rate limiting and cost controls
- [ ] Optimize prompts for latency and cost
- [ ] Create golden set of 50 questions
- [ ] Deploy to staging environment
- [ ] Begin cross-training sessions

### Short-term Actions (Weeks 6-7)
- [ ] Implement confidence scoring and error handling
- [ ] Add "Report Question" feature
- [ ] Conduct first user testing round
- [ ] Set up monitoring and alerting
- [ ] Complete safety features

### Medium-term Actions (Weeks 8-11)
- [ ] Validate difficulty calibration algorithm
- [ ] Implement improvements from user testing
- [ ] Deploy to production
- [ ] Conduct safety audit
- [ ] Set up comprehensive monitoring

---

## Risk Ownership & Review

| Risk Area | Primary Owner | Review Frequency |
|-----------|---------------|------------------|
| API Costs & Performance | Giorgi Mikaberidze | Daily during Week 5, then weekly |
| Question Quality | Sergi Arabidze | Weekly golden set testing |
| User Adoption | Luka Mekoshvili | Post-user testing (Weeks 7, 14) |
| Deployment & Infrastructure | Nikoloz Kvirikashvili | Weekly deployment checks |
| Team Capacity & Coordination | All members | Weekly standup review |

**Next Comprehensive Risk Review**: Week 7 (after first user testing results)

## 6. Research Plan (Updated)

### Technical Questions

**Q1: How to optimize Gemini prompts for latency and cost?**
- **Status:** Week 5
- **Approach:** Test prompt variants, measure token usage and latency
- **Success:** 40-50% token reduction while maintaining >85% quality

**Q2: Optimal algorithm for adaptive difficulty calibration?**
- **Status:** Week 6-8  
- **Approach:** Research IRT, Elo systems; design 3 candidate algorithms; simulate with synthetic users
- **Success:** >70% users report questions "appropriately challenging"

**Q3: How to prevent prompt injection attacks?**
- **Status:** Week 6
- **Approach:** Input sanitization, system prompt guardrails, adversarial testing
- **Success:** Block 100% of obvious injection attempts

### User Testing Plan

**Round 1 (Week 7):**
- **Participants:** 5 students (new, not interviewed previously)
- **Tasks:** Generate test → complete → review feedback → view dashboard → generate focused test
- **Metrics:** Task completion rate, time on task, satisfaction scores
- **Success Criteria:** >75% completion, >4.0/5.0 satisfaction, 3+ actionable insights

**Round 2 (Week 14):**
- **Participants:** 5 new students
- **Goal:** Validate improvements from Round 1
- **Success Criteria:** >85% completion, >4.5/5.0 satisfaction

---

## 7. Project Timeline & Milestones (Realistic)

### Weekly Breakdown

| Week | Focus | Deliverables | Status |
|------|-------|--------------|--------|
| 1-2 | Setup & Planning | Proposal v1, team formation | ✅ Complete |
| 3 | Core Flow | Basic prototype, user interviews | ✅ Complete |
| 4 | **Design Review** | **Proposal v2, architecture v2** | **🔄 In Progress** |
| 5 | Deployment + Optimization | Staging deployment, prompt optimization, golden set | 📅 Planned |
| 6 | Safety + Features | Input validation, rate limiting, caching | 📅 Planned |
| 7 | User Testing 1 | First feedback round (5 students) | 📅 Planned |
| 8 | Iteration | Implement top 3 improvements | 📅 Planned |
| 9 | Midterm Buffer | Reduced work, bug fixes only | 📅 Planned |
| 10 | Production Deploy | Deploy to production, monitoring | 📅 Planned |
| 11 | Safety Audit | Red team testing, privacy review | 📅 Planned |
| 12 | Evaluation | Golden set regression, performance benchmarks | 📅 Planned |
| 13-14 | Polish & Testing | Bug fixes, UX refinements, final validation | 📅 Planned |
| 15 | **Final Demo** | Presentation, demo video, case study | 📅 Planned |

### Major Milestones

**✅ Milestone 1: Proposal v1 (Week 2)** - COMPLETE

**🔄 Milestone 2: Design Review (Week 4)** - IN PROGRESS
- This document + updated architecture + evaluation plan

**🎯 Milestone 3: Safety & Evaluation Audit (Week 11)**
- Red team testing, bias evaluation, golden set regression

**🎯 Milestone 4: Final Demo (Week 15)**
- Live demo, video, case study, deployed product

---

## 8. Team Health & Capacity

### Realistic Velocity Assessment
- **Theoretical capacity:** 50 hours/week → **Practical capacity:** ~40 hours/week
- **Accounting for:** Other courses, debugging overhead, coordination time
- **Week 3 lesson:** Underestimated interview scheduling, deployment complexity

### Learning Goals
- **Giorgi:** Master Gemini API integration with streaming responses
- **Nikoloz:** Design scalable MSSQL schema with efficient queries
- **Sergi:** Advanced prompt engineering for educational content
- **Luka:** React state management and API integration
- **Lasha:** Polished, accessible UI/UX for students

### Collaboration Improvements
- **Meeting schedule:** Adjusted from ideal to practical (2x/week + daily Slack)
- **Cross-training:** Week 5 sessions to mitigate bus factor
- **Documentation:** Week 5 sprint for code comments and architecture guides

---

## 9. Backup Plan (Scope Prioritization)

### If Behind Schedule, Cut in This Order:

**Priority 3 (Cut First):**
- Performance dashboard analytics
- English subject (focus on Math/Logic)
- Advanced Socratic feedback

**Priority 2 (Cut if Desperate):**
- Adaptive difficulty calibration
- User authentication
- Streaming responses

**Priority 1 (Never Cut):**
- Core test generation (10 questions, Math/Logic)
- Answer grading with scores
- Basic feedback (correct answers + explanations)
- Working deployed application
- Safety features (rate limiting, cost caps)

---

## 10. Summary: Key Changes & Evidence

### Problem Refinement
- **Before:** "Students struggle with static resources"
- **After:** "Georgian exam candidates need adaptive practice at appropriate difficulty levels"
- **Evidence:** 8 student interviews, 3 teacher interviews, specific pain points documented

### Technical Pivots
- **Cost optimization:** Gemini Flash (80%) + Pro (20%) vs single model
- **Architecture:** React/Vercel frontend, Express/Azure backend, MSSQL database
- **Performance focus:** Latency reduction from 4.2s to <3s target

### Risk Management
- **Identified critical risks** from prototyping experience
- **Quantified current performance** vs targets
- **Week-by-week mitigation plans** for top risks

### Realistic Planning
- **Adjusted timeline** based on Week 3-4 velocity
- **Buffer for midterms** (Week 9 reduced capacity)
- **Clear prioritization** for scope cuts if needed

---

**Team Sign-off:**
✅ **Giorgi Mikaberidze** - Approved  
✅ **Nikoloz Kvirikashvili** - Approved  
✅ **Sergi Arabidze** - Approved  
✅ **Luka Mekoshvili** - Approved  
✅ **Lasha Giorgi Tskhadadze** - Approved

**Submitted:** November 6, 2025  
**Next Review:** Week 7 (after first user testing round)