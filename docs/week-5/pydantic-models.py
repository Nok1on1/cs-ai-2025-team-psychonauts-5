"""
Pydantic Models for Dialogos - AI-Driven Entrance Exam Tutor
Complete data validation models for all major structures (Pydantic v2 compatible)

Installation Requirements:
    pip install pydantic[email]>=2.0.0

Dependencies:
    - pydantic>=2.0.0
    - email-validator>=2.0.0
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Literal
from datetime import datetime, timezone
from enum import Enum
import re

# Try to import EmailStr, fallback to string with validation
try:
    from pydantic import EmailStr

    EMAIL_VALIDATOR_AVAILABLE = True
except ImportError:
    EMAIL_VALIDATOR_AVAILABLE = False
    EmailStr = str


# ============================================================================
# ENUMS
# ============================================================================


class SubjectType(str, Enum):
    """Subject types for entrance exams"""

    MATH = "math"
    LOGIC = "logic"


class DifficultyLevel(int, Enum):
    """Difficulty levels from 1 (easiest) to 5 (hardest)"""

    LEVEL_1 = 1
    LEVEL_2 = 2
    LEVEL_3 = 3
    LEVEL_4 = 4
    LEVEL_5 = 5


class UserRole(str, Enum):
    """User roles in the system"""

    STUDENT = "student"
    TEACHER = "teacher"


class QuestionStatus(str, Enum):
    """Status of generated questions"""

    ACTIVE = "active"
    ARCHIVED = "archived"
    FLAGGED = "flagged"


# ============================================================================
# USER MODELS
# ============================================================================


class UserBase(BaseModel):
    """Base user information"""

    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.STUDENT

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_format(cls, v):
        """Manual email validation if email-validator not available"""
        if not EMAIL_VALIDATOR_AVAILABLE:
            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, v):
                raise ValueError("Invalid email format")
        return v


class UserCreate(UserBase):
    """Model for user registration"""

    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        """Ensure password has minimum complexity"""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    """Model for user authentication"""

    email: EmailStr
    password: str

    @field_validator("email", mode="before")
    @classmethod
    def validate_email_format(cls, v):
        """Manual email validation if email-validator not available"""
        if not EMAIL_VALIDATOR_AVAILABLE:
            email_pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
            if not re.match(email_pattern, v):
                raise ValueError("Invalid email format")
        return v


class UserResponse(UserBase):
    """Model for user data returned to client"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    last_login: Optional[datetime] = None
    is_active: bool = True


class UserProfile(UserResponse):
    """Extended user profile with statistics"""

    total_tests_taken: int = 0
    average_score: Optional[float] = None
    weak_topics: List[str] = []
    strong_topics: List[str] = []


# ============================================================================
# AUTHENTICATION MODELS
# ============================================================================


class TokenData(BaseModel):
    """JWT token payload"""

    user_id: int
    email: str
    role: UserRole
    exp: datetime


class TokenResponse(BaseModel):
    """Authentication response"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = 604800  # 7 days in seconds
    user: UserResponse


# ============================================================================
# QUESTION BANK MODELS
# ============================================================================


class AnswerChoice(BaseModel):
    """Individual answer choice for multiple-choice questions"""

    option_id: str = Field(..., pattern=r"^[A-D]$")
    text: str = Field(..., min_length=1, max_length=500)
    is_correct: bool = False


class QuestionMetadata(BaseModel):
    """Metadata for questions in the bank"""

    topic_tags: List[str] = Field(..., min_length=1, max_length=5)
    subtopic: Optional[str] = None
    estimated_time_seconds: int = Field(120, ge=30, le=600)
    curriculum_reference: Optional[str] = None
    exposure_count: int = 0
    last_used_date: Optional[datetime] = None


class QuestionBankItem(BaseModel):
    """Question stored in the verified question bank"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    subject: SubjectType
    difficulty: DifficultyLevel
    question_text: str = Field(..., min_length=10, max_length=2000)
    answer_choices: List[AnswerChoice] = Field(..., min_length=4, max_length=4)
    correct_answer_id: str = Field(..., pattern=r"^[A-D]$")
    explanation: str = Field(..., min_length=20, max_length=1000)
    metadata: QuestionMetadata
    status: QuestionStatus = QuestionStatus.ACTIVE
    created_at: datetime
    updated_at: datetime

    @field_validator("answer_choices")
    @classmethod
    def validate_answer_choices(cls, v, info):
        """Ensure exactly one correct answer"""
        if "correct_answer_id" not in info.data:
            return v

        correct_count = sum(1 for choice in v if choice.is_correct)
        if correct_count != 1:
            raise ValueError("Exactly one answer must be marked as correct")

        correct_ids = [choice.option_id for choice in v if choice.is_correct]
        if correct_ids[0] != info.data["correct_answer_id"]:
            raise ValueError("correct_answer_id must match the is_correct flag")

        return v


