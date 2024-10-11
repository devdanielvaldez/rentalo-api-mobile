const { VoucherifyServerSide } = require('@voucherify/sdk');
const { handleError } = require('../../api-util/sdk');

const { VOUCHERIFY_APPLICATION_ID, VOUCHERIFY_CLIENT_SECRET_KEY } = process.env;

const voucherifyClient = VoucherifyServerSide({
  applicationId: VOUCHERIFY_APPLICATION_ID,
  secretKey: VOUCHERIFY_CLIENT_SECRET_KEY,
  apiUrl: 'https://us1.api.voucherify.io',
  apiVersion: 'v2018-08-01',
});

exports.validateVoucher = async (req, res) => {
  const { code } = req.body;

  try {
    const validationResponse = await voucherifyClient.vouchers.get(code);

    res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send(validationResponse)
      .end();
  } catch (e) {
    handleError(res, e);
  }
};

exports.redeemVoucher = async (req, res) => {
  const { code, customerId } = req.body;

  try {
    const redemptionResponse = await voucherifyClient.redemptions.redeem(code, {
      customer: { id: customerId },
    });

    res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send(redemptionResponse)
      .end();
  } catch (e) {
    handleError(res, e);
  }
};
