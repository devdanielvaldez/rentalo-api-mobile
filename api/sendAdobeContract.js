const axios = require('axios');
const qs = require('qs');
const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');
const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET,
});

const params = qs.stringify({
  grant_type: 'refresh_token',
  client_id: process.env.REACT_APP_ABOBE_CLIENTID,
  client_secret: process.env.ABOBE_CLIENT_SECRET,
  refresh_token: process.env.ADOBE_REFRESH_TOKEN,
});

const methods = {
  adobeContracttoken: async (req, response) => {
    try {
      const token = await axios({
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: params,
        url: 'https://api.na3.adobesign.com/oauth/v2/refresh',
      })
      return token
    }
    catch (error) {
      return response.status(404).send(error);
    };
  },
  sendAdobeContract: (req, response) => {
    const {
      ownerId,
      driverEmail,
      title,
      txId,
      driverFullName,
      providerName,
      location,
      cardNumber,
      bookingEndDate,
      bookingStartDate,
      licensePlate,
      documnetNumber,
    } = req.body;
    const timestamp = new Date().toISOString();
    const finalTitle = timestamp + ' - ' + title;

    return integrationSdk.users
      .show({ id: ownerId })
      .then(res => {
        params;
        const options = {
          method: 'POST',
          headers: { 'content-type': 'application/x-www-form-urlencoded' },
          data: params,
          url: 'https://api.na3.adobesign.com/oauth/v2/refresh',
        };
        return axios(options)
          .then(tokenResponse => {
            const ownerEmail = res.data.data.attributes.email;
            const ownerFullName =
              res.data.data.attributes.profile.firstName +
              ' ' +
              res.data.data.attributes.profile.lastName;
            const accessToken = tokenResponse.data.access_token;


            const data2 = JSON.stringify({
              fileInfos: [
                {
                  libraryDocumentId: 'CBJCHBCAABAA8PTaI9zcGeIDfZPHBeanLPnz2FChAd2P',
                },
              ],
              mergeFieldInfo: [
                {
                  defaultValue: providerName,
                  fieldName: 'Custom Field 1',
                },
                {
                  defaultValue: driverFullName,
                  fieldName: 'Custom Field 2',
                },
                {
                  defaultValue: bookingStartDate,
                  fieldName: 'Custom Field 3',
                },
                {
                  defaultValue: bookingEndDate,
                  fieldName: 'Custom Field 5',
                },
                {
                  defaultValue: location,
                  fieldName: 'Custom Field 4',
                },
                {
                  defaultValue: location,
                  fieldName: 'Custom Field 6',
                },
                {
                  defaultValue: txId || '6391cd0a-b415-4eab-834d-69f6742c2de5',
                  fieldName: 'TxId',
                },
                {
                  defaultValue: cardNumber,
                  fieldName: 'Custom Field 13',
                },
                {
                  defaultValue: driverFullName,
                  fieldName: 'Custom Field 12',
                },
                {
                  defaultValue: licensePlate,
                  fieldName: 'Custom Field 11',
                },
                {
                  defaultValue: documnetNumber,
                  fieldName: 'Custom Field 10',
                },
                {
                  defaultValue: title,
                  fieldName: 'Custom Field 7',
                },
                {
                  defaultValue: txId,
                  fieldName: 'Custom Field 14',
                },
              ],
              name: finalTitle,
              participantSetsInfo: [
                {
                  memberInfos: [
                    {
                      email: driverEmail,
                    },
                  ],
                  order: 1,
                  role: 'SIGNER',
                },
                {
                  memberInfos: [
                    {
                      email: ownerEmail,
                    },
                  ],
                  order: 2,
                  role: 'APPROVER',
                },
              ],
              signatureType: 'ESIGN',
              state: 'IN_PROCESS',
            });

            const config2 = {
              method: 'post',
              url: 'https://api.na3.adobesign.com/api/rest/v6/agreements',
              headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              data: data2,
            };
            return axios(config2)
              .then(function (agreements) {
                const contractId = agreements.data.id;
                integrationSdk.transactions.updateMetadata({
                  id: txId,
                  metadata: {
                    contractId
                  }
                }, {
                  expand: true
                }).then(res => {
                });
                return response.status(200).send(contractId);
              })
              .catch(function (error) {
                return response.status(404).send(error);
              });

          })
          .catch(function (error) {
            return response.status(404).send(error);
          });
      })
      .catch(function (error) {
        return response.status(404).send(error);
      });
  },

  viewAdobeContract: async (req, response) => {
    const accessToken = req.authToken
    try {
      const options2 = {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        url: 'https://api.na3.adobesign.com/api/rest/v2/agreements',
      };
        const responseData = await axios(options2)
        const id = responseData?.data?.userAgreementList[0].agreementId
        const options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          url: `https://api.na3.adobesign.com/api/rest/v6/agreements/${id}/signingUrls?frameParent=iframe`,
        };
        const urlResponse = id && await axios(options)
        const URL = urlResponse?.data?.signingUrlSetInfos[0]?.signingUrls[0]?.esignUrl
        return response
          .status(200)
          .send({ URL })
          .end();
     

    } catch (error) {
      console.error(error, "error")
    };
  },

}
module.exports = methods;



