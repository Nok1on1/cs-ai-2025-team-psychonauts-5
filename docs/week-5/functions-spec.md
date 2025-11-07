# Function Specification Template

**Team Name:** Dialogos 
**Project:** Dialogos — AI-Driven Entrance Exam Tutor  
**Date:** Week 4, November 6, 2025

---

## Overview

**Number of Functions:** 3 functions

**Purpose of Function Calling in Our Project:**

Dialogos uses function calling to enable the AI tutor to dynamically generate personalized practice tests, provide adaptive Socratic feedback based on student performance, and retrieve performance analytics to guide learning. The AI analyzes student queries and performance data to determine when to generate new questions, provide hints, or show progress insights.

---

## Function Calling Flow

Here's how function calling will work in our system:

```
1. User Query → AI receives message (e.g., "I want to practice Math at medium difficulty")
2. AI Decision → Determines function needed (generate_practice_test)
3. Function Call → AI generates {
     "function": "generate_practice_test",
     "arguments": {
       "subject": "Math",
       "difficulty": 3,
       "num_questions": 10,
       "focus_topics": ["Quadratic Equations", "Geometry"]
     }
   }
4. OUR CODE executes → Backend calls Gemini API with optimized prompts, 
                       stores test in database, returns test_id
5. Function Result → We send back {
     "status": "success",
     "data": {
       "test_id": "test_123",
       "questions": [...10 questions...],
       "estimated_time": 15
     }
   }
6. AI Response → AI synthesizes natural response:
                "I've created a 10-question Math test focused on your weak areas.
                 Let's start with Question 1..."
7. User Sees Result → Frontend displays first question with multiple choice options
```

**Critical Point:** The LLM does NOT generate questions directly in chat. It identifies what type of practice the student needs, then our backend uses specialized Gemini prompts (optimized for educational content) to generate high-quality exam questions.

---

## Function 1: generate_practice_test

### Basic Information

**Function Name:** `generate_practice_test`

**Purpose:** Generate a personalized practice test with adaptive difficulty based on student's performance history and weak topics.

**When AI Should Call This:**
- User explicitly requests a practice test (e.g., "I want to practice Math")
- User specifies difficulty level (e.g., "Give me medium difficulty questions")
- User wants to focus on specific topics (e.g., "I need help with Quadratic Equations")
- Conversational triggers like "test me", "quiz me", "I want questions", "practice problems"
- After reviewing previous test results and user says "try another test"

### Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `subject` | string (enum) | Yes | ["Math", "Logic", "English"] | Subject area for the practice test |
| `difficulty` | integer | Yes | Min: 1, Max: 5 | Difficulty level (1=easiest, 5=hardest) matching Georgian exam standards |
| `num_questions` | integer | No | Min: 5, Max: 15, Default: 10 | Number of questions to generate |
| `focus_topics` | array[string] | No | Non-empty array if provided | Specific topics to emphasize (e.g., ["Quadratic Equations", "Geometry Proofs"]) |
| `user_id` | string | Yes | UUID format | Student's user ID to fetch performance history |

**Example:**
| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `subject` | string | Yes | Must be "Math", "Logic", or "English" | Subject for practice test |
| `difficulty` | integer | Yes | 1-5 scale | Difficulty level calibrated to student ability |
| `num_questions` | integer | No | 5-15, default 10 | Number of questions to generate |
| `focus_topics` | array[string] | No | e.g., ["Quadratic Equations"] | Topics where student is weak |
| `user_id` | string | Yes | Pattern: ^[a-f0-9-]{36}$ | UUID of authenticated student |

### Return Structure

**On Success:**
```json
{
  "status": "success",
  "data": {
    "test_id": "test_a7f3e9c2",
    "subject": "Math",
    "difficulty": 3,
    "num_questions": 10,
    "estimated_time_minutes": 15,
    "questions": [
      {
        "question_index": 0,
        "question_text": "Solve for x: x² - 5x + 6 = 0",
        "options": [
          "A) x = 2 or x = 3",
          "B) x = -2 or x = -3",
          "C) x = 1 or x = 6",
          "D) No real solutions"
        ],
        "topic": "Quadratic Equations",
        "correct_answer": "A"
      },
      {
        "question_index": 1,
        "question_text": "If a triangle has sides of length 3, 4, and 5, what type of triangle is it?",
        "options": [
          "A) Acute",
          "B) Right",
          "C) Obtuse",
          "D) Equilateral"
        ],
        "topic": "Geometry",
        "correct_answer": "B"
      }
      // ... 8 more questions
    ],
    "created_at": "2025-11-06T14:30:00Z"
  }
}
```

**On Error:**
```json
{
  "status": "error",
  "error_code": "INVALID_SUBJECT",
  "error_message": "Subject 'Physics' is not supported. Choose from: Math, Logic, English",
  "details": {
    "valid_subjects": ["Math", "Logic", "English"]
  }
}
```

### JSON Schema (For the LLM)

```json
{
  "name": "generate_practice_test",
  "description": "Generate a personalized practice test for Georgian National Entrance Exam preparation. Creates multiple-choice questions adapted to the student's performance history, weak topics, and desired difficulty level. Use this when the student wants to practice, requests a test, or asks for questions on specific topics. The function will automatically fetch the student's performance data and generate appropriately challenging questions.",
  "parameters": {
    "type": "object",
    "properties": {
      "subject": {
        "type": "string",
        "enum": ["Math", "Logic", "English"],
        "description": "The subject area for the practice test. Math covers algebra, geometry, arithmetic. Logic covers pattern recognition and deductive reasoning. English covers grammar and reading comprehension."
      },
      "difficulty": {
        "type": "integer",
        "description": "Difficulty level from 1 (easiest, basic concepts) to 5 (hardest, exam-level advanced). Level 3 is medium difficulty suitable for most students. Recommend based on student's recent accuracy: <60% accuracy → level 2, 60-80% → level 3, >80% → level 4.",
        "minimum": 1,
        "maximum": 5
      },
      "num_questions": {
        "type": "integer",
        "description": "Number of questions to generate (5-15). Default is 10 questions which takes about 15 minutes. Use 5 for quick practice, 15 for comprehensive review.",
        "minimum": 5,
        "maximum": 15,
        "default": 10
      },
      "focus_topics": {
        "type": "array",
        "items": {
          "type": "string"
        },
        "description": "Optional list of specific topics to emphasize in the test (e.g., ['Quadratic Equations', 'Geometry Proofs']). If student mentions struggling with a topic or wants to practice something specific, include it here. Leave empty for balanced coverage across all topics.",
        "default": []
      },
      "user_id": {
        "type": "string",
        "description": "The authenticated student's user ID (UUID format). This is automatically available from the session context.",
        "pattern": "^[a-f0-9-]{36}$"
      }
    },
    "required": ["subject", "difficulty", "user_id"]
  }
}
```

