# Optimization Plan: Dialogos AI Tutor

**Date:** December 11, 2024  
**Your Name:** Psychonauts 5 Team (G. Mikaberidze, LG. Tskhadadze, S. Arabidze, L. Mekoshvili, N. Kvirikashvili)

---

## 1. Which model(s) should I use?

### Current Model Usage
- [x] **Model(s) currently using:** Gemini 1.5 Flash (80%) + Gemini 1.5 Pro (20%)
- [x] **Why I chose this model originally:** Needed balance between cost and quality. Flash is 16.7x cheaper than Pro, but Pro handles complex multi-step problems better. Testing showed Flash achieves 87% quality vs Pro's 91%, which exceeds our 85% threshold.

### Task Complexity Analysis
My capstone's queries are:
- [ ] Simple classification (→ Fast model like Haiku)
- [ ] Moderate complexity (→ Mid-tier like GPT-4o-mini)
- [ ] Complex reasoning (→ Frontier like GPT-4o)
- [x] **Mixed complexity** (→ Consider cascading)

**Breakdown:**
- 80% of questions are straightforward (basic math, simple logic) → Gemini Flash
- 20% require complex reasoning (multi-step proofs, advanced geometry) → Gemini Pro

### Error Cost
If my system makes a mistake:
- [ ] Low cost (suggestions, non-critical) → Can use cheaper model
- [x] Medium cost (user annoyance) → Balance cost vs accuracy
- [ ] High cost (medical, legal, financial) → Use frontier model

**Rationale:** Incorrect practice questions frustrate students and waste study time, but aren't life-critical. Our 87% quality with Flash is acceptable for practice tests.

**Decision:** I should use **Hybrid Gemini Flash (80%) + Pro (20%)** because it achieves 87% quality at 75% lower cost than 100% Pro, and our testing validates Flash quality exceeds our 85% threshold for most questions.

---

## 2. Where should I cache?

### Query Patterns
- [x] **Do users ask similar questions?** Yes
- [x] **Do I have repeated queries in logs?** Yes
- [x] **Is my context/prompt reused often?** Yes

**Analysis:** Our system prompt (800 tokens) is identical across all test generation requests. Georgian exam standards and question formatting rules never change.

### Cache Hit Rate Estimate
Based on my data:
- [x] Expected cache hit rate: **60-70%**
- [x] How I estimated this: System prompt reused on every test generation (100% of requests). If users generate 2+ tests per session, cache saves 800 tokens on subsequent requests.

### Cache Strategy
- [x] **Prompt caching** (Gemini auto-caches long prompts >1024 tokens)
- [ ] **Result caching** (Cache full API responses)
- [ ] **Semantic caching** (Cache similar queries via embeddings)
- [ ] **No caching needed** (All queries unique)

**Implementation Status:** Already implemented Gemini context caching with 24-hour TTL for system prompt. Cached tokens cost 90% less (₾0.0006 vs ₾0.006 per test).

**Decision:** I should cache **system prompts using Gemini's native context caching** because the 800-token system prompt is identical across all requests, and caching reduces input token costs by 90%.

---

## 3. What's my cost budget?

### Current Costs
- [x] **Cost per query:** ₾0.027 ($0.009) [after optimization]
- [x] **Expected queries per day:** 8-10 during development, 15-20 in production
- [x] **Monthly projection:** ₾18 ($6) [optimized production phase]
- [x] **Is this sustainable?** Yes

### Cost Breakdown
Analyze where money goes:
- [x] Input tokens: **35%** of cost (optimized from 47%)
- [x] Output tokens: **53%** of cost
- [x] Model choice: **12%** of cost (Flash vs Pro pricing difference)
- [x] Other (embeddings, tools): **0%** of cost

**Most expensive part:** Output tokens (2,000 tokens per test generation)

**Budget Tracking (Weeks 3-6):**
- Week 3-4 (unoptimized): ₾6.84 spent
- Week 5-6 (optimized): ₾3.20 spent
- **Total spent to date: ₾10.04 / ₾150 budget = 6.7%**

**Decision:** My target monthly cost is **₾18 ($6)** which keeps us well within the ₾150 semester AI budget.

---

## 4. What's acceptable latency?

### Current Latency
- [x] **Average response time:** 2.4 seconds
- [x] **p95 latency:** 2.8 seconds
- [x] **User feedback on speed:** "Fast enough for practice tests" (from Week 7 smoke tests)

### Use Case Requirements
- [ ] **Real-time chat** (<2s required)
- [x] **Analysis/research** (5-10s OK)
- [ ] **Background processing** (30s+ OK)

**Context:** Students take practice tests, so 2-3 seconds to generate 10 questions is acceptable. Not a real-time chat where sub-second responses matter.

### Latency Targets
- [x] **Target average:** 3 seconds
- [x] **Target p95:** 5 seconds
- [x] **Maximum acceptable:** 8 seconds

**Current Performance:** ✅ Already meeting targets
- p50: 2.4s ✅
- p95: 2.8s ✅
- p99: 3.2s ✅

