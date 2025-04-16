import app from "./firebase-config";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged, // Crucial for checking login status
  signOut // If you add a logout button here or elsewhere
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
// Import Firestore functions (for user profiles)
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp // To record when user was created
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app); // Get the Firestore service instance
const googleProvider = new GoogleAuthProvider(); // Create Google Auth provider instance

// --- DOM Elements ---
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const googleLoginBtn = document.getElementById('google-login-btn');
const errorMessage = document.getElementById('error-message');
const authStatus = document.getElementById('auth-status');
function clearError() {
  errorMessage.textContent = "";
}

function displayError(message) {
  console.log("Error", message);
  errorMessage.textContent = message;
}

function redirectToApp() {
  window.location.href= 'index.html';
}

async function createUserProfile(userId, email, displayName = null) {
  const userRef = doc(db, 'users', userId);

  try {
    await setDoc(userRef, {
      uid: userId, 
      email: email,
      name: displayName, 
      location: null,
      preferredWorkouts: [],
      fitnessGoals: [],

    }, {merge: true});
    console.log("User profile created/updated for:", userId);
  } catch(error) {
    console.log("Error writing profile: ", error);
  }
}

async function checkAndCreateUserProfile(userId, email, displayName) {
  const userRef = doc(db, 'users', userId);
  try {
    const docSnap = await getDoc(userRef);
    if(!docSnap.exists()) {
      console.log("profile not found for new user, creating..." );
      await createUserProfile(userId, email, displayName);
    } else {
      console.log("user profile already exists for:", userRef);
      if(displayName&& docSnap.data().name !== displayName) {
        await setDoc(userRef, {name: displayName }, {merge: true});
        console.log("updated display name from google profile");
      }
    }
  } catch(error) {
    console.log("Error checking/creating user profile.");
  }
}

signupBtn.addEventListener('click', async() => {
  clearError();
  const email = emailInput.value;
  const password = passwordInput.value;

  if(!email || !password) {
    displayError("Please enter both email and password");
    return ;
  }

  try {
    authStatus.textContent = "Signing up...";
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("signed up: ", userCredential.user.uid);
    authStatus.textContent = "Signup Successful! Redirecting...";
    redirectToApp();
  } catch(error) {
    authStatus.textContent = "";
    displayError("Signup failed:", error.message);
  }
})

loginBtn.addEventListener('click', async () => {
  clearError();
  const email = emailInput.value;
  const password = passwordInput.value;

  if(!email || !password) {
    displayError("Please enter the email and the password");
    return ;
  }

  try {
    authStatus.textContent = "logging in...";
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log("user logged in:", user.uid);
    authStatus.textContent = "Login Successful! redirecting...";
    redirectToApp();
  } catch(error) {
    authStatus.textContent = "";
    displayError("Login Failed: ", error.message);

  }
})

googleLoginBtn.addEventListener('click', async () => {
  clearError();
  try {
    authStatus.textContent = "Connecting to Google...";
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("Google Sign in Successful: ", user.uid);
    await checkAndCreateUserProfile(user.uid, user.email, user.displayName);
    authStatus.textContent = "Google login successful! redirecting...";
    redirectToApp();
  } catch(error) {
    authStatus.textContent ="";
    displayError("Google sign in failed: ", error.message);
  }
})

onAuthStateChanged(auth, (user) => {
  if(user) {
    console.log("Auth state: loggedi In ( UID:", user.uid + ")");
    if(window.location.pathname.includes('auth.html')) {
      console.log("user already logged in, redirecting to app ...");
      redirectToApp();
    } 
  } else {
    console.log("Auth state: logged out");
    authStatus.textContent = "";
  }
})

console.log("loaded auth.js successfully");

