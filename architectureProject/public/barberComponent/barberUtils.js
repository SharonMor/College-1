function isCellDelayable(cellId) {
  // `spot${index}` ==> cellIndex = index
  let cellIndex = cellId.substr(4);
  let nextCellIndex = parseInt(cellIndex) + 1;
  let nextCellId = `spot${nextCellIndex}`;

  let lastCellIndex = getIndexByHour(endHour);
  let lastCellId = `spot${lastCellIndex}`;

  // if there is reservation registered on next cell
  if (tableCellIdToResId.get(nextCellId) || cellId == lastCellId) return false;
  return true;
}

function prepareAndSendMail(emailTo, displayName, resOldDate, resNewDate, resId) {
  let bodyToSend = `<h2>hello ${displayName}</h2>
  <h4>we would like to inform you that your barber delayed your reservation.</h4>
  <br>
  <table>
    <tr>
      <td>old date:</td>
      <td>${resOldDate}</td>
    </tr>
    <tr>
      <td><b>new date:</b></td>
      <td>${resNewDate}</td>
    </tr>
    <tr>
      <td>reservation id:</td>
      <td>${resId}</td>
    </tr>
  </table>
  <h4>For more information please contact the barber.</h4>
  <br>
  <h5>details about the barber can be found in the website's booking page</h5>`;

  const subjectToSend = "MyBarber reservation has been delayed";
  mailToSend = new Mail(emailTo, subjectToSend, bodyToSend);
  sendMail(mailToSend);
}
