# Capstone Proposal

**Course**: Building AI‑Powered Applications

**Team Name**: Dialogos

**Project Title**: Dialogos — AI‑Driven Entrance Exam Tutor

**Date**: October 2025

## Problem Statement

### The Problem

Many students preparing for university entrance exams struggle with static, one‑size‑fits‑all resources that don’t adapt to their evolving weaknesses. Currently, they often use generic preparatory books, shared question banks, or online platforms that do not tailor difficulty or feedback based on individual performance. This leads to inefficient study time, frustration when questions are too easy or too hard, and minimal insight into the reasoning behind answers.

This problem is experienced by high school students across many regions, particularly those with limited access to high‑quality tutoring or adaptive systems. Existing solutions (textbooks, fixed practice tests, generic online platforms) often lack depth, personalization, or reflection prompts. They emphasize answer correctness over understanding. Because these solutions don’t engage students in reflective learning, learners often memorize rather than understand, and plateau in progress.

This issue matters because poor preparation for entrance exams can negatively affect students’ academic futures and cause stress, time lost, and wasted resources. If students cannot diagnose their weak areas or methodically improve, they may underperform despite putting in effort. An AI‑powered solution is suitable here because it can dynamically generate new problems of appropriate difficulty, adapt in real time to a learner’s progress, and provide Socratic-style reflective prompts to deepen understanding. AI can tailor question generation, adapt difficulty curves, and produce introspective feedback without requiring manual content creation at scale.

### Scope

Adaptive mock exam generation (questions tailored to student performance)

Socratic / reasoning feedback prompts to encourage reflection

Performance tracking dashboard (metrics, error areas)

#### What’s Out of Scope (for now):

Live tutoring or chat interface

Integration with third‑party LMS systems

Multilingual support beyond one principal language

Why This Scope Makes Sense:
Focusing on core flows (adaptive test + feedback + tracking) gives a solid, testable MVP within a semester. The out-of-scope features are nice extensions but would risk overreach.

## Target Users

### Primary User Persona

User Type: High school students preparing for university entrance exams

#### Demographics

Age range: 17–19 (or gap-year students)

Technical proficiency: Comfortable using web apps and basic digital tools, but not developers

Context of use: Desktop or mobile browser from home or school

#### User Needs

Need #1: Practice tests matched to their current level
 Why it matters: Avoids wasted time on too-easy or impossible questions
 Current workaround: Pick random or fixed-level tests from books or sites

Need #2: Thoughtful feedback to understand mistakes
 Why it matters: Enables conceptual learning rather than rote memorization
 Current workaround: Look up solutions manually or ask tutors

Need #3: Tracking of strengths and weak topics over time
 Why it matters: Helps focus revision efforts strategically
 Current workaround: Maintain spreadsheets or mental notes

#### User Pain Points

Too many irrelevant or trivial problems

Feedback is surface-level (just “right” or “wrong”)

No guidance on how to improve in weak areas

##### Secondary Users (Optional)

Tutors / Teachers: May use the platform to assign or monitor student progress

Educational institutions: Could adopt the system for cohorts or classes

## Success Criteria

### Product Success Metrics

- Metric #1: Task completion time
 Target: A user can generate and complete a mock test in < 20 minutes
 Measurement method: Timestamp from test start to finish in analytics logs

- Metric #2: Accuracy / Quality of generated questions
 Target: ≥ 85% of questions rated “on target” by expert reviewers
 Measurement method: Expert panel review on sample generated sets

- Metric #3: User satisfaction
 Target: Average feedback ≥ 4.0 / 5
 Measurement method: Exit survey after test session

- Metric #4: Engagement / Adoption
 Target: At least 30 users take > 1 test in the pilot
 Measurement method: Usage analytics over pilot period

- Metric #5: Cost per user interaction
 Target: <$0.10 per generation session
 Measurement method: Track API usage cost vs number of sessions

### Technical Success Criteria

