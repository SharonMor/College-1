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
    // Database Reference
    usersRef = db.collection("users");

    checkBtn.addEventListener("click", () => {
      // clearing old busy cells
      allTableCells.forEach((tableCell) => {
        tableCell.style.backgroundColor = "rgba(94, 121, 49, 0.904)"; // green
        tableCell.style.pointerEvents = "none";
      });

      // Query reservations of a barber
      unsubscribe = usersRef
        .where("isBarber", "==", true)
        .where("email", "==", user.email)
        .onSnapshot((querySnapshot) => {
          // resting map
          tableCellIdToResId.clear();
          if (querySnapshot.size == 1) {
            let resRefList = querySnapshot.docs[0].data().reservations;
            resRefList.forEach((resRef) => {
              // will be reservations = "reservations"
              let reservations = resRef.parent.id;
              let resId = resRef.id;

              // resDoc holds the actual doc in db
              let resDoc = db.collection(reservations).doc(resId);
              resDoc.onSnapshot((doc) => {
                let docData = doc.data();
                let customerNote = docData.note;

                // filtering only current day
                let docDate = docData.date.toDate();
                let chosenDate = new Date(dateInput.value);
                if (areDatesEqual(docDate, chosenDate)) {
                  // converting time (e.g 8:30 --> 8.5)
                  let hourNum = docDate.getHours();
                  hourNum += docDate.getMinutes() == 0 ? 0 : 0.5;
                  const index = getIndexByHour(hourNum);
                  let busyCell = document.getElementById(`spot${index}`);
                  busyCell.style.backgroundColor = "#ffb6c1";
                  busyCell.style.pointerEvents = "auto";
                  busyCell.title = customerNote;
                  tableCellIdToResId.set(`spot${index}`, resId);

                  // change name to the appropriate customer user.
                  let busyCellName = document.getElementById(
                    `spot${index}name`
                  );
                  let customerRef = usersRef.doc(docData.customerId);
                  customerRef.get().then((customerDoc) => {
                    let customerName = customerDoc.data().fullName;
                    busyCellName.innerHTML = customerName;
                    console.log("customerName is: ", customerName);
                  });

                  console.log("index is: ", index);
                  console.log(docDate.getHours(), docDate.getMinutes());
                }
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
      tableCell.style.backgroundColor = "rgb(50, 158, 231)"; //blue
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
    // Database Reference
    reservationsRef = db.collection("reservations");

    delayBtn.addEventListener("click", () => {
      let cellId = previousCellClicked.id;
      let resId = tableCellIdToResId.get(cellId);
      let resRef = reservationsRef.doc(resId);

      resRef
        .get()
        .then((doc) => {
          let docDate = doc.data().date.toDate();
          // delay in 30 min
          let halfAnHourInSec = 30 * 60000;
          let delayedDate = new Date(docDate.getTime() + halfAnHourInSec);
          resRef.update({ date: delayedDate });

          // resting chosen cell table
          previousCellClicked.style.backgroundColor =
            "rgba(94, 121, 49, 0.904)"; // green
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

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseover", () => {
//     previousSpotHover=tableCell.innerHTML;
//     tableCell.innerHTML='Ronen, Regular';
// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseout", () => {
//     tableCell.innerHTML=previousSpotHover;

// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("click", () => {
//     console.log(tableCell.innerHTML);
//     if(previousCellClicked){
//         previousCellClicked.style.backgroundColor = "rgba(85, 107, 47, 0.904)";
//     }

//     if(previousCellClicked!=tableCell){
//         previousCellClicked=tableCell;
//         tableCell.style.backgroundColor = "rgb(50, 158, 231)";
//     }
//     else{
//         previousCellClicked=null;
//     }
// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseover", () => {
//     previousSpotHover=tableCell.innerHTML;
//     tableCell.innerHTML='Ronen, Regular';
// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("mouseout", () => {
//     tableCell.innerHTML=previousSpotHover;

// },false));

// document.querySelectorAll('#timeTable td')
// .forEach(tableCell => tableCell.addEventListener("click", () => {
//     console.log(tableCell.innerHTML);
//     if(previousCellClicked){
//         previousCellClicked.style.backgroundColor = "rgba(85, 107, 47, 0.904)";
//     }

//     if(previousCellClicked!=tableCell){
//         previousCellClicked=tableCell;
//         tableCell.style.backgroundColor = "rgb(50, 158, 231)";
//     }
//     else{
//         previousCellClicked=null;
//     }
// },false));
