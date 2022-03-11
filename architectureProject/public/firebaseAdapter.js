const usersRef = db.collection("users");
const reservationsRef = db.collection("reservations");

///^ Getters ^///
/**
 * @param {String} userId
 * @returns {Promise} Promise of get user in db
 */
function getUser(userId) {
  return new Promise((resolve, reject) => {
    usersRef
      .doc(userId)
      .get()
      .then((doc) => {
        if (doc.exists) resolve(doc);
        else reject("user document doesn't exists");
      })
      .catch((error) => reject(error));
  });
}

const getUserQuery = (email) => usersRef.where("email", "==", email);
const barbersQuery = usersRef.where("isBarber", "==", true);
const getBarberQuery = (name) => barbersQuery.where("fullName", "==", name);

/**
 * checks weather there is only one doc in the given querySnapshot.
 * @param {QuerySnapshot} querySnapshot 
 * @returns the first doc if exists, else null.
 */
function validateAndGetSingleDoc(querySnapshot) {
  const queriedDoc = querySnapshot.docs[0];
  if (_isSingleResult && queriedDoc.exists) return queriedDoc;

  return null;
}

function _isSingleResult(querySnapshot) {
  switch (querySnapshot.size) {
    case 1:
      return true;
    case 0:
      console.error("Error: Trying to fetch data on user that isn't exist");
    default:
      console.error(
        "Error: Trying to fetch data on user," +
          "but there is multiple users with the same name." +
          "\n please contact the managers"
      );
  }
  return false;
}

function snapshotUser(isBarber, email) {}

/**
 * @param {String} resId - the id of reservation to be fetched
 *
 * @returns {Promise} Promise of fetched reservation.
 */
function getReservation(resId) {
  return new Promise((resolve, reject) => {
    reservationsRef
      .doc(resId)
      .get()
      .then((doc) => {
        if (doc.exists) resolve(doc);
        else reject("reservation document doesn't exists");
      })
      .catch((error) => reject(error));
  });
}

function snapshotReservations() {}

///^ Setters / Updates / Deletes ^///

/**
 * @param {String} userId - the id of user to remove from
 * @param {String} reservationId - the id of reservation to be removed
 *
 * @returns {Promise} Promise of remove action
 */
function removeUserReservation(userId, reservationId) {
  const resPrefix = "/reservations/";
  const resToDelete = db.doc(resPrefix + reservationId);
  const userToRemoveFromRef = usersRef.doc(userId);
  // deleting res from user
  return new Promise((resolve, reject) => {
    userToRemoveFromRef
      .update({
        reservations: firebase.firestore.FieldValue.arrayRemove(resToDelete),
      })
      .then(() => resolve())
      .catch(() => reject());
  });
}

/**
 * remove a reservation from db (from connected users, and reservations collection)
 * @param {String} id1 - id of first connected user
 * @param {String} id2 - id of second connected user
 * @param {String} resId - id of reservation to be deleted
 *
 * @returns {Promise} Promise of remove action
 */
function removeReservation(id1, id2, resId) {
  return new Promise((resolve, reject) => {
    removeUserReservation(id1, resId)
      .then(() => removeUserReservation(id2, resId))
      .then(() => reservationsRef.doc(resId).delete())
      .then(() => resolve())
      .catch(() => reject());
  });
}
