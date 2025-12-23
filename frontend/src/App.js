import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

function App() {
  const [testConfig, setTestConfig] = useState({
    subject: 'math',
    difficulty: 1,
    num_questions: 5,
  });
  const [session, setSession] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [feedback, setFeedback] = useState({});

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setTestConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleStartTest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/tests`, testConfig);
      setSession(response.data);
      setAnswers({});
      setResults(null);
      setFeedback({});
    } catch (error) {
      console.error("Error starting test:", error);
    }
  };

  const handleAnswerChange = (questionId, selectedIndex) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedIndex }));
  };

  const handleGradeTest = async (e) => {
    e.preventDefault();
    const formattedAnswers = Object.entries(answers).map(([question_id, selected_index]) => ({
      question_id,
      selected_index,
    }));
    try {
      const response = await axios.post(`${API_BASE_URL}/tests/${session.session_id}/grade`, {
        answers: formattedAnswers,
      });
      setResults(response.data);
    } catch (error) {
      console.error("Error grading test:", error);
    }
  };

  const handleGetFeedback = async (question, selected_index) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/feedback`, {
        question,
        selected_index,
      });
      setFeedback((prev) => ({ ...prev, [question.id]: response.data.message }));
    } catch (error) {
      console.error("Error getting feedback:", error);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <h1>Dialogos</h1>
      {!session && (
        <form onSubmit={handleStartTest}>
          <h2>Configure Test</h2>
          <div>
            <label>Subject: </label>
            <select name="subject" value={testConfig.subject} onChange={handleConfigChange}>
              <option value="math">Math</option>
              <option value="logic">Logic</option>
            </select>
          </div>
          <div>
            <label>Difficulty: </label>
            <select name="difficulty" value={testConfig.difficulty} onChange={handleConfigChange}>
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
              <option value={3}>Level 3</option>
            </select>
          </div>
          <div>
            <label>Number of Questions: </label>
            <input
              type="number"
              name="num_questions"
              value={testConfig.num_questions}
              onChange={handleConfigChange}
              min="1"
              max="20"
            />
          </div>
          <button type="submit">Start Test</button>
        </form>
      )}

      {session && !results && (
        <form onSubmit={handleGradeTest}>
          <h2>Test Questions</h2>
          {session.questions.map((q) => (
            <div key={q.id} style={{ marginBottom: '20px' }}>
              <p>{q.text}</p>
              {q.choices.map((choice, index) => (
                <div key={index}>
                  <input
                    type="radio"
                    id={`${q.id}_${index}`}
                    name={q.id}
                    value={index}
                    onChange={() => handleAnswerChange(q.id, index)}
                    checked={answers[q.id] === index}
                  />
                  <label htmlFor={`${q.id}_${index}`}>{choice}</label>
                </div>
              ))}
            </div>
          ))}
          <button type="submit">Grade Test</button>
        </form>
      )}

      {results && (
        <div>
          <h2>Test Results</h2>
          <p>
            Score: {results.correct} / {results.total} ({(results.correct / results.total) * 100}%)
          </p>
          <button onClick={() => setSession(null)}>Take New Test</button>
          <h3>Review Answers</h3>
          {session.questions.map((q) => {
            const result = results.details.find((d) => d.question_id === q.id);
            const isCorrect = result.correct;
            const selectedAnswer = q.choices[result.selected_index];
            const correctAnswer = q.choices[result.correct_index];
            return (
              <div key={q.id} style={{ border: `2px solid ${isCorrect ? 'green' : 'red'}`, padding: '10px', margin: '10px 0' }}>
                <p>{q.text}</p>
                <p>Your answer: {selectedAnswer} {isCorrect ? '✅' : '❌'}</p>
                {!isCorrect && <p>Correct answer: {correctAnswer}</p>}
                <button onClick={() => handleGetFeedback(q, result.selected_index)}>
                  Get Socratic Feedback
                </button>
                {feedback[q.id] && <p style={{ backgroundColor: '#f0f0f0', padding: '10px' }}>{feedback[q.id]}</p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default App;
