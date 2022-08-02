import { firebase } from "@react-native-firebase/auth";

export const register =
  (email, password, username, callback) => async (dispatch) => {
    // Register a new user
    firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((result) => {
        // Registration successful
        firebase.auth().onAuthStateChanged(async function (user) {
          if (user) {
            dispatch({
              type: "FETCH_USER",
              payload: user,
            });
            trackEvent(eventNames.REGISTER, {
              Time_of_the_day: new Date().toLocaleTimeString(),
              User_Id: user ? user.uid : "unknown",
            });

            // User is signed in.
            user
              .updateProfile({
                displayName: username,
              })
              .then(
                function () {
                  // Update successful.

                  usersRef.child(user.uid).update({
                    uid: user.uid,
                    email: email,
                    dateRegistered: +new Date(),
                  });

                  callback(true, user);
                },
                function (error) {
                  // An error happened.
                  callback(false, null);
                }
              );
          } else {
            callback(false, null);
            // No user is signed in.
          }
        });
      })
      .catch(function (err) {
        // update loading in register screen
        callback(false);
      });
  };

export const signIn = (email, password, callback) => async (dispatch) => {
  // Sign in existing user
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((result) => {
      firebase.auth().onAuthStateChanged(async function (user) {
        if (user) {
          dispatch({
            type: "FETCH_USER",
            payload: user,
          });

          // User is signed in.
          var snapshot = await usersRef.child(user.uid).once("value");
          var userData = snapshot.val();

          if (userData) {
            // record when the user registered and how many requests they have left
            const dateRegistered = new Date();

            usersRef.child(user.uid).update({
              dateRegistered: dateRegistered,
            });
          }

          callback(true, user);
        } else {
          // No user is signed in.
        }
      });
    })
    .catch(function (error) {
      // Handle errors
      if (error) {
        switch (error.code) {
          case "auth/invalid-email":
            alert("The specified user account email is invalid.");
            break;
          case "auth/wrong-password":
            alert("The specified user account password is incorrect.");
            break;
          case "auth/user-not-found":
            alert(
              "The specified user account does not exist. Please register if you don't have an account"
            );
            break;
          default:
            alert("Error logging user in:", error.message);
        }
        // update loading in register screen
        callback(false, null);
      } else {
        callback(false, null);
      }
    });
};

export const signOut = async () => {
  await firebase.auth().signOut();
};
