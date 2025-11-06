# Token Usage & Cost Model (Version 2)

**Project Name:** Dialogos — AI-Driven Entrance Exam Tutor  
**Team Members:** Giorgi Mikaberidze, Nikoloz Kvirikashvili, Sergi Arabidze, Luka Mekoshvili, Lasha Giorgi Tskhadadze  
**Date:** Week 4, November 6, 2025  
**Version:** 2.0 (Updated with Week 3-4 prototyping data)

---

## 📊 Executive Summary

**Current Cost Per Query:** ₾0.135 ($0.045) [Unoptimized]  
**Optimized Cost Per Query:** ₾0.027 ($0.009) [Target]  
**Projected Monthly Cost (Production):** ₾18 ($6) [Optimized]  
**Optimization Potential:** 80% cost reduction identified  
**Budget Status:** ✅ On track (well within ₾150 semester budget)

**Key Insight:**
> By implementing a hybrid Gemini Flash (80%) + Pro (20%) model selection strategy and optimizing prompt tokens from 2,800 to 1,500, we can reduce per-test costs by 80%—from ₾0.135 to ₾0.027—making Dialogos economically sustainable for 30-student pilot within ₾150 semester budget.

---

## 1. Current Baseline (Week 4)

### Token Usage Breakdown

Based on actual prototyping from Week 3-4 testing:

**Per Test Generation (10 Questions) Analysis:**

| Component | Tokens | Cost (Gemini Pro) | % of Total |
|-----------|--------|-------------------|------------|
| **System Prompt** | 1,500 tokens | ₾0.0113 ($0.00375) | 25% |
| **User Query (Performance Context)** | 300 tokens | ₾0.0023 ($0.00075) | 5% |
| **Few-Shot Examples** | 1,000 tokens | ₾0.0075 ($0.0025) | 17% |
| **Input Subtotal** | 2,800 tokens | ₾0.021 ($0.007) | 47% |
| **Output (10 Questions JSON)** | 2,000 tokens | ₾0.030 ($0.01) | 53% |
| **TOTAL PER TEST** | **4,800 tokens** | **₾0.051 ($0.017)** | **100%** |

**Actual Week 3-4 Performance (Unoptimized):**

| Component | Tokens | Cost (Gemini Pro) | % of Total |
|-----------|--------|-------------------|------------|
| **System Prompt (Verbose)** | 2,000 tokens | ₾0.015 ($0.005) | 33% |
| **User Query + Context** | 800 tokens | ₾0.006 ($0.002) | 13% |
| **Input Subtotal** | 2,800 tokens | ₾0.021 ($0.007) | 47% |
| **Output (10 Questions)** | 2,400 tokens | ₾0.036 ($0.012) | 53% |
| **TOTAL PER TEST** | **5,200 tokens** | **₾0.057 ($0.019)** | **100%** |

**Additional Costs per User Session:**
- Socratic Feedback (3-5 incorrect answers): 500 tokens × 3 = 1,500 tokens = ₾0.023 ($0.0075)
- Dashboard Performance Summary: 300 tokens = ₾0.005 ($0.0015)

**Full User Session Cost (Unoptimized):**
- Test Generation: ₾0.057
- Feedback (avg 3 hints): ₾0.023
- Dashboard: ₾0.005
- **Total: ₾0.085 ($0.028) per session**

**Key Findings:**
- Output tokens are 53% of total cost (expected for generative task)
- System prompt is consuming 2,000 tokens (33% of cost) → Major optimization target
- Few-shot examples are inflating input unnecessarily
- Gemini Pro is expensive for 100% of queries (Flash is 17x cheaper!)

---

### Current Usage Patterns

**Week 3-4 Prototyping Data:**

| Metric | Value |
|--------|-------|
| Total test generations (Week 3-4) | 38 tests |
| Average generations/day | 2.7 tests |
| Total tokens used | 197,600 tokens (~5,200 per test) |
| Total cost incurred | ₾6.84 ($2.28) |
| Model used | 100% Gemini 1.5 Pro (unoptimized) |
| Team testing hours | ~20 hours |

**Cost Breakdown by Day (Week 3-4):**

| Date | Tests Generated | Tokens | Cost (Gemini Pro) | Notes |
|------|-----------------|--------|-------------------|-------|
| Oct 23 | 5 | 26,000 | ₾0.90 ($0.30) | Initial prototyping |
| Oct 24 | 8 | 41,600 | ₾1.44 ($0.48) | Testing different difficulties |
| Oct 25 | 6 | 31,200 | ₾1.08 ($0.36) | Math + Logic questions |
| Oct 26 | 7 | 36,400 | ₾1.26 ($0.42) | Edge case testing |
| Oct 27 | 4 | 20,800 | ₾0.72 ($0.24) | User interview prep |
| Oct 28 | 5 | 26,000 | ₾0.90 ($0.30) | Quality validation |
| Oct 29 | 3 | 15,600 | ₾0.54 ($0.18) | Reduced testing (weekend) |
| **Total** | **38** | **197,600** | **₾6.84 ($2.28)** | Avg: ₾0.18/day |

**Current Cost per Test:** ₾0.18 ($0.06) including feedback + dashboard  
**Current Cost per Session:** ₾0.18 ($0.06)

---

## 2. Cost Model (Current vs. Projected)

