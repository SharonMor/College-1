const checkBtn = document.getElementById("checkBtn");
const timeTable = document.getElementById("timeTable");

const paypalWrapper = document.getElementById("smart-button-container"); //paypal buttons
const barberNote = document.getElementById("noteForBarber");

const selectedHaircut = document.getElementById("item-options");

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

// generating timeTable
generateTable();

const allTableCells = document.querySelectorAll("#timeTable td");

// modifying booked table cells
auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    usersRef = db.collection("users");

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
                  let docDate = doc.data().date.toDate();
                  let chosenDate = new Date(dateInput.value);
                  if (areDatesEqual(docDate, chosenDate)) {
                    // converting time (e.g 8:30 --> 8.5)
                    let hourNum = docDate.getHours();
                    hourNum += docDate.getMinutes() == 0 ? 0 : 0.5;
                    const index = getIndexByHour(hourNum);
                    let busyCell = document.getElementById(`spot${index}`);
                    busyCell.style.backgroundColor = "#ffb6c1";
                    busyCell.style.pointerEvents = "none";

                    console.log("index is: ", index);
                    console.log(docDate.getHours(), docDate.getMinutes());
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

let previousCellClicked;
let previousBgColor;
allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("click", () => {
      //when some cell is clicked
      if (previousCellClicked) {
        previousCellClicked.style.backgroundColor = previousBgColor; //green
      }
      //when clicking on a different cell (not on the same one)
      if (previousCellClicked != tableCell) {
        previousCellClicked = tableCell;
        previousBgColor = tableCell.style.backgroundColor;
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
    }));

checkBtn.addEventListener("click", () => {
  if (timeTable.hidden) timeTable.hidden = false;
});


const haircutsValueToImgId = new Map();
haircutsValueToImgId.set("Back On The Block", "backOnTheBlockHair");
haircutsValueToImgId.set("Bruv", "bruvHair");
haircutsValueToImgId.set("Left Over", "leftOverHair");
haircutsValueToImgId.set("Sky High", "skyHighHair");
haircutsValueToImgId.set("Good Fellas", "goodFellasHair");
haircutsValueToImgId.set("Messi", "messiHair");
haircutsValueToImgId.set("More Life", "moreLifeHair");
haircutsValueToImgId.set("Pomp It Up" , "pompItHair");
haircutsValueToImgId.set("Organized Chaos", "organaizedHair");
haircutsValueToImgId.set("Crew Love", "crewLoveHair");

let prevShownImg;

selectedHaircut.addEventListener("change", () => {
  if (prevShownImg) {
    prevShownImg.hidden = true;
  }
  const imgIdToShow = haircutsValueToImgId.get(selectedHaircut.value);
  const imgToShow = document.getElementById(imgIdToShow);
  prevShownImg = imgToShow;
  imgToShow.hidden = false;
});








/// Paypal ///
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
