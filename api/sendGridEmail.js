const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);
module.exports = async (req, res) => {
  const { html, subject, referralCode, to } = req.body;
  const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;
  const key = process.env.SENDGRID_KEY;
 try {
  sgMail.setApiKey(key);
  const message = {
    to: to, // Change to your recipient
    from: verifiedSender, // Change to your verified sender
    subject: subject,
    text: 'text',
    html: html,
  };
  const result = await sgMail.send(message)
  return res
  .status(200)
    .json("ok")
    .end();
 } catch (error) {
  console.error('error', error)
 }
};