### Implementation Pseudocode

```python
def generate_practice_test(subject: str, difficulty: int, user_id: str, 
                          num_questions: int = 10, focus_topics: list = []):
    """
    Generate adaptive practice test using Gemini API with student context
    """
    # Step 1: Validate inputs
    if subject not in ["Math", "Logic", "English"]:
        return error_response("INVALID_SUBJECT", 
                            f"Subject '{subject}' not supported")
    
    if not 1 <= difficulty <= 5:
        return error_response("INVALID_DIFFICULTY", 
                            "Difficulty must be between 1 and 5")
    
    if not 5 <= num_questions <= 15:
        return error_response("INVALID_NUM_QUESTIONS", 
                            "Number of questions must be between 5 and 15")
    
    # Step 2: Check authorization
    user = get_authenticated_user()
    if user.id != user_id:
        return error_response("UNAUTHORIZED", 
                            "Cannot generate test for another user")
    
    # Step 3: Fetch student performance history
    performance = database.query("""
        SELECT topic, AVG(is_correct) as accuracy
        FROM responses
        WHERE user_id = ?
        GROUP BY topic
        ORDER BY accuracy ASC
        LIMIT 5
    """, user_id)
    
    weak_topics = [row.topic for row in performance if row.accuracy < 0.6]
    
    # Merge with explicitly requested focus_topics
    if focus_topics:
        weak_topics = list(set(weak_topics + focus_topics))
    
    # Step 4: Determine model selection (80% Flash, 20% Pro)
    simple_question_count = int(num_questions * 0.8)
    complex_question_count = num_questions - simple_question_count
    
    # Step 5: Build optimized prompts
    system_prompt = build_system_prompt(subject, difficulty)  # 800 tokens
    user_context = build_user_context(weak_topics, performance)  # 300 tokens
    
    # Step 6: Call Gemini API (hybrid model strategy)
    try:
        # Generate simple questions with Flash (fast, cheap)
        flash_questions = call_gemini_flash(
            system_prompt=system_prompt,
            user_context=user_context,
            num_questions=simple_question_count,
            difficulty=difficulty
        )
        
        # Generate complex questions with Pro (better reasoning)
        pro_questions = call_gemini_pro(
            system_prompt=system_prompt,
            user_context=user_context,
            num_questions=complex_question_count,
            difficulty=difficulty + 1  # Slightly harder for complex
        )
        
        all_questions = flash_questions + pro_questions
        shuffle(all_questions)  # Mix so user doesn't know which are complex
        
    except GeminiAPIError as e:
        log_error("Gemini API failed", e)
        return error_response("AI_GENERATION_FAILED", 
                            "Unable to generate questions. Please try again.")
    
    # Step 7: Validate AI output quality
    if not validate_questions(all_questions):
        log_warning("Generated questions failed validation", all_questions)
        return error_response("INVALID_QUESTIONS", 
                            "Generated questions did not meet quality standards")
    
    # Step 8: Store test in database
    test_id = generate_uuid()
    database.execute("""
        INSERT INTO tests (id, user_id, subject, difficulty, questions, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (test_id, user_id, subject, difficulty, json.dumps(all_questions), datetime.now()))
    
    # Step 9: Log for cost tracking
    log_api_usage(
        test_id=test_id,
        model="80% Flash, 20% Pro",
        input_tokens=1100,  # 800 system + 300 context
        output_tokens=2000,  # 10 questions
        cost=0.0081  # Optimized cost
    )
    
    # Step 10: Return formatted response
    return {
        "status": "success",
        "data": {
            "test_id": test_id,
            "subject": subject,
            "difficulty": difficulty,
            "num_questions": num_questions,
            "estimated_time_minutes": num_questions * 1.5,  # 1.5 min per question
            "questions": all_questions,
            "created_at": datetime.now().isoformat()
        }
    }
```

### Example Usage

**User Input:**
```
"I want to practice Math at medium difficulty. I'm struggling with Quadratic Equations."
```

**AI Generates:**
```json
{
  "function": "generate_practice_test",
  "arguments": {
    "subject": "Math",
    "difficulty": 3,
    "num_questions": 10,
    "focus_topics": ["Quadratic Equations"],
    "user_id": "a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f"
  }
}
```

**Our Code Executes:**
```python
result = generate_practice_test(
    subject="Math",
    difficulty=3,
    num_questions=10,
    focus_topics=["Quadratic Equations"],
    user_id="a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f"
)
```

**Function Returns:**
```json
{
  "status": "success",
  "data": {
    "test_id": "test_a7f3e9c2",
    "subject": "Math",
    "difficulty": 3,
    "num_questions": 10,
    "estimated_time_minutes": 15,
    "questions": [
      {
        "question_index": 0,
        "question_text": "Solve for x: x² - 5x + 6 = 0",
        "options": ["A) x = 2 or x = 3", "B) x = -2 or x = -3", "C) x = 1 or x = 6", "D) No real solutions"],
        "topic": "Quadratic Equations",
        "correct_answer": "A"
      }
      // ... 9 more questions
    ]
  }
}
```

**AI Responds to User:**
```
"Perfect! I've created a 10-question Math test at medium difficulty, with extra focus 
on Quadratic Equations since you mentioned struggling with that topic. The test should 
take about 15 minutes. Let's start with Question 1:

**Question 1:** Solve for x: x² - 5x + 6 = 0

A) x = 2 or x = 3  
B) x = -2 or x = -3  
C) x = 1 or x = 6  
D) No real solutions

Take your time and let me know your answer!"
```

### Safety Considerations

**Input Validation:**
- [x] Validate subject is in allowed list (Math, Logic, English)
- [x] Validate difficulty is 1-5 integer
- [x] Validate num_questions is 5-15 integer
- [x] Validate user_id matches UUID pattern
- [x] Sanitize focus_topics array (no SQL injection, XSS)

