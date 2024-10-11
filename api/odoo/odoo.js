const axios = require('axios').default;
const sharetribeSdk = require('sharetribe-flex-sdk');
const { types } = sharetribeSdk;

const { handleError, getISdk } = require('../../api-util/sdk');

const sdk = getISdk();
const { UUID } = types;

const { ODOO_DB, ODOO_URL, ODOO_API_KEY, NODE_ENV } = process.env;

const odooEnvironment = NODE_ENV === "development" ? 6 : 6;


exports.createOdooCustomer = async (req, res) => {
  const { email, name } = req.body;

  try {
    const response = await axios({
      method: 'post',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: "call",
        params: {
          service: "object",
          method: "execute",
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            "res.partner",
            "create",
            {
              "name": name,
              "email": email
            }
          ]
        },
      },
    });

    const odooUserId = response?.data?.result;

    return res
      .status(200)
      .send({ odooUserId })
      .end();
  } catch (error) {
    handleError(res, error);
  }
}

exports.updateOdooUser = async (req, res) => {
  const { odooUserId, odooUserData, odooUserMetadata, user, userId } = req.body;

  let odoo_user_id = odooUserId;

  try {
    if (user && !odooUserId) {
      const response = await axios({
        method: 'post',
        url: ODOO_URL,
        data: {
          jsonrpc: '2.0',
          method: "call",
          params: {
            service: "object",
            method: "execute",
            args: [
              ODOO_DB,
              odooEnvironment,
              ODOO_API_KEY,
              "res.partner",
              "create",
              {
                "name": user.name,
                "email": user.email
              }
            ]
          },
        },
      });

      const odooUserId = response?.data?.result ?? null;
      odoo_user_id = odooUserId;

      await sdk.users.updateProfile({
        id: new UUID(user.id),
        privateData: {
          odoo_user_id: odooUserId,
        }
      });
    }

    const country = await axios({
      method: 'get',
      url: ODOO_URL,
      headers: {
        Cookie: req.authToken,
      },
      data: {
        jsonrpc: '2.0',
        method: "call",
        params: {
          service: "object",
          method: "execute",
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            "res.country",
            "search_read",
            [["name", "=", odooUserMetadata.countryName]],
            ["id", "name"],
          ],
        }
      },
    });

    const response = await axios({
      method: 'put',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: "call",
        params: {
          service: "object",
          method: "execute",
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            "res.partner",
            "write",
            [odoo_user_id],
            {
              ...odooUserData,
              "country_id": country?.data?.result[0]?.id ?? null,
              "x_studio_country": odooUserMetadata.countryName,
            },
          ],
        }
      },
    });

    if (response.data?.result && userId) {
      await sdk.users.updateProfile({
        id: new UUID(userId),
        publicData: {
          odooAccountUpdated: true
        }
      });
    }

    return res
      .status(200)
      .send({ result: response.data.result })
      .end();
  } catch (error) {
    handleError(res, error);
  }
}

exports.sendBookingDetails = async (req, res) => {
  const { order, txId, user } = req.body;

  order.order_line.forEach(l => console.log(l));

  try {
    if (user) {
      const response = await axios({
        method: 'post',
        url: ODOO_URL,
        data: {
          jsonrpc: '2.0',
          method: "call",
          params: {
            service: "object",
            method: "execute",
            args: [
              ODOO_DB,
              odooEnvironment,
              ODOO_API_KEY,
              "res.partner",
              "create",
              {
                "name": user.name,
                "email": user.email
              }
            ]
          },
        },
      });

      const odooUserId = response?.data?.result ?? null;
      order.partner_id = odooUserId;

      await sdk.users.updateProfile({
        id: new UUID(user.id),
        privateData: {
          odoo_user_id: odooUserId,
        }
      });
    }

    const response = await axios({
      method: 'post',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: "call",
        params: {
          service: "object",
          method: "execute",
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            "sale.order",
            "create",
            order,
          ],
        }
      },
    });

    await sdk.transactions.updateMetadata({
      id: new UUID(txId),
      metadata: {
        odooOrderId: response.data?.result ?? null,
      }
    });

    return res
      .status(200)
      .send({ data: response.data?.result ?? null })
      .end();
  } catch (error) {
    handleError(res, error);
  }
}

