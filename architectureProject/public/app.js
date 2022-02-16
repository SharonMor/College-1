const barberBtn = document.getElementById("barberBtn");
const customerBtn = document.getElementById("customerBtn");
const signOutNotify = document.getElementById("signOutNotify");

auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    usersRef = db.collection("users");

    usersRef
      .where("email", "==", user.email)
      .onSnapshot((querySnapshot) => {
        // if user exists
        if (querySnapshot.size == 1) {
          isBarber = querySnapshot.docs[0].data().isBarber;

          barberBtn.hidden = !isBarber;
          customerBtn.hidden = false;
          signOutNotify.hidden = true;
        }
      });

  } else {
    customerBtn.hidden = true;
    barberBtn.hidden = true;
    signOutNotify.hidden = false;
  }
});
