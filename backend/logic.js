const {GoogleGenerativeAI} = require('@google/generative-ai');
const crypto = require('crypto');
const questionsSchema = require("./schemas/questionsSchema.json");
require('dotenv').config();

const _SESSIONS = new Map();
const SESSION_TTL = 1000 * 60 * 60; // 1 hour

function _question_bank() {
    return [
        {
            id: "q_math_1",
            text: "What is 2 + 2?",
            choices: ["3", "4", "5", "22"],
            correct_index: 1,
            subject: "math",
            difficulty: 1,
        },
        {
            id: "q_math_2",
            text: "What is 3 * 3?",
            choices: ["6", "7", "8", "9"],
            correct_index: 3,
            subject: "math",
            difficulty: 1,
        },
        {
            id: "q_logic_1",
            text: "If all A are B and all B are C, are all A C?",
            choices: ["Yes", "No"],
            correct_index: 0,
            subject: "logic",
            difficulty: 1,
        },
        {
            id: "q_logic_2",
            text: "Which does not belong: 2, 4, 6, 9, 10?",
            choices: ["2", "4", "6", "9", "10"],
            correct_index: 3,
            subject: "logic",
            difficulty: 2,
        },
    ];
}

function generate_test(request) {
    const {subject, difficulty, num_questions = 5} = request;
    const bank = _question_bank().filter(
        (q) => q.subject === subject && q.difficulty <= difficulty
    );

    if (bank.length === 0) {
        throw new Error(`No questions available for ${subject} at difficulty ${difficulty}`);
    }

    const questions = bank.slice(0, num_questions);
    const session_id = crypto.randomUUID();
    const session = {session_id, questions, expires: Date.now() + SESSION_TTL};
    _SESSIONS.set(session_id, session);
    return session;
}

async function _gemini_generate_questions(req) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log("[INFO] No Gemini API key found, will use fallback");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const jsonOnlyModel = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: questionsSchema
            }
        });

        const instructions = `
      Create strictly-formatted JSON for multiple-choice questions.
      Return ONLY JSON, no prose.

      Schema for each question object: {
        "id": "string",
        "text": "string",
        "choices": ["string"],
        "correct_index": "integer",
        "subject": "math" | "logic",
        "difficulty": 1 | 2 | 3
      }

      Requirements:
      - subject must be '${req.subject}'.
      - difficulty should be ${req.difficulty}.
      - Generate exactly ${req.num_questions} questions.
      - Ensure correct_index points to the correct choice.

      Output shape: { "questions": [ {question}, ... ] }
    `;

        const result = await jsonOnlyModel.generateContent(instructions);
        const response = await result.response;
        const text = response.text();
        const data = JSON.parse(text);

        return data.questions.map((q) => ({
            ...q,
            id: q.id || crypto.randomUUID(),
            subject: q.subject || req.subject,
            difficulty: q.difficulty || req.difficulty,
        }));
    } catch (error) {
        console.error("[ERROR] Gemini API call failed:", error);
        return null;
    }
}

async function generate_test_ai(request) {
    const questions = await _gemini_generate_questions(request);
    if (!questions) {
        console.log("[FALLBACK] AI generation failed, using deterministic question bank");
        return generate_test(request);
    }

    const session_id = crypto.randomUUID();
    const session = {session_id, questions, expires: Date.now() + SESSION_TTL};
    _SESSIONS.set(session_id, session);
    console.log(`[SUCCESS] Generated AI test: ${session_id} with ${questions.length} questions`);
    return session;
}


function grade_test(submission) {
    const {session_id, answers} = submission;
    const session = _SESSIONS.get(session_id);
    if (!session || session.expires < Date.now()) {
        _SESSIONS.delete(session_id);
        throw new Error(`Test session '${session_id}' not found or expired`);
    }

    const selected_by_qid = answers.reduce((acc, ans) => {
        acc[ans.question_id] = ans.selected_index;
        return acc;
    }, {});

    let correct_count = 0;
    const details = session.questions.map((q) => {
        const selected_index = selected_by_qid[q.id];
        const is_correct = selected_index === q.correct_index;
        if (is_correct) {
            correct_count++;
        }
        return {
            question_id: q.id,
            correct: is_correct,
            correct_index: q.correct_index,
            selected_index: selected_index,
        };
    });

    return {
        session_id: session_id,
        total: session.questions.length,
        correct: correct_count,
        details: details,
    };
}

function generate_socratic_feedback(req) {
    const {question, selected_index} = req;
    const q = question;
    let msg;
    if (selected_index === q.correct_index) {
        msg = "Great job! You chose the correct answer. Can you explain why it is correct in your own words?";
    } else {
        const chosen = q.choices[selected_index] || "(invalid choice)";
        const correct = q.choices[q.correct_index];
        msg = `Let's reflect. You chose '${chosen}'. What evidence in the question text supports that choice? Now compare it to the correct reasoning that leads to '${correct}'. Which assumption might have misled you?`;
    }
    return {question_id: q.id, message: msg};
}

setInterval(() => {
    const now = Date.now();
    for (const [key, session] of _SESSIONS.entries()) {
        if (session.expires < now) {
            _SESSIONS.delete(key);
        }
    }
}, 60 * 1000); // Check every minute


module.exports = {
    generate_test_ai,
    grade_test,
    generate_socratic_feedback,
};
