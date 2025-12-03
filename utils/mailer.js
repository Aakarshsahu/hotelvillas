const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,       // e.g., "smtp.gmail.com"
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,    // your SMTP username (email)
    pass: process.env.SMTP_PASS     // your SMTP password or app password
  }
});

// Optional: verify connection once on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("Mail transporter verification failed:", error);
  } else {
    console.log("Mail transporter ready");
  }
});

module.exports = transporter;
