const path = require('path');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { getISdk } = require('../../api-util/sdk');
const integrationSdk = getISdk();
// const jwtConfig = require('./config/jwtConfig.json');
// const docusign = require('docusign-esign');
const {
  promises: fsPromises,
  existsSync,
  // createWriteStream,
  readFileSync,
  writeFile,
} = require('fs');
// const { default: Axios } = require('axios');
// const SCOPES = ['signature', 'impersonation'];
const basePath = 'https://demo.docusign.net/restapi/v2';
// const integrationKey = 'e82d7aec-2ea7-4d4f-88f4-856d9fe78ba3';
// const accountId = '9b8d4ea7-41c0-4b01-823c-3b1a2a96a3a8';
// const templateId = '88fce187-ba2e-4307-a9c4-7ceaa9d6a7f0';
// const userId= "6d36d757-7c01-4b11-a500-de4e31594a09";

const RSA_PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAisS3QAcg8YbWt05QiI8lpzE1A1BcoZZbCFnzjJ9MdZxbAJbu
D9X9qThBjYr+5yi8YQQXF4IZyuP3qTGLRK5ODQonDoTmNvg3Natca1Sks8gC8HxT
yh426SL5rf4ZDWNYWrloRycipWQkK6mDLXdmo9AiDaIH7L6IeTCP5Mbmzt3XgdZH
QJ98rIlnfratGtyZjgKicnRqsegLtFvcQ5xisCeLOzxGFoePlVdksJ7NEKHh/2Uc
1jUkkiQpYTuSooPtB3BV7Sdd+1qaX14QyStP+HJorwGyK5GQTyNFbLZtPdwEFNz9
mcMwktcPvG+fU9MguqAruPRVEvUIqPwE0zxjCwIDAQABAoIBABovVX7c+X/p2DFd
sz+Zd1rto5m8+8W39/SC+LyTwJs+xkM9t61ATW21glUhocjfvHA4E91pPNG2o6CH
C0cJ9wtp24XXWRONUemsLLPKFIwiFT/ozezJN8ZVRbTpyjNnCCCSdNVcUqLP2y1r
/qdBLRqDJzHYXdNz/o+TtMtQJvRoy7qFEsCFBZYLsXHxGh1pRvg9kG4rbdhLdiAX
yk7cWnXQP/30/hMLQgFNXyR6wmFJGvXX7cokyfCnUhe1tG9JJ+lzO62yw+OIY7OV
qOmIYV8t+OfTH3RCEYF034rQXjDn8FH+FoenBBQZG6JHd8+OhZLQJOA8WnJGNNVZ
57Nx6DkCgYEAybaqHNCIdg5ph6ZeNYycqKIohydUgZsxhVMzgcsPXLDPpj/atV9X
Ar4i5jSF5foOKr4LOjB+Xuzy5rLWrJKWlJH0ShZoeuV7LEgxWH2fiJBx2zoZ5RWs
/+S5o5l2Aj35qlPsjmsazNjptYErgG22qBzyNawC7wv4UdHQzqj9UJkCgYEAsB1c
JTAuFa0jKoLZXxt+2qrRnZoaKmgH5w1vD10+J+70PlLVS0iLuiIlQlyNBJtlP0XY
dZpTpKYhAUkuLCAPzwr8HGFkcTPc5lAIeOzSdvs1+E89P9rVCGi1ESGOK9Bsm8VX
DzpNGnPRrj/MKpgveNjZXg4o2l1hRyLgykOCg0MCgYEAi2okySWYK4Bqj8b89iXp
YOQy/rbAQZPx9iQ7RUoDpBzQaCdaEmGC0fJ4TIOgyAK8J+6R8/XwYcuDVs/kcAIg
8S6vmUVDkS1qpICBGpg42zp6dvsBSsRgfbyoUdqPJZ2QIZk/tm9wZoTFgx1z45/w
zuCyx0XMAUxUpLhPiYZjDoECgYBFiyJy0Oaxyo+jXs4lPz9Fa8SgPlTsv+228FgV
shU0QaiS37S4KKp8UrVx0gghdJdzd8o1Dj7POoa38kTYScTUVhsdvdui0/77t0jR
L3sgXqx+JBQkne4XhvlRDXYNmRz6Gd/59GSz+F4pN6oQe83rI34aJO8+4zbhl0U6
uZPU7wKBgAuDe/kxH5ck+R+30VyzzpzQAWeJhmz0do1bu6/PbrPBsLlKF1oYFqer
c/27hPrCllk13BFyPtQe1DM37oaf8eGvcRpLL87kzhYJlP8DrrP1Z9NnZlFWllEF
MoPehxGBn9ZH87LGYjoHhuQeoHsEzS/o43Fu/yhW93csPRojuj1w
-----END RSA PRIVATE KEY-----`;

const {
  DOCUSIGN_INTEGRATION_KEY,
  DOCUSIGN_ACCOUNT_ID,
  DOCU_SIGN_USER_ID,
  DOCUSIGN_TEMPLATE_ID,
  // REACT_APP_CANONICAL_ROOT_URL,
  NODE_ENV,
} = process.env;
const accountId = DOCUSIGN_ACCOUNT_ID;
//const userId = DOCU_SIGN_USER_ID;
// const templateId = DOCUSIGN_TEMPLATE_ID;
const templateId = DOCUSIGN_TEMPLATE_ID; //"81a2d117-a0c3-400f-837c-ac24f00d5d2f";
// const privateKeyPath = path.resolve(__dirname, 'privateKey.key');

const getAccessToken = async (req, res) => {
  const aud = NODE_ENV === 'development' ? 'account-d.docusign.com' : 'account-d.docusign.com';

  // const aud = process.env.DOCUSIGN_BASE_AUD_AND_URL_FOR_DEVELOPMENT
  // const aud = "account-d.docusign.com"
  const authUrl = `https://${aud}/oauth/token`;

  try {
    const now = Math.floor(Date.now() / 1000);
    const expiresInHours = 1;
    const payload = {
      iss: DOCUSIGN_INTEGRATION_KEY, // Integration key
      sub: DOCU_SIGN_USER_ID, // User ID
      aud: aud,
      iat: now,
      exp: now + expiresInHours * 60 * 60,
      scope: 'signature impersonation',
    };
    const token = jwt.sign(payload, RSA_PRIVATE_KEY, { algorithm: 'RS256' });

    const response = await axios.post(authUrl, {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    });
    return response.data.access_token;
  } catch (error) {
    // throw error;
  }
};

