const checkBtn = document.getElementById("checkBtn");
const timeTable = document.getElementById("timeTable");

const paypalWrapper = document.getElementById("smart-button-container"); //paypal buttons
const barberNote = document.getElementById("noteForBarber");

const selectElement = document.getElementById("item-options");
const bruvHair = document.getElementById("bruvHair");
const leftOverHair = document.getElementById("leftOverHair");
const skyHighHair = document.getElementById("skyHighHair");
const goodFellasHair = document.getElementById("goodFellasHair"); //haircuts declarations
const messiHair = document.getElementById("messiHair");
const moreLifeHair = document.getElementById("moreLifeHair");
const pompItHair = document.getElementById("pompItHair");
const organaizedHair = document.getElementById("organaizedHair");
const backOnTheBlockHair = document.getElementById("backOnTheBlockHair");
const crewLoveHair = document.getElementById("crewLoveHair");

bruvHair.hidden = true;
leftOverHair.hidden = true;
skyHighHair.hidden = true;
goodFellasHair.hidden = true;
messiHair.hidden = true;
moreLifeHair.hidden = true;
pompItHair.hidden = true;
organaizedHair.hidden = true;
backOnTheBlockHair.hidden = true;
crewLoveHair.hidden = true;

barberNote.hidden = true;
timeTable.hidden = true;
paypalWrapper.hidden = true;

// pull data for barbers select
///// Firestore /////
const barbersSelect = document.getElementById("barbers");

// usersRef is already initialized in navbar.js
let unsubscribe;
auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    usersRef = db.collection("users");

    // Query
    unsubscribe = usersRef
      .where("isBarber", "==", true)
      .onSnapshot((querySnapshot) => {
        // Map results to an array of option elements
        const items = querySnapshot.docs.map((doc) => {
          const barberName = doc.data().fullName;
          return `<option value="${barberName}">${barberName}</option>`;
        });
        barbersSelect.innerHTML = '<option value="notSelected" selected disabled>Choose barber</option>';
        barbersSelect.innerHTML += items.join("");
      });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

// setting date fixed times
const dateInput = document.getElementById("dateInput");
let date = new Date();
let nextYearDate = new Date(
  date.getFullYear() + 1,
  date.getMonth(),
  date.getDate()
);
let currentParsedDate = date.toISOString().split("T")[0];

dateInput.value = currentParsedDate;
dateInput.min = currentParsedDate;
dateInput.max = nextYearDate.toISOString().split("T")[0];

// hiding the table when data changes
dateInput.addEventListener("change", () => {
  timeTable.hidden = true;
});

// enabling checkBtn on selecting a barber
barbersSelect.addEventListener("change", () => {
  checkBtn.disabled = false;
  timeTable.hidden = true;
});

// returns index of cell by offset (by default = 0.5)
// e.g (hour = 17, offset = 0.5) => 19
// offset is the time jump between hours.
let getIndexByHour = (hour, startTime = startHour, offsetNum = offset) =>
  (hour - startTime) / offsetNum + 1;

// constant values for table
const startHour = 8;
const endHour = 18;
const numOfCols = 7;
const offset = 0.5;

function generateTable() {
  // generating hours table
  let tableHours = [];

  tableHours.push("<table>");
  for (let i = startHour; i <= endHour; i += offset) {
    // check for a remainder when dividing by 1
    const isFraction = !(i % 1 === 0);
    const isBelow10 = i < 10;
    let hour;
    let rowNum;
    let index = getIndexByHour(i);

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
    // pushing cell
    tableHours.push(
      `<td id="spot${index}">
       <span class="time_span" id="spot${index}time">${hour}</span>
     </td>`
    );
  }
  tableHours.push("</tr></table>");
  timeTable.innerHTML = tableHours.join("");
}
generateTable();

