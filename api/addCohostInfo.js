const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET,
});

module.exports = (req, response) => {
  const initialUserId = req.body.initialUserId;
  const invitedUserId = req.body.invitedUserId;

  return integrationSdk.users
    .updateProfile({
      id: initialUserId,
      publicData: {
        cohost: invitedUserId,
      },
    })
    .then(res => {
      response.sendStatus(200);
    })
    .catch(e => {
      response.sendStatus(200);
    });
};
