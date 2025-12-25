const checkDuplicate = require("../middleware/verifyAuthorization");
const {signUp, signIn} = require("../controllers/authorizationControllers");
const router = require("express").Router()


router.route('/signUp').post(checkDuplicate, signUp);

router.route("/signIn").post(signIn);

module.exports = router;