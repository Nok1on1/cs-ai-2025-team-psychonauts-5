# Dialogos - RAG-Based Exam Tutor Technical Spec

## Tech Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Database:** MongoDB Atlas
- **RAG Framework:** LangChain
- **Embeddings:** sentence-transformers (all-MiniLM-L6-v2 / paraphrase-multilingual-MiniLM-L12-v2)
- **LLM:** Google Gemini API (1.5 Flash + Pro)
- **Document Processing:** PyPDF2, python-docx
- **Auth:** PyJWT

### Frontend
- **Framework:** React 18 + Vite
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Charts:** Chart.js

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** MongoDB Atlas (free tier)

---

## MongoDB Schema

```javascript
// users collection
{
  "_id": ObjectId,
  "email": String,
  "name": String,
  "password_hash": String,
  "created_at": ISODate,
  "last_login": ISODate
}

// documents collection (curriculum materials)
{
  "_id": ObjectId,
  "filename": String,
  "subject": String, // "Math", "English", "Georgian"
  "topic": String,
  "grade_level": Number,
  "source": String, // "Ministry of Education", etc.
  "file_path": String,
  "total_chunks": Number,
  "upload_date": ISODate,
  "metadata": {
    "author": String,
    "year": Number,
    "official": Boolean
  }
}

// chunks collection (document segments + embeddings)
{
  "_id": ObjectId,
  "document_id": ObjectId, // ref to documents
  "chunk_index": Number,
  "text": String, // 500 chars
  "subject": String,
  "topic": String,
  "difficulty_level": Number, // 1-5
  "embedding": [Number], // 384-dim vector
  "metadata": {
    "page_number": Number,
    "section": String
  }
}

// tests collection
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "subject": String,
  "difficulty_level": Number, // 1-5
  "questions": [
    {
      "question": String,
      "options": [String], // 4 options
      "correct_answer": String,
      "topic": String,
      "explanation": String,
      "source_chunk_id": ObjectId,
      "source_document": String,
      "source_page": Number
    }
  ],
  "created_at": ISODate,
  "completed_at": ISODate
}

// responses collection
{
  "_id": ObjectId,
  "test_id": ObjectId,
  "user_id": ObjectId,
  "question_index": Number,
  "question_text": String,
  "question_topic": String,
  "user_answer": String,
  "correct_answer": String,
  "is_correct": Boolean,
  "time_spent_seconds": Number,
  "created_at": ISODate
}

// performance collection (aggregated)
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "subject": String,
  "topic": String,
  "accuracy_percentage": Number,
  "total_questions": Number,
  "correct_questions": Number,
  "updated_at": ISODate
}
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
```

### Tests
```
POST   /api/tests/generate
       Body: {userId, subject, difficulty, numQuestions}
       Returns: {testId, questions[]}

GET    /api/tests/:id
POST   /api/tests/:id/submit
       Body: {answers: [{questionIndex, userAnswer}]}
       Returns: {score, results[], feedback[], suggestions}

GET    /api/tests/:id/feedback
```

### User Dashboard
```
GET    /api/users/:id/dashboard
       Returns: {accuracyOverTime[], topicAccuracy[], weakTopics[]}
```

### Admin (Document Management)
```
POST   /api/admin/documents/upload
       Body: multipart/form-data (PDF/DOCX)
       Returns: {documentId, chunksCreated}

GET    /api/admin/documents
       Returns: [{documentId, filename, subject, chunks}]
```

---

## RAG Pipeline Flow

### 1. Document Processing (One-Time Setup)

