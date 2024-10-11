/**
 * This file contains server side endpoints that can be used to perform backend
 * tasks that can not be handled in the browser.
 *
 * The endpoints should not clash with the application routes. Therefore, the
 * endpoints are prefixed in the main server where this file is used.
 */

const express = require('express');
const bodyParser = require('body-parser');
const { deserialize } = require('./api-util/sdk');

const initiateLoginAs = require('./api/initiate-login-as');
const loginAs = require('./api/login-as');
const transactionLineItems = require('./api/transaction-line-items');
const initiatePrivileged = require('./api/initiate-privileged');
const transitionPrivileged = require('./api/transition-privileged');

const deleteAccount = require('./api/delete-account');

const sendGridEmail = require('./api/sendGridEmail');
const checkReferralCode = require('./api/checkReferralCode');
const saveReferralData = require('./api/saveReferralData');
const updateReferralObj = require('./api/updateReferralObj');
const createUserWithIdp = require('./api/auth/createUserWithIdp');
const sendToStripe = require('./api/sendToStripe');

const docuSignWebhook = require('./api/docusign/docuSignWebhook');
const { authenticateFacebook, authenticateFacebookCallback } = require('./api/auth/facebook');
const { authenticateGoogle, authenticateGoogleCallback } = require('./api/auth/google');

const addCohostInfo = require('./api/addCohostInfo');

const { vehicleDetailsVerify, retrieveBusinessName, getMarketValue } = require('./api/vehicleApi/vehicle-api');
const loadCurrentUser = require('./api-util/load-current-user');
const { createStripeCustomer, retrievePaymentMethod, createPaymentIntent, capturePaymentIntent, createPaymentMethod, deletePaymentMethod, initiateRefund, createCharge } = require('./api/stripe');
const { invoicePostOdooUser, invoiceLineOdooUser, invoicePaymentOdooUser, invoiceOdooUser, getCountryCode, updateInvoiceOdooUser } = require('./api/createOdooUser');
// const odooMidleware = require('./api/odooMidleware');
const { insuranceEmail } = require('./api/sendInsuranceEmail');
const { mailchimp } = require('./api/mailChimp/mailchimp');
const { updatCustomerMetaData, uploadAfterPhotos } = require('./api/updateMetaData');
const { querAllbooking } = require('./api/queryAllBookings');
const { getProviderData } = require('./api/getOtherUserData');
const createUserWithOpenIdp = require('./api/auth/createUserWithOpenIdp');
const loginWithOpenIdp = require('./api/auth/loginWithOpenIdp');
const checkAppleMailId = require('./api/auth/checkAppleMailId');
const {  createEnvelopeAndObtainRecipientUrl, obtainRecipien2Url, getAccessToken, downloadAgreement } = require('./api/docusign/DocuSignBack');
const { createComplianceCheck, createCheck } = require('./api/ComplyCube/complyCubeApi');
const { sendVerification, checkVerification } = require('./api/twilioPhoneNumberVerification/twilioApi');
const { getComplyCubeToken, createCheckTx } = require('./api/ComplyCube/complyCubeTxApi');
const handleComplyCubeWebhook = require('./api/ComplyCube/complyCubeWebHook');
const checkUserExist = require('./api/auth/checkUserExist');

const {
  createOdooCustomer,
  updateOdooUser,
  getOdooBanks,
  assignBankAccountToContact,
  sendBookingDetails,
  sendBookingDetailsPickUpVehicle,
  createInvoice,
  updateBankAccountInContact,
} = require("./api/odoo/odoo");

const {
  activatePolicy,
  updatePolicy,
  cancelPolicy,
  obtainPolicy,
} = require("./api/policy");
const { chassisInfo } = require('./api/chassis');
const { validateVoucher, redeemVoucher } = require('./api/voucherify');
const { updateTransitions } = require('./api/docusign/updateDocuTransitions');
const { mailchimpSubscription } = require('./api/mailChimp/subscription');

const router = express.Router();

const jsonParser = bodyParser.json({ limit: '50mb', type: 'application/json' });
// ================ API router middleware: ================ //

// Parse Transit body first to a string
router.use(
  bodyParser.text({
    type: 'application/transit+json',
  })
);



// Deserialize Transit body string to JS data
router.use((req, res, next) => {
  if (req.get('Content-Type') === 'application/transit+json' && typeof req.body === 'string') {
    try {
      req.body = deserialize(req.body);
    } catch (e) {
      console.error('Failed to parse request body as Transit:');
      console.error(e);
      res.status(400).send('Invalid Transit in request body.');
      return;
    }
  }
  next();
});

// ================ API router endpoints: ================ //

router.get('/initiate-login-as', initiateLoginAs);
router.get('/login-as', loginAs);
router.post('/transaction-line-items', transactionLineItems);
router.post('/initiate-privileged', initiatePrivileged);
router.post('/initiate-refund', loadCurrentUser, initiateRefund);

router.post('/transition-privileged', jsonParser, transitionPrivileged);
router.post('/delete-account', deleteAccount);
router.post('/vehicle-details-verify', vehicleDetailsVerify);
router.post('/vehicle-market-value-verify', getMarketValue);

