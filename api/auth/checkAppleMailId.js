const jwt = require('jsonwebtoken');

module.exports = (req, res) => {
    try {
        const decodedIdToken = jwt.decode(req.body, { complete: true });
        const { email } = decodedIdToken.payload;
        const pattern = /@privaterelay\.appleid\.com$/;
        if (pattern.test(email)) {
            console.log("Email address matches the pattern.");
            return res
                .status(200)
                .set('Content-Type', 'application/transit+json')
                .send({
                    status: 'SUCCESS',
                    statusText: 'Email address matches the pattern.',
                    data: {}
                })
                .end();
        }
        console.log("Email address does not match the pattern.");
        return res
            .status(200)
            .set('Content-Type', 'application/transit+json')
            .send({
                status: 'FAILED',
                statusText: 'Email address does not match the pattern.',
                data: {}
            })
            .end();
    } catch (error) {
        console.log('error', error)
        return res
            .status(200)
            .set('Content-Type', 'application/transit+json')
            .send({
                status: 'ERROR',
                statusText: 'Something went wrong!',
                data: error
            })
            .end();
    }
};
