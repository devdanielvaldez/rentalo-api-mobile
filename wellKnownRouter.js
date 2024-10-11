const express = require('express');
const { openIdConfiguration, jwksUri } = require('./api-util/idToken');

const rsaPrivateKey =`-----BEGIN RSA PRIVATE KEY-----
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
-----END RSA PRIVATE KEY-----`;
const rsaPublicKey = 
`-----BEGIN RSA PUBLIC KEY-----
MIIBigKCAYEAxozXGgQAarz+X3i0lwmQC5Bk7Pzw/xXAD7JmMwteie17itKFbIiG
VtbwrJDtm1acoAbHQMdWINC1APdClpjw0FbD7QRk4xj/9IewedJcP7in2Bb3IW8R
VXqEwf+Yk0F7ljmY+xdN0XeTnDIDMkbpUgNyxqWoUacSBoh+TPhoCIT4dn32+6jf
C6eK721/ZrWT9mth6x1M4tKBO3g0y1Kv6qPnLrO6eD4ydC/8UU4HkSORv9SugFhv
2dlKz0Ebttgw0EEjzIzdX/ItifQiC7SGzVjjAhcAX50dFlmk0gtlEEGejcrvDoUI
bFEErUzig50vGx2Gs+e854x8cInHPl6y9D3NrHZB0xpqT6PUVD8iBKGBZduIYq5s
SY/aI7XDp0Gg9CytYnOyChHcdGGjznKYnpfa+bIxSRMomgpwOl3Uapifa0pfIP61
B7O3KQisremlw2cT6dDxLejdoq4zh5MUHnUxgQyYYMz8cerCBot5EFPKgApAmGZc
IAkz0fLVkceDAgMBAAE=
-----END RSA PUBLIC KEY-----`;
const keyId = process.env.KEY_ID;
const router = express.Router();

// These .well-known/* endpoints will be enabled if you are using FTW as OIDC proxy
// https://www.sharetribe.com/docs/cookbook-social-logins-and-sso/setup-open-id-connect-proxy/
if (rsaPublicKey && rsaPrivateKey) {
  router.get('/openid-configuration', openIdConfiguration);
  router.get('/jwks.json', jwksUri([{ alg: 'RS256', rsaPublicKey, keyId }]));
}

module.exports = router;
