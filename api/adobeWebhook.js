const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');
const axios = require('axios');
const qs = require('qs');
const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET,
});
const serverURL = process.env.REACT_APP_SERVER_URL;

module.exports = (req, response) => {
  const xAdobeSignClientId = req.headers['x-adobesign-clientid'];
  const email = req.body
  const referenceClientId = 'UB7E5BXCXY';
  const isSignatureEvent =
    req.body?.actionType === 'ESIGNED' && req.body.event === 'AGREEMENT_ACTION_COMPLETED';
  const isRenter = req.body?.participantRole === 'SIGNER';
  const isOwner = req.body?.participantRole === 'APPROVER';
  const agreementId = req.body?.agreement?.id;

  if (isSignatureEvent && agreementId) {
    const data1 = qs.stringify({
      grant_type: 'refresh_token',
      client_id: process.env.REACT_APP_ABOBE_CLIENTID,
      client_secret: process.env.ABOBE_CLIENT_SECRET,
      refresh_token:process.env.ADOBE_REFRESH_TOKEN,
    });

    const config1 = {
      method: 'post',
      url: 'https://api.na3.adobesign.com/oauth/v2/refresh',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data1,
    };

    return axios(config1)
      .then(function(res) {
        const refreshToken = res.data.access_token;
        const config2 = {
          method: 'get',
          url: `https://api.na3.adobesign.com/api/rest/v6/agreements/${agreementId}/formFields`,

          headers: {
            Authorization: `Bearer ${refreshToken}`,
            'Content-Type': 'application/json',
          }
        };

        return axios(config2)
          .then(resp => {
            const txId = resp.data.fields.find(f => f.name === 'TxId')?.defaultValue || resp.data.fields.find(f => f.name === 'Custom Field 14')?.defaultValue;
            const transition = isRenter
              ? 'transition/signed-by-customer'
              : 'transition/signed-by-provider';

          
            if(!txId){
              response.setHeader('X-AdobeSign-ClientId', xAdobeSignClientId);
                return response.status(200).send({ xAdobeSignClientId });
            }
            return integrationSdk.transactions
              .transition(
                {
                  id: txId,
                  transition,
                  params: {},
                },
                {
                  expand: true,
                }
              )
              .then(res => {
                response.setHeader('X-AdobeSign-ClientId', xAdobeSignClientId);
                return response.status(200).send({ xAdobeSignClientId });
              })
              .catch(e => {
                response.setHeader('X-AdobeSign-ClientId', xAdobeSignClientId);
                return response.status(200).send({ xAdobeSignClientId });
              });
          })
          .catch(e => {
            response.setHeader('X-AdobeSign-ClientId', xAdobeSignClientId);
            return response.status(200).send({ xAdobeSignClientId });
          });
      })
      .catch(e => {
        response.setHeader('X-AdobeSign-ClientId', xAdobeSignClientId);
        return response.status(200).send({ xAdobeSignClientId });
      });
  } else {
    if (xAdobeSignClientId === referenceClientId) {
      response.setHeader('X-AdobeSign-ClientId', xAdobeSignClientId);
      return response.status(200).send({ xAdobeSignClientId });
    } else {
      return response.sendStatus(404);
    }
  }
};