**Authorization:**
- [x] Verify user is authenticated via JWT token
- [x] Verify user_id matches authenticated session
- [x] Rate limiting: Max 20 test generations per user per day
- [x] Check user hasn't exceeded daily quota

**Error Handling:**
- [x] Never expose Gemini API errors to user (log internally)
- [x] Graceful fallback if Gemini API down (return cached questions)
- [x] Validate AI-generated questions before returning (no malformed JSON)
- [x] Timeout after 10 seconds (prevent hanging requests)

**Quality Assurance:**
- [x] Validate each question has exactly 4 options
- [x] Validate correct_answer is one of A/B/C/D
- [x] Check for mathematical errors in Math questions (confidence scoring)
- [x] Flag questions for review if Gemini confidence < 0.7

**Specific Safety Rules for This Function:**
1. **Rate Limiting:** User can generate max 20 tests per day (prevents API abuse and budget exhaustion)
2. **Content Validation:** All Math questions must pass basic sanity checks (e.g., equations must be solvable)
3. **Cost Caps:** If daily API cost exceeds ₾6 ($2), temporarily block test generation for all users
4. **Authorization:** Users can only generate tests for themselves (user_id must match session)
5. **Topic Validation:** If focus_topics includes non-curriculum topics, filter them out (no "Calculus" in Georgian exam)

---

## Function 2: get_socratic_feedback

### Basic Information

**Function Name:** `get_socratic_feedback`

**Purpose:** Provide Socratic-style hints for incorrect answers that guide students to discover the correct reasoning without directly revealing the answer.

**When AI Should Call This:**
- Student submits an answer and gets it wrong
- Student explicitly asks for a hint (e.g., "Can you give me a hint?")
- Student is confused about a question (e.g., "I don't understand this")
- Student wants to understand their mistake (e.g., "Why is my answer wrong?")
- Conversational triggers like "help me", "I'm stuck", "explain", "give me a clue"

### Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `test_id` | string | Yes | Pattern: ^test_[a-f0-9]{8}$ | Unique test identifier |
| `question_index` | integer | Yes | Min: 0, Max: 14 | Zero-indexed question number |
| `user_answer` | string | Yes | Must be "A", "B", "C", or "D" | Student's selected answer |
| `user_id` | string | Yes | UUID format | Student's user ID for authorization |

### Return Structure

**On Success:**
```json
{
  "status": "success",
  "data": {
    "test_id": "test_a7f3e9c2",
    "question_index": 0,
    "is_correct": false,
    "socratic_hint": "Think about what happens when you factor x² - 5x + 6. What two numbers multiply to give 6 and add to give -5?",
    "follow_up_questions": [
      "What are the factors of 6?",
      "Which pair of factors adds up to -5?"
    ],
    "explanation_available": true
  }
}
```

**On Error:**
```json
{
  "status": "error",
  "error_code": "TEST_NOT_FOUND",
  "error_message": "Test with ID test_a7f3e9c2 does not exist or has been deleted",
  "details": {}
}
```

### JSON Schema

```json
{
  "name": "get_socratic_feedback",
  "description": "Generate Socratic-style hints for incorrect answers that guide students toward understanding without directly revealing the solution. Use this when a student answers a question incorrectly, asks for help, or wants to understand their mistake. The feedback includes thought-provoking questions that lead students to discover the correct reasoning themselves.",
  "parameters": {
    "type": "object",
    "properties": {
      "test_id": {
        "type": "string",
        "description": "The unique identifier of the test containing the question",
        "pattern": "^test_[a-f0-9]{8}$"
      },
      "question_index": {
        "type": "integer",
        "description": "Zero-indexed position of the question in the test (0 for first question, 1 for second, etc.)",
        "minimum": 0,
        "maximum": 14
      },
      "user_answer": {
        "type": "string",
        "enum": ["A", "B", "C", "D"],
        "description": "The answer choice the student selected (A, B, C, or D)"
      },
      "user_id": {
        "type": "string",
        "description": "The authenticated student's user ID",
        "pattern": "^[a-f0-9-]{36}$"
      }
    },
    "required": ["test_id", "question_index", "user_answer", "user_id"]
  }
}
```

### Implementation Pseudocode

```python
def get_socratic_feedback(test_id: str, question_index: int, 
                         user_answer: str, user_id: str):
    """
    Generate Socratic hints for incorrect answers using Gemini API
    """
    # Step 1: Validate inputs
    if not re.match(r"^test_[a-f0-9]{8}$", test_id):
        return error_response("INVALID_TEST_ID", "Test ID format is invalid")
    
    if user_answer not in ["A", "B", "C", "D"]:
        return error_response("INVALID_ANSWER", "Answer must be A, B, C, or D")
    
    # Step 2: Check authorization
    user = get_authenticated_user()
    if user.id != user_id:
        return error_response("UNAUTHORIZED", 
                            "Cannot access feedback for another user's test")
    
    # Step 3: Retrieve test and question from database
    test = database.query("""
        SELECT * FROM tests WHERE id = ? AND user_id = ?
    """, test_id, user_id)
    
    if not test:
        return error_response("TEST_NOT_FOUND", 
                            f"Test {test_id} not found or not owned by user")
    
    questions = json.loads(test.questions)
    
    if question_index < 0 or question_index >= len(questions):
        return error_response("INVALID_QUESTION_INDEX", 
                            f"Question index {question_index} out of range")
    
    question = questions[question_index]
    correct_answer = question["correct_answer"]
    
    # Step 4: Check if answer is correct
    is_correct = (user_answer == correct_answer)
    
    # If correct, return positive feedback (no Socratic hint needed)
    if is_correct:
        return {
            "status": "success",
            "data": {
                "is_correct": True,
                "feedback": "Correct! Great job!",
                "explanation": question.get("explanation", "")
            }
        }
    
    # Step 5: Generate Socratic hint using Gemini Flash (cheaper, sufficient for hints)
    socratic_prompt = f"""
    The student answered this question incorrectly:
    
    Question: {question["question_text"]}
    Options: {question["options"]}
    Correct Answer: {correct_answer}
    Student's Answer: {user_answer}
    Topic: {question["topic"]}
    
    Provide a Socratic hint that:
    1. Does NOT give away the answer directly
    2. Asks thought-provoking questions
    3. Guides them to reconsider their reasoning
    4. Focuses on the key concept they're missing
    
    Return JSON:
    {{
      "socratic_hint": "...",
      "follow_up_questions": ["...", "..."]
    }}
    """
    
    try:
        gemini_response = call_gemini_flash(
            prompt=socratic_prompt,
            max_tokens=300,  # Hints are short
            temperature=0.7  # Slightly creative for pedagogical variety
        )
        
        feedback_data = json.loads(gemini_response)
        
    except GeminiAPIError as e:
        log_error("Gemini feedback generation failed", e)
        # Fallback to generic hint
        feedback_data = {
            "socratic_hint": f"Think carefully about {question['topic']}. What concept applies here?",
            "follow_up_questions": ["What is the key principle?", "What did you assume?"]
        }
    
    # Step 6: Store feedback in database (for analytics)
    database.execute("""
        INSERT INTO feedback_logs (test_id, question_index, user_answer, hint_shown, created_at)
        VALUES (?, ?, ?, ?, ?)
    """, (test_id, question_index, user_answer, feedback_data["socratic_hint"], datetime.now()))
    
    # Step 7: Log for cost tracking
    log_api_usage(
        operation="socratic_feedback",
        model="gemini-flash",
        input_tokens=250,
        output_tokens=150,
        cost=0.00015  # Flash is very cheap
    )
    
    # Step 8: Return formatted response
    return {
        "status": "success",
        "data": {
            "test_id": test_id,
            "question_index": question_index,
            "is_correct": False,
            "socratic_hint": feedback_data["socratic_hint"],
            "follow_up_questions": feedback_data["follow_up_questions"],
            "explanation_available": True  # Full explanation available if still stuck
        }
    }
```

