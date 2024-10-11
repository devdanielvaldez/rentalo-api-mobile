const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET,
});

const decodeReferral = str => {
  const reversedCharacters = str
    .split('')
    .reverse()
    .join('');
  const finalCode = reversedCharacters.toLowerCase();
  return finalCode;
};

module.exports = (req, response) => {
  const referralCode = req.body.referralCode;

  const senderUserIdSnippet = decodeReferral(referralCode); //user who send the referral

  return integrationSdk.users
    .query()
    .then(res => {
      const usersArray = res.data.data;
      const foundUser = usersArray.find(user => {
        const userId = user.id.uuid;
        const lastSix = userId.slice(-6);
        return lastSix === senderUserIdSnippet;
      });

      if (foundUser) {
        response.status(200).send(foundUser); 
      } else {
        response.sendStatus(404);
      }
      // res.data contains the response data
    })
    .catch(error => {
      console.log(error);
      response.sendStatus(404);
    });
};
