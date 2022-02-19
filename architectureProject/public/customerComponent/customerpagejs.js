const checkBtn = document.getElementById("checkBtn");
const timeTable = document.getElementById("timeTable");

const paypalWrapper = document.getElementById("smart-button-container"); //paypal buttons
const customerNote = document.getElementById("noteForBarber");

const selectedHaircut = document.getElementById("item-options");

const barbersSelect = document.getElementById("barbers");
const barberInfo = document.getElementById("barberInfo");
const barberMail = document.getElementById("barberMail");
const barberPhoneText = document.getElementById("barberPhoneText");
const barberWhatsappLink = document.getElementById("whatsappLink");
const barberSpeech = document.getElementById("barberSpeech");
const paypalElement = document.getElementById("paypal-button-container");
const paypalBtnWrapper = document.getElementById("paypalBtnWrapper");

let chosenBarberIndex;

///// Firestore /////
// pull data for barbers select
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
        if (chosenBarberIndex)
          barbersSelect[chosenBarberIndex].selected = true;
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
    usersRef = db.collection("users");

    // getting barber name
    const selectedBarber =
      barbersSelect.options[barbersSelect.selectedIndex].value;
    // getting selected barber info
    usersRef
      .where("isBarber", "==", true)
      .where("fullName", "==", selectedBarber)
      .get()
      .then((querySnapshot) => {
        const barberData = querySnapshot.docs[0].data();

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
    }
    //when clicking on the same cell ("turning it off")
    else {
      previousCellClicked = null;
      paypalWrapper.hidden = true;
    }
  })
);

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
haircutsValueToImgId.set("Pomp It Up", "pompItHair");
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
  paypalBtnWrapper.hidden = false;
});

function addReservation() {
  const user = firebase.auth().currentUser;
  // saving the global variable to last selected
  chosenBarberIndex = barbersSelect.selectedIndex;

  if (user) {
    reservationsRef = db.collection("reservations");
    usersRef = db.collection("users");

    const noteToDb = customerNote.value;
    let customerIdToDb;
    let barberIdToDb;
    let dateToDb;

    // getting signed user info
    usersRef
      .where("email", "==", user.email)
      .get()
      .then((querySnapshot) => {
        customerIdToDb = querySnapshot.docs[0].id;
        // getting barber name
        const selectedBarber =
          barbersSelect.options[barbersSelect.selectedIndex].value;

        // get date
        const chosenDate = new Date(dateInput.value);
        let chosenHour = previousCellClicked.querySelector("span").innerHTML;
        // sub(0,2) = hours, sub(3,5) = minutes
        chosenDate.setHours(chosenHour.substr(0, 2), chosenHour.substr(3, 5));
        dateToDb = firebase.firestore.Timestamp.fromDate(chosenDate);

        // getting selected barber info
        usersRef
          .where("isBarber", "==", true)
          .where("fullName", "==", selectedBarber)
          .get()
          .then((barberQuerySnapshot) => {
            const barberData = barberQuerySnapshot.docs[0];
            const barberIdToDb = barberData.id;

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

                // sending mail
                const user = auth.currentUser;
                const haircutDescription =
                  selectedHaircut.options[selectedHaircut.selectedIndex].value;
                const haircutPrice =
                  selectedHaircut.options[
                    selectedHaircut.selectedIndex
                  ].getAttribute("price");
                let bodyToSend = `<h2>hello ${user.displayName}</h2>
                <h4>your reservation has been approved.</h4>
                <br>
                <table>
                  <tr>
                    <td>date:</td>
                    <td>${chosenDate}</td>
                  </tr>
                  <tr>
                    <td>barber name:</td>
                    <td>${barberData.data().fullName}</td>
                  </tr>
                  <tr>
                    <td>note for barber:</td>
                    <td>${noteToDb}</td>
                  </tr>
                  <tr>
                    <td>haircut style:</td>
                    <td>${haircutDescription}</td>
                  </tr>
                  <tr>
                    <td>price:</td>
                    <td>${haircutPrice}</td>
                  </tr>
                  <tr>
                    <td>reservation id:</td>
                    <td>${newRes.id}</td>
                  </tr>
                </table>`;

                Email.send({
                  Host: "smtp.gmail.com",
                  Username: "mybarbershopproject@gmail.com",
                  Password: "Project123",
                  To: user.email,
                  From: "mybarbershopproject@gmail.com",
                  Subject: "MyBarber reservation is approved",
                  Body: bodyToSend,
                })
                  .then(() => console.log("mail sent successfully"))
                  .catch((error) => console.log(`Error sending mail ${error}`));
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
