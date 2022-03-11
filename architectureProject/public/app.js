const barberBtn = document.getElementById("barberBtn");
const customerBtn = document.getElementById("customerBtn");
const signOutNotify = document.getElementById("signOutNotify");

auth.onAuthStateChanged((user) => {
  if (user) {
    getUserQuery(user.email).onSnapshot((querySnapshot) => {
      const queriedDoc = validateAndGetSingleDoc(querySnapshot);
      if (!queriedDoc) return;

      isBarber = queriedDoc.data().isBarber;
      barberBtn.hidden = !isBarber;
      customerBtn.hidden = false;
      signOutNotify.hidden = true;
    });
  } else {
    customerBtn.hidden = true;
    barberBtn.hidden = true;
    signOutNotify.hidden = false;
  }
});
