const axios = require('axios').default;

const methods = {
  authenticateCustomer: async (req, res) => {
    try {
      const login = await axios({
        method: 'post',
        url: `${process.env.ODOO_URL}/api/authenticate`,
        data: {
          jsonrcp: '2.0',
          params: {
            db: process.env.OODO_DB,
            login: process.env.ODOO_USER,
            password: process.env.ODOO_PASSWORD,
          },
        },
      });
      var myCookie = login.headers['set-cookie'][0];

      return myCookie
    } catch (error) {
      console.error(error, 'authenticateCustomererror')
    }
  },
  createOdooCustomer: async (req, res) => {
    const { email, name } = req.body;
    try {
      const axiosResponse = await axios({
        method: 'post',
        url: `${process.env.ODOO_URL}`,
        data: {
          jsonrcp: '2.0',
          params: {
            service: "object",
            method: "execute",
            args: [`${process.env.OODO_DB}`, 6, `${process.env.ODOO_PASSWORD}`, "res.partner", "create", {
              "name": name,
              "email": email
            }]
          },
        },
      });

      const odooUserId = axiosResponse?.data?.result?.id
      return res
        .status(200)
        .send({ odooUserId })
        .end();
    } catch (error) {
      console.error(error, 'createOdooCustomererror')
    }
  },

  getCountryCode: async (req, res) => {
    const {countryName} = req.body
    try {
      const responseCountryId = await axios({
        method: 'get',
        url: `${process.env.ODOO_URL}/api/country`,
        headers: {
          Cookie: req.authToken,
        },
        data: {
          jsonrcp: '2.0',
          method: "call",
          params: {
            code:countryName
          }
        },
      });
      countryCode= responseCountryId?.data?.result[0]?.id
      return res
      .send({ countryCode })
      .end();

    } catch (error) {
      console.error(error, "errorgetCountryCode")
    }
  },

  updateOdooUser: async (req, res) => {
    const { odooUserId, odooData } = req.body
    try {
      const responseDetails = await axios({
        method: 'put',
        url: `${process.env.ODOO_URL}`,
        data: {
          jsonrcp: '2.0',
          params: odooData
        },
      });
      return res
      .status(200)
        .json("success")
        .end();
    } catch (error) {
      console.error(error, "updateOdooUserError")
    }
  },
  invoiceOdooUser: async (req, res) => {
    const params = req.body
    console.log('invoiceOdooUser', params)
    try {
      const invoicResponseDetails = await axios({
        method: 'post',
        url: `${process.env.ODOO_URL}`,
        data: {
          jsonrcp: '2.0',
          params: params
        }
      });
      console.log("invoicResponseDetails", invoicResponseDetails.data);
      const invoice_id = invoicResponseDetails?.data?.result?.id;
      return res
        .status(200)
        .json({invoice_id})
        .end();
    } catch (error) {
      console.error(error, "invoiceOdooUserError")
    }
  },
  invoiceLineOdooUser: async (req, res) => {
    const params = req.body
    console.log('invoiceLineOdooUser', params)
    try {
      const invoicLineResponseDetails = await axios({
        method: 'post',
        url: `${process.env.ODOO_URL}/api/invoice/line`,
        headers: {
          Cookie: req.authToken,
        },
        data: {
          jsonrcp: '2.0',
          params: params
        }
      });
      return res
        .status(200)
        .json("success")
        .end();
    } catch (error) {
      console.error(error, "invoiceLineOdooUserError")
    }
  },
  invoicePostOdooUser: async (req, res) => {
    const id = req.body
    console.log('id', id)
    try {
      const invoicePostResponseDetails = await axios({
        method: 'post',
        url: `${process.env.ODOO_URL}/api/invoice/state/${id}`,
        headers: {
          Cookie: req.authToken,
        },
        data: {
          jsonrcp: '2.0',
          params: {
            state: "posted",
          }
        }
      });
      return res
        .status(200)
        .json("success")
        .end();
    } catch (error) {
      console.error(error, "invoicePostOdooUserError")
    }

  },
  invoicePaymentOdooUser: async (req, res) => {
    const params = req.body
    console.log('invoicePaymentOdooUser', params)
    try {
      const invoicPaymentResponseDetails = await axios({
        method: 'post',
        url: `${process.env.ODOO_URL}/api/invoice/payment`,
        headers: {
          Cookie: req.authToken,
        }, data: {
          jsonrcp: '2.0',
          params: params
        }
      });
      return res
        .status(200)
        .json("success")
        .end();

    } catch (error) {
      console.error(error, "invoicePaymentOdooUserError")
    }
  },

  updateInvoiceOdooUser: async (req, res) => {
    console.log('req.body', req.body)
    const id = 21
    try {
      const updateInvoiceResponseDetails = await axios({
        method: 'put',
        url: `${process.env.ODOO_URL}/api/invoice/line/${id}`,
        headers: {
          Cookie: req.authToken,
        }, data: {
          jsonrcp: '2.0',
          params: {
               name: 'charge',
               account_id: 21,
              quantity: 1,
              price_unit: 9.3,
              product_id: 5,
               move_id: 23
            }
        }
      });
      console.log('updateInvoiceResponseDetails', updateInvoiceResponseDetails)
      console.log('updateInvoiceOdooUser', res)
      return res
        .status(200)
        .json("success")
        .end();

    } catch (error) {
      console.error(error, "invoiceupdateUserError")
    }
  }
}

module.exports = methods;