```python
# Step 1: Load document
from langchain.document_loaders import PyPDFLoader
loader = PyPDFLoader("math_algebra_grade12.pdf")
documents = loader.load()

# Step 2: Split into chunks
from langchain.text_splitter import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " "]
)
chunks = splitter.split_documents(documents)

# Step 3: Generate embeddings
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')  # 384-dim
embeddings = model.encode([c.page_content for c in chunks])

# Step 4: Store in MongoDB
for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
    db.chunks.insert_one({
        "document_id": doc_id,
        "chunk_index": i,
        "text": chunk.page_content,
        "subject": "Math",
        "topic": extract_topic(chunk),
        "difficulty_level": infer_difficulty(chunk),
        "embedding": embedding.tolist(),
        "metadata": {
            "page_number": chunk.metadata.get("page"),
            "section": chunk.metadata.get("section")
        }
    })
```

### 2. Question Generation (Per Request)

```python
# Step 1: Get user context
user_performance = db.performance.find({"user_id": user_id, "subject": subject})
weak_topics = [p["topic"] for p in user_performance if p["accuracy_percentage"] < 60]

# Step 2: Build semantic query
query = f"Practice questions on {', '.join(weak_topics)} at difficulty {difficulty}"

# Step 3: Generate query embedding
query_embedding = embedding_model.encode(query)

# Step 4: MongoDB Atlas Vector Search
relevant_chunks = db.chunks.aggregate([
    {
        "$vectorSearch": {
            "index": "vector_index",
            "path": "embedding",
            "queryVector": query_embedding.tolist(),
            "numCandidates": 50,
            "limit": 15,
            "filter": {
                "subject": subject,
                "difficulty_level": {"$gte": difficulty - 1, "$lte": difficulty + 1}
            }
        }
    },
    {
        "$project": {
            "text": 1,
            "topic": 1,
            "metadata": 1,
            "score": {"$meta": "vectorSearchScore"}
        }
    }
])

# Step 5: Extract context
context_text = "\n\n".join([c["text"] for c in relevant_chunks])

# Step 6: Build Gemini prompt
system_prompt = f"""Generate 10 multiple-choice questions for {subject} at difficulty {difficulty}/5.

BASE QUESTIONS ONLY ON THIS CURRICULUM CONTENT:
{context_text}

Focus 60% on these weak topics: {weak_topics}

Output JSON array:
[
  {{
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correct_answer": "A",
    "topic": "...",
    "explanation": "...",
    "source_chunk_index": 0
  }}
]
"""

# Step 7: Call Gemini
from google.generativeai import GenerativeModel
model = GenerativeModel("gemini-1.5-flash")
response = model.generate_content(system_prompt)
questions = json.loads(response.text)

# Step 8: Add RAG provenance
for q in questions:
    chunk_idx = q.pop("source_chunk_index")
    source = list(relevant_chunks)[chunk_idx]
    q["source_chunk_id"] = source["_id"]
    q["source_document"] = get_document_name(source["_id"])
    q["source_page"] = source["metadata"].get("page_number")

# Step 9: Store test
test_id = db.tests.insert_one({
    "user_id": user_id,
    "subject": subject,
    "difficulty_level": difficulty,
    "questions": questions,
    "created_at": datetime.utcnow()
}).inserted_id

return {"testId": test_id, "questions": questions}
```

---

## Complete User Flow (JSON)

