const barbersSelect = document.getElementById("barbers");
const dateInput = document.getElementById("dateInput");
// barber info box elements
const barberInfo = document.getElementById("barberInfo");
const barberMail = document.getElementById("barberMail");
const barberPhoneText = document.getElementById("barberPhoneText");
const barberWhatsappLink = document.getElementById("whatsappLink");
const barberSpeech = document.getElementById("barberSpeech");

const checkBtn = document.getElementById("checkBtn");
const timeTable = document.getElementById("timeTable");
const customerNote = document.getElementById("noteForBarber");
const selectedHaircut = document.getElementById("item-options");

const paypalWrapper = document.getElementById("smart-button-container"); //paypal buttons
const paypalElement = document.getElementById("paypal-button-container");
const paypalBtnWrapper = document.getElementById("paypalBtnWrapper");

let chosenBarberIndex;

///// Firestore /////
// pull data for barbers select
// usersRef is already initialized in navbar.js
let unsubscribe;
auth.onAuthStateChanged((user) => {
  if (user) {
    // Query
    unsubscribe = barbersQuery.onSnapshot((querySnapshot) => {
      // save last chosen barber before re-render select
      chosenBarberIndex = barbersSelect.selectedIndex;

      // Map results to an array of option elements
      const items = querySnapshot.docs.map((doc) => {
        const barberName = doc.data().fullName;
        return `<option value="${barberName}">${barberName}</option>`;
      });
      barbersSelect.innerHTML =
        '<option value="notSelected" selected disabled>Choose barber</option>';
      barbersSelect.innerHTML += items.join("");

      // if an update has been accrued in barbers DB -> re choosing the selected barber
      if (chosenBarberIndex) barbersSelect[chosenBarberIndex].selected = true;
    });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

// setting date fixed times
let nextYearDate = getNextYearDate(new Date());
let currentParsedDate = new Date().toISOString().split("T")[0];
let nextYearParsedDate = nextYearDate.toISOString().split("T")[0];

dateInput.value = currentParsedDate;
dateInput.min = currentParsedDate;
dateInput.max = nextYearParsedDate;

// hiding the table when data changes
dateInput.addEventListener("change", () => {
  timeTable.hidden = true;
  paypalWrapper.hidden = true;
});

// enabling checkBtn on selecting a barber
barbersSelect.addEventListener("change", () => {
  checkBtn.disabled = false;
  timeTable.hidden = true;
});

// modifying the barber info
barbersSelect.addEventListener("change", () => {
  barberInfo.hidden = false;

  const user = firebase.auth().currentUser;
  if (user) {
    // getting selected barber info
    getBarberQuery(getSelectedBarber())
      .get()
      .then((querySnapshot) => {
        const queriedDoc = validateAndGetSingleDoc(querySnapshot);
        if (!queriedDoc) return;

        const barberData = queriedDoc.data();

        barberMail.innerHTML = barberData.email;
        barberPhoneText.innerHTML = barberData.phone;
        const phoneNumber = barberData.phone.replace("-", "");
        barberWhatsappLink.href = `https://wa.me/972${phoneNumber}`;
        barberSpeech.innerHTML = barberData.aboutMe;
      })
      .catch((error) => {
        console.log(`Error getting user: ${user.email}`, error);
      });
  }
});

// generating timeTable
generateTable();
const allTableCells = document.querySelectorAll("#timeTable td");

checkBtn.addEventListener("click", () => {
  if (timeTable.hidden) timeTable.hidden = false;
});

// modifying booked table cells
auth.onAuthStateChanged((user) => {
  if (user) {
    checkBtn.addEventListener("click", () => {
      // clearing old busy cells
      allTableCells.forEach((tableCell) => {
        tableCell.style.backgroundColor = GREEN_CELL;
        tableCell.style.pointerEvents = "auto";
      });

      // getting barber name
      let selectedBarber = getSelectedBarber();

      // Query reservations of a barber
      unsubscribe = getBarberQuery(getSelectedBarber()).onSnapshot(
        (querySnapshot) => {
          const queriedDoc = validateAndGetSingleDoc(querySnapshot);
          if (!queriedDoc) return;

          let resRefList = queriedDoc.data().reservations;
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
                if (!areDatesEqual(docDate, chosenDate)) return;

                const index = getIndexByUserDate(docDate);
                let busyCell = document.getElementById(`spot${index}`);
                busyCell.style.backgroundColor = RED_CELL;
                busyCell.style.pointerEvents = "none";
              })
              .catch((error) => {
                console.log("Error getting document:", error);
              });
          });
        }
      );
    });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

// modifying the clickable and color of cells in the table.
let previousCellClicked;
let previousBgColor;
allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("click", () => {
    // when some cell is clicked
    if (previousCellClicked) {
      previousCellClicked.style.backgroundColor = previousBgColor;
    }
    // when clicking on a different cell (not on the same one)
    if (previousCellClicked != tableCell) {
      previousCellClicked = tableCell;
      previousBgColor = tableCell.style.backgroundColor;
      tableCell.style.backgroundColor = BLUE_CELL;
      paypalWrapper.hidden = false;
    }
    //when clicking on the same cell ("turning it off")
    else {
      previousCellClicked = null;
      paypalWrapper.hidden = true;
    }
  })
);

const haircutsValueToImgId = getHaircutsValueToImgId();
let prevShownImg;

selectedHaircut.addEventListener("change", () => {
  if (prevShownImg) {
    prevShownImg.hidden = true;
  }
  const imgIdToShow = haircutsValueToImgId.get(selectedHaircut.value);
  const imgToShow = document.getElementById(imgIdToShow);
  prevShownImg = imgToShow;
  imgToShow.hidden = false;
  paypalBtnWrapper.hidden = false;
});

function addReservation() {
  const user = firebase.auth().currentUser;
  // saving the global variable to last selected
  chosenBarberIndex = barbersSelect.selectedIndex;

  if (user) {
    const noteToDb = customerNote.value;
    let customerIdToDb;
    let barberIdToDb;
    let dateToDb;

    // getting signed user info
    getUserQuery(user.email)
      .get()
      .then((querySnapshot) => {
        const queriedDoc = validateAndGetSingleDoc(querySnapshot);
        if (!queriedDoc) return;

        customerIdToDb = queriedDoc.id;
        // get date
        const chosenDate = new Date(dateInput.value);
        const chosenHour = previousCellClicked.querySelector("span").innerHTML;
        // sub(0,2) = hours, sub(3,5) = minutes
        chosenDate.setHours(chosenHour.substr(0, 2), chosenHour.substr(3, 5));
        dateToDb = firebase.firestore.Timestamp.fromDate(chosenDate);

        // getting selected barber info
        getBarberQuery(getSelectedBarber())
          .get()
          .then((barberQuerySnapshot) => {
            const barberQueriedDoc =
              validateAndGetSingleDoc(barberQuerySnapshot);
            if (!barberQueriedDoc) return;

            const barberIdToDb = barberQueriedDoc.id;
            reservationsRef
              .add({
                date: dateToDb,
                note: noteToDb,
                barberId: barberIdToDb,
                customerId: customerIdToDb,
              })
              .then((newRes) => {
                console.log("Reservation has been added with ID: ", newRes.id);

                // add new reservation to customer
                usersRef.doc(customerIdToDb).update({
                  reservations: firebase.firestore.FieldValue.arrayUnion(
                    db.doc(`/reservations/${newRes.id}`)
                  ),
                });

                // add new reservation to barber, and set barber selected to prev value
                usersRef
                  .doc(barberIdToDb)
                  .update({
                    reservations: firebase.firestore.FieldValue.arrayUnion(
                      db.doc(`/reservations/${newRes.id}`)
                    ),
                  })
                  .then(
                    () => (barbersSelect[chosenBarberIndex].selected = true)
                  );

                // sending mail to customer
                prepareAndSendMail(
                  user.email,
                  user.displayName,
                  chosenDate,
                  barberQueriedDoc.data().fullName,
                  newRes.id
                );
              });
          })
          .catch((error) => {
            console.log(`Error getting barber: ${selectedBarber}`, error);
          });
      })
      .catch((error) => {
        console.log(`Error getting user: ${user.email}`, error);
      });
  }
}

/// Paypal ///
function initPayPalButton() {
  paypal
    .Buttons({
      style: {
        shape: "pill",
        color: "silver",
        layout: "vertical",
        label: "paypal",
      },
      createOrder: function (data, actions) {
        const haircutDescription =
          selectedHaircut.options[selectedHaircut.selectedIndex].value;
        const haircutPrice =
          selectedHaircut.options[selectedHaircut.selectedIndex].getAttribute(
            "price"
          );

        return actions.order.create({
          purchase_units: [
            {
              description: haircutDescription,
              amount: {
                currency_code: "USD",
                value: haircutPrice,
              },
            },
          ],
        });
      },
      onApprove: function (data, actions) {
        return actions.order.capture().then(function (orderData) {
          // Show a success message within this page, e.g.
          paypalElement.innerHTML =
            "<h3 style='color: black;'>Thank you for your payment!</h3>" +
            "<br><h6 style='color: black;'>If you want to place another order, refresh the page</h6>";

          addReservation();
        });
      },
      onCancel: function (data, actions) {
        paypalElement.innerHTML =
          "<h3 style='color: black;'>The payment has been canceled!</h3>" +
          "<br><h6 style='color: black;'>If you want to place an order refresh the page</h6>";
      },
      onError: function (err) {
        console.log(err);
      },
    })
    .render(paypalElement);
}
initPayPalButton();
