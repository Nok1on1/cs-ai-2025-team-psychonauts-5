/**
 * Example: How to upload a document using the new API
 * 
 * 1. Using cURL:
 * 
 * curl -X POST http://localhost:8000/api/documents/upload \
 *   -F "file=@path/to/exam.pdf" \
 *   -F "subject=Math" \
 *   -F "topic=Algebra" \
 *   -F "source=Ministry of Education" \
 *   -F "author=John Doe" \
 *   -F "year=2024" \
 *   -F "official=true"
 * 
 * 2. Using JavaScript/Frontend:
 * 
 */

const uploadDocument = async (file, subject, topic) => {
  const formData = new FormData();
  formData.append('file', file); // PDF file object
  formData.append('subject', subject); // "Math", "English", "Georgian"
  formData.append('topic', topic); // "Algebra", "Grammar", etc.
  formData.append('source', 'Ministry of Education');
  formData.append('author', 'Exam Board');
  formData.append('year', 2024);
  formData.append('official', true);

  const response = await fetch('http://localhost:8000/api/documents/upload', {
    method: 'POST',
    body: formData,
    credentials: 'include'
  });

  const data = await response.json();
  console.log(`Created ${data.chunksCreated} chunks from ${data.filename}`);
  return data.documentId;
};

/**
 * 3. Get all documents:
 */

const getDocuments = async () => {
  const response = await fetch('http://localhost:8000/api/documents');
  const data = await response.json();
  console.log(data.documents);
};

/**
 * 4. Get document with chunks:
 */

const getDocumentChunks = async (documentId) => {
  const response = await fetch(`http://localhost:8000/api/documents/${documentId}`);
  const data = await response.json();
  console.log(`Document: ${data.document.filename}`);
  console.log(`Chunks: ${data.totalChunks}`);
  data.chunks.forEach((chunk, i) => {
    console.log(`Chunk ${i}: ${chunk.text.substring(0, 100)}...`);
  });
};

/**
 * Flow:
 * 1. User (admin) uploads PDF exam → API chunks it → Stored in MongoDB
 * 2. When generating test, search relevant chunks using vector similarity
 * 3. Pass chunks as context to Gemini → AI generates exam-like questions
 */
