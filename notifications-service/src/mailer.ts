import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "maildev",
  port: parseInt(process.env.SMTP_PORT || "1025"),
  secure: false,
});

export const sendConfirmationEmail = async (
  to: string,
  subject: string,
  html: string
) => {
  await transporter.sendMail({
    from: '"Ticketing System" <no-reply@ticketing.com>',
    to,
    subject,
    html,
  });
};
