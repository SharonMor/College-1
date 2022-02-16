const barberBtn = document.getElementById("barberBtn");
const customerBtn = document.getElementById("customerBtn");

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
        }
      });

  } else {
    customerBtn.hidden = true;
    barberBtn.hidden = true;
  }
});
