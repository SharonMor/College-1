const mailToken = "0c6b424a-97e0-4992-896d-0e9a6285f324";

// Mail object for smtp mailing service
class Mail {
  constructor(mailAddressTo, subject, body) {
    this.secureToken = mailToken,
    this.to = mailAddressTo;
    this.from = "mybarbershopproject@gmail.com";
    this.subject = subject;
    this.body = body;
  }
}

// checking if year,month,day are equal
function areDatesEqual(actual, expected) {
  return (
    actual.getFullYear() === expected.getFullYear() &&
    actual.getMonth() === expected.getMonth() &&
    actual.getDate() === expected.getDate()
  );
}

/**
 * Sending Mail using smtpjs api
 * 
 * @param {Mail} mailContent some mail object to send
 */
function sendMail(mailContent) {
  Email.send({
    SecureToken: mailContent.secureToken,
    To: mailContent.to,
    From: mailContent.from,
    Subject: mailContent.subject,
    Body: mailContent.body,
  })
    .then(() => console.log('mail sent successfully'))
    .catch((error) => console.log(`Error sending mail ${error}`));
}
