const nodemailer = require("nodemailer");

exports.sendMail = async (email, subject, text) => {
  let testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  const info = await transporter.sendMail({
    from: '"Fred Foo 👻" <foodhungri@gmail.com>',
    to: email, 
    subject: subject, 
    text: text, 
    html: `<b>${text}</b>`, 
  });
};