```json
{
  "flow": "generate_and_complete_test",
  "steps": [
    {
      "step": 1,
      "actor": "user",
      "action": "navigate_to_new_test_page",
      "frontend": "Display test configuration form"
    },
    {
      "step": 2,
      "actor": "user",
      "action": "configure_test",
      "input": {
        "subject": "Math",
        "difficulty": 3,
        "numQuestions": 10
      }
    },
    {
      "step": 3,
      "actor": "user",
      "action": "click_generate_test",
      "frontend": "Show loading spinner: 'Finding relevant curriculum materials...'"
    },
    {
      "step": 4,
      "actor": "frontend",
      "action": "api_request",
      "endpoint": "POST /api/tests/generate",
      "headers": {
        "Authorization": "Bearer {jwt_token}"
      },
      "body": {
        "userId": "user_123",
        "subject": "Math",
        "difficulty": 3,
        "numQuestions": 10
      }
    },
    {
      "step": 5,
      "actor": "backend",
      "action": "authenticate_user",
      "process": "Verify JWT token"
    },
    {
      "step": 6,
      "actor": "backend",
      "action": "query_user_performance",
      "database": "MongoDB",
      "query": {
        "collection": "performance",
        "filter": {"user_id": "user_123", "subject": "Math"}
      },
      "result": {
        "weak_topics": ["Quadratic Equations", "Geometry Proofs"],
        "avg_accuracy": 68
      }
    },
    {
      "step": 7,
      "actor": "backend",
      "action": "rag_semantic_search",
      "process": [
        {
          "substep": "7a",
          "action": "build_query",
          "query": "Practice questions on Quadratic Equations, Geometry Proofs at difficulty 3"
        },
        {
          "substep": "7b",
          "action": "generate_query_embedding",
          "model": "sentence-transformers/all-MiniLM-L6-v2",
          "output": "[0.234, -0.567, ...]"
        },
        {
          "substep": "7c",
          "action": "mongodb_vector_search",
          "collection": "chunks",
          "index": "vector_index",
          "params": {
            "queryVector": "[0.234, -0.567, ...]",
            "limit": 15,
            "filter": {
              "subject": "Math",
              "difficulty_level": {"$gte": 2, "$lte": 4}
            }
          },
          "result": [
            {
              "_id": "chunk_001",
              "text": "Quadratic equations take the form ax² + bx + c = 0...",
              "topic": "Quadratic Equations",
              "metadata": {"page_number": 47, "section": "Chapter 3"}
            }
          ],
          "num_chunks_retrieved": 15
        }
      ]
    },
    {
      "step": 8,
      "actor": "backend",
      "action": "extract_context",
      "process": "Concatenate text from 15 chunks",
      "output": "1500 words of curriculum content"
    },
    {
      "step": 9,
      "actor": "backend",
      "action": "build_gemini_prompt",
      "prompt": {
        "system": "Generate 10 Math questions from PROVIDED CONTEXT ONLY",
        "context": "{1500 words from retrieved chunks}",
        "user": "Focus 60% on Quadratic Equations and Geometry Proofs",
        "format": "JSON array with question, options, correct_answer, topic, explanation, source_chunk_index"
      },
      "token_count": 2500
    },
    {
      "step": 10,
      "actor": "backend",
      "action": "call_gemini_api",
      "model": "gemini-1.5-flash",
      "request": {
        "prompt": "{system + context + user}",
        "temperature": 0.7,
        "max_tokens": 2000
      },
      "response_time": "2s",
      "response": [
        {
          "question": "Solve for x: 2x² - 5x + 2 = 0",
          "options": ["x = 1/2 or x = 2", "x = 1 or x = 2", "x = 1/2 or x = 1", "x = 2 or x = 3"],
          "correct_answer": "x = 1/2 or x = 2",
          "topic": "Quadratic Equations",
          "explanation": "Using the quadratic formula: x = [-b ± √(b²-4ac)] / 2a...",
          "source_chunk_index": 3
        }
      ]
    },
    {
      "step": 11,
      "actor": "backend",
      "action": "augment_with_rag_provenance",
      "process": "Map source_chunk_index to actual chunk metadata",
      "output": [
        {
          "question": "Solve for x: 2x² - 5x + 2 = 0",
          "options": ["x = 1/2 or x = 2", "x = 1 or x = 2", "x = 1/2 or x = 1", "x = 2 or x = 3"],
          "correct_answer": "x = 1/2 or x = 2",
          "topic": "Quadratic Equations",
          "explanation": "Using the quadratic formula...",
          "source_chunk_id": "chunk_003",
          "source_document": "math_algebra_grade12.pdf",
          "source_page": 47
        }
      ]
    },
    {
      "step": 12,
      "actor": "backend",
      "action": "store_test_in_mongodb",
      "collection": "tests",
      "document": {
        "user_id": "user_123",
        "subject": "Math",
        "difficulty_level": 3,
        "questions": "[10 questions with RAG provenance]",
        "created_at": "2025-11-06T15:00:00Z"
      },
      "result": {
        "testId": "test_456"
      }
    },
    {
      "step": 13,
      "actor": "backend",
      "action": "return_response_to_frontend",
      "response": {
        "testId": "test_456",
        "questions": "[10 questions]"
      },
      "total_latency": "2.5s"
    },
    {
      "step": 14,
      "actor": "frontend",
      "action": "render_test_interface",
      "display": {
        "question_number": "1/10",
        "question_text": "Solve for x: 2x² - 5x + 2 = 0",
        "options": ["A) x = 1/2 or x = 2", "B) x = 1 or x = 2", "C) x = 1/2 or x = 1", "D) x = 2 or x = 3"],
        "provenance_badge": "Source: Algebra Grade 12, Page 47",
        "buttons": ["Next", "Skip"]
      }
    },
    {
      "step": 15,
      "actor": "user",
      "action": "answer_questions",
      "process": "Select answer for each of 10 questions",
      "duration": "12-15 minutes"
    },
    {
      "step": 16,
      "actor": "user",
      "action": "submit_test",
      "frontend": "Show loading: 'Grading your test...'"
    },
    {
      "step": 17,
      "actor": "frontend",
      "action": "api_request",
      "endpoint": "POST /api/tests/test_456/submit",
      "body": {
        "answers": [
          {"questionIndex": 0, "userAnswer": "x = 1 or x = 2"},
          {"questionIndex": 1, "userAnswer": "..."}
        ]
      }
    },
    {
      "step": 18,
      "actor": "backend",
      "action": "grade_test",
      "process": [
        {
          "substep": "18a",
          "action": "retrieve_test",
          "collection": "tests",
          "testId": "test_456"
        },
        {
          "substep": "18b",
          "action": "compare_answers",
          "result": {
            "score": "7/10",
            "accuracy": 70,
            "incorrect_indices": [1, 3, 6]
          }
        },
        {
          "substep": "18c",
          "action": "store_responses",
          "collection": "responses",
          "documents": [
            {
              "test_id": "test_456",
              "question_index": 0,
              "user_answer": "x = 1 or x = 2",
              "correct_answer": "x = 1/2 or x = 2",
              "is_correct": false
            }
          ]
        },
        {
          "substep": "18d",
          "action": "update_performance",
          "collection": "performance",
          "update": {
            "user_id": "user_123",
            "subject": "Math",
            "topic": "Quadratic Equations",
            "accuracy_percentage": 48
          }
        }
      ]
    },
    {
      "step": 19,
      "actor": "backend",
      "action": "generate_socratic_feedback",
      "for_incorrect_answers": true,
      "process": [
        {
          "question": "Solve for x: 2x² - 5x + 2 = 0",
          "user_answer": "x = 1 or x = 2",
          "correct_answer": "x = 1/2 or x = 2",
          "gemini_prompt": "Student answered 'x = 1 or x = 2' but correct is 'x = 1/2 or x = 2'. Provide Socratic hint without giving away answer.",
          "feedback": "What happens when you substitute x=1 into the equation 2x² - 5x + 2 = 0? Does it satisfy the equation? Try calculating 2(1)² - 5(1) + 2."
        }
      ]
    },
    {
      "step": 20,
      "actor": "backend",
      "action": "return_results",
      "response": {
        "score": "7/10",
        "accuracy": 70,
        "results": [
          {
            "question_index": 0,
            "correct": false,
            "user_answer": "x = 1 or x = 2",
            "correct_answer": "x = 1/2 or x = 2",
            "socratic_feedback": "What happens when you substitute x=1...",
            "full_explanation": "Using the quadratic formula...",
            "source_document": "math_algebra_grade12.pdf",
            "source_page": 47
          }
        ],
        "recommendations": {
          "suggested_difficulty": "Stay at Medium (70% is good progress)",
          "weak_topics": ["Quadratic Equations (48%)", "Geometry Proofs (52%)"],
          "study_materials": ["Review Algebra Grade 12, Chapter 3"]
        }
      }
    },
    {
      "step": 21,
      "actor": "frontend",
      "action": "render_results_screen",
      "display": {
        "score_banner": "7 out of 10 correct! (70%)",
        "per_question_breakdown": [
          {
            "question_number": 1,
            "status": "incorrect",
            "expandable_card": {
              "show_hint_button": true,
              "socratic_hint": "What happens when you substitute x=1...",
              "show_explanation_button": true,
              "full_explanation": "Using the quadratic formula...",
              "source_reference": {
                "text": "Source: Algebra Grade 12, Page 47",
                "link": "View Document"
              }
            }
          }
        ],
        "recommendation_box": {
          "message": "You're making progress! Try another Medium test.",
          "focus_areas": ["Quadratic Equations (48% accuracy)"],
          "study_links": ["Review Algebra Grade 12, Chapter 3"]
        },
        "buttons": ["Take Another Test", "View Dashboard"]
      }
    }
  ]
}
```

