// utils/sendEmail.js
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html, text }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not set in environment");
  }
  if (!process.env.FROM_EMAIL) {
    throw new Error("FROM_EMAIL is not set in environment");
  }

  // Resend accepts html; text optional
  const response = await resend.emails.send({
    from: process.env.FROM_EMAIL,
    to,
    subject,
    html,
    text,
  });

  // response contains message id and status info
  return response;
}

module.exports = sendEmail;
