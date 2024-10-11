const axios = require('axios').default;
const { handleError } = require('../../api-util/sdk');

const { CHASSIS_URL } = process.env;

const requestOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
};

exports.chassisInfo = async (req, res) => {
  const { chassis } = req.body;

  try {
    const url = `${CHASSIS_URL}/?chassis=${chassis}`;
    const response = await axios.get(url, requestOptions);

    res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send(response?.data)
      .end();
  } catch (e) {
    handleError(res, e);
  }
};
