const User = require("../mongoSchemas/user");
const jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const checkDuplicate = async (req, res, next) => {
    try {
        const inUseEmail = await User.findOne({
            email: req.body.email,
        });

        if (inUseEmail) {
            res.status(409).json({message: `IN_USE_EMAIL`});
            return;
        }
        next();
    } catch (error) {
        res
            .status(500)
            .json({message: `Duplicate Checking raised an error`, Error: error.message});
    }
};

const authMiddleware = async (req, res, next) => {
    const token = req.cookies["x-access-token"];
    if (!token) return res.status(401).json({message: "No token"});

    try {
        const payload = jwt.verify(token, config.secret);
        const user = await User.findById(payload.id);
        if (!user) return res.status(404).json({message: "User not found"});

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({message: "Invalid or expired token"});
    }
};


module.exports = {checkDuplicate, authMiddleware};