// Create user with identity provider (e.g. Facebook or Google)
// This endpoint is called to create a new user after user has confirmed
// they want to continue with the data fetched from IdP (e.g. name and email)
router.post('/auth/create-user-with-idp', createUserWithIdp);
router.post('/auth/create-user-with-open-idp', createUserWithOpenIdp);
router.post('/auth/login-user-with-open-idp', loginWithOpenIdp);
router.post('/check-apple-id', checkAppleMailId);
router.post('/check-user-exists', checkUserExist);

// Facebook authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Facebook

// This is the route for callback URL the user is redirected after authenticating
// with Facebook. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Flex API to authenticate user to Flex
router.get('/auth/google', authenticateGoogle);
router.get('/auth/google/callback', authenticateGoogleCallback);

router.get('/auth/facebook', authenticateFacebook);
router.get('/auth/facebook/callback', authenticateFacebookCallback);

// Google authentication endpoints

// This endpoint is called when user wants to initiate authenticaiton with Google
// This is the route for callback URL the user is redirected after authenticating
// with Google. In this route a Passport.js custom callback is used for calling
// loginWithIdp endpoint in Flex API to authenticate user to Flex



router.post('/check-referral-code', jsonParser, checkReferralCode);
router.post('/save-referral-data', jsonParser, saveReferralData);
router.post('/update-referral', jsonParser, updateReferralObj);
router.post('/add-cohost', addCohostInfo);

// ******************  complyCube Verfication api  ****************
router.post('/complyCube-driver-webhook', jsonParser, handleComplyCubeWebhook);
router.post('/comply-cube', createComplianceCheck);
router.post('/create-check', createCheck);
router.post('/get-token', getComplyCubeToken);
router.post('/create-tx-check', createCheckTx);

// *******************  docu sign Api ****************
router.post('/docu-webhook', jsonParser, docuSignWebhook);
router.post('/docu', createEnvelopeAndObtainRecipientUrl);
router.post('/view-docu', obtainRecipien2Url);
router.post('/token', getAccessToken);
router.post('/update-docu-tranistion', updateTransitions);
router.post('/downloadAgreement', downloadAgreement);

//  *************** stripe Api ******************
router.post('/create-stripe-customer', loadCurrentUser, createStripeCustomer);
router.post('/sendToStripe', jsonParser, sendToStripe);
router.post('/retrieve-payment-method', loadCurrentUser, retrievePaymentMethod);
router.post('/create-payment-intent', loadCurrentUser, createPaymentIntent);
router.post('/capture-payment-intent', loadCurrentUser, capturePaymentIntent);
router.post('/initiate-payment-refund', loadCurrentUser, initiateRefund);
router.post('/create-charge', loadCurrentUser, createCharge);
router.post('/create-payment-method', loadCurrentUser, createPaymentMethod);
router.post('/retrieve-business-name', loadCurrentUser, retrieveBusinessName);
router.post('/delete-payment-method', loadCurrentUser, deletePaymentMethod);

// ****************** Odoo Api ***********************
// router.use('/authenticate', odooMidleware);

router.post('/authenticate/create-odoo-user', createOdooCustomer);
router.post('/authenticate/update-odoo-user', updateOdooUser);
router.post('/authenticate/take-odoo-banks', getOdooBanks);
router.post('/authenticate/assign-bank-to-contact', assignBankAccountToContact);
router.post('/authenticate/send-odoo-payment-details', sendBookingDetails);
router.post('/authenticate/send-odoo-payment-pick-up-vehicle', sendBookingDetailsPickUpVehicle);
router.post('/authenticate/send-odoo-cancel-booking', createInvoice);
router.post('/authenticate/update-bank-in-contact', updateBankAccountInContact);

router.post('/authenticate/get-country-code', getCountryCode);
router.post('/authenticate/invoice-odoo-user', invoiceOdooUser);
router.post('/authenticate/invoice-update-user', updateInvoiceOdooUser);
router.post('/authenticate/invoiceline-odoo-user', invoiceLineOdooUser);
router.post('/authenticate/invoicePost-odoo-user', invoicePostOdooUser);
router.post('/authenticate/invoicePayment-odoo-user', invoicePaymentOdooUser);

// ***************  sendGrid and mailchimp api *****************
router.post('/mail-chimp', mailchimp);
router.post('/mail-chimp/subscription', mailchimpSubscription);
router.post('/sendgrid-email', jsonParser, sendGridEmail);
router.post('/insurance-email', insuranceEmail);


router.post('/update-meta-data', updatCustomerMetaData);
router.post('/get-provider-data', getProviderData);
router.post('/upload-after-photos', uploadAfterPhotos);
router.post('/query-all-bookings', querAllbooking);

// ************* twilio otp api ***************
// router.post('/twilio-api', sendVerificationCode);
// router.post('/verify-otp', verifyOTP);

router.post('/verification/send', sendVerification);
router.post('/verification/check', checkVerification);

// ************* policy api ***************
router.post('/policy-activate', activatePolicy);
router.post('/policy-update', updatePolicy);
router.post('/policy-cancel', cancelPolicy);
router.post('/policy-obtain', obtainPolicy);

// ************* Chassis api ***************
router.post('/chassis-info', chassisInfo);

// ************* Voucherify api ***************
router.post('/validate-voucher', validateVoucher);
router.post('/redeem-voucher', redeemVoucher);

module.exports = router;