// modifying booked table cells
auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    usersRef = db.collection("users");

    const allTableCells = document.querySelectorAll("#timeTable td");
    checkBtn.addEventListener("click", () => {
      // clearing old busy cells
      allTableCells.forEach((tableCell) => {
        tableCell.style.backgroundColor = "rgba(94, 121, 49, 0.904)"; // green
        tableCell.style.pointerEvents = "auto";
      });

      // getting barber name
      let selectedBarber =
        barbersSelect.options[barbersSelect.selectedIndex].value;

      // Query reservations of a barber
      unsubscribe = usersRef
        .where("isBarber", "==", true)
        .where("fullName", "==", selectedBarber)
        .onSnapshot((querySnapshot) => {
          // Map results to an array of option elements
          if (querySnapshot.size == 1) {
            let resRefList = querySnapshot.docs[0].data().reservations;
            resRefList.forEach((resRef) => {
              // will be reservations = "reservations"
              let reservations = resRef.parent.id;
              let docId = resRef.id;
              // ref holds the actual doc in db
              let docRef = db.collection(reservations).doc(docId);
              docRef
                .get()
                .then((doc) => {
                  // filtering only current day
                  let dbDate = doc.data().date.toDate();
                  let chosenDate = new Date(dateInput.value);
                  if (areDatesEqual(dbDate, chosenDate)) {
                    // converting time (e.g 8:30 --> 8.5)
                    let hourNum = dbDate.getHours();
                    hourNum += dbDate.getMinutes() == 0 ? 0 : 0.5;
                    const index = getIndexByHour(hourNum);
                    let busyCell = document.getElementById(`spot${index}`);
                    busyCell.style.backgroundColor = "#ffb6c1";
                    busyCell.style.pointerEvents = "none";

                    console.log("index is: ", index);
                    console.log(dbDate.getHours(), dbDate.getMinutes());
                  }
                })
                .catch((error) => {
                  console.log("Error getting document:", error);
                });
            });
          } else if (querySnapshot.size == 0) {
            console.log(
              "Error: Trying to fetch data on barber that isn't exist"
            );
          } else {
            console.log(
              "Error: Trying to fetch data on barber," +
                "but there is multiple barbers with the same name." +
                "\n please contact the managers"
            );
          }
        });
    });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

// checking if year,month,day are equal
function areDatesEqual(actual, expected) {
  return (
    actual.getFullYear() === expected.getFullYear() &&
    actual.getMonth() === expected.getMonth() &&
    actual.getDate() === expected.getDate()
  );
}

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseover", () => {
//     if(tableCell.style.backgroundColor == "rgba(85, 107, 47, 0.904)"){
//       console.log(tableCell.style.innerHTML);
//       console.log(tableCell.style.backgroundColor);
//         tableCell.style.backgroundColor = "#ffffff";}
//     },false));
let previousCellClicked;
document.querySelectorAll("#timeTable td").forEach((tableCell) =>
  tableCell.addEventListener("click", () => {
      //when some cell is clicked
      if (previousCellClicked) {
        previousCellClicked.style.backgroundColor = "rgba(85, 107, 47, 0.904)"; //green
      }
      //when clicking on a different cell (not on the same one)
      if (previousCellClicked != tableCell) {
        previousCellClicked = tableCell;
        tableCell.style.backgroundColor = "rgb(50, 158, 231)"; //blue
        paypalWrapper.hidden = false;
        barberNote.hidden = false;
      }
      //when clicking on the same cell ("turning it off")
      else {
        previousCellClicked = null;
        paypalWrapper.hidden = true;
        barberNote.hidden = true;
      }
    }, false));

checkBtn.addEventListener("click", () => {
  if (timeTable.hidden) timeTable.hidden = false;
});

// function getSelectedValue(){
//   var selectedValue=document.getElementById("item-options").value;
//   // console.log(selectedValue);
// }

// TODO: map images to selected index
// let prvSelectedHairStyle;

// selectElement.addEventListener('change', () => {
//   if (prvSelectedHairStyle) {
//     prvSelectedHairStyle.hidden = true;
//   }
//   const select = document.getElementById("item-options");
//   const selectedHairStyle = select.options[select.selectedIndex];
//   prvSelectedHairStyle = selectedHairStyle;
//   selectedHairStyle.hidden = false;
// })