### Example Usage

**User Input:**
```
"I chose B, but that's wrong. Can you help me understand why?"
```

**AI Generates:**
```json
{
  "function": "get_socratic_feedback",
  "arguments": {
    "test_id": "test_a7f3e9c2",
    "question_index": 0,
    "user_answer": "B",
    "user_id": "a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f"
  }
}
```

**Our Code Executes:**
```python
result = get_socratic_feedback(
    test_id="test_a7f3e9c2",
    question_index=0,
    user_answer="B",
    user_id="a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f"
)
```

**Function Returns:**
```json
{
  "status": "success",
  "data": {
    "test_id": "test_a7f3e9c2",
    "question_index": 0,
    "is_correct": false,
    "socratic_hint": "Think about what happens when you factor x² - 5x + 6. What two numbers multiply to give 6 and add to give -5?",
    "follow_up_questions": [
      "What are the factors of 6?",
      "Which pair of factors adds up to -5?"
    ],
    "explanation_available": true
  }
}
```

**AI Responds to User:**
```
"Let's think through this together! 🤔

Think about what happens when you factor x² - 5x + 6. What two numbers multiply 
to give 6 and add to give -5?

Here are some questions to guide you:
- What are the factors of 6?
- Which pair of factors adds up to -5?

Take a moment to work through these questions. If you're still stuck, I can show 
you the full explanation."
```

### Safety Considerations

**Input Validation:**
- [x] Validate test_id matches expected format
- [x] Validate question_index is within test bounds
- [x] Validate user_answer is A/B/C/D only
- [x] Sanitize all inputs before database queries

**Authorization:**
- [x] Verify user owns the test (user_id match)
- [x] Check test hasn't been deleted
- [x] Rate limiting: Max 50 feedback requests per user per day

**Error Handling:**
- [x] Graceful fallback if Gemini fails (generic hint)
- [x] Never reveal correct answer in Socratic hint
- [x] Log all feedback requests for quality monitoring

**Educational Safety:**
- [x] Validate Socratic hint doesn't accidentally give away answer
- [x] Ensure hints are appropriate difficulty (not too easy, not too cryptic)
- [x] Flag hints that are too direct for manual review

**Specific Safety Rules for This Function:**
1. **No Answer Leakage:** Socratic hints must NEVER contain the letter of the correct answer (A/B/C/D)
2. **Topic Alignment:** Hints must reference the question's topic, not unrelated concepts
3. **Appropriate Difficulty:** Hints should match student's current level (no PhD-level explanations for basic questions)
4. **Rate Limiting:** Max 5 hints per question (prevents hint-spamming instead of thinking)

---

## Function 3: get_performance_summary

### Basic Information

**Function Name:** `get_performance_summary`

**Purpose:** Retrieve student's performance analytics including accuracy trends, weak topics, and personalized recommendations for what to practice next.

**When AI Should Call This:**
- User asks about their progress (e.g., "How am I doing?")
- User wants to see their weak areas (e.g., "What should I focus on?")
- User asks for recommendations (e.g., "What should I practice next?")
- Conversational triggers like "show my progress", "performance dashboard", "my stats"
- At the start of a session to provide context-aware tutoring

### Parameters

| Parameter | Type | Required | Validation | Description |
|-----------|------|----------|------------|-------------|
| `user_id` | string | Yes | UUID format | Student's user ID |
| `timeframe` | string (enum) | No | ["week", "month", "all_time"], Default: "all_time" | Time period for analytics |
| `subject_filter` | string (enum) | No | ["Math", "Logic", "English", "all"], Default: "all" | Filter by specific subject or show all |

### Return Structure

**On Success:**
```json
{
  "status": "success",
  "data": {
    "user_id": "a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f",
    "timeframe": "all_time",
    "overall_accuracy": 68.5,
    "total_tests_completed": 12,
    "total_questions_answered": 120,
    "accuracy_by_subject": {
      "Math": 65.0,
      "Logic": 72.0,
      "English": 70.0
    },
    "weak_topics": [
      {"topic": "Quadratic Equations", "accuracy": 45.0, "questions_attempted": 8},
      {"topic": "Geometry Proofs", "accuracy": 52.0, "questions_attempted": 12},
      {"topic": "Pattern Recognition", "accuracy": 58.0, "questions_attempted": 10}
    ],
    "strong_topics": [
      {"topic": "Linear Equations", "accuracy": 88.0, "questions_attempted": 15},
      {"topic": "Basic Algebra", "accuracy": 92.0, "questions_attempted": 10}
    ],
    "accuracy_trend": [
      {"week": "Week 1", "accuracy": 58.0},
      {"week": "Week 2", "accuracy": 65.0},
      {"week": "Week 3", "accuracy": 68.5}
    ],
    "recommended_difficulty": 3,
    "recommendations": [
      "Practice more Quadratic Equations (45% accuracy → goal: 75%)",
      "Focus on Geometry Proofs - you're improving but need more practice",
      "Consider taking a medium difficulty (level 3) test next"
    ]
  }
}
```

