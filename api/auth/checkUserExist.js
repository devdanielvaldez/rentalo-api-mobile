const jwt = require('jsonwebtoken');
const { getISdk } = require('../../api-util/sdk');


module.exports = async (req, res) => {
    try {
        const { id_token : idpToken } = req.body;
        const decodedIdToken = jwt.decode(idpToken, { complete: true });
        const { email } = decodedIdToken.payload;
        const pattern = /@privaterelay\.appleid\.com$/;
        const iSdk = getISdk();
        let userRes = {};
        if (pattern.test(email)) {
            //Since we changed our approach of apple login, but there are some users who have already signed up with apple login, we need to check if the user exists in the system with apple email or not. For that Promise.allSettled is used.
            let userQuery = await Promise.allSettled([
                iSdk.users.query({ prot_appleEmail: email }), //if this gives result -> old user -> assign and return
                iSdk.users.show({ email }), //if this gives result -> new user -> assign and return
            ]);
            if (
                userQuery[0]?.value?.data?.data &&
                userQuery[0].value.data.data.length
            ) {
                userRes = userQuery[0].value.data.data[0];
            } else if (userQuery[1]?.value?.data?.data) {
                userRes = userQuery[1].value.data.data;
            }
        } else {
            const res = await iSdk.users.show({ email });
            userRes = res && res.data.data;
        }

        return res
            .status(200)
            .set('Content-Type', 'application/transit+json')
            .send({
                user: userRes,
            })
            .end();
    } catch (error) {
        console.log('error at checkIfUserExists: ', error);
        console.log('error', error && JSON.stringify(error.data))
        return res
            .status(200)
            .set('Content-Type', 'application/transit+json')
            .send({
                user: false,
            })
            .end();
    }
}