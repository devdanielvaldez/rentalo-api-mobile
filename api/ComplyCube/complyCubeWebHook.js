const { EventVerifier, ComplyCube } = require('@complycube/api');
const { getISdk } = require('../../api-util/sdk');
const TRANSITION_WAITING_FOR_CUSTOMER_REVERIFICATION = 'transition/reverify'


const handleComplyCubeWebhook = (req, res) => {
  const webhookSecret = process.env.COMPLYCUBE_WEBHOOK_SECRET;
  // const webhookSecret = '9a0497892b318d08697d99c14cfab231'; //live
  // const webhookSecret = '54a519919adfffc212c4ed3d24604853'; //test

  // undefined webhookSecret = '9a0497892b318d08697d99c14cfab231';

  if (!webhookSecret) {
    console.error('Webhook secret is not defined. Make sure to set COMPLYCUBE_WEBHOOK_SECRET environment variable.');
    return res.status(500).send('Webhook secret is missing.');
  }

  const eventVerifier = new EventVerifier(webhookSecret);
  const signature = req.headers['complycube-signature'];

  if (!signature) {
    console.error('Webhook signature is missing in the request headers.');
    return res.status(400).send('Webhook signature is missing.');
  }

  let event;
  try {
    event = eventVerifier.constructEvent(JSON.stringify(req.body), signature);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'check.completed': {
      const checkId = event.payload.id;
      const checkOutcome = event.payload.outcome;
      checkById(checkId)
      console.log(`Check ${checkId} completed with outcome ${checkOutcome}`);
      break;
    }
    case 'check.pending': {
      const checkId = event.payload.id;
      console.log(`Check ${checkId} is pending`);
      break;
    }
    case 'document.created': {
      const checkId = event.payload.id;
      console.log(`Check ${checkId} is created`);
      break;
    }
    case 'client.created': {
      const checkId = event.payload.id;
      console.log(`Check ${checkId} is client.created`);
      break;
    }
    case 'check.monitoring.attention': {
      const checkId = event.payload.id;
      console.log(`Check ${checkId} is check.monitoring.attention`);
      break;
    }
    case 'check.completed.attention': {
      const checkId = event.payload.id;
      console.log(`Check ${checkId} is check.completed.attention`);
      break;
    }
    case 'check.failed': {
      const checkId = event.payload.id;
      // console.log(`Check ${checkId} is failed`);
      break;
    }
    case 'check.updated': {
      const checkId = event.payload.id;
      // console.log(`Check ${checkId} is updated`);
      break;
    }
    case 'check.completed.clear': {
      const checkId = event.payload.id;
      console.log(`Check ${checkId} is completed.clear`);
      checkById(checkId)
      break;
    }
    case 'check.completed.attention': {
      const checkId = event.payload.id;
      console.log(`Check ${checkId} is completed.attention`);
      break;
    }
    default: {
      console.warn(`Received an unexpected event type: ${event.type}`);
      return res.status(400).end();
    }
  }

  res.status(200).end();
};

module.exports = handleComplyCubeWebhook;


const checkById = async (checkId) => {
  const integrationSdk = getISdk();
  const complycube = new ComplyCube({
    // apiKey: "test_YlR1TmZLaWdQM1dvNG1KNHI6ZmE0NDM5YTM1YWUyNTdlYjYxZWVkNmM2YzY5YmZhZjgzYjUzYjBhNjVjOWQ0Yjg0Y2RjNjhlNTgxODQ5MmY1NQ=="
    // apiKey: "live_YlR1TmZLaWdQM1dvNG1KNHI6MjA5ZDUyYjU5YmUzNGU1YzhmZWVkZjYwZjU2ZjM2Y2IyNmUzNzg5ODBlYzA0MTc1ZmJmNmQwNzIxM2UxMDY4OQ=="
    apiKey: process.env.COMPLYCUBE_KEY,
  });

  const checkDetails = await complycube.check.get(checkId);
  const clientId = checkDetails && checkDetails.clientId;
  const identity = checkDetails && checkDetails.status;
  const clientDetails = await complycube.client.get(clientId);
  const { userID, userType, txId } = clientDetails?.metadata;
  console.log(userType, '*** *** => userType');
  console.log(clientDetails, '*** *** => clientDetails');

  const test1 = checkDetails.result;

  const { breakdown, outcome } = test1 ;

  console.log("test1", test1);

  const {extractedData} = breakdown ;

  const {documentDetails ,holderDetails} = extractedData ;


  // const hostMetaData = {
  //   identityStatus: identity == 'complete' ? 'verified' : 'pending'
  // }
  // const driverMetaData = {
  //   identityStatus: identity == 'complete' ? 'verified' : 'pending'
  // }
  // const verficationDetails = userType == 'host' ? hostMetaData : driverMetaData;

  if (txId) {
    try {
      const updateResponse = identity && await integrationSdk.transactions.updateMetadata({
        id: txId,
        metadata: {
          driverReverified: { identity }
        }
      })
      const transactionsResponse = updateResponse && await integrationSdk.transactions.show({ id: txId })
      const transitions = transactionsResponse &&
        transactionsResponse.data &&
        transactionsResponse.data.data &&
        transactionsResponse.data.data?.attributes &&
        transactionsResponse.data.data.attributes.transitions

      const checkTransitions = transitions.findIndex(elm => elm.transition === TRANSITION_WAITING_FOR_CUSTOMER_REVERIFICATION);
      if (checkTransitions < 0) {
        const updateData = transactionsResponse && await integrationSdk.transactions.transition({
          id: txId,
          transition: 'transition/reverify',
          params: {}
        },
          {
            expand: true
          }
        )
        return updateData;
      }
    } catch (error) {
      console.log('error updateResponse', error, error && error.data && error.data.errors)
    }

  }

  if (userID && !txId) {
      const hostIdentityStatus = identity == 'complete' ? 'verified' : 'pending';
      const driverIdentityStatus = identity == 'complete' ? 'verified' : 'pending';

      try {
        if (userType == 'driver') {
          await integrationSdk.users.updateProfile({
            id: userID,
            protectedData: {
              driverMetaData: {
                driverIdentityStatus: driverIdentityStatus,
                documentDetails,
                holderDetails,
                driverClientId: clientId
              },
              verification_status: driverIdentityStatus,
              verification_outcome: outcome,
            },
          })
        } else if (userType == 'host') {
          await integrationSdk.users.updateProfile({
            id: userID,
            protectedData: {
              hostMetaData: {
                documentDetails ,
                holderDetails,
                hostIdentityStatus: hostIdentityStatus,
              },
              verification_status: hostIdentityStatus,
              verification_outcome: outcome,
            },
          })
        }
      } catch (error) {
        console.log(error, error && error.data && error.data.errors, '*** *** => updateprofile error');

        const metaData = {
          [userType == 'host' ? "hostMetaData" : "driverMetaData"]: {
            verification_error: error?.data?.errors ?? null,
          }
        }

        await integrationSdk.users.updateProfile({
          id: userID,
          protectedData: {
            ...metaData,
            verification_status: "not_verified",
          },
        })
      }
  }
}