# ============================================================================
# TEST GENERATION MODELS
# ============================================================================


class TestGenerationRequest(BaseModel):
    """Request to generate an adaptive test"""

    subject: SubjectType
    target_difficulty: DifficultyLevel
    num_questions: int = Field(10, ge=5, le=20)
    focus_topics: Optional[List[str]] = None
    exclude_question_ids: Optional[List[int]] = None


class GeneratedQuestion(BaseModel):
    """AI-generated question with source tracking"""

    question_text: str = Field(..., min_length=10, max_length=2000)
    answer_choices: List[AnswerChoice] = Field(..., min_length=4, max_length=4)
    correct_answer_id: str = Field(..., pattern=r"^[A-D]$")
    difficulty: DifficultyLevel
    topic_tags: List[str]
    source_question_ids: List[int] = Field(
        ..., description="IDs of questions used for RAG"
    )
    retrieval_scores: List[float] = Field(
        ..., description="Similarity scores for retrieved questions"
    )
    generation_timestamp: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class TestSession(BaseModel):
    """Complete test session data"""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    subject: SubjectType
    target_difficulty: DifficultyLevel
    questions: List[GeneratedQuestion]
    started_at: datetime
    completed_at: Optional[datetime] = None
    is_completed: bool = False
    total_score: Optional[float] = None


# ============================================================================
# STUDENT RESPONSE MODELS
# ============================================================================


class StudentAnswer(BaseModel):
    """Student's answer to a question"""

    question_index: int = Field(..., ge=0)
    selected_answer_id: str = Field(..., pattern=r"^[A-D]$")
    time_spent_seconds: int = Field(..., ge=0, le=600)


class AnswerSubmission(BaseModel):
    """Submission of answers for grading"""

    test_session_id: int
    answers: List[StudentAnswer] = Field(..., min_length=1, max_length=20)


class QuestionResult(BaseModel):
    """Result for a single question"""

    question_index: int
    question_text: str
    student_answer_id: str
    correct_answer_id: str
    is_correct: bool
    explanation: Optional[str] = None
    socratic_feedback: Optional[str] = None


class TestResults(BaseModel):
    """Complete test results with grading"""

    test_session_id: int
    user_id: int
    subject: SubjectType
    total_questions: int
    correct_answers: int
    score_percentage: float = Field(..., ge=0, le=100)
    question_results: List[QuestionResult]
    completed_at: datetime
    new_difficulty_estimate: Optional[DifficultyLevel] = None


# ============================================================================
# RAG MODELS
# ============================================================================


class EmbeddingVector(BaseModel):
    """Vector embedding for RAG"""

    text: str
    embedding: List[float] = Field(..., min_length=1536, max_length=1536)
    model: str = "text-embedding-3-small"


class RetrievedDocument(BaseModel):
    """Document retrieved from vector database"""

    question_id: int
    similarity_score: float = Field(..., ge=0, le=1)
    question_text: str
    difficulty: DifficultyLevel
    topic_tags: List[str]
    metadata: Dict


class RAGContext(BaseModel):
    """Complete RAG context for question generation"""

    retrieved_questions: List[RetrievedDocument] = Field(..., max_length=10)
    curriculum_sections: Optional[List[str]] = None
    student_weak_topics: List[str] = []
    excluded_question_ids: List[int] = []


# ============================================================================
# PERFORMANCE TRACKING MODELS
# ============================================================================


class TopicPerformance(BaseModel):
    """Student performance on a specific topic"""

    topic_name: str
    subject: SubjectType
    questions_attempted: int
    questions_correct: int
    accuracy_percentage: float = Field(..., ge=0, le=100)
    average_difficulty: float = Field(..., ge=1, le=5)
    last_practiced: datetime


class PerformanceHistory(BaseModel):
    """Historical performance data"""

    user_id: int
    total_tests: int
    overall_accuracy: float = Field(..., ge=0, le=100)
    math_accuracy: Optional[float] = None
    logic_accuracy: Optional[float] = None
    topic_performance: List[TopicPerformance]
    difficulty_progression: Dict[str, List[int]]  # date -> difficulty level
    created_at: datetime
    updated_at: datetime


