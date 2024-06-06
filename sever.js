require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');
const User = require('./model/user');
const Otp = require('./model/otp');
const sequelize = require('./database/config');

const app = express();
app.use(bodyParser.json());

//Configure Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.AUTH_USER,
        pass: process.env.AUTH_PASSWORD
    },
    debug: true, // Enable debug output
    logger: true,
});
// try now !!! store credentials// okkk trying to do so.....g
app.post('/generate-otp', async (req, res) => {
    try {
        const { email } = req.body;
        console.log(email)
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60000);

        await Otp.create({
            userId: user.id,
            otp: otpCode,
            expiresAt,
        });

        // Send OTP via email
        const mailOptions = {
            from: process.env.AUTH_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otpCode}. It is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ message: 'Error sending email', error });
            } else {
                console.log('Email sent: ' + info.response);
                res.status(200).json({ message: 'OTP generated and sent to the user' });
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error generating OTP', error });
    }
});





app.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validOtp = await Otp.findOne({
            where: {
                userId: user.id,
                otp,
                expiresAt: {
                    [Op.gt]: new Date(),
                },
            },
        });

        if (!validOtp) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        res.status(200).json({ message: 'OTP verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error });
    }
});

app.post('/create-user', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.create({ email });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error creating user', error });
    }
});

sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});



