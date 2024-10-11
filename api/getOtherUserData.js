const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');
const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET,
});

const methods = {
  getProviderData: async (req, res) => {
    const id = req.body.uuid;
    try {
      const result = await integrationSdk.users.show({
        id,
      })
      const hostMetaData = result.data.data.attributes.profile.protectedData.hostMetaData;
      return res.status(200).send(hostMetaData);

    } catch (error) {
      console.error('error', error)
    }
  },
};

module.exports = methods;