const barberBtn = document.getElementById("barberBtn");
const customerBtn = document.getElementById("customerBtn");

auth.onAuthStateChanged((user) => {
  if (user) {
    // Database Reference
    usersRef = db.collection("users");

    usersRef
      .where("email", "==", user.email)
      .get()
      .then((querySnapshot) => {
        // if user exists
        if (querySnapshot.size == 1) {
          isBarber = querySnapshot.docs[0].data().isBarber;

          customerBtn.hidden = isBarber;
          barberBtn.hidden = !isBarber;
        }
      })
      .catch((error) => {
        console.log(`Error getting user: ${user.email}`, error);
      });
  } else {
    customerBtn.hidden = true;
    barberBtn.hidden = true;
  }
});
