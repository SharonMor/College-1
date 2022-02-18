const profileName = document.getElementById("profileName");
const profilePic = document.getElementById("profilePic");
const profileEmail = document.getElementById("profileEmail");
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
        let userId = querySnapshot.docs[0].id;
        let userData = querySnapshot.docs[0].data();
        let isBarberName = userData.isBarber ? "Barber" : "Customer";
        profileName.innerHTML = `${userData.fullName} (${isBarberName})`;
        profilePic.src = userData.profileImg;
        profileEmail.innerHTML = userData.email;
        profilePhone.innerHTML = userData.phone;

        let resRefList = userData.reservations;
        if (resRefList.length != 0) {
          reservationsList.innerHTML = "";
        }
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

              // handling the case if reservation is created by the barber as a customer
              // so we want to show the properties of the barber
              if (docData.customerId == userId) {
                targetId = docData.barberId;
              }

              let customerRef = usersRef.doc(targetId);
              customerRef.get().then((customerDoc) => {

                // filtering out non updated reservations
                let resDbDate = docData.date;
                const currentServerDate = firebase.firestore.Timestamp.now();
                if (resDbDate < currentServerDate) {
                  return;
                }

                let customerName = customerDoc.data().fullName;
                let resDate = resDbDate.toDate().toISOString().split("T")[0];
                let resHours = resDbDate.toDate().getHours();
                let resMinutes = resDbDate.toDate().getMinutes();
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
              if (dtResElement) dtResElement.remove();
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
  if (!resId) {
    alert("No such reservation! please rewrite the correct id");
    return;
  }
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

            // sending cancellation mails
            // sending mail to barber
            barberRef.get().then((barberDoc) => {
              barberData = barberDoc.data();
              sendMail(
                barberData.email,
                barberData.fullName,
                doc.data().date.toDate(),
                doc.id
              );
            });
            // sending mail to barber
            customerRef.get().then((customerDoc) => {
              customerData = customerDoc.data();
              sendMail(
                customerData.email,
                customerData.fullName,
                doc.data().date.toDate(),
                doc.id
              );
            });
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

function sendMail(emailTo, displayName, resDate, resId) {
  let bodyToSend = `<h2>hello ${displayName}</h2>
    <h4>we would like to inform you that your reservation has been cancelled.</h4>
    <br>
    <table>
      <tr>
        <td>date:</td>
        <td>${resDate}</td>
      </tr>
      <tr>
        <td>reservation id:</td>
        <td>${resId}</td>
      </tr>
    </table>
    <h4>For more information please contact the barber.</h4>
    <br>
    <h5>details about the barber can be found in the website's booking page</h5>`;

  Email.send({
    Host: "smtp.gmail.com",
    Username: "mybarbershop17@gmail.com",
    Password: "yuval1234",
    To: emailTo,
    From: "mybarbershop17@gmail.com",
    Subject: "MyBarber reservation has been canceled",
    Body: bodyToSend,
  });
}
