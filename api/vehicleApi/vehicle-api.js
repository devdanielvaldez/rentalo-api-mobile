const { default: Axios } = require('axios');

const formatCode = code => code.trim().replace(/-/g, '');

const VEHICLE_ENQUIRY_URI = process.env.VEHICLE_ENQUIRY_URI;

const requestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
};

module.exports = {
  vehicleDetailsVerify: async (req, res) => {
    try {
      const { licenseplate, identification } = req.body;

      const url = `${VEHICLE_ENQUIRY_URI}/api/plate-consultation/?licensePlate=${formatCode(
        licenseplate
      )}&identification=${formatCode(identification)}`;
      console.log('vehicleDetailsVerify', url);
      const verfiyDetails = await Axios.get(url, requestOptions);

      return res.status(200).send({ data: { ...verfiyDetails?.data, isFetched: true } });
    } catch (error) {
      res
        .status(error?.response?.status || 400)
        .send({ message: error?.response?.data.detail })
        .end();
    }
  },
  getMarketValue: async (req, res) => {
    try {
      const { licenseplate } = req.body;

      const url = `${VEHICLE_ENQUIRY_URI}/api/reliable-value/?licencePlate=${formatCode(
        licenseplate
      )}`;
      console.log('getMarketValue', url);

      const marketValue = await Axios.get(url, requestOptions);

      return res.status(200).send({ data: { ...(marketValue?.data ?? {}) } });
    } catch (error) {
      res
        .status(error?.response?.status || 400)
        .send({ message: error?.response?.data.detail })
        .end();
    }
  },
  retrieveBusinessName: async (req, res) => {
    try {
      const { idNumber } = req.body;
      const idNumberWithoutDash = idNumber.replace(/-/g, '');
      const requestOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      };
      const response = await Axios.get(
        `${
          process.env.VEHICLE_ENQUIRY_URI
        }/api/taxpayer-consultation?rnc_or_identity_card=${idNumberWithoutDash.trim()}`,
        requestOptions
      );
      const businessDetails = response && response.data;
      const tradename = businessDetails && businessDetails.tradename;
      return res.status(200).send({ tradename });
    } catch (error) {
      const message = error?.response?.data?.detail || 'Error fetching business name';
      return res
        .status(400)
        .send({ Status: 'FAILED', message })
        .end();
    }
  },
};
