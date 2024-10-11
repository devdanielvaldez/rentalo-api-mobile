const { ComplyCube } = require("@complycube/api");
const complycube = new ComplyCube({
    // apiKey: "test_YlR1TmZLaWdQM1dvNG1KNHI6ZmE0NDM5YTM1YWUyNTdlYjYxZWVkNmM2YzY5YmZhZjgzYjUzYjBhNjVjOWQ0Yjg0Y2RjNjhlNTgxODQ5MmY1NQ=="
    // apiKey: "live_YlR1TmZLaWdQM1dvNG1KNHI6MjA5ZDUyYjU5YmUzNGU1YzhmZWVkZjYwZjU2ZjM2Y2IyNmUzNzg5ODBlYzA0MTc1ZmJmNmQwNzIxM2UxMDY4OQ=="
    apiKey: process.env.COMPLYCUBE_KEY,
});

const methods = {
    createComplianceCheck: async (req, res) => {

        const { userData } = req.body;
        const { email, firstName, lastName, userID, userType } = userData;
        try {

            const { id: clientId } = await complycube.client.create({
                type: "person",
                email: email,
                personDetails: {
                    firstName: firstName,
                    lastName: lastName,
                },
                metadata: {
                    userID,
                    userType
                }
            });

            if (clientId) {
                const token = await complycube.token.generate(clientId, {
                    referrer: "*://*/*"
                });

                return res
                    .status(200)
                    .send({ token, clientId });
            }

        } catch (error) {
            res
                .status(400)
                .send({ error })
                .end();

        }
    },

    createCheck: async (req, res) => {
        const { clientId, documentId, userID, userType } = req.body;

        try {
            const response = await complycube.check.create(clientId, {
                documentId,
                type: 'document_check',
                options: {
                    userID,
                    userType
                }
            });

            const check = await complycube.check.get(response.id);

            res
              .status(200)
              .send({ check })
              .end();
        } catch (error) {
            console.log(error, '*** *** => error');
            res
              .status(400)
              .send({ error })
              .end();
        }
    },
}

module.exports = methods;

