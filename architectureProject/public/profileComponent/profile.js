const profileName = document.getElementById("profileName");
const profilePic = document.getElementById("profilePic");
const profileEmail = document.getElementById("profileEmail");
const profileIsBarber = document.getElementById("profileIsBarber");
const profilePhone = document.getElementById("profilePhone");
const reservationsList = document.getElementById("reservationsList");

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

        resList.push('<p>Futurue Reservations:</p>');
        // TODO: continue generating list
        // <dt>Reservation1 <button> Cancel </button></dt>
      });
  } else {
    // Unsubscribe when the user signs out
    unsubscribe && unsubscribe();
  }
});
