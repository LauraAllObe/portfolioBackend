require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// 🔐 Setup Mailgun transporter globally
const transporter = nodemailer.createTransport({
  host: 'smtp.mailgun.org',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAILGUN_USER,
    pass: process.env.MAILGUN_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// 📤 Send email endpoint
app.post('/send-email', async (req, res) => {
  const { name, email, subject, message, time } = req.body;

  const mailOptions = {
    from: `"${name}" <contact@lauraobermaier.info>`,
    to: 'lauraaobermaier@gmail.com',
    replyTo: email,
    subject,
    html: `
      <div style="font-family: system-ui, sans-serif, Arial; font-size: 12px">
        <div>A message by ${name} has been received.</div>
        <div style="margin-top: 20px; padding: 15px 0; border-top: dashed 1px lightgrey;">
          <p><strong>From:</strong> ${email}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Message:</strong><br/>${message}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true });
  } catch (err) {
    console.error("Email send failed:", err);
    res.status(500).send({ error: "Email failed to send." });
  }
});

// 🧪 Diagnostic test route
app.get('/test-email', async (req, res) => {
  try {
    await transporter.sendMail({
      from: '"Test Bot" <contact@lauraobermaier.info>',
      to: 'lauraaobermaier@gmail.com',
      subject: 'Test Email from Backend',
      text: 'Hello from Heroku. The email service is working.',
    });
    res.send('✅ Test email sent successfully!');
  } catch (err) {
    console.error("Manual test failed:", err);
    res.status(500).send('❌ Failed to send test email.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Email server running on port ${PORT}`);
});