### Development Phase (Weeks 3-9)

**Current Usage (Week 3-4 actual):**
- Tests per day: ~3 (team testing)
- Days completed: 14 days
- Actual cost: ₾6.84 ($2.28)

**Projected (Weeks 5-9):**
- Tests per day: 8-10 (increased development + testing)
- Days remaining: 35 days (5 weeks)
- Estimated tests: 280-350 tests
- **Projected cost (unoptimized): ₾50.4-₾63 ($16.80-$21.00)**
- **Projected cost (optimized): ₾7.56-₾9.45 ($2.52-$3.15)** ✅

### Production Phase (Weeks 10-15)

**Expected Usage (30-student pilot):**
- Students: 30 active users
- Tests per student: 5 tests average
- Total tests: 150 tests (baseline)
- Additional testing/demos: +50 tests
- **Total queries: 200 tests**

**Cost Breakdown:**
- Test generation: 200 × ₾0.027 = ₾5.40 ($1.80)
- Feedback (150 sessions × 3 hints avg): 450 hints × ₾0.008 = ₾3.60 ($1.20)
- Dashboard queries (200): 200 × ₾0.003 = ₾0.60 ($0.20)
- **Total production cost: ₾9.60 ($3.20)** ✅

### Total Semester Projection

| Phase | Tests Generated | Cost (Unoptimized) | Cost (Optimized) | Savings |
|-------|-----------------|-------------------|------------------|---------|
| **Weeks 3-4 (Actual)** | 38 | ₾6.84 ($2.28) | ₾6.84 ($2.28) | N/A (baseline) |
| **Development (W5-9)** | 280-350 | ₾50.4-₾63 | ₾7.56-₾9.45 | 85% |
| **Production (W10-15)** | 200 | ₾36 ($12) | ₾9.60 ($3.20) | 73% |
| **TOTAL** | **518-588** | **₾93.24-₾105.84** | **₾24-₾25.89** | **74-76%** |

**Budget Allocation:**
- AI API costs (optimized): ₾25.89 ($8.63)
- User testing incentives: ₾250 ($83.33) — 10 participants × ₾25
- Infrastructure:
  - Vercel (Frontend): ₾0 (Free tier)
  - Azure App Service (Backend): ₾0 (Student credits)
  - Azure MSSQL (Database): ₾0 (Student credits)
  - Azure Log Analytics: ₾0 (Free tier)
- Buffer/contingency: ₾24.11 ($8.04)
- **Total Budget Used: ₾300 (~$100)** (within project budget)
- **AI Costs: ₾25.89 ($8.63)** (well within ₾150 AI budget)

**Budget Health:** ✅ Excellent — Using only 17% of ₾150 AI budget, 30% of overall project budget

---

## 3. Optimization Strategies

### Strategy 1: Compress System Prompt ⭐ High Impact

**Current System Prompt (2,000 tokens - Week 3-4 verbose version):**
```
You are an expert Georgian National Entrance Exam tutor with 10 years of experience. 
Your job is to generate high-quality practice questions for students preparing for the 
June 2026 entrance exams. You must be thorough, pedagogically sound, and ensure all 
questions align with the Georgian national curriculum standards.

When generating questions, follow these guidelines:
1. Always create exactly 10 multiple-choice questions
2. Each question should have 4 options (A, B, C, D)
3. Ensure one and only one correct answer
4. Make distractors (wrong answers) plausible but clearly incorrect upon careful analysis
5. Questions should test conceptual understanding, not just memorization
6. Difficulty should be calibrated to the specified level (1-5 scale)
7. Focus on the topics where the student is weak (see context below)
8. Avoid ambiguous wording or trick questions
9. Use clear, grammatically correct language appropriate for 17-18 year old students
10. Provide explanations that guide understanding, not just state the answer

For Math questions:
- Show clear problem setups
- Include appropriate units
- Avoid computational complexity that obscures concepts
- Test multiple solution approaches when possible

For Logic questions:
- Pattern recognition should have unique solutions
- Deductive reasoning should follow valid logical structures
- Avoid cultural bias in scenario-based questions

Remember: These questions will directly impact students' university placement. Accuracy 
and quality are paramount. Double-check all mathematical calculations. Ensure explanations 
are thorough and helpful for learning.

Return your response as a JSON array with the following structure for each question:
{
  "question": "The question text here",
  "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
  "correct_answer": "B",
  "topic": "Specific topic (e.g., Quadratic Equations)",
  "explanation": "Detailed explanation of why the correct answer is correct"
}

Be professional, accurate, and educational in your approach.
```

**Token Count:** ~2,000 tokens

**Optimized System Prompt (800 tokens - 60% reduction):**
```
Generate 10 multiple-choice questions for Georgian National Entrance Exam (Math/Logic).

Requirements:
- Format: JSON array
- 4 options (A-D) per question, 1 correct
- Difficulty: {difficulty}/5
- Focus topics: {weak_topics}
- Age-appropriate for 17-18 year olds

JSON structure:
{
  "question": "...",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "correct_answer": "B",
  "topic": "Quadratic Equations",
  "explanation": "..."
}

Quality standards:
- Plausible distractors (not obvious wrong answers)
- Test concepts, not memorization
- Clear wording, no tricks
- Math: Include units, check calculations
- Logic: Unique solutions, valid reasoning

Priority: Accuracy critical for university placement exams.
```

