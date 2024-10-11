const { getSdk } = require('./sdk');

const ERROR_MESSAGE =
  'Requesting user information from sharetribe failed. Make sure you are authenticated.';

const loadCurrentUser = async (req, res, next) => {
  const sdk = getSdk(req, res);

  let user = null;
  try {
    user = await sdk.currentUser.show();
  } catch (e) {
    return res.status(401).json({ error: ERROR_MESSAGE });
  }
  req.currentUser = user.data.data;
  next();
};

module.exports = loadCurrentUser;