selectElement.addEventListener("change", () => {
  var selectedInnerValue = document.getElementById("item-options").value;
  console.log(selectedInnerValue);
  if (selectedInnerValue == "Left Over") {
    hidePics();
    leftOverHair.hidden = false;
  } else if (selectedInnerValue == "Back On The Block") {
    hidePics();
    backOnTheBlockHair.hidden = false;
  } else if (selectedInnerValue == "Bruv") {
    hidePics();
    bruvHair.hidden = false;
  } else if (selectedInnerValue == "Sky High") {
    hidePics();
    skyHighHair.hidden = false;
  } else if (selectedInnerValue == "Good Fellas") {
    hidePics();
    goodFellasHair.hidden = false;
  } else if (selectedInnerValue == "Messi") {
    hidePics();
    messiHair.hidden = false;
  } else if (selectedInnerValue == "More Life") {
    hidePics();
    moreLifeHair.hidden = false;
  } else if (selectedInnerValue == "Pomp It Up") {
    hidePics();
    pompItHair.hidden = false;
  } else if (selectedInnerValue == "Organized Chaos") {
    hidePics();
    organaizedHair.hidden = false;
  } else if (selectedInnerValue == "Crew Love") {
    hidePics();
    crewLoveHair.hidden = false;
  }
});

function hidePics() {
  bruvHair.hidden = true;
  leftOverHair.hidden = true;
  skyHighHair.hidden = true;
  goodFellasHair.hidden = true;
  messiHair.hidden = true;
  moreLifeHair.hidden = true;
  pompItHair.hidden = true;
  organaizedHair.hidden = true;
  backOnTheBlockHair.hidden = true;
  crewLoveHair.hidden = true;
}

function initPayPalButton() {
  var shipping = 0;
  var itemOptions = document.querySelector(
    "#smart-button-container #item-options"
  );
  var quantity = parseInt();
  var quantitySelect = document.querySelector(
    "#smart-button-container #quantitySelect"
  );
  if (!isNaN(quantity)) {
    quantitySelect.style.visibility = "visible";
  }
  var orderDescription =
    "In order to place an order, Please select one of the following haristyles. Then add your payment method.";
  if (orderDescription === "") {
    orderDescription = "Item";
  }
  paypal
    .Buttons({
      style: {
        shape: "pill",
        color: "silver",
        layout: "vertical",
        label: "paypal",
      },
      createOrder: function (data, actions) {
        var selectedItemDescription =
          itemOptions.options[itemOptions.selectedIndex].value;
        var selectedItemPrice = parseFloat(
          itemOptions.options[itemOptions.selectedIndex].getAttribute("price")
        );
        var tax =
          20 === 0 || false ? 0 : selectedItemPrice * (parseFloat(20) / 100);
        if (quantitySelect.options.length > 0) {
          quantity = parseInt(
            quantitySelect.options[quantitySelect.selectedIndex].value
          );
        } else {
          quantity = 1;
        }

        tax *= quantity;
        tax = Math.round(tax * 100) / 100;
        var priceTotal =
          quantity * selectedItemPrice + parseFloat(shipping) + tax;
        priceTotal = Math.round(priceTotal * 100) / 100;
        var itemTotalValue =
          Math.round(selectedItemPrice * quantity * 100) / 100;

        return actions.order.create({
          purchase_units: [
            {
              description: orderDescription,
              amount: {
                currency_code: "USD",
                value: priceTotal,
                breakdown: {
                  item_total: {
                    currency_code: "USD",
                    value: itemTotalValue,
                  },
                  shipping: {
                    currency_code: "USD",
                    value: shipping,
                  },
                  tax_total: {
                    currency_code: "USD",
                    value: tax,
                  },
                },
              },
              items: [
                {
                  name: selectedItemDescription,
                  unit_amount: {
                    currency_code: "USD",
                    value: selectedItemPrice,
                  },
                  quantity: quantity,
                },
              ],
            },
          ],
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (orderData) {
          // Full available details
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2)
          );

          // Show a success message within this page, e.g.
          const element = document.getElementById("paypal-button-container");
          element.innerHTML = "";
          element.innerHTML = "<h3>Thank you for your payment!</h3>";

          // Or go to another URL:  actions.redirect('thank_you.html');
        });
      },
      onError: function (err) {
        console.log(err);
      },
    })
    .render("#paypal-button-container");
}
initPayPalButton();
