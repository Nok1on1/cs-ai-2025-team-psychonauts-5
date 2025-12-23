const express = require('express');
const cors = require('cors');
const {
  generate_test_ai,
  grade_test,
  generate_socratic_feedback,
} = require('./logic');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Dialogos Backend is running!');
});

app.post('/api/tests', async (req, res) => {
  try {
    const session = await generate_test_ai(req.body);
    res.json(session);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tests/:sessionId/grade', (req, res) => {
  try {
    const submission = {
      session_id: req.params.sessionId,
      answers: req.body.answers,
    };
    const results = grade_test(submission);
    res.json(results);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/feedback', (req, res) => {
  try {
    const feedback = generate_socratic_feedback(req.body);
    res.json(feedback);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