Response latency (p95): < 3 seconds

Availability: ≥ 95% uptime

API error rate: < 5% failed requests

Cost per user: ≤ target above

## Learning Goals

**Giorgi Mikaberidze** (Backend/AI):
 - Advanced prompt engineering and Gemini API integration
 - Scalable Express / Node.js service architecture

**Nikoloz Kvirikashvili** (Database/Backend):
 - MSSQL schema design, optimization, migrations
 - Query performance tuning and indexing

**Sergi Arabidze** (AI Specialist):
 - Experimenting with complex AI features
 - Evaluating model output quality and bias

**Luka Mekoshvili** (Frontend/Communication):
 - Modern React patterns, state management
 - Team communication, stakeholder documentation

**Lasha-Giorgi Tskhadadze** (Designer/Frontend):
 - UI/UX design, responsive layout, accessibility
 - Implementation of polished frontend interfaces

## Technical Architecture

### System Overview

Users access the React frontend to request a mock exam. The frontend sends that request to the Node.js/Express backend, which consults the MSSQL database for user history and question metadata, then calls the Gemini API to generate new questions and reflective prompts. The backend returns the exam and feedback responses, which the frontend displays and stores user responses. Performance metrics and logs are captured.

### Architecture Diagram

               ┌──────────────┐
               │    User      │  
               │ (Browser UI) │  
               └──────┬───────┘
                      │
                      ▼
               ┌──────────────┐
               │  Frontend     │
               │   (React)     │
               └──────┬───────┘
                      │ HTTP/REST
                      ▼
               ┌──────────────┐
               │  Backend API  │
               │  (Express)    │
               └───┬───────┬───┘
                   │       │
        ┌──────────┘       └───────────┐
        ▼                              ▼
┌──────────────┐                 ┌──────────────┐
│   MSSQL DB    │                 │ Gemini AI API │
│ (user / test) │                 └──────────────┘
└──────────────┘

### Technology Stack

#### Frontend

Framework: React

Key libraries: React Router, Styled Components or Tailwind

Hosting: Azure Static Web Apps or similar

#### Backend

Framework: Node.js + Express

Language: JavaScript / TypeScript

Hosting: Azure App Service

#### AI/ML Services

Primary model: Gemini (for question generation and feedback)

Fallback model: Simpler GPT or cached responses

#### Data Storage

MSSQL for relational data (users, test history)

(Optional) Future: vector storage or embeddings store

#### DevOps / Tooling

Version control: GitHub

CI/CD: GitHub Actions (if time allows)

Monitoring & Logging: Custom logs, error tracking

### Data Flow

User requests a new mock test via frontend

Frontend sends request to API with user context

Backend retrieves user history from MSSQL

Backend builds prompt with context and calls Gemini API

Gemini returns generated questions + reasoning prompts

Backend sends back to frontend

User completes test, sends responses back

Backend stores results, updates user model, logs metrics

Frontend displays performance dashboard

### Critical Path Latency Budget

Frontend validation & UI: <100 ms

Backend logic + DB: <300 ms

AI model generation: <2 sec

Total target: < 2.5 sec

AI Integration Details

Model Selection:

Primary use: Text generation (question & reasoning)

Model: Gemini with tuned prompt

### Prompt Strategy

Template includes: user performance summary, problem constraints, style guide

Context length: up to 3,000 tokens

Temperature: ~0.7 for creativity, lower for factual generation

Safety: system prompt restricts generation to educational domain

Retrieval / Context Strategy:

Chunking: archived exam data in ~500-token chunks

Embedding model: Use Gemini embedding API or similar

Similarity metric: Cosine similarity

Top-k: retrieve top 3–5 context chunks

Reranking: optional based on relevance scores

### Third-Party Services & APIs

