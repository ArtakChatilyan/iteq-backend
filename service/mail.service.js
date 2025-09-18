const nodemailer = require("nodemailer");

const mailService = {
  sendActivationMail: async (to, link) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: "Acount actiovation on ITEQ",
      text: "",
      html: `<div><a href=${link}>account activation</a></div>`,
    });
  },
  sendRecoveryMail: async (to, link) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "artak.chatilyan@gmail.com",
      subject: "Password recovery on ITEQ",
      text: "",
      html: `<div><a href=${link}>password recovery tools(available within 3 minutes)</a></div>`,
    });
  },
  sendQuestion: async (to, Firstname, Lastname, Email, Phone, Message) => {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: to,
      subject: "from:" + Email,
      text: "",
      html: `<div><div>${Firstname} ${Lastname}<div><div>${Phone}<div><div>${Message}<div></div>`,
    });
  },
};

module.exports = mailService;
