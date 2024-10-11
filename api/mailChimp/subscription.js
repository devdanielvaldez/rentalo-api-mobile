const client = require("@mailchimp/mailchimp_marketing");

const methods = {
    mailchimpSubscription: async (req, res) => {
        const { email, fname, lname } = req.body;
        try {
            client.setConfig({
                apiKey: "8dcb2035b7cc3cc9b13e3573026ee6d8-us4",
                server: "us4",
            });
            const data = await client.lists.addListMember("49e168dae2", {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fname,
                    LNAME: lname
                  }
            });
            return res
                .status(200)
                .send({ data: data })
                .end();
        } catch (error) {
            console.log(error);

            res.send({status:400,error:JSON.parse(error.response.text)})
        }
    }
}

module.exports = methods;