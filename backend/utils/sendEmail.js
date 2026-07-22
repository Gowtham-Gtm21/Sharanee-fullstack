const nodemailer = require("nodemailer");

/**
 * Sends an email if SMTP env vars are configured; otherwise logs the
 * email content to the console so development still works without SMTP.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log("\n----- EMAIL (SMTP not configured, printing instead) -----");
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    console.log("-----------------------------------------------------------\n");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
