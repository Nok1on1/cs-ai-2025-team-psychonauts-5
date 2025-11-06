Prioritized Backlog (Version 2)

Project Name: Dialogos
Last Updated: Week 4, November 7, 2025
Sprint: Week 4 of 15

📋 Backlog Overview

Total Issues: 12
P1 (Must Have): 5 issues
P2 (Should Have): 4 issues
P3 (Nice to Have): 3 issues
Completed: 3 issues

Current Sprint Focus: Implement core study module features, integrate progress tracking, and prepare UI for first user testing.

🔴 Priority 1: Critical Path (Must Have for MVP)
Issue #1: Implement Study Module Framework

Status: 🟡 In Progress
Assigned: Luka M.
Due: Week 5
Effort: Large (8+ hrs)

User Story:

As a student, I want structured study modules so that I can follow a guided learning path.

Why This Is P1:
Core feature of Dialogos — without study modules, the app cannot deliver its primary learning function.

Acceptance Criteria:

 Users can access a study module from the dashboard

 Modules include sections for lessons, exercises, and summaries

 Progress is tracked per module

Technical Requirements:

Backend API for module retrieval and progress tracking

Database schema for modules and lessons

REST endpoints secured for student sessions

Definition of Done:

 Code committed to feature/study-module branch

 Unit tests for module API (>80% coverage)

 Integration test: module retrieval → lesson view → progress update

 Code review completed

 Deployed to staging

Dependencies:

Blocks: Issue #2 (Lesson content ingestion)

Blocked By: None

Resources:

/docs/study-module-architecture.md

REST API guide: https://restfulapi.net

Issue #2: Lesson Content Ingestion

Status: 🔵 To Do
Assigned: Lasha Giorgi T.
Due: Week 5
Effort: Medium (4–8 hrs)

User Story:

As a student, I want lessons uploaded and structured so that I can study effectively.

Why This Is P1:
Without content, study modules are empty; crucial for MVP.

Acceptance Criteria:

 20 sample lessons uploaded to the system

 Lessons include title, content, and optional multimedia

 Lessons mapped to modules

Technical Requirements:

CSV or JSON ingestion

Backend validation for content format

Definition of Done:

 Lessons available via API

 Unit tests for content validation

Dependencies:

Blocks: Issue #1

Blocked By: None

Resources:

/docs/content-guidelines.md

Issue #3: Progress Tracking Implementation

Status: 🔵 To Do
Assigned: Nikoloz K.
Due: Week 6
Effort: Medium (4–8 hrs)

User Story:

As a student, I want my progress tracked so that I know which lessons I have completed.

Why This Is P1:
Essential for measuring learning outcomes and enabling analytics features.

Acceptance Criteria:

 Completion status stored for each lesson

 Dashboard displays module completion percentage

 Progress saved even after logging out

Technical Requirements:

Backend database updates

API endpoints for updating and retrieving progress

Definition of Done:

 Unit tests for progress tracking

 Integration with dashboard

Dependencies:

Blocks: Issue #1

Blocked By: Issue #2

Resources:

/docs/progress-tracking.md

Issue #4: Dashboard UI Implementation

Status: 🟡 In Progress
Assigned: Sergi A.
Due: Week 5
Effort: Medium (4–8 hrs)

User Story:

As a student, I want a dashboard showing modules, progress, and next tasks so I can navigate efficiently.

Why This Is P1:
Dashboard is the main interaction point; without it, app is unusable.

Acceptance Criteria:

 Display list of modules with progress

 Show upcoming exercises

 UI is responsive

Technical Requirements:

React frontend

Integration with progress tracking API

Mobile-first design

Definition of Done:

 UI matches mockups

 Tested on desktop and mobile

Dependencies:

Blocks: Issue #3

Blocked By: Issue #1

Resources:

Figma UI kit /designs/dashboard

Issue #5: User Authentication & Roles

Status: ✅ Done
Assigned: Luka M.
Due: Week 3
Effort: Medium (4–8 hrs)

User Story:

As a student, I want to log in securely so my data is private.

Why This Is P1:
Required for secure access to modules and progress data.

Acceptance Criteria:

 Students can sign up, log in, and log out

 Passwords stored securely

 Roles defined for admin and student

Technical Requirements:

JWT-based authentication

Role-based access control

Definition of Done:

 Unit tests pass

 Integrated with backend

🟡 Priority 2: Enhanced Features (Should Have)
Issue #6: Reminder & Notifications System

Status: 🔵 To Do
Assigned: Giorgi M.
Due: Week 7
Effort: Medium

User Story:

As a student, I want notifications for upcoming lessons so I don’t miss study sessions.

Why This Is P2:
Improves engagement; not critical for MVP.

Issue #7: Quiz & Assessment Module

Status: 🔵 To Do
Assigned: Lasha Giorgi T.
Due: Week 8
Effort: Large

User Story:

As a student, I want quizzes at the end of lessons so I can test my knowledge.

Why This Is P2:
Important for evaluation but can be added after core module works.

Issue #8: Search Lessons Feature

Status: 🔵 To Do
Assigned: Sergi A.
Due: Week 8
Effort: Medium

User Story:

As a student, I want to search lessons by topic so I can find content quickly.

Why This Is P2:
Enhances usability but not essential for MVP.

Issue #9: Multi-language Support

Status: 🔵 To Do
Assigned: Nikoloz K.
Due: Week 9
Effort: Large

User Story:

As a student, I want content in multiple languages so non-native speakers can learn.

Why This Is P2:
Enhances accessibility; can be deferred if needed.

🟢 Priority 3: Nice-to-Have (Could Have)
Issue #10: Gamification Elements

Description: Badges, streaks, and rewards for completing modules.
Why P3: Nice-to-have for engagement; not essential for MVP.

Issue #11: Dark Mode

Description: Toggle between light and dark themes.
Why P3: Improves UX; can be deferred.

Issue #12: Social Sharing

Description: Share progress or achievements with friends.
Why P3: Optional for MVP; increases engagement.

⏸️ Backlog (Not Prioritized Yet)

 Feedback System: Collect student feedback on lessons

 Analytics Dashboard for Admin: Visualize user engagement and module completion

🚫 Rejected / Cut Features

AI Tutor Integration: Cut due to time constraints for MVP

Offline Mode: Deferred for post-course release

📅 Sprint Timeline
Week 4 (Current)

 Issue #1: Implement Study Module Framework

 Issue #4: Dashboard UI Implementation

 Issue #6: Reminder & Notifications System

Week 5

 Issue #2: Lesson Content Ingestion

 Issue #3: Progress Tracking Implementation

Week 6

 Issue #7: Quiz & Assessment Module

Week 7+

Continue with P2 and P3 features
