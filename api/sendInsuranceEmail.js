const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_KEY);

const sendLinkFun = (origin) =>{
   return ` <!doctype html>
    <html lang="en">
    
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
      <title>Referral</title>
    
      <link href="https://fonts.googleapis.com/css2?family=Poppins&display=swap" rel="stylesheet">
      <style type="text/css">
        table,
        td,
        div,
        h1,
        p {
          font-family: 'Poppins', sans-serif;
        }
    
        @media screen and (max-width: 1920px) {
          .col-sml {
            max-width: 42% !important;
          }
    
          .col-lge {
            max-width: 57% !important;
          }
    
          .mainContainer {
            max-width: 680px;
            width: 100%;
            box-sizing: border-box;
            margin: 20px auto;
            padding: 36px 64px;
            border: 1px solid #D1D1D1;
          }
    
          .mainContainerInner {
            padding: 0px;
            max-width: 100%;
          }
    
          .headerCon {
            width: 100%;
            padding: 0px;
          }
    
          .buttonFullWidth {
            width: fit-content;
          }
    
        }
    
        @media screen and (max-width: 768px) {
          .col-lge {
            max-width: 100% !important;
            margin-top: 24px;
          }
    
          .mainContainer {
            max-width: 100%;
            width: 100%;
            margin: 0px auto;
            padding: 26px 34px 0;
            border: 0px solid;
            display: table-cell;
          }
    
          .headerCon {
            border: 0px solid #D1D1D1;
            border-radius: 0px;
            padding: 0;
            width: 100%;
          }
    
          .buttonFullWidth {
            width: fit-content;
          }
        }
    
        @media screen and (max-width: 767px) {
    
          .col-lge {
            max-width: 100% !important;
            margin-top: 24px;
          }
    
          .buttonFullWidth {
            width: 100%;
          }
    
          .mainContainer {
            max-width: 100%;
            margin: 0;
            width: 100%;
            padding: 39px 0px 24px;
          }
    
          .mainContainerInner {
            max-width: 100%;
            width: 100%;
            margin: 0px auto;
            padding: 0px 20px 0px;
            border: 0px solid;
            display: table-cell;
          }
    
          .headerCon {
            border: 0px solid #D1D1D1;
            border-radius: 0px;
            padding: 0px;
            width: 100%;
          }
    
          button {
            width: 100%;
            text-align: center;
          }
        }
      </style>
    </head>
    
    <body
      style="font-size:16px;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;color:#0a0a0a;font-family: 'Poppins', sans-serif;font-weight:normal;padding:0;margin:0;text-align:left;font-size:16px;line-height:19px;width:100% !important;">
      <div class="mainContainer">
        <div class="mainContainerInner">
          <header
            style="text-align:center;margin-bottom:24px;display: flex;justify-content: flex-start; flex-direction: row;align-items: center;">
            
            <img src='/logo.png' width="200" height="100"/>
        
          </header>
          <div class="headerCon" style=" margin:38px 0 0 0;">
            <div>
              <h5
                style="font-family: 'Poppins', sans-serif;font-style: normal;font-weight: 600;font-size: 18px;line-height: 100%;letter-spacing: -0.04em;margin:0;color: #000000;">
                Hola 
              </h5>
    
              <div style="margin-top: 22px;">
                <p
                  style="font-family: 'Poppins', sans-serif;font-style: normal;font-weight: normal;font-size: 17px;line-height: 140%;letter-spacing: -0.04em;margin:0 0 20px 0;color: #7A7A7A;display: inline-block;width: 100%;">
                  Insurance Page link : <a href="${origin}/bookingDetails"
                    style="text-decoration: underline;color:#000000" >Open Now </a>
                </p>
                <p
                  style="margin:24px 0 0px; font-family: 'Poppins', sans-serif;font-style: normal;font-weight: normal;font-size: 17px;line-height: 140%;letter-spacing: -0.04em;color: #333;">
                  Gracias, <br>
                  El equipo de Réntalo</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>`
}

const methods = {
    insuranceEmail: async (req, res) => {
        const {origin} = req.body
        const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;
        const key = process.env.SENDGRID_KEY;
        sgMail.setApiKey(key);
        const message = {
            to: "accounts@rentaloinc.com", // Change to your recipient
            from: verifiedSender, // Change to your verified sender
            subject: "Booking details",
            text: 'text',
            html: sendLinkFun(origin),
        };
        const result = await sgMail.send(message)
    }
}

module.exports = methods;

