const whenSignedIn = document.getElementById("whenSignedIn");
const userDetails = document.getElementById("userDetails");

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in
    whenSignedIn.hidden = false;
    userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;
  } else {
    // not signed in
    whenSignedIn.hidden = true;
    userDetails.innerHTML = "";
  }
});

///// Firestore /////
const addReservation = document.getElementById("addReservationData");
const addUser = document.getElementById("addUserData");
const loadData = document.getElementById("loadData");
const thingsList = document.getElementById("thingsList");

let reservationsRef;
let unsubscribe;

// push data to DB (phone connected to mail)
auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    reservationsRef = db.collection("reservations");

    addReservation.onclick = () => {
      const { serverTimestamp } = firebase.firestore.FieldValue;

      reservationsRef.add({
        date: serverTimestamp(),
        note: "some note",
        barberId: "SomeBarberId",
        customerId: "SomeCustomerId",
      });
    };

    // // Query
    // unsubscribe = usersRef
    //   // .where('uid', '==', user.uid)
    //   // .orderBy('createdAt') // Requires a query
    //   .onSnapshot((querySnapshot) => {
    //     // Map results to an array of li elements
    //     const items = querySnapshot.docs.map((doc) => {
    //       return `<li>${doc.data().email}</li>`;
    //     });
    //     thingsList.innerHTML = items.join("");
    //   });
    // unsubscribe = reservationsRef
    //   // .where('uid', '==', user.uid)
    //   // .orderBy('createdAt') // Requires a query
    //   .onSnapshot((querySnapshot) => {
    //     // Map results to an array of li elements
    //     const items = querySnapshot.docs.map((doc) => {
    //       return `<li>${doc.data().date}</li>`;
    //     });
    //     thingsList.innerHTML = items.join("");
    //   });
  } else {
    // Unsubscribe when the user signs out
    // unsubscribe && unsubscribe();
  }
});
