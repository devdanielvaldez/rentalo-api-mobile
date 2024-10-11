const { transactionLineItems } = require('../api-util/lineItems');
const { getSdk, getTrustedSdk, handleError, serialize, getISdk } = require('../api-util/sdk');

const integrationSdk = getISdk();

module.exports = (req, res) => {
  const { isSpeculative, bookingData, bodyParams, queryParams } = req.body;
  const listingId = bodyParams && bodyParams.params ? bodyParams.params.listingId : null;//txId
  const sdk = getSdk(req, res);
  let lineItems = null;
  // const promotion = bodyParams?.params?.promotion;
  // const voucherCode = bodyParams?.params?.voucherCode;

  const listingPromise = () => sdk.listings.show({ id: listingId });
  const userPromise = () => integrationSdk.users.show({ id: bookingData.authorId });

  Promise.all([listingPromise(), userPromise()])
    .then(([listingResponse, userResponse]) => {
      const listing = listingResponse.data.data;
      const provider = userResponse.data.data;
      lineItems = transactionLineItems(listing, bookingData, provider);
      return getTrustedSdk(req);
    })
    .then(trustedSdk => {
      const { params } = bodyParams;

      // Add lineItems to the body params
      const body = {
        ...bodyParams,
        params: {
          ...params,
          lineItems,
        },
      };

      if (isSpeculative) {
        return trustedSdk.transactions.initiateSpeculative(body, queryParams);
      }
      return trustedSdk.transactions.initiate(body, queryParams);
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
