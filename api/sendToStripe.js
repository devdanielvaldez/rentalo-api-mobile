// const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// const integrationSdk = sharetribeIntegrationSdk.createInstance({
//   clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
//   clientSecret: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET,
// });

module.exports = (req, response) => {
  const { transaction, token } = req.body;
  const amount = transaction.attributes.payinTotal.amount;
  const currency = 'usd';
  // const description = `${transaction.customer.id.uuid} booked ${transaction.listing.id.uuid} from ${transaction.booking.attributes.displayStart} to ${transaction.booking.attributes.displayEnd}`;

  return stripe.charges
    .create({
      amount: amount,
      currency: currency,
      // description: description,
      source: token?.id,
    })
    .then(result => {
      response.status(200).send(result);
    })
    .catch(error => {
      response.status(400).send(error.stack);
    });
};
