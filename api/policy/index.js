const axios = require('axios').default;
const sharetribeSdk = require('sharetribe-flex-sdk');
const { getISdk, handleError } = require('../../api-util/sdk');
const { types } = sharetribeSdk;

const { UUID } = types;

const { POLICY_URL, POLICY_API_KEY, CATEGORY_ID } = process.env;

exports.obtainPolicy = async (req, res) => {
  const { chassis } = req.body;

  try {

    const response = await axios({
      method: 'GET',
      url: POLICY_URL,
      params: {
        category_id: Number(CATEGORY_ID),
        chassis,
      },
      headers: {
        "api-token": POLICY_API_KEY,
      }
    });

    res
      .status(201)
      .set('Content-Type', 'application/transit+json')
      .send({ data: response?.data?.data })
      .end();
  } catch (e) {
    handleError(res, e);
  }
}

exports.activatePolicy = async (req, res) => {
  const {
    listingId,
    customerId,
    providerId,
    startBooking,
    endBooking,
    transactionId,
  } = req.body;

  try {
    const sdk = await getISdk();

    const listingApiResponse = await sdk.listings.query({ ids: [listingId] });
    const { attributes } = listingApiResponse ? listingApiResponse.data.data[0] : {};
    const {
      publicData: {
        color,
        model,
        chassis,
        year,
        make,
        licenseplate,
      }
    } = attributes ?? {};

    const customerApiResponse = await sdk.users.show({ id: customerId });
    const { attributes: customerAttributes } = customerApiResponse ? customerApiResponse.data.data : {};
    const {
      profile: {
        firstName,
        lastName,
        protectedData: {
          phoneNumber,
          driverMetaData: {
            documentDetails: {
              documentNumber,
            },
            driverClientId,
          }
        }
      }
    } = customerAttributes ?? {};

    const providerApiResponse = await sdk.users.show({ id: providerId });
    const { attributes: providerAttributes, id } = providerApiResponse ? providerApiResponse.data.data : {};
    const {
      profile: {
        protectedData: {
          hostMetaData: {
            documentDetails: {
              documentNumber: hostDocumentNumber,
            },
          }
        }
      }
    } = providerAttributes ?? {};


    const response = await axios({
      method: 'POST',
      url: POLICY_URL,
      data: {
        category_id: Number(CATEGORY_ID), // ?
        // Customer
        customer_id: hostDocumentNumber ?? id.uuid,
        customer_name: 'RENTALO',
        // Provider
        driver_id: documentNumber ?? driverClientId,
        driver_name: `${firstName} ${lastName}`,
        driver_phone: phoneNumber,
        // Booking period
        start_date: startBooking,
        end_date: endBooking,
        // vehicle
        brand: make,
        model: model,
        year: year,
        color: color,
        chassis: chassis,
        plate: licenseplate,
      },
      headers: {
        "api-token": POLICY_API_KEY,
      }
    });

    const policy = await axios({
      method: 'GET',
      url: POLICY_URL,
      params: {
        category_id: Number(CATEGORY_ID),
        chassis,
      },
      headers: {
        "api-token": POLICY_API_KEY,
      }
    });

    await sdk.transactions.updateMetadata({
      id: new UUID(transactionId),
      metadata: {
        policy: policy?.data?.data,
      }
    });

    res
      .status(201)
      .set('Content-Type', 'application/transit+json')
      .send(response.data)
      .end();
  } catch(e) {
    handleError(res, e);
  }
}

exports.updatePolicy = async (req, res) => {
  const {
    startBooking,
    endBooking,
    chassis,
  } = req.body;

  try {

    const response = await axios({
      method: 'POST',
      url: `${POLICY_URL}/update`,
      data: {
        category_id: Number(CATEGORY_ID), // ?
        start_date: startBooking,
        end_date: endBooking,
        chassis: chassis,
      },
      headers: {
        "api-token": POLICY_API_KEY,
      },
    });

    res
      .status(201)
      .set('Content-Type', 'application/transit+json')
      .send(response.data)
      .end();
  } catch(e) {
    handleError(res, e);
  }
}

exports.cancelPolicy = async (req, res) => {
  const { chassis } = req.body;

  try {
    const response = await axios({
      method: 'POST',
      url: `${POLICY_URL}/cancel`,
      data: {
        category_id: Number(CATEGORY_ID), // ?
        chassis: chassis,
      },
      headers: {
        "api-token": POLICY_API_KEY,
      },
    });

    res
      .status(201)
      .set('Content-Type', 'application/transit+json')
      .send(response.data)
      .end();
  } catch(e) {
    handleError(res, e);
  }
}