**Token Count:** ~800 tokens

**Why This Works:**
- Removes redundant phrasing ("be professional", "remember that")
- Consolidates guidelines into bullet points
- Keeps critical instructions (JSON format, difficulty, topics)
- Maintains quality standards in compressed form
- Gemini models are efficient with concise prompts

**Token Savings:** 1,200 tokens input per test  
**Cost Savings:** 1,200 × ₾0.0000075 = ₾0.009/test → **₾4.70/semester (19% reduction)**

---

### Strategy 2: Remove Few-Shot Examples ⭐ High Impact

**Current Approach:**
Include 2-3 example questions in prompt to show desired format:
```
Example 1:
{
  "question": "Solve for x: 2x + 5 = 15",
  "options": ["A) x = 5", "B) x = 10", "C) x = 7.5", "D) x = 20"],
  "correct_answer": "A",
  "topic": "Linear Equations",
  "explanation": "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5"
}

Example 2:
[... another 300 tokens ...]
```

**Token Cost:** ~1,000 tokens per test

**Optimized Approach:**
Use Gemini's JSON Schema mode (structured output) instead:
```python
from google import generativeai as genai

schema = {
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "question": {"type": "string"},
            "options": {"type": "array", "items": {"type": "string"}},
            "correct_answer": {"type": "string"},
            "topic": {"type": "string"},
            "explanation": {"type": "string"}
        },
        "required": ["question", "options", "correct_answer", "topic", "explanation"]
    }
}

response = model.generate_content(
    prompt,
    generation_config=genai.GenerationConfig(
        response_mime_type="application/json",
        response_schema=schema
    )
)
```

**Why This Works:**
- JSON Schema enforces format without examples
- Gemini natively understands structured output
- No token cost for examples
- More reliable formatting

**Token Savings:** 1,000 tokens input per test  
**Cost Savings:** 1,000 × ₾0.0000075 = ₾0.0075/test → **₾3.92/semester (16% reduction)**

---

### Strategy 3: Compress User Query Context ⭐ Medium Impact

**Current User Query (800 tokens):**
```
Please generate a practice test with the following specifications:

Student Information:
- The student is preparing for the 2026 Georgian National Entrance Exam
- Subject: Mathematics
- Current performance level: 68% accuracy
- Recent test history: Completed 4 tests in the past week

Performance Context:
- Weak topics identified:
  * Quadratic Equations: 45% accuracy (8 questions attempted, 4 correct)
  * Geometry Proofs: 52% accuracy (12 questions attempted, 6 correct)
- Strong topics identified:
  * Linear Equations: 88% accuracy (15 questions attempted, 13 correct)
  * Basic Algebra: 92% accuracy (10 questions attempted, 9 correct)

Test Configuration:
- Difficulty level: 3 out of 5 (Medium)
- Number of questions: 10
- Distribution: 60% focused on weak topics (Quadratic Equations, Geometry), 40% mixed review

Please generate appropriate questions that will help this student improve in their weak areas 
while maintaining their strong areas. Ensure questions are appropriately challenging for 
difficulty level 3.
```

**Optimized User Query (300 tokens):**
```
Subject: Math
Difficulty: 3/5
Questions: 10

Performance:
- Weak: Quadratic Equations (45%), Geometry Proofs (52%)
- Strong: Linear Equations (88%), Basic Algebra (92%)

Focus: 60% weak topics, 40% review
```

**Why This Works:**
- Removes verbose explanations
- System prompt already covers guidelines
- Keeps essential context for adaptation
- Gemini doesn't need conversational padding

**Token Savings:** 500 tokens input per test  
**Cost Savings:** 500 × ₾0.0000075 = ₾0.00375/test → **₾1.96/semester (8% reduction)**

---

### Strategy 4: Hybrid Model Selection ⭐ HIGHEST Impact

**Current Model:** Gemini 1.5 Pro for 100% of queries

**Problem:** 
- Pro costs $1.25/1M input, $5.00/1M output
- Flash costs $0.075/1M input, $0.30/1M output
- **Flash is 16.7x cheaper for input, 16.7x cheaper for output!**

**Optimized Strategy:** 
Use Gemini Flash for 80% of questions (simple/medium), Pro for 20% (complex multi-step)

**Question Complexity Assessment:**
```python
def assess_question_complexity(difficulty, topic):
    """
    Determine if question needs Pro (better reasoning) or Flash (fast+cheap)
    """
    complex_topics = [
        "Multi-step Proofs",
        "Systems of Equations (3+ variables)",
        "Complex Logic Chains",
        "Advanced Geometry Proofs"
    ]
    
    # High difficulty + complex topic → Pro
    if difficulty >= 4 and topic in complex_topics:
        return "gemini-1.5-pro"
    
    # Everything else → Flash
    return "gemini-1.5-flash"

def generate_test(difficulty, num_questions, weak_topics):
    questions = []
    
    # Determine model distribution
    complex_count = int(num_questions * 0.2)  # 20% complex
    simple_count = num_questions - complex_count  # 80% simple
    
    # Generate simple questions with Flash (fast, cheap)
    flash_questions = call_gemini_flash(simple_count, difficulty, weak_topics)
    
    # Generate complex questions with Pro (better reasoning)
    pro_questions = call_gemini_pro(complex_count, difficulty + 1, weak_topics)
    
    return flash_questions + pro_questions
```

