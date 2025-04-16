import app from './firebase-config';
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

const auth = getAuth(app);
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

console.log("Protected page script loaded");
