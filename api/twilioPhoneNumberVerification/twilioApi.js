// const twilio = require('twilio');
const twilio = require('../../services/twilio');

const { getISdk } = require('../../api-util/sdk');

const sdk = getISdk();

// personal sunil
// const accountSid = 'AC1d9805a06b8345d709ec9828e54e4703';
// const authToken = 'af3f89ab88a9b8990d3984cc752a0281';
// const twilioPhoneNumber = '+13347210294';

// rentalo twilio
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_NUMBER;
// const client = twilio(accountSid, authToken);

// This object will store verification codes and associated phone numbers
// const verificationCodes = {};

// // Export the functions
// module.exports = {
//   sendVerificationCode: async (req, res) => {
//     const { phoneNumber } = req.body;
//     try {
//       // Generate a random verification code
//       const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

//       // Store the verification code along with the phone number
//       verificationCodes[phoneNumber] = verificationCode;

//       // Send the SMS using Twilio
//       const message = await client.messages.create({
//         body: `Your verification code is: ${verificationCode}`,
//         from: twilioPhoneNumber,
//         to: phoneNumber,
//       });

//       // console.log('Verification code sent:', message.sid);

//       res.json({ success: true });
//     } catch (error) {
//       console.error('Error sending verification code:', error);
//       res.json({ success: false });
//     }
//   },


// verifyOTP: (req, res) => {
//   const { otp } = req.body;
//   // Iterate over stored verification codes to find a matching OTP
//   let phoneNumber = null;
//   for (const [key, value] of Object.entries(verificationCodes)) {
//     if (value === otp) {
//       phoneNumber = key;
//       delete verificationCodes[key]; // Remove the used OTP
//       break;
//     }
//   }
//   if (phoneNumber) {
//     res.json({ success: true });
//   } else {
//     res.json({ success: false, error: 'Invalid OTP' });
//   }
// }
// };


const INVALID_NUMBER_ERROR = 'Invalid phone number';
const ALREADY_USED_NUMBER_ERROR = 'This number is already in use';
const TOO_MANY_REQUESTS_ERROR = 'To many requests';
const VERIFICATION_FAILED_ERROR = 'Verification failed';

const CODE_SENT = 'Verification code sent';

const APPROVED_STATUS = 'approved';

const _checkPhoneAlreadyUse = async (userPhoneNumber, userUUID) => {
  try {

    const user = await sdk.users.show({
      id: userUUID,
    });

    const {
      verifiedPhoneNumber,
      phoneNumber,
    } = user?.data?.data?.attributes.protectedData || {};

    return verifiedPhoneNumber && userPhoneNumber === phoneNumber;
  } catch (e) {
    throw new Error(e);
  }
};

const _updateUserProfile = async (userId, userPhoneNumber) => {
  try {
    return await sdk.users.updateProfile({
      id: userId,
      protectedData: {
        // driverVerifiedPhoneNumber: true,
        // driverPhoneNumber: userPhoneNumber,
        phoneNumber: userPhoneNumber,
        verifiedPhoneNumber: true,
      },
    });
  } catch (e) {
    throw new Error(e);
  }
};

exports.sendVerification = async (req, res) => {
  const { number, userUUID } = req.body;

  try {
    if (!number)
      return res
        .status(400)
        .set('Content-Type', 'application/json')
        .send({ message: INVALID_NUMBER_ERROR });

    const isAlreadyUse = await _checkPhoneAlreadyUse(number, userUUID);

    if (isAlreadyUse)
      return res
        .status(400)
        .set('Content-Type', 'application/json')
        .send({ message: ALREADY_USED_NUMBER_ERROR });

    const result = await twilio.sendVerification(number);

    if (result) {
      return res.send(CODE_SENT);
    } else {
      return res
        .status(400)
        .send({ message: result.status === 429 ? TOO_MANY_REQUESTS_ERROR : INVALID_NUMBER_ERROR });
    }
  } catch (e) {
    return res
      .status(400)
      .send({ message: e.status === 429 ? TOO_MANY_REQUESTS_ERROR : e.message });
  }
};

exports.checkVerification = async (req, res) => {
  const { userUUID, code, userPhoneNumber } = req.body;
  try {
    const result = await twilio.checkVerification(userPhoneNumber, code);

    if (result === APPROVED_STATUS) {
      await _updateUserProfile(userUUID, userPhoneNumber);
      return res.send(result);
    } else
      return res
        .status(400)
        .set('Content-Type', 'application/json')
        .send({ message: VERIFICATION_FAILED_ERROR });
  } catch (e) {
    return res.status(400).send({ message: e.message });
  }
};

exports.sendSms = async (req, res) => {
  try {
    const { message, to } = req.body;
    const result = await twilio.send({ message, to });

    if (!result.message) {
      return res.status(200).send({ success: true });
    } else {
      return res.status(400).send({ error: result.message });
    }
  } catch (e) {
    throw new Error(e);
  }
};