---

## Document Upload Flow (Admin)

```json
{
  "flow": "upload_curriculum_document",
  "steps": [
    {
      "step": 1,
      "actor": "admin",
      "action": "upload_pdf",
      "endpoint": "POST /api/admin/documents/upload",
      "form_data": {
        "file": "math_algebra_grade12.pdf",
        "subject": "Math",
        "topic": "Algebra",
        "grade_level": 12,
        "source": "Ministry of Education"
      }
    },
    {
      "step": 2,
      "actor": "backend",
      "action": "save_file_to_storage",
      "path": "/storage/documents/math_algebra_grade12.pdf"
    },
    {
      "step": 3,
      "actor": "backend",
      "action": "extract_text_from_pdf",
      "library": "PyPDF2",
      "output": "Full document text with page numbers"
    },
    {
      "step": 4,
      "actor": "backend",
      "action": "split_into_chunks",
      "params": {
        "chunk_size": 500,
        "chunk_overlap": 50
      },
      "output": "145 chunks"
    },
    {
      "step": 5,
      "actor": "backend",
      "action": "generate_embeddings",
      "model": "sentence-transformers/all-MiniLM-L6-v2",
      "input": "145 text chunks",
      "output": "145 × 384-dim vectors"
    },
    {
      "step": 6,
      "actor": "backend",
      "action": "store_in_mongodb",
      "collections": [
        {
          "collection": "documents",
          "document": {
            "filename": "math_algebra_grade12.pdf",
            "subject": "Math",
            "topic": "Algebra",
            "total_chunks": 145,
            "upload_date": "2025-11-06"
          }
        },
        {
          "collection": "chunks",
          "documents": [
            {
              "document_id": "doc_123",
              "chunk_index": 0,
              "text": "Quadratic equations...",
              "subject": "Math",
              "topic": "Quadratic Equations",
              "difficulty_level": 3,
              "embedding": "[0.234, -0.567, ...]",
              "metadata": {"page_number": 47}
            }
          ]
        }
      ]
    },
    {
      "step": 7,
      "actor": "backend",
      "action": "create_vector_index",
      "collection": "chunks",
      "index_definition": {
        "name": "vector_index",
        "type": "vectorSearch",
        "fields": [
          {
            "type": "vector",
            "path": "embedding",
            "numDimensions": 384,
            "similarity": "cosine"
          }
        ]
      }
    },
    {
      "step": 8,
      "actor": "backend",
      "action": "return_success",
      "response": {
        "documentId": "doc_123",
        "chunksCreated": 145,
        "message": "Document processed successfully"
      }
    }
  ]
}
```