class PerformanceSummary(BaseModel):
    """Summary statistics for dashboard"""

    user_id: int
    tests_last_week: int
    average_score_last_week: Optional[float] = None
    improvement_trend: Literal["improving", "stable", "declining"]
    recommended_difficulty: DifficultyLevel
    weak_topics: List[str] = Field(default=[], max_length=5)
    strong_topics: List[str] = Field(default=[], max_length=5)


# ============================================================================
# FEEDBACK MODELS
# ============================================================================


class SocraticFeedbackRequest(BaseModel):
    """Request for Socratic feedback on wrong answer"""

    question_text: str
    correct_answer_id: str
    student_answer_id: str
    topic_tags: List[str]


class SocraticFeedbackResponse(BaseModel):
    """AI-generated Socratic feedback"""

    feedback_text: str = Field(..., min_length=50, max_length=1000)
    hint_level: Literal["gentle", "moderate", "explicit"]
    follow_up_question: Optional[str] = None
    related_concepts: List[str] = []
    citations: List[str] = Field(
        default=[], description="Source references for feedback"
    )


# ============================================================================
# RATE LIMITING MODELS
# ============================================================================


class RateLimitStatus(BaseModel):
    """Current rate limit status for user"""

    user_id: int
    tests_today: int
    max_tests_per_day: int = 20
    api_cost_today: float
    max_daily_cost: float = 60.0
    can_generate_test: bool
    reset_time: datetime


class CostTracking(BaseModel):
    """API cost tracking"""

    date: datetime
    embedding_cost: float = 0.0
    gemini_flash_cost: float = 0.0
    gemini_pro_cost: float = 0.0
    total_cost: float = 0.0
    total_tests_generated: int = 0
    average_cost_per_test: float = 0.0


# ============================================================================
# CITATION MODELS
# ============================================================================


class CitationSource(BaseModel):
    """Source citation for generated content"""

    source_type: Literal["question_bank", "curriculum", "reference_material"]
    source_id: str
    document_name: str
    topic: str
    difficulty: Optional[DifficultyLevel] = None
    retrieval_score: Optional[float] = None


class CitedContent(BaseModel):
    """Content with citations"""

    content: str
    citations: List[CitationSource]
    confidence_score: Optional[float] = Field(None, ge=0, le=1)


# ============================================================================
# API RESPONSE MODELS
# ============================================================================


class APIError(BaseModel):
    """Standard error response"""

    error: str
    message: str
    status_code: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class APISuccess(BaseModel):
    """Standard success response"""

    success: bool = True
    message: str
    data: Optional[Dict] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ============================================================================
# VALIDATION EXAMPLES
# ============================================================================

if __name__ == "__main__":
    # Example: Creating a question bank item
    sample_question = QuestionBankItem(
        id=1,
        subject=SubjectType.MATH,
        difficulty=DifficultyLevel.LEVEL_3,
        question_text="Solve for x: x² - 5x + 6 = 0",
        answer_choices=[
            AnswerChoice(option_id="A", text="x = 1 or x = 6", is_correct=False),
            AnswerChoice(option_id="B", text="x = 2 or x = 3", is_correct=True),
            AnswerChoice(option_id="C", text="x = -2 or x = -3", is_correct=False),
            AnswerChoice(option_id="D", text="x = 5 or x = 1", is_correct=False),
        ],
        correct_answer_id="B",
        explanation="Factor as (x-2)(x-3) = 0, giving x = 2 or x = 3",
        metadata=QuestionMetadata(
            topic_tags=["algebra", "quadratic_equations"],
            subtopic="factoring",
            estimated_time_seconds=120,
        ),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    print("✓ Sample question validated successfully")
    print(f"Question: {sample_question.question_text}")
    print(f"Difficulty: {sample_question.difficulty.value}")
    print(f"Topics: {', '.join(sample_question.metadata.topic_tags)}")

    # Example: Test generation request
    test_request = TestGenerationRequest(
        subject=SubjectType.MATH,
        target_difficulty=DifficultyLevel.LEVEL_3,
        num_questions=10,
        focus_topics=["algebra", "geometry"],
    )

    print(
        f"\n✓ Test request validated: {test_request.num_questions} {test_request.subject.value} questions"
    )

    # Example: User creation with password validation
    try:
        new_user = UserCreate(
            email="student@example.com",
            full_name="Test Student",
            password="Password123",  # Valid password
            role=UserRole.STUDENT,
        )
        print(f"\n✓ User created: {new_user.email}")
    except ValueError as e:
        print(f"\n✗ User validation failed: {e}")