Service Purpose Cost Estimate Rate Limits / Notes
Gemini API Question + feedback generation ~$0.02–0.05 per 1k tokens Request throttling may apply
Azure App Service Hosting backend Free / minimal tier Scale if needed
MSSQL on Azure Database Free / student tier Must monitor performance

## Risk Assessment

### Technical Risks

Risk #1: API Rate Limits or Outages

Likelihood: Medium

Impact: High

Mitigation: Implement retry logic, exponential backoff, caching, fallback to simpler model

Risk #2: Low Quality or Irrelevant AI Outputs

Likelihood: Medium

Impact: High

Mitigation: Use prompt tuning, manual validation for samples, user feedback loop

Risk #3: Unacceptable Latency / Slow Responses

Likelihood: Medium

Impact: Medium

Mitigation: Cache frequent responses, batch calls, optimize prompt size

Product Risks

Risk #1: Users don’t find it useful

Likelihood: Medium

Impact: High

Mitigation: Early user interviews, prototype testing, iterate based on feedback

Risk #2: Scope creep

Likelihood: High

Impact: Medium

Mitigation: Freeze core features after a deadline, weekly scope review

### Team Risks

Risk #1: Uneven workload distribution

Likelihood: Medium

Impact: Medium

Mitigation: Weekly standups, track GitHub contributions, pair programming

Risk #2: Team member availability / scheduling conflicts

Likelihood: Medium

Impact: Medium

Mitigation: Buffer time in schedule, cross‑training roles

### Safety & Ethical Risks

Risk #1: Prompt injection / malicious input

Likelihood: Low

Impact: Medium

Mitigation: Input sanitization, separate user content from system prompts

Risk #2: AI bias or incorrect explanations

Likelihood: Medium

Impact: Medium

Mitigation: Test with diverse inputs, include disclaimers, allow user override

Risk #3: Privacy / data leakage of user responses

Likelihood: Low

Impact: High

Mitigation: Store minimal PII, anonymize user data, secure database

### Contingency Plans

If primary model fails/unavailable: switch to fallback (e.g. GPT-3.5) and inform users of degraded mode

If testers are scarce: fallback to synthetic user evaluation using curated datasets

If behind schedule: drop or delay optional features (feedback types, dashboards) and focus on core generation + test flow

## Research Plan

### What We Need to Learn

#### Technical Questions

How to integrate streaming API responses in Express backend
 Resources: API docs, example repos
 Timeline: Weeks 3–4

Best approach to chunk and embed archived exam data
 Resources: Research papers / OpenAI cookbook
 Timeline: Week 5

How to mitigate prompt injection and maintain safe generation
 Resources: OWASP, prompt safety guides
 Timeline: Week 6

#### Product Questions

Do users prefer short or detailed feedback prompts?
 Method: A/B test during pilot
 Timeline: Weeks 7–8

What interface layout is easiest for test navigation?
 Method: Usability testing
 Timeline: Weeks 5–7

#### Experiments & Prototypes

Week 3–4: Proof of Concept
 Goal: Full pipeline from request → AI → response
 Success: End‑to‑end flow working with <5 sec latency

Week 5–6: Retrieval-augmented Generation
 Goal: Use real archived data in prompts
 Success: ≥80% of AI responses include relevant context

Week 7–8: First User Testing Round
 Goal: Gather qualitative feedback
 Success: ≥3 users complete tasks and provide feedback

Week 11–12: Optimization & Evaluation
 Goal: Reduce latency and cost
 Success: Meet technical success criteria

## Literature & Resources

OpenAI Cookbook (prompting, retrieval)

Research papers on adaptive testing and AI in education

Prompt safety / injection mitigation resources

## User Study Plan

### Research Ethics

Do we need IRB approval?
Yes — because we collect feedback and potentially work with minors. We will prepare consent forms and abide by an IRB (or equivalent) process.

### Data we’ll collect

Task completion times, user responses, survey feedback, optional screen recordings

Storage period: until end of semester, then anonymized

Access: only team members

User consent:

Use adapted course consent template