**Cost Comparison:**

**Scenario: 10-question test**

**Current (100% Pro):**
- Input: 1,800 tokens × $0.00000125 = $0.00225
- Output: 2,000 tokens × $0.000005 = $0.01
- **Total: $0.01225 per test = ₾0.037/test**

**Optimized (80% Flash, 20% Pro):**

Flash portion (8 questions):
- Input: 1,440 tokens × $0.000000075 = $0.000108
- Output: 1,600 tokens × $0.0000003 = $0.00048
- Subtotal: $0.000588

Pro portion (2 questions):
- Input: 360 tokens × $0.00000125 = $0.00045
- Output: 400 tokens × $0.000005 = $0.002
- Subtotal: $0.0025

**Total: $0.003088 per test = ₾0.0093/test**

**Savings:** 75% reduction in generation cost!  
**Per-Semester Savings:** (₾0.037 - ₾0.0093) × 520 tests = ₾14.36 ($4.79) — **58% total cost reduction!**

---

### Strategy 5: Implement Response Caching ⭐ Medium Impact

**Strategy:** Cache system prompts and common contexts to reduce input tokens

**Gemini Context Caching:**
- Cache system prompt (reused across all requests)
- Cache static context (Georgian exam standards, topic definitions)
- Cached tokens cost 90% less than regular input tokens

**Implementation:**
```python
import google.generativeai as genai

# Create cached content (reusable system prompt)
cached_content = genai.caching.CachedContent.create(
    model='gemini-1.5-flash',
    system_instruction=SYSTEM_PROMPT,  # 800 tokens
    ttl=datetime.timedelta(hours=24),
)

# Use cached content for all requests
model = genai.GenerativeModel.from_cached_content(cached_content)
response = model.generate_content(user_query)
```

**Token Savings:**
- System prompt: 800 tokens normally cost ₾0.006/test
- Cached: 800 tokens cost ₾0.0006/test (10% of normal)
- **Savings: ₾0.0054 per test**

**Per-Semester Savings:** ₾0.0054 × 520 tests = ₾2.81 ($0.94) — **11% additional reduction**

**Cache Cost:** 
- Storage: $1.00 per 1M tokens per hour (negligible for 800-token prompt)
- Total cache cost: ~₾0.30 ($0.10) for entire semester

**Net Savings:** ₾2.81 - ₾0.30 = ₾2.51 ($0.84) — **10% reduction**

---

## 4. Combined Optimization Impact

### Cumulative Savings

| Optimization | Token Reduction | Cost Savings | Implementation Effort | Priority |
|--------------|-----------------|--------------|----------------------|----------|
| #1: Compress System Prompt | 1,200 input | ₾4.70 (19%) | 2 hours | High |
| #2: Remove Few-Shot Examples | 1,000 input | ₾3.92 (16%) | 3 hours | High |
| #3: Compress User Context | 500 input | ₾1.96 (8%) | 1 hour | Medium |
| #4: Hybrid Model Selection | N/A (model switch) | ₾14.36 (58%) | 4 hours | **CRITICAL** |
| #5: Response Caching | 800 input (cached) | ₾2.51 (10%) | 2-3 hours | Medium |

**Cumulative Impact:**

**Original Cost Model (100% Gemini Pro, verbose prompts):**
- Per test: ₾0.057 ($0.019)
- Semester (520 tests): ₾29.64 ($9.88)

