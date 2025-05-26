import bcrypt from 'bcrypt'; // Ensure bcrypt is available for password hashing
import { User } from './model.js'; // Import the User model
import jwt from 'jsonwebtoken'; // Import jsonwebtoken for token generation
import { randomBytes } from 'crypto';
import * as dotenv from 'dotenv';
import TryCatch from './trycatch.js';
import { sendPasswordResetEmail, sendResetSuccessEmail, sendVerificationEmail, sendWelcomeEmail } from './mailtrap/emails.js';
import axios from 'axios';
dotenv.config();
const verifyCaptcha = async (token) => {
    console.log('Client reCAPTCHA token:', token); // Logging the client-side token
    const secret = process.env.CAPTCHA_SECRET_KEY; // Secret key should be in environment variables on the server side
    if (!secret) {
        console.error('CAPTCHA_SECRET_KEY is not defined!');
        return false;
    }
    // Sending the POST request to Google reCAPTCHA API for verification
    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, // No body data, just query params
        {
            params: {
                secret: secret,
                response: token
            }
        });
        console.log('Server reCAPTCHA verification response:', response.data); // Log the full response from Google
        return response.data.success;
    }
    catch (error) {
        console.error('Error verifying CAPTCHA:', error);
        return false;
    }
};
export const registerUser = TryCatch(async (req, res) => {
    const { name, email, password, recaptchaToken } = req.body;
    if (!name || !email || !password || !recaptchaToken) {
        res.status(400).json({ message: "All fields including captcha are required." });
        return;
    }
    const isHuman = await verifyCaptcha(recaptchaToken);
    if (!isHuman) {
        res.status(403).json({ message: "Captcha verification failed." });
        return;
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400).json({ message: "User already exists." });
        return;
    }
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = Math.floor(10000 + Math.random() * 900000).toString();
    ;
    const user = new User({
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
    });
    await user.save();
    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: '7d' });
    await sendVerificationEmail(user.email, verificationToken);
    res.status(201).json({ message: "User registered successfully.", user: user, token });
});
export const verifyEmail = TryCatch(async (req, res) => {
    //code=123456 in UI
    const { code } = req.body;
    try {
        const user = await User.findOne({ verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });
        if (!user) {
            res.status(400).json({ success: false, message: "Invalid or expired verification code" });
            return;
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;
        await user.save();
        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            user: user
        });
    }
    catch (error) {
        console.error('error in verifying email', error);
        res.status(500).json({ success: false, message: "server error" });
    }
});
export const loginUser = TryCatch(async (req, res) => {
    const { email, password, recaptchaToken } = req.body;
    try {
        if (!email || !password || !recaptchaToken) {
            res.status(400).json({ message: "Email and password are required." });
            return;
        }
        const isHuman = await verifyCaptcha(recaptchaToken);
        if (!isHuman) {
            res.status(403).json({ message: "Captcha verification failed." });
            return;
        }
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid credentials." });
            return;
        }
        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials." });
            return;
        }
        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SEC, { expiresIn: '7d' });
        user.lastLogin = new Date();
        user.save();
        res.status(200).json({ message: "User logged in successfully.", user: user, token });
    }
    catch (error) {
        console.log("error during login", error);
        res.status(400).json({ success: false, message: error.message });
    }
});
export const forgotPassword = TryCatch(async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ success: false, message: "user not found" });
            return;
        }
        //generate reset token
        const resetToken = randomBytes(20).toString("hex");
        const resettokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiresAt = resettokenExpiresAt;
        await user.save();
        //send email
        // Construct the reset URL
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'; // Default to a fallback URL if not set
        const resetURL = `${clientUrl}/reset-password/${resetToken}`;
        console.log("Reset URL:", resetURL); // Log the reset URL for debugging
        await sendPasswordResetEmail(user.email, `${clientUrl}/reset-password/${resetToken}`);
        res.status(200).json({ success: true, message: "password reset link sent to your email" });
    }
    catch (error) {
        console.error('error in password reset email', error);
        res.status(500).json({ success: false, message: error.message });
    }
});
export const resetPassword = TryCatch(async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
            return;
        }
        //update password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;
        await user.save();
        sendResetSuccessEmail(user.email);
        res.status(200).json({ success: true, message: "password reset successful" });
    }
    catch (error) {
        console.log("Error in password", error);
        res.status(400).json({ success: false, message: error.message });
    }
});
export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;
    res.json(user);
});
export const addToPlaylist = TryCatch(async (req, res) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({
            message: 'no user with this id'
        });
        return;
    }
    if (user?.playlist.includes(req.params.id)) {
        const index = user.playlist.indexOf(req.params.id);
        user.playlist.splice(index, 1);
        await user.save();
        res.json({
            message: 'removed from playlist'
        });
        return;
    }
    user.playlist.push(req.params.id);
    await user.save();
    res.json({
        message: 'added to playlist'
    });
});
export const searchPerson = TryCatch(async (req, res) => {
    try {
        const { userId } = req.params;
        console.log(`userId in search person:${userId}`);
        const user = await User.findById(userId).select("searchHistory");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json({ searchHistory: user.searchHistory });
    }
    catch (err) {
        console.log('error in search persons history controller');
    }
});
export const updateSearchHistory = TryCatch(async (req, res) => {
    const { userId } = req.params;
    const { term } = req.body;
    console.log(`userIdddddddddddddddddddddddd:${userId}`);
    console.log("typeof userIddddddddddddddddddd:", typeof userId); // should be string
    // should show userId, not 'search-history'
    if (!term || typeof term !== "string") {
        res.status(400).json({ message: "Invalid or missing `term` in request body" });
        return;
    }
    const user = await User.findById(userId);
    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }
    // Ensure unique recent history (optionally trim older entries)
    user.searchHistory = [
        term,
        ...(user.searchHistory || []).filter((t) => t !== term),
    ].slice(0, 5);
    await user.save();
    res.status(200).json({ message: "Search history updated" });
});
