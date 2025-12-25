const {route} = require("express/lib/application");
const {recentTests, insertTest} = require("../controllers/dashboardControllers");
const router = require("express").Router()

router.route("/recentTests").get(recentTests)

router.route("/insertTest").post(insertTest)