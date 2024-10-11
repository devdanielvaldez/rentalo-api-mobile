const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_ID, TWILIO_NUMBER } = process.env;
const client = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

exports.sendVerification = to => {
  return client.verify.v2
    .services(TWILIO_VERIFY_SERVICE_ID)
    .verifications.create({ to, channel: 'sms' })
    .then(result => {
      return result.status;
    });
};

exports.checkVerification = (to, code) => {
  return client.verify.v2
    .services(TWILIO_VERIFY_SERVICE_ID)
    .verificationChecks.create({ to, code })
    .then(result => {
      return result.status;
    });
};

exports.send = ({ message, to }) => {
  return client.messages
    .create({
      body: message,
      from: TWILIO_NUMBER,
      to,
    })
    .then(message => {
      return message;
    })
    .catch(error => {
      return error
    });
};
