const User = require('../model/usersModel');
const ForgotModel = require('../model/forgotpasswordModel');
const bcrypt = require('bcrypt');
require('dotenv').config();
const nodemailer = require('nodemailer');
const uuid = require('uuid');

// FORGET PASSWORD FORM CONTROLLER — SEND MAIL
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User does not exist. Please signup or check your email address.' });
        }

        const id = uuid.v4();
        const addForget = await ForgotModel.create({ id, active: true, usersTbId: user.dataValues.id });

        if (!addForget) {
            throw new Error('Error creating reset request.');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        const resetLink = `${process.env.BASE_URL}/password/resetpassword/${id}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Reset your ExpenseTracker Password',
            html: `
                <p>You requested a password reset for your account.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="${resetLink}">Reset Password</a></p>
                <p>This link will expire after use. If you didn’t request this, please ignore this email.</p>
            `
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ message: 'Failed to send reset email.', success: false });
            } else {
                console.log('Email sent successfully:', info.response);
                return res.status(202).json({ message: 'Reset link sent to your email.', success: true });
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while processing your request.', success: false });
    }
};

// RESET PASSWORD — SERVE RESET FORM
const resetPassword = async (req, res) => {
    const { id } = req.params;
    try {
        const validUser = await ForgotModel.findOne({ where: { id, active: true } });

        if (!validUser) {
            return res.status(404).json({ message: 'Invalid or expired reset link.' });
        }

        await validUser.update({ active: false });

        res.status(200).send(`
            <html>
            <head>
                <title>Expense Tracker - Reset Password</title>
                <script src="https://cdn.tailwindcss.com"></script>
            </head>
            <body>
                <div class="w-screen h-screen flex items-center justify-center">
                    <form action="/password/updatepassword/${id}" method="POST" class="p-6 bg-white rounded shadow-md">
                        <h2 class="text-xl font-bold mb-4">Reset Your Password</h2>
                        <div class="mb-4">
                            <label for="newpassword" class="block text-gray-700">New Password:</label>
                            <input type="password" name="newpassword" required class="w-full px-3 py-2 border rounded focus:outline-none focus:ring focus:border-blue-300" />
                        </div>
                        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            Reset Password
                        </button>
                    </form>
                </div>
            </body>
            </html>
        `);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'An error occurred while verifying reset link.', success: false });
    }
};

// UPDATE PASSWORD — CHANGE USER PASSWORD
const updatePassword = async (req, res) => {
    const { resetpasswordid } = req.params;
    const { newpassword } = req.body;

    try {
        const resetRequest = await ForgotModel.findOne({ where: { id: resetpasswordid } });

        if (!resetRequest) {
            return res.status(404).json({ message: 'Invalid or expired reset link.', success: false });
        }

        const user = await User.findOne({ where: { id: resetRequest.usersTbId } });

        if (!user) {
            return res.status(404).json({ message: 'User not found.', success: false });
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newpassword, saltRounds);

        await user.update({ password: hashedPassword });

        return res.status(200).json({ message: 'Password successfully updated. Please log in with your new password.', success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating password.', success: false });
    }
};

module.exports = {
    forgotPassword,
    resetPassword,
    updatePassword
};