**On Error:**
```json
{
  "status": "error",
  "error_code": "INSUFFICIENT_DATA",
  "error_message": "You haven't completed any tests yet. Complete at least one test to see your performance analytics.",
  "details": {
    "tests_completed": 0,
    "minimum_required": 1
  }
}
```

### JSON Schema

```json
{
  "name": "get_performance_summary",
  "description": "Retrieve comprehensive performance analytics for a student including overall accuracy, subject-level performance, weak topics needing practice, strong topics to maintain, accuracy trends over time, and personalized recommendations. Use this when students ask about their progress, want to know what to practice, or need guidance on next steps. Helps provide data-driven tutoring advice.",
  "parameters": {
    "type": "object",
    "properties": {
      "user_id": {
        "type": "string",
        "description": "The authenticated student's user ID (UUID format)",
        "pattern": "^[a-f0-9-]{36}$"
      },
      "timeframe": {
        "type": "string",
        "enum": ["week", "month", "all_time"],
        "description": "Time period for analytics: 'week' (last 7 days), 'month' (last 30 days), or 'all_time' (since account creation). Default is 'all_time'.",
        "default": "all_time"
      },
      "subject_filter": {
        "type": "string",
        "enum": ["Math", "Logic", "English", "all"],
        "description": "Filter results by specific subject or show 'all' subjects combined. Default is 'all'.",
        "default": "all"
      }
    },
    "required": ["user_id"]
  }
}
```

### Implementation Pseudocode

```python
def get_performance_summary(user_id: str, timeframe: str = "all_time", 
                           subject_filter: str = "all"):
    """
    Retrieve and calculate student performance analytics from database
    """
    # Step 1: Validate inputs
    if timeframe not in ["week", "month", "all_time"]:
        return error_response("INVALID_TIMEFRAME", 
                            "Timeframe must be 'week', 'month', or 'all_time'")
    
    if subject_filter not in ["Math", "Logic", "English", "all"]:
        return error_response("INVALID_SUBJECT_FILTER", 
                            "Subject filter must be Math, Logic, English, or all")
    
    # Step 2: Check authorization
    user = get_authenticated_user()
    if user.id != user_id:
        return error_response("UNAUTHORIZED", 
                            "Cannot access performance data for another user")
    
    # Step 3: Calculate date range based on timeframe
    if timeframe == "week":
        start_date = datetime.now() - timedelta(days=7)
    elif timeframe == "month":
        start_date = datetime.now() - timedelta(days=30)
    else:  # all_time
        start_date = datetime.min
    
    # Step 4: Query overall statistics
    overall_stats = database.query("""
        SELECT 
            COUNT(DISTINCT r.test_id) as total_tests,
            COUNT(r.id) as total_questions,
            AVG(CASE WHEN r.is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as overall_accuracy
        FROM responses r
        JOIN tests t ON r.test_id = t.id
        WHERE r.user_id = ?
          AND t.created_at >= ?
          AND (t.subject = ? OR ? = 'all')
    """, user_id, start_date, subject_filter, subject_filter)
    
    # Check if user has any data
    if overall_stats.total_tests == 0:
        return error_response("INSUFFICIENT_DATA", 
                            "Complete at least one test to see analytics",
                            details={"tests_completed": 0, "minimum_required": 1})
    
    # Step 5: Query accuracy by subject
    subject_accuracy = database.query("""
        SELECT 
            t.subject,
            AVG(CASE WHEN r.is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as accuracy
        FROM responses r
        JOIN tests t ON r.test_id = t.id
        WHERE r.user_id = ?
          AND t.created_at >= ?
        GROUP BY t.subject
    """, user_id, start_date)
    
    accuracy_by_subject = {row.subject: round(row.accuracy, 1) 
                          for row in subject_accuracy}
    
    # Step 6: Identify weak topics (accuracy < 60%)
    weak_topics = database.query("""
        SELECT 
            r.question_topic as topic,
            AVG(CASE WHEN r.is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as accuracy,
            COUNT(r.id) as questions_attempted
        FROM responses r
        JOIN tests t ON r.test_id = t.id
        WHERE r.user_id = ?
          AND t.created_at >= ?
          AND (t.subject = ? OR ? = 'all')
        GROUP BY r.question_topic
        HAVING accuracy < 60
        ORDER BY accuracy ASC
        LIMIT 5
    """, user_id, start_date, subject_filter, subject_filter)
    
    weak_topics_list = [
        {
            "topic": row.topic,
            "accuracy": round(row.accuracy, 1),
            "questions_attempted": row.questions_attempted
        }
        for row in weak_topics
    ]
    
    # Step 7: Identify strong topics (accuracy > 80%)
    strong_topics = database.query("""
        SELECT 
            r.question_topic as topic,
            AVG(CASE WHEN r.is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as accuracy,
            COUNT(r.id) as questions_attempted
        FROM responses r
        JOIN tests t ON r.test_id = t.id
        WHERE r.user_id = ?
          AND t.created_at >= ?
          AND (t.subject = ? OR ? = 'all')
        GROUP BY r.question_topic
        HAVING accuracy > 80
        ORDER BY accuracy DESC
        LIMIT 5
    """, user_id, start_date, subject_filter, subject_filter)
    
    strong_topics_list = [
        {
            "topic": row.topic,
            "accuracy": round(row.accuracy, 1),
            "questions_attempted": row.questions_attempted
        }
        for row in strong_topics
    ]
    
    # Step 8: Calculate accuracy trend (weekly buckets)
    if timeframe in ["month", "all_time"]:
        accuracy_trend = database.query("""
            SELECT 
                WEEK(t.created_at) as week_num,
                CONCAT('Week ', WEEK(t.created_at) - WEEK(MIN(t.created_at) OVER ()) + 1) as week_label,
                AVG(CASE WHEN r.is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as accuracy
            FROM responses r
            JOIN tests t ON r.test_id = t.id
            WHERE r.user_id = ?
              AND t.created_at >= ?
            GROUP BY WEEK(t.created_at)
            ORDER BY week_num
        """, user_id, start_date)
        
        trend_list = [
            {"week": row.week_label, "accuracy": round(row.accuracy, 1)}
            for row in accuracy_trend
        ]
    else:
        trend_list = []  # Don't show trend for 1-week timeframe
    
    # Step 9: Recommend difficulty level based on recent accuracy
    recent_accuracy = overall_stats.overall_accuracy
    
    if recent_accuracy < 50:
        recommended_difficulty = 2  # Easy
    elif recent_accuracy < 70:
        recommended_difficulty = 3  # Medium
    elif recent_accuracy < 85:
        recommended_difficulty = 4  # Hard
    else:
        recommended_difficulty = 5  # Very Hard
    
    # Step 10: Generate personalized recommendations
    recommendations = []
    
    # Recommend practice on weak topics
    if weak_topics_list:
        top_weak = weak_topics_list[0]
        recommendations.append(
            f"Practice more {top_weak['topic']} ({top_weak['accuracy']:.0f}% accuracy → goal: 75%)"
        )
        
        if len(weak_topics_list) > 1:
            second_weak = weak_topics_list[1]
            recommendations.append(
                f"Focus on {second_weak['topic']} - you're improving but need more practice"
            )
    
    # Recommend maintaining strong topics
    if strong_topics_list:
        recommendations.append(
            f"Great work on {strong_topics_list[0]['topic']}! Keep it up with periodic review"
        )
    
    # Recommend difficulty adjustment
    if recent_accuracy > 85:
        recommendations.append(
            f"You're mastering level {recommended_difficulty - 1}! Try level {recommended_difficulty} for a challenge"
        )
    elif recent_accuracy < 50:
        recommendations.append(
            f"Consider starting with easier questions (level {recommended_difficulty}) to build confidence"
        )
    else:
        recommendations.append(
            f"Continue with level {recommended_difficulty} difficulty - you're making good progress"
        )
    
    # Step 11: Cache result (reduce database load for repeated requests)
    cache_key = f"performance:{user_id}:{timeframe}:{subject_filter}"
    redis_client.setex(cache_key, 300, json.dumps({  # Cache 5 minutes
        "overall_accuracy": overall_stats.overall_accuracy,
        "weak_topics": weak_topics_list,
        "strong_topics": strong_topics_list
    }))
    
    # Step 12: Return formatted response
    return {
        "status": "success",
        "data": {
            "user_id": user_id,
            "timeframe": timeframe,
            "overall_accuracy": round(overall_stats.overall_accuracy, 1),
            "total_tests_completed": overall_stats.total_tests,
            "total_questions_answered": overall_stats.total_questions,
            "accuracy_by_subject": accuracy_by_subject,
            "weak_topics": weak_topics_list,
            "strong_topics": strong_topics_list,
            "accuracy_trend": trend_list,
            "recommended_difficulty": recommended_difficulty,
            "recommendations": recommendations
        }
    }
```

