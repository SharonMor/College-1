///// User Authentication /////

const auth = firebase.auth();

const whenSignedIn = document.getElementById('whenSignedIn');
const whenSignedOut = document.getElementById('whenSignedOut');

const signInBtn = document.getElementById('signInBtn');
const signOutBtn = document.getElementById('signOutBtn');

// Get the modal
const modal = document.getElementById('signUpDialog');

const userDetails = document.getElementById('userDetails');
const userSignBar = document.getElementById('signInOut');
const userNameBar = document.getElementById('userNameBar');

const provider = new firebase.auth.GoogleAuthProvider();

/// Sign in event handlers

signInBtn.onclick = () => auth.signInWithPopup(provider);

signOutBtn.onclick = () => auth.signOut();


// TODO: fix sign-in/out on bar
// push data to DB (phone connected to mail)

auth.onAuthStateChanged(user => {
    if (user) {
        // signed in
        whenSignedIn.hidden = false;
        whenSignedOut.hidden = true;
        userDetails.innerHTML = `<h3>Hello ${user.displayName}!</h3> <p>User ID: ${user.uid}</p>`;

        // close signup dialog and display off signup-btn
        modal.style.display= 'none';
        signUpBtn.style.display = 'none';
        
        userSignBar.innerHTML = 'Sign Out';
        userNameBar.style.display = 'show';
        userNameBar.innerHTML = user.displayName;
    } else {
        // not signed in
        whenSignedIn.hidden = true;
        whenSignedOut.hidden = false;
        userDetails.innerHTML = '';

        modal.style.display = 'show';
        signUpBtn.style.display = 'show';
        userSignBar.innerHTML = 'Sign In';
        userNameBar.style.display = 'none';
    }
});


///// Firestore /////

const db = firebase.firestore();

const createThing = document.getElementById('createThing');
const thingsList = document.getElementById('thingsList');


let thingsRef;
let unsubscribe;

auth.onAuthStateChanged(user => {

    if (user) {

        // Database Reference
        thingsRef = db.collection('things')

        createThing.onclick = () => {
            const { serverTimestamp } = firebase.firestore.FieldValue;

            thingsRef.add({
                uid: user.uid,
                name: faker.commerce.productName(),
                createdAt: serverTimestamp()
            });
        }


        // Query
        unsubscribe = thingsRef
            .where('uid', '==', user.uid)
            .orderBy('createdAt') // Requires a query
            .onSnapshot(querySnapshot => {
                
                // Map results to an array of li elements

                const items = querySnapshot.docs.map(doc => {

                    return `<li>${doc.data().name}</li>`

                });

                thingsList.innerHTML = items.join('');

            });



    } else {
        // Unsubscribe when the user signs out
        unsubscribe && unsubscribe();
    }
});

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

signInBtn.disabled = true;
const phoneNumber = document.getElementById('phone');

phoneNumber.addEventListener('input', () => {
    const phoneRegex = new RegExp('[0-9]{3}-[0-9]{7}');
    const match = phoneNumber.value.match(phoneRegex);

    document.getElementById('signInBtn').disabled = !(match && phoneNumber.value === match[0]);
});