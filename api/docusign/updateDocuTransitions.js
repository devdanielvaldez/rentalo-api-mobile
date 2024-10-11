const { getISdk } = require('../../api-util/sdk');

const integrationSdk = getISdk();

const methods = {
  updateTransitions: async (req, res) => {
    const { txId, lastTransition, isCustomer } = req.body;
    const handleTransitions =
      lastTransition === 'transition/waiting-for-customer-signature' ||
      lastTransition === 'transition/waiting-for-customer-signature-by-operator'
        ? 'transition/signed-by-customer'
        : 'transition/signed-by-provider';
    if (isCustomer) {
      const updateData = await integrationSdk.transactions.transition(
        {
          id: txId,
          transition: handleTransitions,
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
      return res.status(200).json({ status: 'OK', updateData });
    } else if (!isCustomer) {
      const updateData = await integrationSdk.transactions.transition(
        {
          id: txId,
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
      return res.status(200).json({ status: 'OK', updateData });
    }
  },
};
module.exports = methods;
