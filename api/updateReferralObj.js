const sharetribeIntegrationSdk = require('sharetribe-flex-integration-sdk');

const integrationSdk = sharetribeIntegrationSdk.createInstance({
  clientId: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_ID,
  clientSecret: process.env.SHARETRIBE_FLEX_INTEGRATION_CLIENT_SECRET,
});

module.exports = (req, response) => {
  const type = req.body.type;
  const currentUser = req.body.currentUser;

  if (type === 'newUser') {
    const newUserId = req.body.newUserId;
    const referralObj = req.body.referralObj;
    const referralSenderUserId = referralObj.userId;

    return integrationSdk.users
      .updateProfile({
        id: newUserId,
        privateData: {
          referral: {
            userId: referralSenderUserId,
            used: true,
          },
        },
      })
      .then(resp => {
        return integrationSdk.users
          .show({ id: referralSenderUserId })
          .then(res => {
            const referralsArray = res.data.data.attributes.profile.privateData.referralsArray;
            const newReferralsArray = referralsArray.map(e => {
              if (e.userId === newUserId) {
                return {
                  userId: newUserId,
                  used: true,
                };
              } else {
                return e;
              }
            });

            return integrationSdk.users
              .updateProfile({
                id: referralSenderUserId,
                privateData: {
                  referralsArray: newReferralsArray,
                },
              })
              .then(res => {
                response.sendStatus(200);
              })
              .catch(e => {
                response.sendStatus(404);
              });
          })
          .catch(e => {
            response.sendStatus(404);
          });
      })
      .catch(e => {
        response.sendStatus(404);
      });
  } else {
    const referralsArray = currentUser.attributes.profile.privateData.referralsArray;
    const newReferralsArray = [...referralsArray];
    const luckyOne = referralsArray.find(item => {
      return item.used;
    });
    const index = newReferralsArray.indexOf(luckyOne);
    if (index > -1) {
      newReferralsArray.splice(index, 1);
    }

    return integrationSdk.users
      .updateProfile({
        id: currentUser.id.uuid,
        privateData: {
          referralsArray: newReferralsArray,
        },
      })
      .then(res => {
        response.sendStatus(200);
      })
      .catch(e => {
        response.sendStatus(404);
      });
  }
};
