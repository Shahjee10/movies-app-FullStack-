const nodemailer = require('nodemailer');

// ✅ Gmail SMTP configuration using App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetEmail = async (to, resetLink) => {
  try {
    await transporter.sendMail({
      from: `"Movies App Support" <${process.env.GMAIL_USER}>`, // ✅ use your Gmail
      to,
      subject: 'Reset Your Password',
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you did not request this, you can safely ignore this email.</p>
      `,
    });

    console.log('✅ Reset email sent successfully to:', to);
  } catch (error) {
    console.error('❌ Error sending reset email:', error);
    throw new Error('Failed to send reset email');
  }
};

module.exports = sendResetEmail;