// Function to create an envelope and obtain the recipient view URL
const createEnvelopeAndObtainRecipientUrl = async (req, res) => {
  const {
    txId,
    providerName,
    providerEmail,
    customerName,
    customerEmail,
    documentFields,
  } = req.body;
  const {
    location,
    bookingStartDate,
    bookingEndDate,
    documnetNumber,
    cardNumber,
    vehicle,
    perDayCalculatedPrice,
    finalPrice,
    serviceFee,
    // hostFullName,
    driverFullName,
    unitCalculatedPrice,
    licenseplate,
    discountAmount,
    // cardBrand,
    insuranceAmount,
    currentCustomerName,
    currentProviderName,
    chassis,
    perDayInsuranceFee,
    pickupAndDropTime,
    // dropTime,
  } = documentFields;
  const options = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  const options2 = { year: 'numeric', month: '2-digit', day: '2-digit' };
  const options3 = { year: 'numeric', month: '2-digit', day: '2-digit' };
  function formatDateToLocaleString(inputDateString, locale, options) {
    const inputDate = new Date(inputDateString);
    const formattedDate = inputDate.toLocaleString(locale, options);
    return formattedDate;
  }
  const startDate = formatDateToLocaleString(bookingStartDate, 'es-ES', options2);
  const endDate = formatDateToLocaleString(bookingEndDate, 'es-ES', options2);
  const startDate2 = bookingStartDate.toLocaleString('en-US', options2);
  const startDate3 = bookingStartDate.toLocaleString('en-US', options3);
  const endDate3 = bookingEndDate.toLocaleString('en-US', options3);
  const currentDate = new Date();
  const currebtDateFormated = currentDate.toLocaleString('es-ES', options);

  try {
    const accessToken = await getAccessToken();
    const envelopesEndpoint = `${basePath}/accounts/${accountId}/envelopes`;

    const roles = [
      {
        roleName: 'Customer',
        name: customerName,
        email: customerEmail,

        tabs: {
          textTabs: [
            {
              tabLabel: 'driverFullName',
              value: driverFullName,
            },
            {
              tabLabel: 'providerName',
              value: currentProviderName,
            },
            {
              tabLabel: 'ownerName',
              value: currentCustomerName,
            },
            {
              tabLabel: 'driverName',
              value: driverFullName,
            },
            {
              tabLabel: 'customerName',
              value: currentCustomerName || customerName,
            },
            {
              tabLabel: 'pickUpTime',
              value: `${startDate} ${pickupAndDropTime}`,
            },
            {
              tabLabel: 'pickUpTime2',
              value: `${startDate2} ${pickupAndDropTime}`,
            },
            {
              tabLabel: 'dropOffTime',
              value: `${endDate} ${pickupAndDropTime}`,
            },
            {
              tabLabel: 'cardNumber',
              value: `${cardNumber}`,
            },
            {
              tabLabel: 'finalPrice',
              value: `$${finalPrice.toFixed(2)}`,
            },
            {
              tabLabel: 'finalPrice2',
              value: `$(${finalPrice.toFixed(2)})`,
            },
            {
              tabLabel: 'totalPrice',
              value: `$${perDayCalculatedPrice.toFixed(2)}`,
            },
            {
              tabLabel: 'license',
              value: documnetNumber,
            },
            {
              tabLabel: 'licensePlate',
              value: licenseplate,
            },
            {
              tabLabel: 'location',
              value: location && location.address,
            },
            {
              tabLabel: 'location2',
              value: location && location.address,
            },
            {
              tabLabel: 'vehicle',
              value: vehicle,
            },
            {
              tabLabel: 'vehicle2',
              value: vehicle,
            },
            {
              tabLabel: 'startEndDate',
              value: `${startDate3} - ${endDate3}`,
            },
            {
              tabLabel: 'serviceFee',
              value: `$${serviceFee.toFixed(2)}`,
            },
            {
              tabLabel: 'insuranceAmount',
              value: `$${insuranceAmount.toFixed(2)}`,
            },
            {
              tabLabel: 'unitPrice',
              value: `$${unitCalculatedPrice.toFixed(2)} / Día`,
            },
            {
              tabLabel: 'discountAmount',
              value: `$${discountAmount.toFixed(2)}`,
            },
            {
              tabLabel: 'chasis',
              value: `${chassis}`,
            },
            {
              tabLabel: 'referenceId',
              value: `${txId}`,
            },
            {
              tabLabel: 'perDayInsuranceFee',
              value: `$${perDayInsuranceFee.toFixed(2)} / Día`,
            },
            {
              tabLabel: 'currentDatePickupDate',
              value: `${currebtDateFormated}`,
            },
          ],
        },
        recipientId: '1',
        clientUserId: '1001', // Optional client user ID for embedded signing
      },
      {
        roleName: 'Provider',
        name: providerName,
        recipientId: '2',
        email: providerEmail,
        clientUserId: '1002', // Optional client user ID for embedded signing
      },
    ];

    const compositeTemplate = {
      compositeTemplateId: '1',
      serverTemplates: [
        {
          sequence: '1',
          templateId: templateId, // Replace with your template ID
        },
      ],
      inlineTemplates: [
        {
          sequence: '1',
          recipients: {
            signers: roles,
          },
        },
      ],
    };

    const envelopeDefinition = {
      status: 'sent',
      compositeTemplates: [compositeTemplate],
    };

    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    };

    const response = await axios.post(envelopesEndpoint, envelopeDefinition, { headers });
    const envelopeId = response.data.envelopeId;
    const result = await integrationSdk.transactions.updateMetadata(
      {
        id: txId,
        metadata: {
          envelopeId,
        },
      },
      {
        expand: true,
      }
    );

    const recipientViewEndpoint = `${basePath}/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`;

    const viewRequest = {
      authenticationMethod: 'none',
      email: customerEmail,
      clientUserId: '1001',
      userName: customerName,
      roleName: 'Customer',
      returnUrl: `${process.env.REACT_APP_CANONICAL_ROOT_URL}/order/${txId}/details?myState=54255`,
    };

    const recipientResponse = await axios.post(recipientViewEndpoint, viewRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const recipientUrl = recipientResponse.data.url;

    return res.status(200).send({ envelopeId, recipientUrl });
  } catch (error) {
    console.error('Error creating envelope and obtaining recipient URL:', error);
    return res.status(500).send('Internal Server Error');
  }
};

