

const firebaseConfig = {
  apiKey: "AIzaSyBReVUbDcMWjVgAIqDyoSeaeh6ML1JJ5cY",
  authDomain: "ece461final.firebaseapp.com",
  projectId: "ece461final",
  storageBucket: "ece461final.appspot.com",
  messagingSenderId: "755743319950",
  appId: "1:755743319950:web:27277ffb389689572666df"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
        .then((result) => {
            // This is the Google user object
            const user = result.user;
            console.log('Successfully signed in with Google:', user);

            // Redirect to registry.html
            window.location.href = 'registry.html';
        })
        .catch((error) => {
            console.error('Google Sign-In Error:', error);
        });
}