### Example Usage

**User Input:**
```
"How am I doing? What should I focus on next?"
```

**AI Generates:**
```json
{
  "function": "get_performance_summary",
  "arguments": {
    "user_id": "a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f",
    "timeframe": "all_time",
    "subject_filter": "all"
  }
}
```

**Our Code Executes:**
```python
result = get_performance_summary(
    user_id="a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f",
    timeframe="all_time",
    subject_filter="all"
)
```

**Function Returns:**
```json
{
  "status": "success",
  "data": {
    "user_id": "a7f3e9c2-8d4b-4e1a-9f2c-3b6d8a9e1c4f",
    "timeframe": "all_time",
    "overall_accuracy": 68.5,
    "total_tests_completed": 12,
    "total_questions_answered": 120,
    "accuracy_by_subject": {
      "Math": 65.0,
      "Logic": 72.0,
      "English": 70.0
    },
    "weak_topics": [
      {"topic": "Quadratic Equations", "accuracy": 45.0, "questions_attempted": 8},
      {"topic": "Geometry Proofs", "accuracy": 52.0, "questions_attempted": 12}
    ],
    "strong_topics": [
      {"topic": "Linear Equations", "accuracy": 88.0, "questions_attempted": 15},
      {"topic": "Basic Algebra", "accuracy": 92.0, "questions_attempted": 10}
    ],
    "accuracy_trend": [
      {"week": "Week 1", "accuracy": 58.0},
      {"week": "Week 2", "accuracy": 65.0},
      {"week": "Week 3", "accuracy": 68.5}
    ],
    "recommended_difficulty": 3,
    "recommendations": [
      "Practice more Quadratic Equations (45% accuracy → goal: 75%)",
      "Focus on Geometry Proofs - you're improving but need more practice",
      "Continue with level 3 difficulty - you're making good progress"
    ]
  }
}
```

**AI Responds to User:**
```
"Great question! Let me show you how you're progressing 📊

**Overall Performance:**
You've completed 12 tests with 68.5% accuracy across 120 questions. You're making steady 
progress - your accuracy has improved from 58% in Week 1 to 68.5% now!

**Subject Breakdown:**
- Math: 65% (room for improvement)
- Logic: 72% (doing well!)
- English: 70% (solid performance)

**What to Focus On:**
Your weak areas are:
1. **Quadratic Equations** - 45% accuracy (8 questions attempted)
   → This needs the most attention
2. **Geometry Proofs** - 52% accuracy (12 questions attempted)
   → You're improving but need more practice

**Your Strengths:**
Keep up the great work on:
- Linear Equations (88% accuracy) 
- Basic Algebra (92% accuracy)

**My Recommendations:**
1. Practice more Quadratic Equations (45% → goal: 75%)
2. Focus on Geometry Proofs - you're improving but need more practice
3. Continue with level 3 (medium) difficulty - you're making good progress

Would you like me to generate a focused test on Quadratic Equations to help you improve?"
```

### Safety Considerations

**Input Validation:**
- [x] Validate timeframe is valid enum value
- [x] Validate subject_filter is valid enum value
- [x] Validate user_id matches UUID format

**Authorization:**
- [x] Verify user can only access their own performance data
- [x] Check user is authenticated
- [x] No cross-user data leakage

**Error Handling:**
- [x] Handle case where user has no test history
- [x] Graceful degradation if database query fails
- [x] Return cached data if recent query exists

**Privacy:**
- [x] Never expose absolute rankings (no "you're 50th out of 100 students")
- [x] Keep all performance data private to individual student
- [x] Don't expose other students' data for comparison