---

## Latency Budget

| Step | Target | Current |
|------|--------|---------|
| User performance query | <100ms | TBD |
| Query embedding generation | <50ms | TBD |
| MongoDB vector search | <200ms | TBD |
| Context extraction | <50ms | TBD |
| Gemini API call | <1500ms | ~2000ms |
| Result augmentation | <50ms | TBD |
| Database write | <100ms | TBD |
| **Total (P95)** | **<3000ms** | **~2500ms** |

---

## MongoDB Indexes

```javascript
// Performance indexes
db.chunks.createIndex({embedding: "vector", subject: 1, difficulty_level: 1})
db.tests.createIndex({user_id: 1, created_at: -1})
db.responses.createIndex({test_id: 1})
db.performance.createIndex({user_id: 1, subject: 1, topic: 1})
db.documents.createIndex({subject: 1, topic: 1})

// Vector search index (MongoDB Atlas)
{
  "name": "vector_index",
  "type": "vectorSearch",
  "fields": [{
    "type": "vector",
    "path": "embedding",
    "numDimensions": 384,
    "similarity": "cosine"
  }]
}
```

---

## Cost Estimation

| Component | Price | Usage | Monthly Cost (1000 tests) |
|-----------|-------|-------|---------------------------|
| Embedding generation | Free (local) | 15 chunks × 500 chars | $0.00 |
| MongoDB Atlas vector search | Free tier | 15 queries | $0.00 |
| Gemini Flash (80%) | $0.075/$0.30 per 1M tokens | ~2500 tokens | $0.64 |
| Gemini Pro (20%) | $1.25/$5.00 per 1M tokens | ~2500 tokens | $2.40 |
| **Total** | — | — | **~$3.00** |