**Decision:** I can accept up to **5 seconds** latency to save costs: **Yes** — current latency is well within acceptable range, so cost optimizations that slightly increase latency (like using Flash instead of Pro) are acceptable.

---

## 5. What will I measure?

### Baseline Metrics (BEFORE optimization - Week 3-4)
Document current state:

| Metric | Value |
|--------|-------|
| Cost per query | ₾0.057 ($0.019) |
| Average latency | 3.8 s |
| p95 latency | 4.2 s |
| Error rate | 2% (API timeouts) |
| Cache hit rate | N/A (not implemented) |
| Model distribution | 100% Gemini Pro |

### Success Criteria (AFTER optimization - Week 6)
What would make this optimization successful?

- [x] **Cost reduction target:** >**80%** ✅ Achieved 86%
- [x] **Latency change acceptable:** <+2 seconds increase ✅ Actually decreased by 1.4s
- [x] **Quality maintained:** <15% accuracy drop ✅ Flash: 87% vs Pro: 91% (4% gap)
- [x] **Cache hit rate:** >**60%** ✅ Achieving 65-70%

**How I'll measure quality:**
- [x] Manual review of responses (3 teachers rated 50 questions)
- [x] User feedback (Week 7 smoke tests with 8 scenarios)
- [x] Comparison to baseline outputs (Flash vs Pro side-by-side)
- [x] Golden set evaluation (50-question test set evaluated weekly)

### Current Metrics (Week 6 - AFTER optimization)

| Metric | Value | Change from Baseline |
|--------|-------|---------------------|
| Cost per query | ₾0.0081 ($0.0027) | **-86%** ✅ |
| Average latency | 2.4 s | **-1.4s** ✅ |
| p95 latency | 2.8 s | **-1.4s** ✅ |
| Error rate | 1.2% | -40% ✅ |
| Cache hit rate | 65-70% | New metric ✅ |
| Model distribution | 80% Flash, 20% Pro | Optimized ✅ |

**Quality Validation:**
- Flash quality score: 4.35/5.0 (87%)
- Pro quality score: 4.55/5.0 (91%)
- Difference: 4% (well within acceptable <15% threshold)

---

## 6. When will I optimize?

### Priority Analysis (Week 10 Slide 19 Framework)

**🔥 High Priority** (Optimize IMMEDIATELY):
- [ ] Costs burning budget
- [ ] Users complaining about speed
- [ ] Hitting rate limits
- [ ] Quality issues

**⚠️ Medium Priority** (Optimize SOON):
- [ ] Costs manageable but high
- [ ] Latency acceptable but slow
- [x] Obvious inefficiencies
- [x] Preparing for scale

**✅ Low Priority** (Can WAIT):
- [x] Costs negligible (<₾10/day)
- [x] Users happy with speed
- [x] Working well
- [ ] Limited traffic

**My optimization priority:** **Medium** (already completed Week 5-6)

**Justification:** 
- Costs were ₾0.057/test (₾30/semester) — manageable but needed optimization before 30-student pilot
- Latency was 3.8s — acceptable but could be improved
- Obvious win: Gemini Flash is 16.7x cheaper with minimal quality loss
- **Status: Optimizations completed in Week 5-6, now monitoring**

---

## My Optimization Choice

Based on the analysis above:

### Chosen Optimization
- [x] **Model Cascading** (Gemini Flash 80% → Pro 20%)
- [x] **Result Caching** (Gemini context caching for system prompts)
- [ ] **Semantic Caching** (Embeddings + similarity)
- [ ] **Batching** (Process multiple items together)
- [x] **Prompt Compression** (2,000 → 800 tokens)

### Why This Choice?

**Primary: Hybrid Model Selection (80% Flash, 20% Pro)**
- Gemini Flash costs $0.075/1M input vs Pro's $1.25/1M (16.7x cheaper)
- Testing showed Flash achieves 87% quality vs Pro's 91% — only 4% gap
- Most questions are straightforward (basic algebra, simple logic patterns)
- Only complex multi-step problems need Pro's advanced reasoning
- **Impact: 58% cost reduction from model switching alone**

**Secondary: Prompt Compression**
- Original system prompt was 2,000 tokens (verbose, redundant)
- Optimized to 800 tokens (60% reduction) without quality loss
- Removed unnecessary explanations, consolidated bullet points
- Used JSON Schema for structured output instead of few-shot examples
- **Impact: 19% additional cost reduction**

**Tertiary: Context Caching**
- System prompt (800 tokens) is identical across all test generations
- Gemini caches prompts >1024 tokens automatically with 24-hour TTL
- Cached tokens cost 90% less (₾0.0006 vs ₾0.006 per test)
- **Impact: 10% additional cost reduction**

**Combined effect: 86% total cost reduction (₾0.057 → ₾0.0081 per test)**

