const dateInput = document.getElementById("dateInput");
const checkBtn = document.getElementById("checkBtn");
const delayBtn = document.getElementById("delayBtn");
const delayContainer = document.getElementById("delayContainer");
const table = document.getElementById("timeTable");

checkBtn.addEventListener("click", () => {
  if (table.hidden) {
    table.hidden = false;
    delayContainer.hidden = false;
  }
});

// setting date fixed times
const nextYearDate = getNextYearDate(new Date());
const currentParsedDate = new Date().toISOString().split("T")[0];
const nextYearParsedDate = nextYearDate.toISOString().split("T")[0];

dateInput.value = currentParsedDate;
dateInput.min = currentParsedDate;
dateInput.max = nextYearParsedDate;

// hiding the table when data changes
dateInput.addEventListener("change", () => {
  timeTable.hidden = true;
  delayContainer.hidden = true;
  delayBtn.disabled = true;
});

// generate timeTable
generateTable(true);

const allTableCells = document.querySelectorAll("#timeTable td");
const tableCellIdToResId = new Map();

// modifying booked table cells, user is a barber of course
auth.onAuthStateChanged((user) => {
  if (user) {
    checkBtn.addEventListener("click", () => {
      // clearing old busy cells
      allTableCells.forEach((tableCell) => {
        tableCell.style.backgroundColor = GREEN_CELL; // green
        tableCell.style.pointerEvents = "none";
      });

      // Query reservations of a barber
      unsubscribe = getUserQuery(user.email).onSnapshot((querySnapshot) => {
        const queriedDoc = validateAndGetSingleDoc(querySnapshot);
        if (!queriedDoc) return;

        // resting map
        tableCellIdToResId.clear();
        const resRefList = queriedDoc.data().reservations;
        const barberId = queriedDoc.id;
        resRefList.forEach((resRef) => {
          // will be reservations = "reservations"
          const reservations = resRef.parent.id;
          const resId = resRef.id;

          // resDoc holds the actual doc in db
          const resDoc = db.collection(reservations).doc(resId);
          resDoc.onSnapshot((doc) => {
            const docData = doc.data();
            const docDate = docData.date.toDate();
            const chosenDate = new Date(dateInput.value);

            // filter out reservation that is created by the barber as a customer
            // and filtering out date != today
            if (
              docData.customerId == barberId ||
              !areDatesEqual(docDate, chosenDate)
            )
              return;

            const index = getIndexByUserDate(docDate)
            const busyCell = document.getElementById(`spot${index}`);
            busyCell.style.backgroundColor = RED_CELL;
            busyCell.style.pointerEvents = "auto";
            busyCell.title = docData.note;
            tableCellIdToResId.set(`spot${index}`, resId);

            // change name to the appropriate customer user.
            const busyCellName = document.getElementById(`spot${index}name`);
            getUser(docData.customerId).then(
              (customerDoc) =>
                (busyCellName.innerHTML = customerDoc.data().fullName)
            );
          });
        });
      });
    });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

// hide name and show time on mouseOver in table cells
allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("mouseover", () => {
    let tableCellSpan = tableCell.querySelector(".name_span");
    tableCellSpan.style.visibility = "visible";
    tableCellSpan = tableCell.querySelector(".time_span");
    tableCellSpan.style.visibility = "hidden";
  })
);

// show times and hide names on mouseOver in table cells
allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("mouseout", () => {
    let tableCellSpan = tableCell.querySelector(".name_span");
    tableCellSpan.style.visibility = "hidden";
    tableCellSpan = tableCell.querySelector(".time_span");
    tableCellSpan.style.visibility = "visible";
  })
);

let previousCellClicked;
let previousBgColor;
allTableCells.forEach((tableCell) =>
  tableCell.addEventListener("click", () => {
    if (previousCellClicked) {
      previousCellClicked.style.backgroundColor = previousBgColor;
    }
    // when clicking on a different cell (not on the same one)
    if (previousCellClicked != tableCell) {
      previousCellClicked = tableCell;
      previousBgColor = tableCell.style.backgroundColor;
      tableCell.style.backgroundColor = BLUE_CELL;
      delayBtn.disabled = false;
    }
    // when clicking on the same cell ("turning it off")
    else {
      previousCellClicked = null;
      delayBtn.disabled = true;
    }
  })
);

// handle delay haircut
auth.onAuthStateChanged((user) => {
  if (user) {
    delayBtn.addEventListener("click", () => {
      const cellId = previousCellClicked.id;

      if (!isCellDelayable(cellId)) {
        alert(
          "Warning! you can't delay selected time\n" +
            "selected time may be last hour OR the next time slot is taken"
        );
        return;
      }

      const resId = tableCellIdToResId.get(cellId);
      const resRef = reservationsRef.doc(resId);

      getReservation(resId)
        .then((doc) => {
          const targetCustomerId = doc.data().customerId;
          const docDate = doc.data().date.toDate();
          // delay in 30 min
          const halfAnHourInSec = 30 * 60000;
          const delayedDate = new Date(docDate.getTime() + halfAnHourInSec);
          resRef
            .update({ date: delayedDate })
            // updating map
            .then(() => tableCellIdToResId.delete(cellId))
            .then(() => {
              // sending mail
              getUser(targetCustomerId).then((targetDoc) => {
                const targetName = targetDoc.data().fullName;
                const targetEmail = targetDoc.data().email;

                prepareAndSendMail(
                  targetEmail,
                  targetName,
                  docDate,
                  delayedDate,
                  resId
                );
              });
            })
            .catch((error) => {
              // The document probably doesn't exist.
              console.error("Error updating document: ", error);
            });
        })
        // resting chosen cell table
        .then(() => {
          previousCellClicked.style.backgroundColor = GREEN_CELL;
          previousCellClicked.style.pointerEvents = "none";
          previousCellClicked = null;
          delayBtn.disabled = true;
        })
        .catch((error) => {
          console.log("Error getting/updating document:", error);
        });
    });
  }
});
