exports.sendOtp = async (phone,msg) => {
  phone = "+91"+phone
  const accountSid = process.env.SMS_ACCID;
  const authToken = process.env.SMS_AUTH_TOKEN;
  const client = require("twilio")(accountSid, authToken);

  client.messages
    .create({
      to: `${phone}`,
      from: "+12028663231",
      body: msg,
    })
    .then((message) => console.log(message.sid)).catch((e)=>{
      console.log(e)
    });
};






