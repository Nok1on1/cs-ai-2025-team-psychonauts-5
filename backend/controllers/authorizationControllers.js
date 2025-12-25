var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var config = require("../config/auth.config");
const User = require("../mongoSchemas/user");
require('dotenv').config();

const signUp = async (req, res) => {
    const {name, email, password} = req.body;
    let user;
    try {
        user = await User.create({
            name: name,
            email: email,
            password: bcrypt.hashSync(password, 8),
            role: "student",
        });

    } catch (error) {
        await User.findByIdAndDelete(user._id).exec();
        console.log(error);
        res
            .status(500)
            .json({message: "Something went wrong in signUp", err: error});
    }

    let token = jwt.sign({id: user._id}, config.secret, {
        expiresIn: config.jwtExpiration,
    });

    res.cookie("x-access-token", token, {
        httpOnly: true,
        sameSite: "Lax",
        secure: false,
        maxAge: config.jwtExpiration * 1000,
    }).status(200).json({id: user._id, name, email, password, accessToken: token});
};

const signIn = async (req, res) => {
    const {email, password} = req.body;

    const foundUser = await User.findOne({
        email: email,
    }).exec();

    if (!foundUser) return res.status(404).json({message: "User Not Found!"});

    var passwordIsValid = bcrypt.compareSync(password, foundUser.password);

    if (!passwordIsValid) {
        return res.status(401).send({
            accessToken: null,
            message: "Invalid Password!",
        });
    }

    let token = jwt.sign({id: foundUser._id}, config.secret, {
        expiresIn: config.jwtExpiration,
    });

    let authority = "ROLE_" + foundUser.role;

    res
        .cookie("x-access-token", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false,
            maxAge: config.jwtExpiration * 1000,
        })
        .status(200)
        .json({
            message: "Logged in",
            id: foundUser._id,
            name: foundUser.name,
            email: foundUser.email,
            role: authority,
            accessToken: token,
        });
};

module.exports = {signUp, signIn};