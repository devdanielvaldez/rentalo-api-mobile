const axios = require('axios');

class OdooAPI {
  constructor() {
    this.url = process.env.ODOO_URL || '';
  }

  async createRental(rentalData) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'sale.order',
            'create',
            rentalData
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'createRentalError');
      throw error;
    }
  }

  async createContact(contactData) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'res.partner',
            'create',
            contactData
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'createContactError');
      throw error;
    }
  }

  async updateContact(contactId, contactData) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'res.partner',
            'write',
            [contactId],
            contactData
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'updateContactError');
      throw error;
    }
  }

  async createBankAccount(bankAccountData) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'res.partner.bank',
            'create',
            bankAccountData
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'createBankAccountError');
      throw error;
    }
  }

  async assignBankAccountToContact(contactId, bankAccountId) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'res.partner.bank',
            'create',
            {
              partner_id: contactId,
              bank_id: bankAccountId
            }
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'assignBankAccountToContactError');
      throw error;
    }
  }

  async getCountryByName(countryName) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'res.country',
            'search_read',
            [['name', 'ilike', countryName]],
            ['name', 'id']
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'getCountryByNameError');
      throw error;
    }
  }

  async getAllBanks() {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'res.bank',
            'search_read',
            [],
            ['name', 'id']
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'getAllBanksError');
      throw error;
    }
  }

  async confirmVehiclePickup(orderId) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'sale.order',
            'action_confirm',
            orderId
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'confirmVehiclePickupError');
      throw error;
    }
  }

  async confirmVehicleDropOff(orderId) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'sale.order',
            'action_done',
            orderId
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'dropOffVehicleError');
      throw error;
    }
  }

  async cancelRental(orderId) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'sale.order',
            'action_cancel',
            orderId
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'cancelRentalError');
      throw error;
    }
  }

  async extendRental(orderId, extensionData) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'sale.order',
            'write',
            [orderId],
            extensionData
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'extendRentalError');
      throw error;
    }
  }

  async createInvoice(invoiceData) {
    try {
      const response = await axios.post(this.url, {
        jsonrpc: '2.0',
        method: 'call',
        params: {
          service: 'object',
          method: 'execute',
          args: [
            process.env.OODO_DB,
            6,
            process.env.ODOO_PASSWORD,
            'account.move',
            'create',
            invoiceData
          ],
        },
      });
      return response;
    } catch (error) {
      console.error(error, 'createInvoiceError');
      throw error;
    }
  }





}






// EXAMPLE OF ODOO API CALLS

const odooAPI = new OdooAPI();

const rentalData = {
  partner_id: 111,
  is_rental_order: true,
  rental_status: 'draft',
  date_order: '2023-10-09',
  validity_date: '2023-10-11',
  x_owner: 'NAME OF THE OWNER',
  pricelist_id: 2,
  order_line: [
    [0, 0, { product_id: 50, product_uom_qty: 2, price_unit: 65.78 }],
    [0, 0, { product_id: 88, product_uom_qty: 2, price_unit: 15 }],
  ],
};

odooAPI.createRental(rentalData)
  .then(response => console.log(response))
  .catch(error => console.error(error));




// ******************************************************************************************

const contactData = {
    name: 'Edgar Santiago',
    email: 'edgarsantiago@rentalodr.com'
  };
  
  odooAPI.createContact(contactData)
    .then(response => console.log(response))
    .catch(error => console.error(error));

// ******************************************************************************************


  const contactData = {
    name: 'Edgar Alberto Santiago Ferreiras',
    email: 'edgarsantiago@rentalodr.com',
    x_studio_driver_license: '05500418745',
    x_studio_date_of_birth_1: '1991-11-15',
    country_id: 1,
    mobile: '7034722381',
    company_type: 'person'
  };
  
  odooAPI.updateContact(153, contactData)
    .then(response => console.log(response))
    .catch(error => console.error(error));

// ******************************************************************************************

const invoiceData = {
    partner_id: 153,
    invoice_date: '2023-10-09',
    move_type: 'out_invoice',
    invoice_line_ids: [
      [0, 0, { product_id: 50, quantity: 2, price_unit: 65.78 }],
      [0, 0, { product_id: 88, quantity: 2, price_unit: 15 }],
    ],
  };
  
  odooAPI.createInvoice(invoiceData)
    .then(response => console.log(response))
    .catch(error => console.error(error));

// ******************************************************************************************

const extensionData = {
    date_order: '2023-10-09 10:00:00',
    commitment_date: '2023-10-15 10:00:00'
  };
  
  odooAPI.extendRental(66, extensionData)
    .then(response => console.log(response))
    .catch(error => console.error(error));

// ******************************************************************************************

const bankAccountData = {
    partner_id: 153,
    bank_id: 1,
    acc_number: '1234567890',
    routingNumber: '111000025'
  };
  
  odooAPI.createBankAccount(bankAccountData)
    .then(response => console.log(response))
    .catch(error => console.error(error));