Users may withdraw at any time

Clear explanation of data usage, anonymity, and usage boundaries

### Recruitment Plan

Number: 5–8 users per testing round

Criteria: Students preparing for entrance exams (no prior use of similar tools)

Where: Local high schools, student study groups, social media

Compensation: Small gift card, snacks, or course credit

Timeline:
 – Week 3–4: Recruit first batch
 – Week 7–8: User testing round 1
 – Week 11–12: User testing round 2
 – Week 14: Final feedback session

### Testing Protocol

Session Structure (45‑60 min):

Introduction (5 min)
 - Explain study purpose, get consent, think‑aloud instructions

Background Questions (5 min)
 - Ask about current study practices, pain points

Task 1 (10 min): Generate & complete a small mini-test

Task 2 (10 min): Request feedback and interpret reasoning

Task 3 (10 min): View performance dashboard and plan next steps

Post-Task Questions (10 min):
 - What worked? What was confusing?
 - What would they change?
 - Would they use this tool?
 - Rate experience (1–5 scale)

Wrap-up (5 min): Thank them, provide compensation, ask follow‑up permission

### Data Collection Methods

Screen recording (with permission)

Observer notes

Task metrics (completion rate, time, error rate)

Survey responses

System logs (latency, cost, error)

Data Storage:

Raw recordings / notes: secured folder (Google Drive or institutional)

Anonymized summaries in project reports

No identifiable data stored in public repo

### Analysis Plan

Quantitative: completion rates, average times, error rates, satisfaction scores

Qualitative: thematic coding of user feedback, identification of usability issues

Use findings to prioritize improvements and refine features

### Deliverables

User research report (mid and final)

Feature prioritization updates

Input into final case study

## Project Timeline & Milestones

### Weekly Breakdown

| Week | Focus / Deliverable | Owners |
|------|---------------------|--------|
| 1 | Setup — Team formation, project idea | All |
| 2 | Planning — This proposal, team contract, dev environment | All |
| 3 | Core Flow — Basic request → AI response pipeline | Giorgi / Sergi |
| 4 | Design Review — Final architecture, evaluation plan | All |
| 5 | Retrieval — Integrate archived data / context | Nikoloz / Sergi |
| 6 | Functionality — Feedback prompt logic, structured output | Sergi / Giorgi |
| 7 | User Testing 1 — First round testing & feedback | All |
| 8 | Iteration — Apply feedback, polish core flows | All |
| 9 | Midterm / Buffer — Catch-up, refine modules | All |
| 10 | Optimization — Caching, prompt tuning, cost reduction | Giorgi / Nikoloz |
| 11 | Safety & Audit — Bias testing, red teaming | All |
| 12 | Evaluation — Golden dataset tests, regression | Sergi / Giorgi |
| 13 | Production — CI/CD, deployment, monitoring | Nikoloz / Giorgi |
| 14 | Polish & Testing 2 — Refinements, second user round | All |
| 15 | Final Demo — Presentation, demo, case study | All |

### Major Milestones

1. Milestone 1 — Proposal submission (Week 2)  
       - Deliverable: Final proposal submitted

2. Milestone 2 — Design review (Week 4)  
       - Deliverables: architecture diagrams, evaluation plan, product backlog

3. Milestone 3 — Safety & evaluation audit (Week 11)  
       - Deliverables: red‑teaming report, bias checks, telemetry baseline

4. Milestone 4 — Final demo (Week 15)  
       - Deliverables: Working product, presentation, case study

#### Dependencies

- Core flow (Week 3) is a prerequisite for user testing  
- Retrieval logic (Week 5) depends on a stable architecture  
- Feature freeze must precede optimization efforts

#### Backup plan

- If behind schedule: drop nonessential features (expanded dashboards, extra feedback modes)  
- Preserve core features: adaptive test + feedback + basic tracking  
- Reprioritize tasks and use buffer weeks as needed
