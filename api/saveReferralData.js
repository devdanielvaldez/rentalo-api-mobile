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

module.exports = (req, res) => {
  const newUserId = req.body.newUserId; //user who received the referral
  const senderUser = req.body.senderUser;
  const referralsArray = senderUser.attributes.profile.privateData.referralsArray
    ? senderUser.attributes.profile.privateData.referralsArray
    : [];
  const senderUserId = senderUser.id.uuid;

  return integrationSdk.users
    .updateProfile({
      //update sender user profile
      id: senderUserId,
      privateData: {
        referralsArray: [
          ...referralsArray,
          {
            userId: newUserId,
            used: false,
          },
        ],
      },
    })
    .then(res => {
      return integrationSdk.users
        .updateProfile({
          //update new user profile
          id: newUserId,
          privateData: {
            referral: {
              userId: senderUserId,
              used: false,
            },
          },
        })
        .catch(e => {
          res.sendStatus(404);
        });
    })
    .then(resp => {
      res.sendStatus(200);
    })
    .catch(e => {
      res.sendStatus(404);
    });
};