const obtainRecipien2Url = async (req, res) => {
  const { code, envelopeId, providerEmail, providerName, txId } = req.body;
  try {
    const accessToken = await getAccessToken();

    const recipientViewEndpoint = `${basePath}/accounts/${accountId}/envelopes/${envelopeId}/views/recipient`;
    const viewRequest = {
      authenticationMethod: 'none',
      userName: providerName,
      email: providerEmail,
      clientUserId: '1002',
      returnUrl: `${process.env.REACT_APP_CANONICAL_ROOT_URL}/sale/${txId}/details?myState=54255`,
    };

    const recipientResponse = await axios.post(recipientViewEndpoint, viewRequest, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const recipientUrl2 = recipientResponse.data.url;

    return res.status(200).send({ recipientUrl2 });
  } catch (error) {
    console.error('Error creating envelope and obtaining recipient URL:', error);
    return res.status(500).send('Internal Server Error');
  }
};

// function for download the agreement pdf
const downloadAgreement = async (req, res) => {
  const { envelopeId, documentId = '1' } = req.body;
  const accessToken = await getAccessToken();
  const basePath = 'https://demo.docusign.net/restapi/v2';
  try {
    const documentEndpoint = `${basePath}/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}`;
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/pdf',
      'Content-Transfer-Encoding': 'base64',
      'Content-Type': 'application/json',
    };
    const response = await axios.get(documentEndpoint, {
      headers,
    });
    const contentDisposition = response.headers['content-disposition'];
    const filename = contentDisposition.match(/filename="(.+?)"/)[1];
    // const contentType = response.headers['content-type'];
    const content = response.data;
    // Set headers to prompt file download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    // Decode the Base64 data
    const decodedData = Buffer.from(content, 'base64');
    const pdfFilePath = path.join(__dirname, 'output.pdf');
    // Write the decoded data to a PDF file
    await savePDF(decodedData, pdfFilePath);
    // Read the PDF file as binary data
    const pdfData = await readFileSync(pdfFilePath);
    // const removed = await removeLocalFile(pdfFilePath);
    const base64Data = pdfData.toString('base64');
    // Create a data URL for the PDF file
    const dataURL = `data:application/pdf;base64,${base64Data}`;
    // const mimeType = 'application/pdf';
    // const dataURL = `data:${mimeType};base64,${base64Data}`;
    res.send(dataURL);
  } catch (error) {
    console.error('Error retrieving envelope document:', error);
    res.status(500).send('Error retrieving envelope document.');
  }
};

