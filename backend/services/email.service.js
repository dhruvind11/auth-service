const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send an email using Zoho SMTP
 */
const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Auth System" <${process.env.ZOHO_EMAIL}>`,
    to,
    subject,
    html,
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendEmail };
