const {generate_socratic_feedback, generate_test_ai, grade_test} = require("../logic");

const generateQuiz = async (req, res) => {
    try {
        const session = await generate_test_ai(req.body);
        res.json(session);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

const getGrade = async (req, res) => {
    try {
        const submission = {
            session_id: req.params.sessionId,
            answers: req.body.answers,
        };
        const results = grade_test(submission);
        res.json(results);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

const generateSocraticFeedback = async (req, res) => {
    try {
        const feedback = await generate_socratic_feedback(req.body);
        res.json(feedback);
    } catch (error) {
        res.status(400).json({error: error.message});
    }
}

module.exports = {generateQuiz, getGrade, generateSocraticFeedback};