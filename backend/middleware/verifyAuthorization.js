const User = require("../mongoSchemas/user");

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

module.exports = checkDuplicate;