**After Quick Wins (#1-3):**
- Per test: ₾0.037 ($0.012)
- Semester: ₾19.24 ($6.41)
- **Savings: 35% reduction**

**After Hybrid Model (#4):**
- Per test: ₾0.0093 ($0.0031)
- Semester: ₾4.84 ($1.61)
- **Savings: 84% reduction!**

**After All Optimizations (#1-5):**
- Per test: ₾0.0081 ($0.0027)
- Semester: ₾4.21 ($1.40)
- **Savings: 86% reduction!** ✅

**Final Optimized Cost Breakdown:**
- Test generation: ₾0.0081 per test
- Feedback (3 hints avg): ₾0.024 per session
- Dashboard query: ₾0.003 per query
- **Total per user session: ₾0.0351 ($0.0117)**

**Production Phase Budget (200 tests + feedback):**
- Generation: 200 × ₾0.0081 = ₾1.62
- Feedback: 150 sessions × ₾0.024 = ₾3.60
- Dashboard: 200 × ₾0.003 = ₾0.60
- **Total: ₾5.82 ($1.94)** ✅ Incredible!

---

## 5. Implementation Roadmap

### Week 5 (Immediate - Do Now) 🔥

**Priority 1: Hybrid Model Selection** (4 hours - **HIGHEST IMPACT: 58% savings**)
- [x] Research Gemini Flash vs Pro quality differences
- [ ] Implement complexity assessment function
- [ ] Create model routing logic
- [ ] Test 20 questions on both models (validate quality)
- [ ] Deploy model selection to staging
- [ ] Measure cost difference

**Expected Savings:** ₾14.36 ($4.79) per semester — **58% reduction**

**Priority 2: Compress System Prompt** (2 hours)
- [ ] Rewrite system prompt (2,000 → 800 tokens)
- [ ] Test with 10 sample questions
- [ ] Validate quality matches verbose version
- [ ] Deploy to staging

**Expected Savings:** ₾4.70 ($1.57) per semester — **19% reduction**

**Weekly Target:** Achieve 77% cost reduction by end of Week 5

---

### Week 6 (High Priority)

**Priority 3: Implement JSON Schema (Structured Output)** (3 hours)
- [ ] Define Pydantic/JSON schema for question format
- [ ] Update Gemini API calls with response_schema parameter
- [ ] Test with 15 questions across subjects
- [ ] Validate format consistency (no parsing errors)
- [ ] Remove few-shot examples from prompt

**Expected Savings:** ₾3.92 ($1.31) per semester — **16% reduction**

**Priority 4: Compress User Context** (1 hour)
- [ ] Reduce context from 800 → 300 tokens
- [ ] Test adaptive difficulty still works
- [ ] Deploy to staging

**Expected Savings:** ₾1.96 ($0.65) per semester — **8% reduction**

**Weekly Target:** Cumulative 84% cost reduction

---

### Week 7 (Medium Priority)

**Priority 5: Implement Context Caching** (2-3 hours)
- [ ] Set up Gemini context caching for system prompt
- [ ] Configure 24-hour TTL (time-to-live)
- [ ] Update API calls to use cached content
- [ ] Monitor cache hit rates
- [ ] Measure token savings

**Expected Savings:** ₾2.51 ($0.84) per semester — **10% additional reduction**

**Weekly Target:** Final optimized cost model (86% reduction)

---

### Week 8 (Validation & Monitoring)

**Testing & Validation** (3 hours)
- [ ] Run golden set (50 questions) on optimized system
- [ ] Compare quality: optimized vs baseline
- [ ] Measure latency: Flash vs Pro response times
- [ ] Validate cost tracking accuracy
- [ ] Document final optimization results

**Set Up Cost Monitoring** (2 hours)
- [ ] Create cost tracking spreadsheet
- [ ] Log every API call with tokens + cost
- [ ] Set up daily cost alerts (>₾6/day)
- [ ] Weekly cost review process

---

## 6. Cost Tracking Dashboard

### Metrics to Monitor

**Daily Tracking (Automated):**
- [ ] Cost per test generation (running average)
- [ ] Total daily spend (₾ and $)
- [ ] Token usage trend (input/output breakdown)
- [ ] Model distribution (% Flash vs Pro)
- [ ] Cache hit rate (if implemented)

**Weekly Reviews (Team Standup):**
- [ ] Weekly cost total
- [ ] Budget burn rate (% of ₾150 used)
- [ ] Projected end-of-semester cost
- [ ] Optimization impact measurement
- [ ] Anomaly detection (unusual spikes)

**Monthly Checkpoints:**
- [ ] Month-to-date spend
- [ ] Cost per user metrics (production phase)
- [ ] Budget health status
- [ ] Adjust projections if needed

---

### Dashboard Implementation

**Option 1: Simple Google Sheets (Week 5)**

Structure:
```
| Date | Tests | Input Tokens | Output Tokens | Model | Cost (₾) | Cost ($) | Cache Hit | Notes |
|------|-------|--------------|---------------|-------|----------|----------|-----------|-------|
| Nov 6 | 5 | 4,000 | 10,000 | Flash | ₾0.045 | $0.015 | N/A | Baseline |
| Nov 7 | 8 | 6,400 | 16,000 | 80% Flash | ₾0.064 | $0.021 | N/A | Hybrid model |
| Nov 8 | 10 | 8,000 | 20,000 | 80% Flash | ₾0.081 | $0.027 | 60% | Caching enabled |
```

**Formulas:**
- Daily cost: `=SUM(cost_column)`
- Average cost per test: `=daily_cost / num_tests`
- Budget remaining: `=₾150 - cumulative_cost`
- Burn rate: `=(cumulative_cost / days_elapsed) * days_remaining`

**Option 2: Automated Dashboard (Week 8-9, if time allows)**

Backend logging:
```python
# Log every API call
def log_api_call(test_id, model, input_tokens, output_tokens, cost):
    db.execute("""
        INSERT INTO api_logs (test_id, model, input_tokens, output_tokens, cost_gel, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (test_id, model, input_tokens, output_tokens, cost, datetime.now()))
```

Dashboard queries:
```sql
-- Daily cost
SELECT DATE(timestamp), SUM(cost_gel) 
FROM api_logs 
GROUP BY DATE(timestamp);

-- Model distribution
SELECT model, COUNT(*), AVG(cost_gel)
FROM api_logs
GROUP BY model;

-- Cache effectiveness
SELECT cache_hit, COUNT(*), AVG(input_tokens)
FROM api_logs
GROUP BY cache_hit;
```

Visualization: Grafana or simple React dashboard with Chart.js

---

## 7. Budget Allocation (Full Semester)

### Cost Categories

| Category | Budgeted | Actual (W3-4) | Projected (W5-15) | Total | % of Budget |
|----------|----------|---------------|-------------------|-------|-------------|
| **AI API Costs** | | | | | |
| - Development (W3-9) | ₾15 | ₾6.84 | ₾8.16 | ₾15 | 10% |
| - Production (W10-15) | ₾11 | ₾0 | ₾11 | ₾11 | 7% |
| **AI Subtotal** | **₾26** | **₾6.84** | **₾19.16** | **₾26** | **17%** |
| | | | | | |
| **User Testing** | | | | | |
| - Round 1 (5 students) | ₾125 | ₾0 | ₾125 | ₾125 | 42% |
| - Round 2 (5 students) | ₾125 | ₾0 | ₾125 | ₾125 | 42% |
| **Testing Subtotal** | **₾250** | **₾0** | **₾250** | **₾250** | **83%** |
| | | | | | |
| **Infrastructure** | | | | | |
| - Vercel (Frontend) | ₾0 | ₾0 | ₾0 | ₾0 | 0% |
| - Azure (Backend+DB) | ₾0 | ₾0 | ₾0 | ₾0 | 0% |
| - Domain (dialogos.ge) | ₾0 | ₾0 | ₾0 | ₾0 | 0% |
| **Infrastructure Subtotal** | **₾0** | **₾0** | **₾0** | **₾0** | **0%** |
| | | | | | |
| **Buffer/Contingency** | ₾24 | ₾0 | ₾24 | ₾24 | 8% |
| | | | | | |
| **GRAND TOTAL** | **₾300** | **₾6.84** | **₾293.16** | **₾300** | **100%** |

**AI Budget Health:** ✅ Excellent
- Used: ₾6.84 / ₾150 AI budget = 4.6%
- Projected: ₾26 / ₾150 = 17.3%
- Remaining: ₾124 buffer for unexpected usage

**Overall Budget Health:** ✅ On Track
- Total project budget: ~₾300 ($100)
- AI represents only 9% of total budget
- Largest cost: User testing incentives (83%)

---

## 8. Cost Alerts & Thresholds

### Alert Levels

**🟢 Normal Operations:**
- Daily spend: <₾3 ($1)
- Weekly spend: <₾15 ($5)
- Monthly projection: <₾30 ($10)
- Action: Continue normal operations

**🟡 Warning (Monitor Closely):**
- Daily spend: ₾3-6 ($1-2)
- Weekly spend: ₾15-30 ($5-10)
- Monthly projection: ₾30-60 ($10-20)
- 50-80% of AI budget consumed
- **Action Required:**
  - Review recent queries for anomalies
  - Check optimization implementation status
  - Notify team in Slack
  - Daily cost monitoring

**🟠 Action Required (Intervention Needed):**
- Daily spend: ₾6-12 ($2-4)
- Weekly spend: ₾30-60 ($10-20)
- 80-90% of AI budget consumed
- **Action Required:**
  - Immediate optimization deployment
  - Switch to 100% Gemini Flash if not yet implemented
  - Reduce testing volume (only essential tests)
  - Team meeting to discuss
  - Escalate to team lead (Giorgi)

**🔴 Critical (Emergency Measures):**
- Daily spend: >₾12 ($4)
- Weekly spend: >₾60 ($20)
- >90% of AI budget consumed
- **Action Required:**
  - Pause all non-essential API calls
  - Emergency team meeting
  - Implement immediate cost caps in code
  - Escalate to instructor
  - Consider alternative models or strategies

---

### Response Plan

**If Yellow Alert (₾3-6/day):**
1. Giorgi reviews API logs for unusual patterns
2. Check if optimization strategies deployed
3. Measure model distribution (should be 80% Flash)
4. Team notification in Slack: "⚠️ Daily cost elevated: ₾X"
5. Continue monitoring, no immediate action unless persists 3+ days

**If Orange Alert (₾6-12/day):**
1. **Immediate actions (within 1 hour):**
   - Stop all non-essential testing
   - Deploy hybrid model selection if not yet live
   - Enable context caching immediately
2. **Short-term (within 24 hours):**
   - Team meeting to review usage patterns
   - Identify cost drivers (which features?)
   - Implement rate limiting if abuse detected
3. **Follow-up (within 48 hours):**
   - Document root cause
   - Update cost projections
   - Adjust testing schedule if needed

**If Red Alert (>₾12/day or >90% budget):**
1. **Emergency measures (immediate):**
   - Hard code temporary API call limit (max 20/day)
   - Switch to 100% Gemini Flash (disable Pro)
   - Disable feedback generation temporarily
   - Freeze all development testing
2. **Crisis management (within 2 hours):**
   - Emergency team meeting
   - Contact instructor for guidance
   - Calculate runway (days until budget exhausted)
   - Prepare fallback plan (pre-generated question bank)
3. **Recovery plan:**
   - Identify budget recovery options
   - Consider reducing pilot scope (30 → 15 users)
   - Implement aggressive caching
   - Re-validate all optimization strategies

---

## 9. Alternative Models Consideration

### Model Comparison

| Model | Input Cost (/1M tokens) | Output Cost (/1M tokens) | Quality | Speed | Notes |
|-------|-------------------------|--------------------------|---------|-------|-------|
| **Gemini 1.5 Flash** | $0.075 | $0.30 | Very good | Fast (~1s) | Our primary model |
| **Gemini 1.5 Pro** | $1.25 | $5.00 | Excellent | Slower (~2s) | 20% of queries |
| **GPT-4o-mini** | $0.15 | $0.60 | Very good | Fast | 2x cost of Flash |
| **GPT-4o** | $5.00 | $15.00 | Excellent | Medium | 67x cost of Flash! |
| **Claude 3.5 Haiku** | $1.00 | $5.00 | Good | Very fast | Not ideal for generation |
| **Claude 3.5 Sonnet** | $3.00 | $15.00 | Excellent | Medium | Too expensive |

**Decision Rationale:**

✅ **Stick with Gemini Flash + Pro Hybrid**
- **Best cost/quality ratio:** Flash is cheapest, Pro for complex tasks
- **Already integrated:** No switching cost
- **Structured output support:** JSON schema works well
- **Educational use case:** Gemini performs well on academic content
- **Budget-friendly:** 16.7x cheaper than GPT-4o

❌ **Why Not GPT-4o:**
- **67x more expensive** than Gemini Flash for input
- **50x more expensive** for output
- Would cost ₾174 ($58) for semester vs ₾26 ($8.67) with Gemini
- Quality difference not worth 6.7x budget increase

❌ **Why Not Claude:**
- More expensive than Gemini
- Fewer educational content benchmarks
- Less familiar to team

**Fallback Plan (If Gemini Fails):**
1. Try GPT-4o-mini (acceptable cost, good quality)
2. If budget critical: Use GPT-3.5-turbo (very cheap but lower quality)
3. Last resort: Pre-generated question bank (no API costs)

---

## 10. Long-Term Cost Sustainability

### Post-Course Considerations

**If we launch Dialogos as real product after course:**

**Expected Scale (Conservative):**
- 500 active students (Georgian market capture)
- 5 tests per student per month average
- 2,500 tests/month

**Monthly Costs (Optimized Model):**
- Test generation: 2,500 × ₾0.0081 = ₾20.25 ($6.75)
- Feedback (avg 3 hints per test): 7,500 hints × ₾0.008 = ₾60 ($20)
- Dashboard queries: 2,500 × ₾0.003 = ₾7.50 ($2.50)
- **AI API Total: ₾87.75 ($29.25/month)**

**Additional Infrastructure:**
- Vercel Pro: ₾60 ($20/month) — Better performance
- Azure App Service (Production): ₾150 ($50/month) — Scale up
- Azure MSSQL (Production): ₾90 ($30/month) — Larger tier
- Monitoring (Azure Insights): ₾30 ($10/month)
- **Infrastructure Total: ₾330 ($110/month)**

**Total Operating Cost: ₾418 ($139/month) = ₾5,016 ($1,668/year)**

---

### Revenue Model Options

**Option 1: Freemium**
- Free tier: 3 tests/month
- Pro tier: ₾30 ($10)/month — Unlimited tests
- **Break-even: 14 paying subscribers** (₾418 / ₾30)
- **Target: 50 paying subscribers = ₾1,500/month revenue**
- **Profit: ₾1,082/month ($361)**

**Option 2: Institutional Licensing**
- Sell to exam prep centers: ₾900 ($300)/month per center for 50 students
- Target: 3 centers = ₾2,700/month
- **Profit: ₾2,282/month ($761)**

**Option 3: Hybrid (Freemium + Institutional)**
- 30 individual Pro subscribers: ₾900/month
- 2 institutional licenses: ₾1,800/month
- **Total revenue: ₾2,700/month**
- **Profit: ₾2,282/month ($761)**

**Conclusion:** ✅ Economically viable post-course!
- Low operating costs due to optimization
- Multiple revenue models possible
- Break-even at just 14 subscribers
- Scalable (costs grow linearly with users)

---

## 11. Risk Mitigation Strategies

### Cost Overrun Scenarios & Responses

**Scenario 1: Flash Quality Insufficient**
- **Risk:** Flash generates poor quality questions, need 100% Pro
- **Impact:** ₾26 → ₾88 semester cost (3.4x increase)
- **Mitigation:**
  - Thoroughly test Flash quality in Week 5 (golden set)
  - Use confidence scoring to route low-confidence to Pro
  - Acceptable: 70% Flash / 30% Pro (still 2.7x cheaper than 100% Pro)
- **Likelihood:** Low (Flash performs well on structured tasks)

**Scenario 2: Higher Than Expected Usage**
- **Risk:** Students generate 10 tests each instead of 5
- **Impact:** 300 tests → 600 tests = ₾48 instead of ₾26
- **Mitigation:**
  - Implement rate limiting: 3 tests per day max
  - Track usage patterns early (Week 10-11)
  - Adjust projections weekly
- **Likelihood:** Medium (students may over-use if free)

**Scenario 3: Caching Doesn't Work**
- **Risk:** Cache hit rate <10% instead of expected 60%
- **Impact:** Lose ₾2.51 savings, ₾26 → ₾28.51
- **Mitigation:**
  - Don't rely on caching for core budget
  - Consider caching "nice to have" not critical
  - Can remove caching if implementation takes too long
- **Likelihood:** Medium (depends on implementation quality)

**Scenario 4: Gemini API Price Increase**
- **Risk:** Google raises Gemini prices mid-semester
- **Impact:** Could double costs overnight
- **Mitigation:**
  - Monitor Google Cloud pricing announcements
  - Have GPT-4o-mini as backup (similar cost structure)
  - Budget buffer (₾24) can absorb 92% increase
- **Likelihood:** Very Low (Google gives 90-day notice for pricing changes)

---

## 12. Optimization Checklist

### Week 5 (This Week) — Critical Week! 🔥

- [ ] **Implement hybrid model selection (4 hours)**
  - [ ] Code complexity assessment function
  - [ ] Add model routing logic
  - [ ] Test 20 questions (compare Flash vs Pro quality)
  - [ ] Deploy to staging
  - [ ] Expected: 58% cost reduction

- [ ] **Compress system prompt (2 hours)**
  - [ ] Rewrite 2,000 → 800 tokens
  - [ ] Validate quality with 10 test questions
  - [ ] Deploy to staging
  - [ ] Expected: 19% cost reduction

- [ ] **Set up cost tracking spreadsheet (1 hour)**
  - [ ] Create Google Sheet with formulas
  - [ ] Log Week 3-4 baseline data
  - [ ] Set up daily logging process

**Week 5 Target:** 77% cost reduction achieved (₾0.057 → ₾0.013/test)

---

### Week 6

- [ ] **Implement structured output (3 hours)**
  - [ ] Define JSON schema
  - [ ] Update API calls
  - [ ] Test with 15 questions
  - [ ] Expected: 16% cost reduction

- [ ] **Compress user context (1 hour)**
  - [ ] Reduce 800 → 300 tokens
  - [ ] Test adaptive difficulty works
  - [ ] Expected: 8% cost reduction

**Week 6 Target:** 84% cumulative reduction

---

### Week 7

- [ ] **Implement context caching (2-3 hours)**
  - [ ] Set up Gemini caching
  - [ ] Configure 24-hour TTL
  - [ ] Monitor cache hit rate
  - [ ] Expected: 10% additional reduction

**Week 7 Target:** 86% final reduction (₾0.0081/test)

---

### Week 8 (Validation)

- [ ] **Run golden set on optimized system**
  - [ ] Test all 50 cases
  - [ ] Compare quality vs baseline
  - [ ] Measure latency improvements

- [ ] **Cost validation**
  - [ ] Measure actual costs for 1 week
  - [ ] Compare to projections
  - [ ] Adjust model if needed

---

### Ongoing (Weeks 9-15)

- [ ] **Daily cost monitoring**
  - [ ] Log all API calls
  - [ ] Update tracking spreadsheet
  - [ ] Check for anomalies

- [ ] **Weekly cost reviews**
  - [ ] Team standup discussion
  - [ ] Budget burn rate check
  - [ ] Adjust if needed

---

## ✅ Cost Model Checklist

**Baseline Established:**
- [x] Week 3-4 actual usage documented (38 tests, ₾6.84)
- [x] Token breakdown analyzed (5,200 tokens/test)
- [x] Cost per component identified

**Optimization Strategies Defined:**
- [x] Strategy 1: Compress system prompt (19% savings)
- [x] Strategy 2: Remove few-shot examples (16% savings)
- [x] Strategy 3: Compress user context (8% savings)
- [x] Strategy 4: Hybrid model selection (58% savings) ⭐
- [x] Strategy 5: Context caching (10% savings)

**Budget Planning:**
- [x] Semester projection: ₾26 AI costs (17% of ₾150 budget)
- [x] Cost tracking system designed
- [x] Alert thresholds defined
- [x] Risk mitigation strategies documented

**Implementation Roadmap:**
- [x] Week-by-week plan (Weeks 5-8)
- [x] Priority ranking (Hybrid model = highest impact)
- [x] Validation milestones defined

**Long-Term Viability:**
- [x] Post-course sustainability analyzed
- [x] Revenue models proposed
- [x] Break-even calculated (14 subscribers)

---

**Document Version:** 2.0  
**Last Updated:** Week 4, November 6, 2025  
**Next Review:** Week 6 (after optimization implementation)  
**Owner:** Giorgi Mikaberidze (backend + API integration)

---

## 📊 Appendix: Token Calculation Reference

### Gemini Pricing (as of November 2024)

**Gemini 1.5 Flash:**
- Input: $0.075 per 1M tokens (₾0.000000225 per token)
- Output: $0.30 per 1M tokens (₾0.0000009 per token)
- Context caching: $0.01875 per 1M tokens (75% discount)

**Gemini 1.5 Pro:**
- Input: $1.25 per 1M tokens (₾0.00000375 per token)
- Output: $5.00 per 1M tokens (₾0.000015 per token)
- Context caching: $0.3125 per 1M tokens (75% discount)

**Conversion Rate:** $1 = ₾3.00 (approximate, November 2024)

---

### Token Estimation Guide

**Rough estimates:**
- 1 token ≈ 4 characters
- 1 token ≈ 0.75 words
- 100 words ≈ 133 tokens
- 1,000 characters ≈ 250 tokens

**For Dialogos-specific content:**
- Math question with explanation: ~150-250 tokens
- Logic question: ~100-150 tokens
- System prompt (optimized): ~800 tokens
- User context: ~300 tokens
- Full test (10 questions): ~2,000 output tokens

**Use tiktoken for accurate counts (OpenAI standard):**
```python
import tiktoken

encoding = tiktoken.get_encoding("cl100k_base")  # GPT-4/Gemini compatible
text = "Your prompt here..."
token_count = len(encoding.encode(text))
print(f"Token count: {token_count}")
```

---

**End of Cost Model Document**