exports.sendBookingDetailsPickUpVehicle = async (req, res) => {
  const { odooOrderId } = req.body;

  try {
    const response = await axios({
      method: 'put',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: "call",
        params: {
          service: "object",
          method: "execute",
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            "sale.order",
            "action_confirm",
            odooOrderId,
          ],
        }
      },
    });

    return res
      .status(200)
      .send({ data: "Ok" })
      .end();
  } catch (error) {
    handleError(res, error);
  }
}

exports.assignBankAccountToContact = async (req, res) => {
  const { bankAccountData, user } = req.body;

  try {

    if (user) {
      const response = await axios({
        method: 'post',
        url: ODOO_URL,
        data: {
          jsonrpc: '2.0',
          method: "call",
          params: {
            service: "object",
            method: "execute",
            args: [
              ODOO_DB,
              odooEnvironment,
              ODOO_API_KEY,
              "res.partner",
              "create",
              {
                "name": user.name,
                "email": user.email
              }
            ]
          },
        },
      });

      const odooUserId = response?.data?.result ?? null;
      bankAccountData.partner_id = odooUserId;

      await sdk.users.updateProfile({
        id: new UUID(user.id),
        privateData: {
          odoo_user_id: odooUserId,
        }
      });
    }

    const response = await axios({
      method: 'post',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: "call",
        params: {
          service: "object",
          method: "execute",
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            "res.partner.bank",
            "create",
            bankAccountData,
          ],
        }
      },
    });

    const errorMsg = response.data?.error?.data?.message ?? null;
    const data = response.data?.result ?? null;

    return res
      .status(200)
      .send({ data, error: errorMsg })
      .end();
  } catch (error) {
    handleError(res, error);
  }
}

exports.updateBankAccountInContact = async (req, res) => {
  const { bankAccountData, bankAccountId } = req.body;

  try {

    const response = await axios({
      method: 'post',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: "call",
        params: {
          service: "object",
          method: "execute",
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            "res.partner.bank",
            "write",
            [bankAccountId],
            bankAccountData,
          ],
        }
      },
    });

    const errorMsg = response.data?.error?.data?.message ?? null;
    const data = response.data?.result ?? null;

    return res
      .status(200)
      .send({ data, error: errorMsg })
      .end();
  } catch (error) {
    handleError(res, error);
  }
}

exports.getOdooBanks = async (req, res) => {

  try {
    const banks = await axios({
      method: 'get',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            'res.bank',
            'search_read',
            [],
            ["name","id","active"],
          ],
        },
      }
    });

    res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send({ data: banks.data?.result ?? [] })
      .end();

  } catch(e) {
    handleError(res, e);
  }
}

exports.createInvoice = async (req, res) => {
  const { invoiceData, user } = req.body;

  try {

    if (user) {
      const response = await axios({
        method: 'post',
        url: ODOO_URL,
        data: {
          jsonrpc: '2.0',
          method: "call",
          params: {
            service: "object",
            method: "execute",
            args: [
              ODOO_DB,
              odooEnvironment,
              ODOO_API_KEY,
              "res.partner",
              "create",
              {
                "name": user.name,
                "email": user.email
              }
            ]
          },
        },
      });

      const odooUserId = response?.data?.result ?? null;
      invoiceData.partner_id = odooUserId;

      await sdk.users.updateProfile({
        id: new UUID(user.id),
        privateData: {
          odoo_user_id: odooUserId,
        }
      });
    }

    const response = await axios({
      method: 'get',
      url: ODOO_URL,
      data: {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            ODOO_DB,
            odooEnvironment,
            ODOO_API_KEY,
            'sale.order',
            'create',
            invoiceData
          ],
        },
      }
    });

    res
      .status(200)
      .set('Content-Type', 'application/transit+json')
      .send({ data: "Ok" })
      .end();
  } catch(e) {
    handleError(res, e);
  }
}