### Expected Impact
- **Cost reduction:** **86%** ✅ Achieved
- **Latency change:** **-1.4 seconds** ✅ Improved (not degraded!)
- **Quality impact:** No change / **Minor drop (4%)** / Improvement ✅ Acceptable

### Implementation Plan
**Step 1:** Implement complexity assessment function to route 80% Flash / 20% Pro
- Created `_assess_question_complexity()` in `functions.py`
- Routes by difficulty level + topic (multi-step proofs → Pro, basic math → Flash)
- Status: ✅ Complete (Week 5)

**Step 2:** Compress system prompt from 2,000 → 800 tokens
- Removed verbose explanations ("You are an expert tutor with 10 years...")
- Consolidated guidelines into bullet points
- Switched to JSON Schema for structured output (removed few-shot examples)
- Status: ✅ Complete (Week 5)

**Step 3:** Enable Gemini context caching for system prompt
- Configured `CachedContent.create()` with 24-hour TTL
- System prompt cached on first request, reused for 24 hours
- Status: ✅ Complete (Week 6)

**Step 4:** Validate optimizations with golden set testing
- Generated 50 test questions using optimized system
- Had 3 teachers rate quality on 1-5 scale
- Compared Flash vs Pro quality scores
- Status: ✅ Complete (Week 6)

### Risks & Mitigation
**Risk 1:** Flash quality insufficient for complex questions
**Mitigation:** 
- Thoroughly tested Flash with 50-question golden set
- Validated 87% quality exceeds 85% threshold
- Kept Pro for 20% most complex questions as safety net
- Can increase Pro percentage to 30-40% if needed
- **Status:** ✅ Risk mitigated — Flash quality validated

**Risk 2:** Cache hit rate lower than expected (<60%)
**Mitigation:**
- Monitor cache hit rates daily in Week 7-8
- Cache effectiveness depends on session patterns (multi-test users)
- If cache hit rate <40%, savings only ₾1.25 instead of ₾2.51
- Budget buffer can absorb this variance
- **Status:** ⚠️ Monitoring — currently 65-70% hit rate

**Risk 3:** Latency increases due to cache misses or Flash timeouts
**Mitigation:**
- Set aggressive timeouts (5s max per API call)
- Fallback to cached question bank if API fails
- Flash is actually faster than Pro (avg 2.4s vs 3.2s)
- **Status:** ✅ Risk avoided — latency improved, not degraded

---

## Next Steps After This Optimization

If this optimization works, what should I optimize next?

**Second optimization:** **Implement semantic caching for similar test requests**
- Students often request "Math difficulty 2" multiple times
- Could cache generated tests for 1 hour and serve to similar requests
- Use embeddings to match requests (subject + difficulty + focus topics)
- Expected savings: 15-20% additional reduction
- Implementation complexity: Medium (requires vector similarity search)

**Third optimization:** **Batch grading for multiple students**
- Current: Grade tests one-by-one (1 API call per test)
- Future: Batch grade 5-10 tests in single API call
- Reduces API overhead, improves throughput
- Expected savings: 10% reduction in grading costs
- Implementation complexity: Low (modify `grade_test()` to accept list)

**Path to target cost:** 
- ₾0.057 current (Week 3-4 baseline)
- → ₾0.0081 after optimization 1 (hybrid model + caching) ✅ **Complete**
- → ₾0.0065 after optimization 2 (semantic caching)
- → ₾0.0059 after optimization 3 (batch grading)
- → **₾0.0059 target** (90% reduction from baseline)

---

## Approval Checkpoint

**Instructor signature/approval:** _____________________

**Date:** December 11, 2024

**Feedback/suggestions:** 

---

## Summary for Instructor Review

### What We Did (Week 5-6)
1. ✅ Implemented hybrid Gemini Flash (80%) + Pro (20%) model selection
2. ✅ Compressed system prompt from 2,000 → 800 tokens
3. ✅ Enabled Gemini context caching with 24-hour TTL
4. ✅ Validated quality with 50-question golden set (87% Flash vs 91% Pro)
5. ✅ Measured performance: 2.4s avg latency, 65-70% cache hit rate

### Results Achieved
- **Cost reduction: 86%** (₾0.057 → ₾0.0081 per test)
- **Latency improvement: -37%** (3.8s → 2.4s average)
- **Quality maintained: 87%** (exceeds 85% threshold)
- **Budget health: ✅ Excellent** (₾10.04 / ₾150 = 6.7% used)

### Evidence
- Performance baseline: `docs/evidence/performance-baseline.csv`
- Cost tracking: `docs/evidence/cost-tracking-week6.csv`
- Golden set results: `docs/evidence/flash-vs-pro-quality.csv`
- Implementation: `capstone/functions.py` (hybrid model selection logic)

### Next Steps
- Week 8: Monitor production usage with 30-student pilot
- Week 9: Implement semantic caching if cost projections increase
- Week 10: Evaluate batch grading optimization

---

**Document Status:** ✅ Complete  
**Optimizations Status:** ✅ Implemented & Validated  
**Ready for Production:** ✅ Yes