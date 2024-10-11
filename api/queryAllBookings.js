const { getISdk } = require('../api-util/sdk');

const integrationSdk = getISdk();

const methods = {
  querAllbooking: async (req, res) => {
    const { listingId } = req.body;
    const id = listingId.uuid;
    const currentDate = new Date();

    try {
      const result = await integrationSdk.transactions.query({
        listingId: id,
        createdAtEnd: currentDate,
      });
      const numberOfBookings = result?.data?.data?.length;
      return res.status(200).send({ numberOfBookings });
    } catch (error) {
      console.error('error', error);
    }
  },
};
module.exports = methods;
