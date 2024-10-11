const sgMail = require('@sendgrid/mail');
const flexIntegrationSdk = require('sharetribe-flex-integration-sdk');
const { createBatchId } = require('./sendGridBatchId');
const clientId = process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID;
const clientSecret = process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET;
const integrationSdk = flexIntegrationSdk.createInstance({
  clientId,
  clientSecret,
});
sgMail.setApiKey(process.env.SENDGRID_KEY);
const canonicalURL = process.env.REACT_APP_CANONICAL_ROOT_URL;
const createScheduleEmail = async (userId, listingId) => {
  try {
    const userData = await integrationSdk.users.show({ id: userId });
    const listingData = await integrationSdk.listings.show({ id: listingId });
    const listing = listingData.data.data;
    const user = userData.data.data;

    const { attributes } = user || {};
    const { email, profile } = attributes || {};
    const { displayName } = profile || {};

    const { attributes: listingAttributes } = listing || {};
    const { title = '', metadata } = listingAttributes || {};
    const { batchId } = metadata || {};
    const emailBatchId = await createBatchId();
    // const emailBatchId = batchId || (await createBatchId());
    console.log('emailBatchId', emailBatchId);
    const subject = 'Draft Listing Reminder';
    const text = `<html>
      <body>
        <h2>Hi ${displayName},</h2>
        <p>This is a reminder that you have a draft listing that needs to be complete.</p>
        <hr />
        <h3>Listing Details</h3>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Listing ID:</strong> ${listingId}</p>
        <p>Click <a href="${canonicalURL}/listings">here</a> to complete your listing.</p>
        <hr />
        <p>Thank you for using our platform. 
        </p>
      </body>
    </html>
    `;
    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject,
      html: text,
      custom_args: {
        userId: userId,
        listingId: listingId,
      },
      batch_id: emailBatchId,
      send_at: Math.floor(Date.now() / 1000) + 259200,
    };
    const response = await sgMail.send(msg);
    const updateListingMetadata = await integrationSdk.listings.update({
      id: listing.id.uuid,
      metadata: { batchId: emailBatchId },
    });
    console.log('Email scheduled successfully');
  } catch (error) {
    console.log('error in create schedule email', error);
  }
};

module.exports = {
  createScheduleEmail,
};
