const helmet = require('helmet');

const dev = process.env.REACT_APP_ENV === 'development';
const self = "'self'";
const unsafeInline = "'unsafe-inline'";
const unsafeEval = "'unsafe-eval'";
const data = 'data:';
const blob = 'blob:';
const devImagesMaybe = dev ? ['*.localhost:8000'] : [];
const baseUrl = process.env.REACT_APP_SHARETRIBE_SDK_BASE_URL || 'https://flex-api.sharetribe.com';

// Default CSP whitelist.
//
// NOTE: Do not change these in the customizations, make custom
// additions within the exported function in the bottom of this file.

const complycubeUrls = [
  'https://api.complycube.com',
  'https://assets.complycube.com',
  'wss://xds.complycube.com/',

];



const defaultDirectives = {
  baseUri: [self],
  defaultSrc: [self],
  childSrc: [blob],
  connectSrc: [
    self,
    baseUrl,
    '*.tiles.mapbox.com',
    'api.mapbox.com',
    'events.mapbox.com',
    'www.google-analytics.com',
    'stats.g.doubleclick.net',
    'www.youtube.com',
    'sentry.io',
    'https://www.rentaloinc.com',
    'www.rentaloinc.com',
    '*.rentaloinc.com',
    '*.stripe.com',
    'https://www.woopra.com',
    'https://appleid.apple.com',
    'http://www.woopra.com',
    'https://vehicle-inquiries-api.herokuapp.com',
    'https://rentalo.odoo.com',
    '*.tawk.to',
    'wss://vsb110.tawk.to',
    '*.tawk.to/s/',
    'https://demo.docusign.net',
    // 'wss://vsb50.tawk.to'
    'https://www.gstatic.com',
    ...complycubeUrls,
  ],


  fontSrc: [
    self,
    data,
    'assets-sharetribecom.sharetribe.com',
    'fonts.gstatic.com',
    'https://appleid.apple.com',
    'embed.tawk.to',
    'cdnjs.cloudflare.com',
    'https://rentalo.odoo.com'
  ],
  frameSrc: [self, '*.stripe.com','embed.tawk.to', 'https://rentalo.odoo.com'],
  imgSrc: [
    self,
    data,
    blob,
    ...devImagesMaybe,
    '*.imgix.net',
    'https://appleid.cdn-apple.com',
    'sharetribe.imgix.net', // Safari 9.1 didn't recognize asterisk rule.

    // Styleguide placeholder images
    'lorempixel.com',
    'via.placeholder.com',
    'www.youtube.com',
    'api.mapbox.com',
    '*.gstatic.com',
    '*.googleapis.com',
    '*.ggpht.com',

    // Google Analytics
    'www.google.com',
    'www.google-analytics.com',
    'stats.g.doubleclick.net',
    'embed.tawk.to',
    'https://appleid.apple.com',
    'https://assets.complycube.com',
    '*.stripe.com',
    'https://rentalo.odoo.com'
  ],
  scriptSrc: [
    self,
    unsafeInline,
    unsafeEval,
    data,
    'api.mapbox.com',
    'www.youtube.com',
    'https://www.rentaloinc.com',
    'www.rentaloinc.com',
    '*.rentaloinc.com',
    '*.google-analytics.com',
    'js.stripe.com',
    'embed.tawk.to',
    'cdn.jsdelivr.net',
    'https://appleid.cdn-apple.com',
    'https://appleid.apple.com',
    'https://demo.docusign.net',
    'https://www.woopra.com',
    'https://api.complycube.com',
    'https://assets.complycube.com',
    'https://www.gstatic.com',
    'https://www.googletagmanager.com',
    'https://demo.docusign.net',
     '*.tawk.to',
    'https://www.gstatic.com',
    'https://rentalo.odoo.com',

  ],
  styleSrc: [
    self,
    unsafeInline,
    'fonts.googleapis.com',
    'api.mapbox.com',
    'www.youtube.com',
    'embed.tawk.to',
    'https://appleid.apple.com',
    'https://demo.docusign.net',
    'https://www.woopra.com',
    'https://api.complycube.com',
    'https://assets.complycube.com',
    'https://www.gstatic.com',
    'https://rentalo.odoo.com'
  ],
};

/**
 * Middleware for creating a Content Security Policy
 *
 * @param {String} reportUri URL where the browser will POST the
 * policy violation reports
 *
 * @param {Boolean} enforceSsl When SSL is enforced, all mixed content
 * is blocked/reported by the policy
 *
 * @param {Boolean} reportOnly In the report mode, requests are only
 * reported to the report URL instead of blocked
 */
module.exports = (reportUri, enforceSsl, reportOnly) => {
  // ================ START CUSTOM CSP URLs ================ //

  // Add custom CSP whitelisted URLs here. See commented example
  // below. For format specs and examples, see:
  // https://content-security-policy.com/

  // Example: extend default img directive with custom domain
  // const { imgSrc = [self] } = defaultDirectives;
  // const exampleImgSrc = imgSrc.concat('my-custom-domain.example.com');

  const customDirectives = {
    // Example: Add custom directive override
    // imgSrc: exampleImgSrc,
  };

  // ================ END CUSTOM CSP URLs ================ //

  // Helmet v4 expects every value to be iterable so strings or booleans are not supported directly
  // If we want to add block-all-mixed-content directive we need to add empty array to directives
  // See Helmet's default directives:
  // https://github.com/helmetjs/helmet/blob/bdb09348c17c78698b0c94f0f6cc6b3968cd43f9/middlewares/content-security-policy/index.ts#L51

  const directives = Object.assign({ reportUri: [reportUri] }, defaultDirectives, customDirectives);
  if (!reportOnly) {
    directives.blockAllMixedContent = [];
  }

  // See: https://helmetjs.github.io/docs/csp/
  return helmet.contentSecurityPolicy({
    useDefaults: false,
    directives,
    reportOnly,
  });
};
