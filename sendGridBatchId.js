const client = require('@sendgrid/client');
client.setApiKey(process.env.SENDGRID_KEY);
const createBatchId = async () => {
  try {
    const [response] = await client.request({
      method: 'POST',
      url: '/v3/mail/batch',
    });

    const batchId = response?.body?.batch_id;
    return batchId;
  } catch (error) {
    console.error('Error creating batch ID:', error);
  }
};

module.exports = { createBatchId };
