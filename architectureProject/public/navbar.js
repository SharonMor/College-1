const signInGoogleBtn = document.getElementById("googleSignInBtn");
const navSignOutBtn = document.getElementById("navSignOutBtn");
const avatar = document.getElementById("avatar");

const dialog = document.getElementById("signUpDialog");
const xDialog = document.getElementById("xDialog");
const cancelDialogBtn = document.getElementById("cancelDialogBtn");

const navSignUpBtn = document.getElementById("navSignUpBtn");
const userName = document.getElementById("userName");

const phoneNumber = document.getElementById("phone");
const freeText = document.getElementById("freeText");
const barberToggle = document.getElementById("barberToggle");

signInGoogleBtn.disabled = true;
freeText.hidden = true;

///// User Authentication /////
/// Sign in event handlers
// TODO: consider change to signInWithReDirect
signInGoogleBtn.addEventListener("click", () => {
  auth.signInWithPopup(provider);
  // auth.signInWithRedirect(provider);
});

navSignOutBtn.addEventListener("click", () => {
  let signOutPromise = auth.signOut();
  let homeLocation = `${window.location.origin}/index.html`;

  signOutPromise
    .then((onSignedOut) => {
      window.location.href = homeLocation;
    })
    .catch((error) => console.log(`Error signing out: ${error}`));
});

navSignUpBtn.onclick = () => (dialog.hidden = false);
xDialog.onclick = () => (dialog.hidden = true);
cancelDialogBtn.onclick = () => (dialog.hidden = true);

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in
    // close signup dialog and display off signup-btn
    dialog.hidden = true;
    navSignUpBtn.hidden = true;
    navSignOutBtn.hidden = false;

    userName.innerHTML = user.displayName;
    avatar.src = user.photoURL;
  } else {
    // not signed in
    dialog.hidden = true;
    navSignUpBtn.hidden = false;
    navSignOutBtn.hidden = true;
    userName.innerHTML = "";
  }
});

let usersRef;

// push data to DB (phone connected to mail)
auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    usersRef = db.collection("users");
    addUserIfNotExist(user);
  }
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == dialog) {
    dialog.hidden = true;
  }
};

barberToggle.addEventListener(
  "change",
  () => (freeText.hidden = barberToggle.checked ? false : true)
);

phoneNumber.addEventListener("input", () => {
  const phoneRegex = new RegExp("[0-9]{3}-[0-9]{7}");
  const match = phoneNumber.value.match(phoneRegex);

  signInGoogleBtn.disabled = !(match && phoneNumber.value === match[0]);
});

function addUserIfNotExist(user) {
  usersRef = db.collection("users");

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
          profileImg: user.photoURL,
          phone: phoneNumber.value,
          reservations: [],
        });
      }
    })
    .catch((error) => {
      console.log(`Error getting user: ${user.email}`, error);
    });
}

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in
    avatar.addEventListener("click", () => {
      let profileLocation = `${window.location.origin}/profileComponent/profile.html`;

      window.location.href = profileLocation;
    });
  }
});
