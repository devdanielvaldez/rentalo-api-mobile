const { getISdk } = require('../../api-util/sdk');
const integrationSdk = getISdk();

module.exports = async (req, response) => {
  try {
    const { data, event } = req.body;

    const { envelopeSummary = {}, recipientId } = data || {};

    const { recipients = {} } = envelopeSummary || {};
    const { signers } = recipients;
    const { value = '' } =
      (recipients &&
        signers &&
        signers[0].tabs &&
        signers[0].tabs.textTabs &&
        signers[0].tabs.textTabs.find(tab => tab.tabLabel === 'txId')) ||
      {};

    console.log('=>>>>>>>>>>>>>>> event', event);
    console.log('>>>>>>>>>>>>>>> recipientId', recipientId);
    console.log('>>>>>>>>>>>>>>> value', value);

    if (recipientId == '1' && event == 'recipient-completed' && value) {
      console.log('=====recipientId == 1======>>>>>>>>>> entryyyyyy');

      const updateData = await integrationSdk.transactions.transition(
        {
          id: value,
          transition: 'transition/signed-by-customer',
          params: {
            protectedData: {
              isCustomerSigned: true,
            },
          },
        },
        {
          expand: true,
        }
      );
      console.log('11111======>>>>>> updateData', updateData);
      return updateData;
    } else if (recipientId == '2' && event == 'recipient-completed' && value) {
      console.log('=========recipientId == "2" ==>>>>>>>>>> entry 2');
      const updateData = await integrationSdk.transactions.transition(
        {
          id: value,
          transition: 'transition/signed-by-provider',
          params: {
            protectedData: {
              isProviderSigned: true,
            },
          },
        },
        {
          expand: true,
        }
      );
      console.log('=======>?>>>>>>>>> 2222222 updateData', updateData);
      return updateData;
    }

    // Handle other cases or return an appropriate response here if necessary.
    return response.status(200).send('OK');
  } catch (error) {
    // Handle errors here
    console.error('Error:', error);
    return response.status(500).send('Internal Server Error');
  }
};
