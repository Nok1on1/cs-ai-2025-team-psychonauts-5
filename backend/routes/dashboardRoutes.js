const {route} = require("express/lib/application");
const {recentTests, insertTest} = require("../controllers/dashboardControllers");
const {authMiddleware} = require("../middleware/verifyAuthorization");
const router = require("express").Router()

router.route("/recentTests").get(authMiddleware, recentTests)

router.route("/insertTest").post(authMiddleware, insertTest)

module.exports = router;