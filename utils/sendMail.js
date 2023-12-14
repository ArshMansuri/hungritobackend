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
    from: '"Fred Foo 👻" <foodhungri@gmail.com>', // sender address
    to: email, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: `<b>${text}</b>`, // html body
  });
};
