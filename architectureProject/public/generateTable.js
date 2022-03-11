// constant values for table
const startHour = 8;
const endHour = 18;
const numOfCols = 7;
const offset = 0.5;

// returns index of cell by offset (by default = 0.5)
// e.g (hour = 17, offset = 0.5) => 19
// offset is the time jump between hours.
const getIndexByHour = (hour, startTime = startHour, offsetNum = offset) =>
  (hour - startTime) / offsetNum + 1;

/**
 * @param {Date} docDate - date of a some user 
 * @returns table index to the appropriate date
 */
// mapping db time to index (e.g 8:30 --> 8.5 --> index: 2)
const getIndexByUserDate = (docDate) => {
  let hourNum = docDate.getHours();
  hourNum += docDate.getMinutes() == 0 ? 0 : offset;
  return getIndexByHour(hourNum);
};

function generateTable(isBarber = false) {
  // generating hours table
  let tableHours = [];

  tableHours.push("<table>");
  for (let i = startHour; i <= endHour; i += offset) {
    // check for a remainder when dividing by 1
    const isFraction = !(i % 1 === 0);
    const isBelow10 = i < 10;
    let hour;
    let rowNum;
    const index = getIndexByHour(i);
    let tdInnerHtml;

    if (isFraction) hour = isBelow10 ? `0${i - offset}:30` : `${i - offset}:30`;
    else hour = isBelow10 ? `0${i}:00` : `${i}:00`;

    // pushing tr's to table hours
    if ((index - 1) % numOfCols == 0) {
      rowNum = (index - 1) / numOfCols;
      // if first cell
      if (index - 1 == 0) tableHours.push(`<tr id="row${rowNum}">`);
      // closing opened tr and opening new one
      else tableHours.push(`</tr><tr id="row${rowNum}">`);
    }

    if (isBarber) {
      tdInnerHtml = `<div>
                         <span class="time_span" id="spot${index}time">${hour}</span>
                         <span class="name_span" id="spot${index}name"></span>
                       </div>`;
    } else {
      tdInnerHtml = `<span class="time_span" id="spot${index}time">${hour}</span>`;
    }

    // pushing cell
    tableHours.push(`<td id="spot${index}">${tdInnerHtml}</td>`);
  }
  tableHours.push("</tr></table>");
  timeTable.innerHTML = tableHours.join("");
}
generateTable();
