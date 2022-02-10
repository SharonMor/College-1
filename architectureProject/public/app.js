///// User Authentication /////
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();

const whenSignedIn = document.getElementById("whenSignedIn");

const signInGoogleBtn = document.getElementById("googleSignInBtn");
const navSignOutBtn = document.getElementById("navSignOutBtn");

const dialog = document.getElementById("signUpDialog");
const xDialog = document.getElementById("xDialog");
const cancelDialogBtn = document.getElementById("cancelDialogBtn");

const userDetails = document.getElementById("userDetails");
const navSignUpBtn = document.getElementById("navSignUpBtn");
const userName = document.getElementById("userName");

const phoneNumber = document.getElementById("phone");
const freeText = document.getElementById("freeText");
const barberToggle = document.getElementById("barberToggle");

signInGoogleBtn.disabled = true;
freeText.hidden = true;

/// Sign in event handlers
// TODO: consider change to signInWithReDirect
signInGoogleBtn.addEventListener("click", () => {
  auth.signInWithPopup(provider);
  // auth.signInWithRedirect(provider);
});

navSignOutBtn.addEventListener("click", () => {
  auth.signOut();
  dialog.hidden = true;
});

navSignUpBtn.onclick = () => (dialog.hidden = false);
xDialog.onclick = () => (dialog.hidden = true);
cancelDialogBtn.onclick = () => (dialog.hidden = true);

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in
    whenSignedIn.hidden = false;
    userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;

    // close signup dialog and display off signup-btn
    dialog.hidden = true;
    navSignUpBtn.hidden = true;
    navSignOutBtn.hidden = false;

    userName.innerHTML = user.displayName;
  } else {
    // not signed in
    whenSignedIn.hidden = true;
    userDetails.innerHTML = "";

    dialog.hidden = true;
    navSignUpBtn.hidden = false;
    navSignOutBtn.hidden = true;
    userName.innerHTML = "";
  }
});

///// Firestore /////
const db = firebase.firestore();

const addReservation = document.getElementById("addReservationData");
const addUser = document.getElementById("addUserData");
const loadData = document.getElementById("loadData");
const thingsList = document.getElementById("thingsList");

let usersRef;
let reservationsRef;
let unsubscribe;

// push data to DB (phone connected to mail)
auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    usersRef = db.collection("data");
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

    addUserIfNotExist(user);
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

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == dialog) {
    dialog.hidden = true;
  }
};

barberToggle.addEventListener("change", () =>
  freeText.hidden = barberToggle.checked ? false : true);

phoneNumber.addEventListener("input", () => {
  const phoneRegex = new RegExp("[0-9]{3}-[0-9]{7}");
  const match = phoneNumber.value.match(phoneRegex);

  signInGoogleBtn.disabled = !(match && phoneNumber.value === match[0]);
});

function addUserIfNotExist(user) {
  usersRef = db.collection("data");

  usersRef
    .where("email", "==", user.email)
    .get()
    .then((querySnapshot) => {
      let aboutMeText = barberToggle.checked ? freeText.value : "";

      // if user isn't exists -> adding new user
      if (querySnapshot.size == 0) {
        console.log(`adding ${user.email} to FireStore`);
        usersRef.add({
          isBarber: barberToggle.checked,
          aboutMe: aboutMeText,
          email: user.email,
          fullName: user.displayName,
          phone: phoneNumber.value,
          reservations: [],
        });
      }
    })
    .catch((error) => {
      console.log(`Error getting user: ${user.email}`, error);
    });
}
