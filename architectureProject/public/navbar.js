const signInGoogleBtn = document.getElementById("googleSignInBtn");
const continueDialogBtn = document.getElementById("continueDialogBtn");
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

continueDialogBtn.disabled = true;
freeText.hidden = true;
const avatarOriginSrc = avatar.src;

///// User Authentication /////
/// Sign in event handlers
navSignUpBtn.addEventListener("click", () => {
  auth.signInWithPopup(provider);
});

navSignOutBtn.addEventListener("click", () => {
  const signOutPromise = auth.signOut();
  const homeLocation = `${window.location.origin}/index.html`;

  signOutPromise
    .then((onSignedOut) => {
      window.location.href = homeLocation;
    })
    .catch((error) => console.log(`Error signing out: ${error}`));
});

xDialog.onclick = () => clearUser();
cancelDialogBtn.onclick = () => clearUser();

auth.onAuthStateChanged((user) => {
  if (user) {
    // signed in
    // open signup dialog if user isn't registered
    getUserQuery(user.email)
      .get()
      .then((querySnapshot) => {
        // if user isn't exists -> adding new user
        if (querySnapshot.size == 0) {
          dialog.hidden = false;

          continueDialogBtn.onclick = () => addUserIfNotExist(user);
        }
      })
      .catch((error) => {
        console.log(`Error getting user: ${user.email}`, error);
      });

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

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == dialog) clearUser();
};

barberToggle.addEventListener(
  "change",
  () => (freeText.hidden = barberToggle.checked ? false : true)
);

phoneNumber.addEventListener("input", () => {
  const phoneRegex = new RegExp("^05[0-9]{8}");
  const match = phoneNumber.value.match(phoneRegex);

  continueDialogBtn.disabled = !(match && phoneNumber.value === match[0]);
});

function addUserIfNotExist(user) {
  getUserQuery(user.email)
    .get()
    .then((querySnapshot) => {
      const aboutMeText = barberToggle.checked ? freeText.value : "";

      // if user isn't exists -> adding new user
      if (querySnapshot.size == 0) {
        console.log(`adding ${user.email} to FireStore`);
        usersRef
          .add({
            isBarber: barberToggle.checked,
            aboutMe: aboutMeText,
            email: user.email,
            fullName: user.displayName,
            profileImg: user.photoURL,
            phone: phoneNumber.value,
            reservations: [],
          })
          .then(() => (dialog.hidden = true));
      }
    })
    .catch((error) => {
      console.log(`Error getting user: ${user.email}`, error);
    });
}

auth.onAuthStateChanged((user) => {
  if (user) avatar.addEventListener("click", redirectToProfile);
});

function redirectToProfile() {
  const profileLocation = `${window.location.origin}/profileComponent/profile.html`;

  window.location.href = profileLocation;
}

function clearUser() {
  dialog.hidden = true;
  avatar.src = avatarOriginSrc;
  auth.signOut();
  avatar.removeEventListener("click", redirectToProfile);
}
