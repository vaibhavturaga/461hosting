// Initialize Firebase with your project configuration
firebase.initializeApp(firebaseConfig);

// Get references to the email and password input fields
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

// Function to handle user login
function login() {
  const email = emailInput.value;
  const password = passwordInput.value;

  // Use Firebase authentication to sign in the user
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // User signed in successfully
      const user = userCredential.user;
      console.log('User signed in:', user);
      // Redirect to another page or perform other actions
    })
    .catch((error) => {
      // Handle errors
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error('Login error:', errorCode, errorMessage);
      // Display the error message on the page
      errorMessage.textContent = errorMessage;
    });
}
