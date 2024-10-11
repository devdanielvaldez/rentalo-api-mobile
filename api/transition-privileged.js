const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, getTrustedSdk, handleError, serialize, getISdk } = require('../api-util/sdk');

const integrationSdk = getISdk();


module.exports = (req, res) => {
  const { isSpeculative, bookingData, bodyParams, queryParams } = req.body;
  // const promotion = bodyParams?.params?.promotion;
  // const voucherCode=bodyParams?.params?.voucherCode
  const { listingId, ...restParams } = bodyParams && bodyParams.params ? bodyParams.params : {};

  const sdk = getSdk(req, res);
  let lineItems = null;

  const listingPromise = () => sdk.listings.show({ id: listingId });
  const userPromise = () => bookingData
    ? integrationSdk.users.show({ id: bookingData.authorId })
    : Promise.resolve({});

  Promise.all([listingPromise(), userPromise()])
    .then(([listingResponse, userResponse]) => {
      const listing = listingResponse.data.data;
      const provider = userResponse?.data?.data;
      if (bookingData) {
        lineItems = transactionLineItems(listing, bookingData, provider);
      }

      return getTrustedSdk(req);
    })
    .then(trustedSdk => {
      // Add lineItems to the body params
      const body = {
        ...bodyParams,
        params: {
          ...restParams,
          lineItems,
        },
      };

      if (isSpeculative) {
        return trustedSdk.transactions.transitionSpeculative(body, queryParams);
      }
      return trustedSdk.transactions.transition(body, queryParams);
    })
    .then(apiResponse => {
      const { status, statusText, data } = apiResponse;
      res
        .status(status)
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status,
            statusText,
            data,
          })
        )
        .end();
    })
    .catch(e => {
      handleError(res, e);
    });
};
