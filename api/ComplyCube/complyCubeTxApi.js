const { ComplyCube } = require("@complycube/api");
const complycube = new ComplyCube({
    // apiKey: "test_YlR1TmZLaWdQM1dvNG1KNHI6ZmE0NDM5YTM1YWUyNTdlYjYxZWVkNmM2YzY5YmZhZjgzYjUzYjBhNjVjOWQ0Yjg0Y2RjNjhlNTgxODQ5MmY1NQ=="
    // apiKey: "live_YlR1TmZLaWdQM1dvNG1KNHI6MjA5ZDUyYjU5YmUzNGU1YzhmZWVkZjYwZjU2ZjM2Y2IyNmUzNzg5ODBlYzA0MTc1ZmJmNmQwNzIxM2UxMDY4OQ=="
    apiKey: process.env.COMPLYCUBE_KEY,
});

const methods = {
    getComplyCubeToken: async (req, res) => {
        const { clientId ,txId } = req.body;
        try {

            const client = await complycube.client.update(clientId, {
                metadata: {
                    txId
                }
              });
            console.log(client, '*** *** => client');

            if (clientId) {
                const token = await complycube.token.generate(clientId, {
                    referrer: "*://*/*"
                });

                return res
                    .status(200)
                    .send({ token,clientId});
            }

        } catch (error) {
            res
              .status(400)
              .send({ error })
              .end();

        }
    },

    createCheckTx: async (req, res) => {
        const { clientId, documentId } = req.body;
        console.log(req.body, '*** *** => req.body');
     try {
        const check = await complycube.check.create(clientId,{
            documentId,
            type: 'document_check',

        });
        console.log(check, '*** *** => check');
     } catch (error) {
        console.log(error, '*** *** => error');

        res
          .status(400)
          .send({ error })
          .end();
     }
    }
}

module.exports = methods;

