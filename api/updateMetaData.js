const sharetribeSdk = require('sharetribe-flex-sdk');
const { handleError, serialize } = require('../api-util/sdk');
const { getISdk } = require('../api-util/sdk');

const { types } = sharetribeSdk;
const { UUID,  } = types;

const integrationSdk = getISdk();


const methods = {
  updatCustomerMetaData: async (req, res) => {
    const { id, dropOff } = req.body
    try {
      const apiResponse = await integrationSdk.transactions.updateMetadata({
        id: new UUID(id),
        metadata: {
          dropOff
        }
      }, {
        expand: true
      });

    const { status, statusText, data } = apiResponse;
    res
      .status(status)
      .set('Content-Type', 'application/transit+json')
      .send(
        serialize({
          status,
          statusText,
          data,
        })
      )
      .end();
    } catch (e) {
      handleError(res, e);
    }
  },

  uploadAfterPhotos: async (req, res) => {
    const { currentTransaction, afterImages } = req.body;

    try {
      const apiResponse = await integrationSdk.transactions.updateMetadata({
        id: currentTransaction?.id,
        metadata: {
          afterImages
        }
      }, {
        expand: true,
      });

      const { status, statusText, data } = apiResponse;
      res
        .status(status)
        .set('Content-Type', 'application/transit+json')
        .send(
          serialize({
            status,
            statusText,
            data,
          })
        )
        .end();
    } catch (e) {
      handleError(res, e);
    }
  }

}
module.exports = methods;