**Specific Safety Rules for This Function:**
1. **Privacy:** Only return data for authenticated user (no leaderboards, no peer comparison)
2. **Cache:** Cache results for 5 minutes to reduce database load (performance data doesn't change frequently)
3. **Data Minimization:** Only query necessary date ranges (don't fetch all-time data if timeframe is "week")
4. **Rate Limiting:** Max 100 requests per user per day (analytics queries are expensive)

---

## Function Calling Implementation Plan

### Week 5: Foundation
- [ ] Set up Gemini function calling infrastructure
- [ ] Implement `generate_practice_test` with basic functionality
- [ ] Test hybrid model selection (80% Flash, 20% Pro)
- [ ] Validate question quality on 20 test generations

### Week 6: Expand Functions
- [ ] Implement `get_socratic_feedback` function
- [ ] Test Socratic hints don't reveal answers
- [ ] Implement `get_performance_summary` function
- [ ] Add proper error handling for all functions

### Week 7: Integration & Testing
- [ ] Integrate all 3 functions into conversational AI flow
- [ ] Test complete user journey (generate test → take test → get feedback → view dashboard)
- [ ] User testing Round 1: Validate function calling UX
- [ ] Handle edge cases (invalid inputs, missing data, API failures)

### Week 8: Polish & Optimization
- [ ] Optimize prompt engineering for function calling
- [ ] Add caching for performance_summary
- [ ] Implement rate limiting per function
- [ ] Add comprehensive logging and monitoring

### Week 9-10: Production Deployment
- [ ] Deploy functions to production backend
- [ ] Set up monitoring dashboards
- [ ] Test at scale with pilot users
- [ ] Fine-tune based on real usage patterns

---

## Error Code Reference

Document all error codes your functions might return:

| Error Code | HTTP Status | Meaning | User-Facing Message |
|------------|-------------|---------|---------------------|
| **INVALID_SUBJECT** | 400 | Subject not in allowed list | "Please choose from Math, Logic, or English" |
| **INVALID_DIFFICULTY** | 400 | Difficulty not 1-5 | "Difficulty must be between 1 (easiest) and 5 (hardest)" |
| **INVALID_NUM_QUESTIONS** | 400 | Question count out of range | "Please choose between 5 and 15 questions" |
| **UNAUTHORIZED** | 403 | User doesn't own resource | "You don't have permission to access this" |
| **TEST_NOT_FOUND** | 404 | Test ID doesn't exist | "We couldn't find that test" |
| **INVALID_QUESTION_INDEX** | 400 | Question number out of range | "That question doesn't exist in this test" |
| **INVALID_ANSWER** | 400 | Answer not A/B/C/D | "Please select A, B, C, or D" |
| **INSUFFICIENT_DATA** | 400 | Not enough tests completed | "Complete at least one test to see your analytics" |
| **AI_GENERATION_FAILED** | 500 | Gemini API error | "We're having trouble generating questions. Please try again." |
| **DATABASE_ERROR** | 500 | Database connection failed | "Technical difficulties. Please try again in a moment." |
| **RATE_LIMIT_EXCEEDED** | 429 | Too many requests | "You've reached the daily limit. Try again tomorrow." |
| **INVALID_TIMEFRAME** | 400 | Timeframe not valid enum | "Please choose 'week', 'month', or 'all_time'" |
| **INVALID_TEST_ID** | 400 | Test ID format wrong | "That doesn't look like a valid test ID" |

---

## Testing Strategy

### Unit Tests

**For each function, test:**

**generate_practice_test:**
- [ ] Valid inputs → correct test structure returned
- [ ] Invalid subject → INVALID_SUBJECT error
- [ ] Difficulty out of range → INVALID_DIFFICULTY error
- [ ] User doesn't own test → UNAUTHORIZED error
- [ ] Gemini API failure → graceful fallback with error message
- [ ] Focus topics filter works correctly
- [ ] Hybrid model selection (80% Flash, 20% Pro verified)

**get_socratic_feedback:**
- [ ] Correct answer → positive feedback, no hint needed
- [ ] Incorrect answer → Socratic hint generated
- [ ] Test not found → TEST_NOT_FOUND error
- [ ] Question index out of range → INVALID_QUESTION_INDEX error
- [ ] Hint doesn't reveal correct answer (manual validation)
- [ ] Unauthorized access → UNAUTHORIZED error

**get_performance_summary:**
- [ ] User with test history → complete analytics returned
- [ ] User with no tests → INSUFFICIENT_DATA error
- [ ] Timeframe filter works (week, month, all_time)
- [ ] Subject filter works (Math, Logic, English, all)
- [ ] Weak topics identified correctly (accuracy < 60%)
- [ ] Strong topics identified correctly (accuracy > 80%)
- [ ] Recommendations generated appropriately

### Integration Tests

**Test the full loop:**
- [ ] User query → AI generates function call → Backend executes → AI responds
- [ ] Multiple function calls in sequence (generate test → get feedback → view performance)
- [ ] Error recovery (what if function fails? AI should explain gracefully)
- [ ] Context retention (AI remembers test_id from earlier in conversation)

### Example Test Cases

**Function 1: generate_practice_test**
```python
def test_valid_test_generation():
    result = generate_practice_test(
        subject="Math",
        difficulty=3,
        user_id="valid-uuid",
        num_questions=10
    )
    assert result["status"] == "success"
    assert len(result["data"]["questions"]) == 10
    assert result["data"]["subject"] == "Math"

def test_invalid_subject():
    result = generate_practice_test(
        subject="Physics",
        difficulty=3,
        user_id="valid-uuid"
    )
    assert result["status"] == "error"
    assert result["error_code"] == "INVALID_SUBJECT"

def test_unauthorized_user():
    result = generate_practice_test(
        subject="Math",
        difficulty=3,
        user_id="different-user-uuid"  # Not the authenticated user
    )
    assert result["status"] == "error"
    assert result["error_code"] == "UNAUTHORIZED"

def test_hybrid_model_selection():
    # Mock Gemini API calls to track which model is used
    with patch("gemini_api.call_gemini_flash") as mock_flash:
        with patch("gemini_api.call_gemini_pro") as mock_pro:
            result = generate_practice_test(
                subject="Math",
                difficulty=3,
                user_id="valid-uuid",
                num_questions=10
            )
            # Verify 80% Flash, 20% Pro
            assert mock_flash.call_count == 1  # 8 questions
            assert mock_pro.call_count == 1    # 2 questions
```

**Function 2: get_socratic_feedback**
```python
def test_correct_answer_no_hint():
    result = get_socratic_feedback(
        test_id="test_12345678",
        question_index=0,
        user_answer="A",  # Assume A is correct
        user_id="valid-uuid"
    )
    assert result["status"] == "success"
    assert result["data"]["is_correct"] == True
    assert "socratic_hint" not in result["data"]

def test_incorrect_answer_generates_hint():
    result = get_socratic_feedback(
        test_id="test_12345678",
        question_index=0,
        user_answer="B",  # Wrong answer
        user_id="valid-uuid"
    )
    assert result["status"] == "success"
    assert result["data"]["is_correct"] == False
    assert "socratic_hint" in result["data"]
    assert len(result["data"]["socratic_hint"]) > 0
    # Validate hint doesn't contain "A", "B", "C", "D" explicitly
    assert not re.search(r'\b[ABCD]\b', result["data"]["socratic_hint"])

def test_test_not_found():
    result = get_socratic_feedback(
        test_id="test_nonexist",
        question_index=0,
        user_answer="A",
        user_id="valid-uuid"
    )
    assert result["status"] == "error"
    assert result["error_code"] == "TEST_NOT_FOUND"
```

**Function 3: get_performance_summary**
```python
def test_performance_with_data():
    result = get_performance_summary(
        user_id="valid-uuid",
        timeframe="all_time"
    )
    assert result["status"] == "success"
    assert result["data"]["overall_accuracy"] > 0
    assert result["data"]["total_tests_completed"] > 0
    assert len(result["data"]["weak_topics"]) >= 0
    assert len(result["data"]["recommendations"]) > 0

def test_insufficient_data():
    # User with no test history
    result = get_performance_summary(
        user_id="new-user-uuid"
    )
    assert result["status"] == "error"
    assert result["error_code"] == "INSUFFICIENT_DATA"

def test_subject_filter():
    result = get_performance_summary(
        user_id="valid-uuid",
        subject_filter="Math"
    )
    assert result["status"] == "success"
    # All returned data should be Math-only
    for subject in result["data"]["accuracy_by_subject"].keys():
        assert subject == "Math"
```

---

## Performance Metrics

**Target Performance:**
- `generate_practice_test` execution time: <3 seconds (including Gemini API call)
- `get_socratic_feedback` execution time: <2 seconds
- `get_performance_summary` execution time: <500ms (with caching: <100ms)
- Total conversational turn (user query → AI response): <5 seconds
- Function success rate: >99%
- Error rate: <1%

**Monitoring:**
- [ ] Log every function call (function name, parameters, result status, latency)
- [ ] Track success vs error rates per function
- [ ] Alert if function latency >5 seconds
- [ ] Alert if error rate >5% for any function
- [ ] Dashboard showing function usage stats (calls per hour, avg latency, errors)

**Cost Monitoring:**
- [ ] Track Gemini API cost per function call
- [ ] Monitor daily total function calling costs
- [ ] Alert if daily cost >₾6 ($2)
- [ ] Trend analysis: Cost per student over time

---

## Resources

**API Documentation:**
- Gemini Function Calling: https://ai.google.dev/gemini-api/docs/function-calling
- Gemini Structured Output: https://ai.google.dev/gemini-api/docs/json-mode
- OpenAI Function Calling (reference): https://platform.openai.com/docs/guides/function-calling

**Libraries:**
- `google-generativeai` (Python SDK for Gemini)
- `pydantic` (JSON schema validation)
- `redis` (caching for performance_summary)

**Team Responsibilities:**
- Function 1 (`generate_practice_test`): Giorgi Mikaberidze, Sergi Arabidze
- Function 2 (`get_socratic_feedback`): Sergi Arabidze, Luka Mekoshvili
- Function 3 (`get_performance_summary`): Nikoloz Kvirikashvili, Giorgi Mikaberidze
- Testing & validation: All team members
- Integration with conversational AI: Giorgi Mikaberidze

---

## Sign-off

**Team Members:**
- **Giorgi Mikaberidze** - Backend architecture, function implementation, Gemini API integration
- **Nikoloz Kvirikashvili** - Database queries, performance analytics, caching strategy
- **Sergi Arabidze** - Prompt engineering, Socratic feedback generation, question quality validation
- **Luka Mekoshvili** - Frontend integration, error handling, user testing
- **Lasha Giorgi Tskhadadze** - UI/UX for function outputs, testing, documentation

**Date Completed:** Week 4, November 6, 2025

**Reviewed By Instructor:** [ ] Yes  [ ] No  [Date: _____ ]

---

## Appendix: Common Patterns

### Pattern 1: Adaptive Content Generation
**Use when:** AI needs to generate personalized educational content
**Dialogos example:** `generate_practice_test` adapts questions based on student performance history
**Key considerations:** 
- Fetch user context (weak topics, recent accuracy)
- Use context to guide AI generation
- Validate generated content before returning

### Pattern 2: Contextual Feedback
**Use when:** AI needs to provide guidance without giving away answers
**Dialogos example:** `get_socratic_feedback` generates hints that guide thinking
**Key considerations:**
- Never reveal the answer directly
- Adapt hint difficulty to student level
- Provide follow-up questions to scaffold learning

### Pattern 3: Analytics Retrieval
**Use when:** AI needs to summarize user data for insights
**Dialogos example:** `get_performance_summary` aggregates test results
**Key considerations:**
- Cache frequently-requested analytics
- Return actionable recommendations, not just data
- Privacy: only show user's own data

### Pattern 4: Multi-Step Workflows
**Use when:** User goal requires multiple function calls
**Dialogos example:** "Test me on Math" → `generate_practice_test` → user answers → `get_socratic_feedback` → "How am I doing?" → `get_performance_summary`
**Key considerations:**
- Maintain context across function calls (remember test_id)
- Handle errors at any step gracefully
- Provide progress indicators for long workflows

### Pattern 5: Hybrid AI Models
**Use when:** Different tasks need different AI capabilities/costs
**Dialogos example:** 80% Gemini Flash (simple questions), 20% Gemini Pro (complex reasoning)
**Key considerations:**
- Route to appropriate model based on task complexity
- Track cost per model to validate savings
- Ensure quality doesn't suffer on cheaper model

---

**End of Function Specification Document**
