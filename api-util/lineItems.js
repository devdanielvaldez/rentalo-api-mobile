const { calculateQuantityFromDates, calculateTotalFromLineItems } = require('./lineItemHelpers');
const { types } = require('sharetribe-flex-sdk');
const moment = require('moment');

const { Money } = types;
const {
  REACT_APP_AVAILABLE_CREDIT_PRICE,
  REACT_APP_AVAILABLE_PROMOTIONAL_PRICE,
  CONVERSION_VALUE,
  SERVICE_FEE,
  SERVICE_FEE_WITH_ID_RNC,
  SERVICE_FEE_CUSTOMER,
  REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY,
} = process.env;
// This bookingUnitType needs to be one of the following:
// line-item/night, line-item/day or line-item/units
const bookingUnitType = 'line-item/day';
// const PROVIDER_COMMISSION_PERCENTAGE = -10;

const conversionValue = CONVERSION_VALUE;

/** Returns collection of lineItems (max 50)
 *
 * Each line items has following fields:
 * - `code`: string, mandatory, indentifies line item type (e.g. \"line-item/cleaning-fee\"), maximum length 64 characters.
 * - `unitPrice`: money, mandatory
 * - `lineTotal`: money
 * - `quantity`: number
 * - `percentage`: number (e.g. 15.5 for 15.5%)
 * - `seats`: number
 * - `units`: number
 * - `includeFor`: array containing strings \"customer\" or \"provider\", default [\":customer\"  \":provider\" ]
 *
 * Line item must have either `quantity` or `percentage` or both `seats` and `units`.
 *
 * `includeFor` defines commissions. Customer commission is added by defining `includeFor` array `["customer"]` and provider commission by `["provider"]`.
 *
 * @param {Object} listing
 * @param {Object} bookingData
 * @returns {Array} lineItems
 */
exports.transactionLineItems = (listing, bookingData, provider) => {
  const make = listing?.attributes?.publicData?.make;
  const { fifteenDaysDiscount, sevenDayDiscount, twentyFiveDaysDiscount } =
    listing?.attributes?.publicData?.promotions || {};

  const idRnc = provider?.attributes?.profile?.protectedData?.hostIdentification?.idNumber;
  const providerCommissionPercentage = -(idRnc ? SERVICE_FEE_WITH_ID_RNC : SERVICE_FEE);

  const unitPrice = listing.attributes.price;
  const amount = listing.attributes.price.amount;
  const usdAmount = (SERVICE_FEE_CUSTOMER / 100) * amount;
  const { startDate, endDate, refferralCode, voucherCode, promotion, voucher } = bookingData;
  const days = moment(endDate).diff(startDate, 'days');
  const marketValue = listing?.attributes.publicData.marketValue;
  let insuranceAmount = 0;

  console.log('marketValue', marketValue);

  if (marketValue) {
    const referenceValue = parseInt(marketValue) * 0.6;

    if (referenceValue < 100000) {
      insuranceAmount = 14500;
    }

    if (referenceValue >= 100000 && referenceValue <= 200000) {
      insuranceAmount = 17500;
    }

    if (referenceValue >= 200000 && referenceValue <= 300000) {
      insuranceAmount = 19500;
    }

    if (referenceValue >= 300000 && referenceValue <= 400000) {
      insuranceAmount = 23500;
    }

    if (referenceValue >= 400000 && referenceValue <= 500000) {
      insuranceAmount = 27500;
    }

    if (referenceValue >= 500000 && referenceValue <= 1000000) {
      insuranceAmount = 32500;
    }

    if (referenceValue > 1000000) {
      insuranceAmount = 32500;
    }
  }

  console.log('insuranceAmount', insuranceAmount);

  /**
   * If you want to use pre-defined component and translations for printing the lineItems base price for booking,
   * you should use one of the codes:
   * line-item/night, line-item/day or line-item/units (translated to persons).
   *
   * Pre-definded commission components expects line item code to be one of the following:
   * 'line-item/provider-commission', 'line-item/customer-commission'
   *
   * By default BookingBreakdown prints line items inside LineItemUnknownItemsMaybe if the lineItem code is not recognized. */
  const numberOfDays = calculateQuantityFromDates(startDate, endDate, bookingUnitType);

  const booking = {
    code: bookingUnitType,
    unitPrice,
    quantity: numberOfDays,
    includeFor: ['customer', 'provider'],
  };

  const parsedConversionValue = parseFloat(conversionValue);
  const insuranceUnitPriceAmount =
    make.toUpperCase() == 'HYUNDAI' || make.toUpperCase() == 'KIA'
      ? insuranceAmount / parsedConversionValue + (insuranceAmount / parsedConversionValue) * 0.2
      : insuranceAmount / parsedConversionValue;

  const insuranceUnitAmount = insuranceUnitPriceAmount + 0.33 * insuranceUnitPriceAmount;

  const insurance = {
    code: 'line-item/tarifa-de-seguro',
    unitPrice: new Money(insuranceUnitAmount, REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY),
    quantity: numberOfDays,
    includeFor: ['customer'],
  };

  const providerCommission = {
    code: 'line-item/provider-commission',
    unitPrice: calculateTotalFromLineItems([booking]),
    percentage: providerCommissionPercentage,
    includeFor: ['provider'],
  };

  const serviceFees = {
    code: 'line-item/tarifa-de-servicio',
    unitPrice: new Money(usdAmount * numberOfDays, REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY),
    quantity: 1,
    includeFor: ['customer'],
  };

  const lineItems = [booking, insurance, providerCommission, serviceFees];
  const isCredit = promotion === 'available-credits';
  const isVoucher = promotion === 'promotional-voucher';
  const isVoucherCode = voucherCode && voucherCode.toUpperCase() === 'RENTALO2023';
  if ((refferralCode && isCredit) || (isVoucherCode && isVoucher)) {
    const discount = {
      code: 'line-item/código-de-promoción-utilizado',
      unitPrice: refferralCode
        ? new Money(
            -(Number(REACT_APP_AVAILABLE_CREDIT_PRICE) * 100),
            REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY
          )
        : new Money(
            -(Number(REACT_APP_AVAILABLE_PROMOTIONAL_PRICE) * 100),
            REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY
          ),
      quantity: 1,
      includeFor: ['customer'],
    };
    lineItems.push(discount);
  }

  const daysdiscountAmount =
    15 > days && days >= 7
      ? sevenDayDiscount
      : 25 > days && days >= 15
      ? fifteenDaysDiscount
      : days >= 25
      ? twentyFiveDaysDiscount
      : 0;

  if (daysdiscountAmount) {
    const daysdiscount = {
      code: 'line-item/dias-de-descuento',
      unitPrice: new Money(
        -(Number(daysdiscountAmount) * 100),
        REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY
      ),
      quantity: 1,
      includeFor: ['customer'],
    };
    lineItems.push(daysdiscount);
  }

  if (voucher) {
    const discountType = voucher.discount.type;
    const voucherDiscount = {
      code: 'line-item/cupon-descuento',
      includeFor: ['customer'],
    };

    if (discountType === 'PERCENT') {
      voucherDiscount.percentage = -voucher.discount.percent_off;
      voucherDiscount.unitPrice = calculateTotalFromLineItems([booking]);
    } else if (discountType === 'AMOUNT') {
      voucherDiscount.quantity = 1;
      voucherDiscount.unitPrice = new Money(
        -voucher.discount.amount_off,
        REACT_APP_SHARETRIBE_MARKETPLACE_CURRENCY
      );
    }

    lineItems.push(voucherDiscount);
  }

  return lineItems;
};
