const profileName = document.getElementById("profileName");
const profilePic = document.getElementById("profilePic");
const profileEmail = document.getElementById("profileEmail");
const profileIsBarber = document.getElementById("profileIsBarber");
const profilePhone = document.getElementById("profilePhone");
const reservationsList = document.getElementById("reservationsList");
const resInputId = document.getElementById("resInputId");
const cancelBtn = document.getElementById("cancelBtn");

let unsubscribe;
auth.onAuthStateChanged((user) => {
  if (user) {
    let usersRef = db.collection("users");
    let resList = [];

    unsubscribe = usersRef
      .where("email", "==", user.email)
      .onSnapshot((querySnapshot) => {
        let userData = querySnapshot.docs[0].data();
        profileName.innerHTML = userData.fullName;
        profilePic.src = userData.profileImg;
        profileEmail.innerHTML = userData.email;
        profileIsBarber.checked = userData.isBarber;
        profilePhone.innerHTML = userData.phone;

        reservationsList.innerHTML = "";
        let resRefList = querySnapshot.docs[0].data().reservations;
        resRefList.forEach((resRef) => {
          // will be reservations = "reservations"
          let reservations = resRef.parent.id;
          let resId = resRef.id;

          // resDoc holds the actual doc in db
          let resDoc = db.collection(reservations).doc(resId);
          resDoc.onSnapshot((doc) => {
            if (doc.exists) {
              let docData = doc.data();
              // could be customer/barber
              let targetId = userData.isBarber
                ? docData.customerId
                : docData.barberId;
              let customerRef = usersRef.doc(targetId);
              customerRef.get().then((customerDoc) => {
                let customerName = customerDoc.data().fullName;
                let resDate = docData.date.toDate().toISOString().split("T")[0];
                let resHours = docData.date.toDate().getHours();
                let resMinutes = docData.date.toDate().getMinutes();
                resMinutes = resMinutes == 0 ? "00" : resMinutes;
                let resHtml =
                  `<tr id=${doc.id}>` +
                  `<td><span class="resName">${customerName}</span></td>` +
                  `<td><span class="resDate">${resDate}, ${resHours}:${resMinutes}</span></td>` +
                  `<td><span class="resId">id: ${doc.id}</span></td></tr>`;

                let dtResElement = document.getElementById(doc.id);
                if (dtResElement) {
                  dtResElement.outerHTML = resHtml;
                } else {
                  reservationsList.innerHTML += resHtml;
                }
              });
            } else {
              console.log(`reservation ${doc.id} has been deleted!`);
              // removing element from DOM
              let dtResElement = document.getElementById(doc.id);
              if (dtResElement)
                dtResElement.remove();
            }
          });
        });
      });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});

// adding event listener to cancel
cancelBtn.addEventListener("click", () => {
  let resId = resInputId.value;
  let resRef = db.collection("reservations").doc(resId);
  let usersRef = db.collection("users");

  resRef
    .get()
    .then((doc) => {
      if (doc.exists) {
        const barberId = doc.data().barberId;
        const customerId = doc.data().customerId;
        const resToDelete = db.doc(`/reservations/${doc.id}`);

        const customerRef = usersRef.doc(customerId);
        const barberRef = usersRef.doc(barberId);
        // deleting res from customer
        customerRef.update({
          reservations: firebase.firestore.FieldValue.arrayRemove(resToDelete),
        });
        // deleting res from barber
        barberRef.update({
          reservations: firebase.firestore.FieldValue.arrayRemove(resToDelete),
        });
        // deleting res from reservations
        resRef
          .delete()
          .then(() => {
            alert(`Reservation ${doc.id} successfully deleted!`);
          })
          .catch((error) => {
            console.error("Error removing reservation: ", error);
          });
      } else {
        alert("No such reservation! please rewrite the correct id");
      }
    })
    .catch((error) => {
      console.log("Error getting document:", error);
    });

  console.log();
});
