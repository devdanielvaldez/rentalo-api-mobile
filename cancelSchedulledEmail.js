const client = require('@sendgrid/client');
client.setApiKey(process.env.SENDGRID_KEY);
const cancelSchedulledEmail = async batchId => {
  const data = {
    batch_id: batchId,
    status: 'cancel',
  };

  const request = {
    url: `/v3/user/scheduled_sends`,
    method: 'POST',
    body: data,
  };

  client
    .request(request)
    .then(([response, body]) => {
      console.log('Email cancelled successfully');
    })
    .catch(error => {
      console.log('Error cancelling email: ', error);
    });
};
module.exports = {
  cancelSchedulledEmail,
};
