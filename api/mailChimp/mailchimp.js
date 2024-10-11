// const mailchimp = require("@mailchimp/mailchimp_marketing");
const client = require("@mailchimp/mailchimp_marketing");

const methods = {
    mailchimp: async (req, res) => {
        const { email } = req.body
        try {
            client.setConfig({
                apiKey: "0919c86d48321cea68593af437302271-us21",
                server: "us21",
            });
            const data = await client.lists.addListMember("84ace5322b", {
                email_address: email,
                status: "subscribed",
            });
            return res
                .status(200)
                .send({ data: { ...data } })
                .end();
        } catch (error) {
            res.send({status:400,error:JSON.parse(error.response.text)})
        }
    }
}

module.exports = methods;