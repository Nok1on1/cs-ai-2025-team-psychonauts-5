const {generateQuiz, getGrade, generateSocraticFeedback} = require("../controllers/quizControllers");
const {route} = require("express/lib/application");
const router = require("express").Router()


router.route('/').post(generateQuiz);

router.route('/:sessionId/grade').post(getGrade)

router.route('/feedback').post(generateSocraticFeedback)

module.exports = router;