// Define a function that returns a Promise for writeFile
function writeFileAsync(filePath, data) {
  return new Promise((resolve, reject) => {
    writeFile(filePath, data, err => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

// fuction to save the pdf
async function savePDF(decodedData, filePath) {
  try {
    await writeFileAsync(filePath, decodedData);
    console.log('PDF file saved successfully!');
  } catch (err) {
    console.error('Error writing PDF file:', err);
  }
}

// function to delete a file
const removeLocalFile = async filePath => {
  try {
    if (!existsSync(filePath)) return true;
    await fsPromises.unlink(filePath);
    return true;
  } catch (error) {
    console.log('error', error);
    return false;
  }
};

// async function authenticate() {
//   const jwtLifeSec = 10 * 60; // requested lifetime for the JWT is 10 min
//   const dsApi = new docusign.ApiClient();
//   dsApi.setOAuthBasePath(jwtConfig.dsOauthServer.replace("https://", "")); // it should be domain only.
//   let rsaKey = readFileSync(jwtConfig.privateKeyLocation);

//   try {
//     const results = await dsApi.requestJWTUserToken(
//       jwtConfig.dsJWTClientId,
//       jwtConfig.impersonatedUserGuid,
//       SCOPES,
//       rsaKey,
//       jwtLifeSec
//     );
//     const accessToken = results.body.access_token;
//     console.log("accessToken", accessToken)

//     // get user info
//     const userInfoResults = await dsApi.getUserInfo(accessToken);

//     // use the default account
//     let userInfo = userInfoResults.accounts.find(
//       (account) => account.isDefault === "true"
//     );

//     return {
//       accessToken: results.body.access_token,
//       apiAccountId: userInfo.accountId,
//       basePath: `${userInfo.baseUri}/restapi`,
//     };
//   } catch (e) {
//     console.log(e);
//     let body = e.response && e.response.body;
//     // Determine the source of the error
//     if (body) {
//       // The user needs to grant consent
//       if (body.error && body.error === "consent_required") {
//         // if (getConsent()) {
//         //   return authenticate();
//         // }
//         console.log("Consent required");
//       } else {
//         console.log("Error while authenticating:", body);

//       }
//     }
//   }
// }
// async function docGen(req, res) {

//   console.log("req.body", req.body)

//   const { txId, providerName, providerEmail, customerName, customerEmail, documentFields } = req.body;

//   const {
//     location,
//     bookingStartDate,
//     bookingEndDate,
//     documnetNumber,
//     cardNumber,
//     vehicle,
//     perDayCalculatedPrice,
//     finalPrice,
//     serviceFee,
//     hostFullName,
//     driverFullName,
//     unitCalculatedPrice,
//     licenseplate,
//     discountAmount,
//     cardBrand,
//     insuranceAmount,
//     currentCustomerName,
//     currentProviderName,
//     chassis,
//     perDayInsuranceFee,
//     pickupAndDropTime,
//     dropTime
//   } = documentFields;
//   const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' ,hour: '2-digit', minute: '2-digit'};
//   const options2 = { year: 'numeric', month: '2-digit', day: '2-digit' };
//   const options3 = { year: 'numeric', month: '2-digit', day: '2-digit' };
//   function formatDateToLocaleString(inputDateString, locale, options) {
//     const inputDate = new Date(inputDateString);
//     const formattedDate = inputDate.toLocaleString(locale, options);
//     return formattedDate;
//   }
//   const startDate = formatDateToLocaleString(bookingStartDate, 'es-ES', options2);
//   const endDate = formatDateToLocaleString(bookingEndDate, 'es-ES', options2);
//   const startDate2 = bookingStartDate.toLocaleString('en-US', options2);
//   const startDate3 = bookingStartDate.toLocaleString('en-US', options3)
//   const endDate3 = bookingEndDate.toLocaleString('en-US', options3)
//   const currentDate = new Date();
//   const currebtDateFormated = currentDate.toLocaleString('es-ES', options)

//   // const customerName = "Houssem Slimeni";
//   // const customerEmail = "houssem.slimeni@avaxia-group.com";
//   // const txId = "123456";

//   // const providerName = "Admin Rentalo";
//   // const providerEmail = "accounts@rentaloinc.com";

//   const base = "https://demo.docusign.net/restapi";

//   const envelopeDefinition = {
//     templateId: process.env.DOC_GEN_TEMPLATE_ID,
//     status: "created",
//     templateRoles: [
//       {
//         name: customerName,
//         email: customerEmail,
//         roleName: "Customer",
//         recipientId: "1",
//         clientUserId: "1001",
//       },
//       {
//         name: providerName,
//         email: providerEmail,
//         roleName: "Provider",
//         recipientId: "2",
//         clientUserId: "1002",
//       },
//     ],
//   };

//   const authToken = await authenticate();
//   try {
//     // Create envelope
//     const createEnvelopeResponse = await axios.post(`${base}/v2.1/accounts/${process.env.DOC_GEN_ACCOUNT_ID}/envelopes`, envelopeDefinition, {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${authToken.accessToken}`,
//       },
//     });
//     const { envelopeId } = createEnvelopeResponse.data;
//     console.log(`Envelope was created. EnvelopeId ${envelopeId}`);

//     // Get document generation form fields
//     const docGenFormFieldsResponse = await axios.get(`${base}/v2.1/accounts/${process.env.DOC_GEN_ACCOUNT_ID}/envelopes/${envelopeId}/docgenformfields`, {
//       headers: {
//         "Authorization": `Bearer ${authToken.accessToken}`,
//       },
//     });
//     const docGenFormFields = docGenFormFieldsResponse.data;

//     // Update form fields
//     const docGenFormFieldRequest = {
//       docGenFormFields: [
//         {
//           docGenDocumentStatus: "created",
//           documentId: docGenFormFields.docGenFormFields[0].documentId,
//           docGenFormFieldList: [
//             {
//               label: "referenceId",
//               name: "referenceId",
//               value: txId,
//               description: "This is the referenceId",
//             },
//             {
//               label: "driverName",
//               name: "driverName",
//               value: driverFullName,
//               description: "This is the driverName",
//             },
//             {
//               label: "providerName",
//               name: "providerName",
//               value: currentProviderName,
//               description: "This is the driverName",
//             },
//             {
//               label: "ownerName",
//               name: "ownerName",
//               value: currentProviderName,
//               description: "This is the ownerName",
//             },
//             {
//               label: "pickupDateTime",
//               name: "pickupDateTime",
//               value: `${startDate} ${pickupAndDropTime}`,
//               description: "This is the pickupDateTime",
//             },
//             {
//               label: "pickupAddress",
//               name: "pickupAddress",
//               value: location.address,
//               description: "This is the pickupAddress",
//             },
//             {
//               label: "dropoffDateTime",
//               name: "dropoffDateTime",
//               value: `${endDate} ${pickupAndDropTime}`,
//               description: "This is the dropoffDateTime",
//             },
//             {
//               label: "dropoffAddress",
//               name: "dropoffAddress",
//               value: location.address,
//               description: "This is the dropoffAddress",
//             },
//             {
//               label: "vehicleTitle",
//               name: "vehicleTitle",
//               value: vehicle,
//               description: "This is the vehicleTitle",
//             },
//             {
//               label: "chassis",
//               name: "chassis",
//               value: chassis,
//               description: "This is the chassis",
//             },
//             {
//               label: "driverLicense",
//               name: "driverLicense",
//               value: documnetNumber,
//               description: "This is the driverLicense",
//             },
//             {
//               label: "licensePlate",
//               name: "licensePlate",
//               value: licenseplate,
//               description: "This is the licensePlate",
//             },
//             {
//               label: "bookingPeriod",
//               name: "bookingPeriod",
//               value: `${startDate3} - ${endDate3}`,
//               description: "This is the bookingPeriod",
//             },
//             {
//               label: "vehicleUnitPrice",
//               name: "vehicleUnitPrice",
//               value: `${unitCalculatedPrice}`,
//               description: "This is the vehicleUnitPrice",
//             },
//             {
//               label: "vehicleTotal",
//               name: "vehicleTotal",
//               value: `${finalPrice}`,
//               description: "This is the vehicleTotal",
//             },
//             {
//               label: "insuUnitPrice",
//               name: "insuUnitPrice",
//               value: `${perDayInsuranceFee.toFixed(2)}`,
//               description: "This is the insuUnitPrice",
//             },
//             {
//               label: "insuTotal",
//               name: "insuTotal",
//               value: `${insuranceAmount}`,
//               description: "This is the insuTotal",
//             },
//             {
//               label: "serviceFee",
//               name: "serviceFee",
//               value: `${serviceFee}`,
//               description: "This is the serviceFee",
//             },
//             {
//               label: "discount",
//               name: "discount",
//               value: `${discountAmount}`,
//               description: "This is the discount",
//             },
//             {
//               label: "totalAmount",
//               name: "totalAmount",
//               value: `${finalPrice}`,
//               description: "This is the totalAmount",
//             },
//             {
//               label: "cardBrand",
//               name: "cardBrand",
//               value: cardBrand,
//               description: "This is the cardBrand",
//             },
//             {
//               label: "cardNumber",
//               name: "cardNumber",
//               value: cardNumber,
//               description: "This is the cardNumber",
//             }

//           ],
//         },
//       ],
//     };
//     const updateFormFieldResponse = await axios.put(`${base}/v2.1/accounts/${process.env.DOC_GEN_ACCOUNT_ID}/envelopes/${envelopeId}/docgenformfields`, docGenFormFieldRequest, {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${authToken.accessToken}`,
//       },
//     });
//     const updateFormFieldResult = updateFormFieldResponse.data;
//     console.log(updateFormFieldResult);

//     // Send the draft envelope
//     await axios.put(`${base}/v2.1/accounts/${process.env.DOC_GEN_ACCOUNT_ID}/envelopes/${envelopeId}`, {
//       status: "sent",
//     }, {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${authToken.accessToken}`,
//       },
//     });

//     // Generate the recipient view URL
//     // const recipientViewRequest = {
//     //   returnUrl: `${process.env.REACT_APP_CANONICAL_ROOT_URL}/sale/${txId}/details?myState=54255`,
//     //   authenticationMethod: 'none',
//     //   email: customerEmail,
//     //   userName: customerName,
//     //   roleName: 'Customer',
//     // };

//     const viewRequest = {
//       authenticationMethod: 'none', // or 'password'
//       email: customerEmail,
//       userName: customerName,
//       roleName: 'Customer',
//       returnUrl: `${process.env.REACT_APP_CANONICAL_ROOT_URL}/order/${txId}/details?myState=54255`,
//       clientUserId: '1001', // Optional for embedded signing
//     };

//     const recipientViewResponse = await axios.post(`${base}/v2.1/accounts/${process.env.DOC_GEN_ACCOUNT_ID}/envelopes/${envelopeId}/views/recipient`, viewRequest, {
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${authToken.accessToken}`,
//       },
//     });

//     const recipientUrl = recipientViewResponse.data.url;
//     console.log(`Recipient view URL: ${recipientUrl}`);

//     // You can now redirect the user to the recipient view URL or provide it as a link
//     return res.status(200).send({ envelopeId, recipientUrl });

//   } catch (error) {
//     console.error(error);
//   }
// }

module.exports = {
  createEnvelopeAndObtainRecipientUrl,
  obtainRecipien2Url,
  getAccessToken,
  downloadAgreement,
};
