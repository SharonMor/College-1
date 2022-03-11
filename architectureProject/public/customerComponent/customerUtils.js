const getSelectedBarber = () =>
  barbersSelect.options[barbersSelect.selectedIndex].value;

const getSelectedHaircut = () =>
  selectedHaircut.options[selectedHaircut.selectedIndex].value;

const getSelectedHaircutPrice = () =>
  selectedHaircut.options[selectedHaircut.selectedIndex].getAttribute("price");

/**
 * @returns {Map} a map of haircuts values mapped to img ids.
 */
const getHaircutsValueToImgId = () => {
  let haircutsValueToImgId = new Map();
  haircutsValueToImgId.set("Back On The Block", "backOnTheBlockHair");
  haircutsValueToImgId.set("Bruv", "bruvHair");
  haircutsValueToImgId.set("Left Over", "leftOverHair");
  haircutsValueToImgId.set("Sky High", "skyHighHair");
  haircutsValueToImgId.set("Good Fellas", "goodFellasHair");
  haircutsValueToImgId.set("Messi", "messiHair");
  haircutsValueToImgId.set("More Life", "moreLifeHair");
  haircutsValueToImgId.set("Pomp It Up", "pompItHair");
  haircutsValueToImgId.set("Organized Chaos", "organaizedHair");
  haircutsValueToImgId.set("Crew Love", "crewLoveHair");

  return haircutsValueToImgId;
};

function prepareAndSendMail(emailTo, displayName, resDate, barberName, resId) {
  let bodyToSend = `<h2>hello ${displayName}</h2>
    <h4>your reservation has been approved.</h4>
    <br>
    <table>
      <tr>
        <td>date:</td>
        <td>${resDate}</td>
      </tr>
      <tr>
        <td>barber name:</td>
        <td>${barberName}</td>
      </tr>
      <tr>
        <td>note for barber:</td>
        <td>${customerNote.value}</td>
      </tr>
      <tr>
        <td>haircut style:</td>
        <td>${getSelectedHaircut()}</td>
      </tr>
      <tr>
        <td>price:</td>
        <td>${getSelectedHaircutPrice()}</td>
      </tr>
      <tr>
        <td>reservation id:</td>
        <td>${resId}</td>
      </tr>
    </table>`;
  const subjectToSend = "MyBarber reservation is approved";
  mailToSend = new Mail(emailTo, subjectToSend, bodyToSend);
  sendMail(mailToSend);
}