**Per test cost:** ~$0.003 (~₾0.009)

---

## Subject-Specific Considerations

### Math
- **Document types:** Textbooks (algebra, geometry, calculus), problem sets
- **Question types:** Multiple choice (calculations), numeric input
- **Validation:** SymPy for math expression parsing

### English  
- **Document types:** Grammar guides, reading passages, vocabulary lists
- **Question types:** Grammar MCQ, reading comprehension, vocabulary
- **Challenges:** Subjective writing (out of scope)

### Georgian
- **Document types:** Grammar textbooks, literature excerpts, language rules
- **Question types:** Grammar rules, reading comprehension, writing mechanics
- **Embedding model:** `paraphrase-multilingual-MiniLM-L12-v2` (supports Georgian)
- **Challenges:** Unicode UTF-8 handling for Georgian script

---

## Key Technical Decisions

1. **RAG over pure generation:** Ensures curriculum alignment, reduces hallucination
2. **Local embeddings:** Zero cost, no API latency (sentence-transformers)
3. **MongoDB native vector search:** Eliminates separate vector DB (Pinecone, Weaviate)
4. **Hybrid Gemini (Flash + Pro):** 80% Flash for speed/cost, 20% Pro for complex reasoning
5. **Document provenance:** Every question links to source document/page (builds trust)

---

## Critical Metrics

### Product Metrics
- Task completion rate: >75%
- Curriculum alignment: >90% (teacher validation)
- User satisfaction: >4.0/5.0
- Question quality: >85% relevance

### Technical Metrics
- RAG retrieval accuracy: >80%
- Response latency (P95): <3s
- Question correctness: 100%
- Cost per test: <₾0.30

---

## Document Corpus (Expected)

| Subject | Documents | Chunks | Size |
|---------|-----------|--------|------|
| Math | 10 docs | ~1500 | ~2MB |
| English | 8 docs | ~1200 | ~1.5MB |
| Georgian | 6 docs | ~900 | ~1MB |
| **Total** | 24 docs | ~3600 | ~5MB |

MongoDB Atlas free tier: 512MB (sufficient)
