// Twilio Credentials
// To set up environmental variables, see http://twil.io/secure


// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

const accountSid = "AC7a6a1d535a35f0e2193e151bf93afa9f";
const authToken = "de87b80da42575294030db60033c6af5";

// require the Twilio module and create a REST client
const client = require('twilio')(accountSid, authToken);

function sendSms() {
    client.messages
    .create({
        to: '+972547278105',
        from: '+972544326889',
        body: 'This test test, sharon go make some pizza!',
    })
    .then(message => console.log(message.sid));
}