var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
var config = require("../config/auth.config");
const User = require("../mongoSchemas/user");
require('dotenv').config();

const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: "Name, email, and password are required" });
        }

        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(email)) {
            return res.status(400).json({ message: "Invalid email address" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email already in use" });
        }

        // Create user
        const hashedPassword = bcrypt.hashSync(password, 8);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "student",
        });

        // Sign JWT
        const token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: config.jwtExpiration,
        });

        // Set cookie
        res.cookie("x-access-token", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false, // true in production with HTTPS
            maxAge: config.jwtExpiration * 1000,
        });

        // Return user info (no password!)
        return res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            accessToken: token
        });

    } catch (err) {
        console.error("SignUp error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const token = jwt.sign({ id: user._id }, config.secret, {
            expiresIn: config.jwtExpiration,
        });

        res.cookie("x-access-token", token, {
            httpOnly: true,
            sameSite: "Lax",
            secure: false, // true in production
            maxAge: config.jwtExpiration * 1000,
        });

        return res.status(200).json({
            message: "Logged in",
            id: user._id,
            name: user.name,
            email: user.email,
            role: "ROLE_" + user.role,
            accessToken: token
        });

    } catch (err) {
        console.error("SignIn error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = {signUp, signIn};