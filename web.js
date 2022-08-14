const firebaseConfig = {
    apiKey: "AIzaSyC1B0x1kTEUiwIkQAnj1nzRpwrGuxL6UVE",
    authDomain: "tictactoe-46150.firebaseapp.com",
    projectId: "tictactoe-46150",
    storageBucket: "tictactoe-46150.appspot.com",
    messagingSenderId: "758617707893",
    appId: "1:758617707893:web:c3c5050c701525eeef6f3c"
  };
firebase.initializeApp(firebaseConfig);

let uuid;
let ref;

firebase.auth().signInAnonymously().catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;

    console.log(errorCode, errorMessage);
});