
// Firebase configuration - Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAK2rLIcEm4ZIUodPWhyQwzwTVJM2wZWzo",
authDomain: "fitness-buddy-e44f7.firebaseapp.com",
projectId: "fitness-buddy-e44f7",
storageBucket: "fitness-buddy-e44f7.firebasestorage.app",
messagingSenderId: "750411075422",
appId: "1:750411075422:web:2ef218847e9c9fe74e09cf",
measurementId: "G-VE18CRGTZV"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Toggle between sign up and login forms
const signupTab = document.getElementById('signup-tab');
const loginTab = document.getElementById('login-tab');
const signupFormContainer = document.getElementById('signup-form-container');
const loginFormContainer = document.getElementById('login-form-container');
const toLoginLink = document.getElementById('to-login');
const toSignupLink = document.getElementById('to-signup');

// Function to show signup form
function showSignup() {
    loginTab.classList.remove('active');
    signupTab.classList.add('active');
    loginFormContainer.classList.remove('active');
    signupFormContainer.classList.add('active');
    clearErrorMessages();
}

// Function to show login form
function showLogin() {
    signupTab.classList.remove('active');
    loginTab.classList.add('active');
    signupFormContainer.classList.remove('active');
    loginFormContainer.classList.add('active');
    clearErrorMessages();
}

// Clear all error messages
function clearErrorMessages() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.style.display = 'none';
        el.textContent = '';
    });
}

// Show error message for a specific field
function showError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + '-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

// Toggle password visibility
function togglePassword(inputId) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
    } else {
        passwordInput.type = 'password';
    }
}

// Show loading spinner
function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(buttonId.replace('btn', 'spinner'));
    button.disabled = true;
    spinner.style.display = 'inline-block';
}

// Hide loading spinner
function hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(buttonId.replace('btn', 'spinner'));
    button.disabled = false;
    spinner.style.display = 'none';
}

// Event listeners
signupTab.addEventListener('click', showSignup);
loginTab.addEventListener('click', showLogin);
toLoginLink.addEventListener('click', showLogin);
toSignupLink.addEventListener('click', showSignup);

// Sign up with email and password
document.getElementById('signup-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrorMessages();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;

    // Client-side validation
    if (password !== confirmPassword) {
        showError('signup-confirm', 'Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('signup-password', 'Password must be at least 6 characters');
        return;
    }

    showLoading('signup-btn');

    try {
        // Create user with Firebase
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with display name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        alert(`Account created successfully for ${name}! You will be redirected to the dashboard.`);
        this.reset();
        
        // Redirect to dashboard or home page after successful signup
//window.location.href = 'Dash.html'; 
    } catch (error) {
        hideLoading('signup-btn');
        console.error('Signup error:', error);
        
        // Handle specific Firebase errors
        switch (error.code) {
            case 'auth/email-already-in-use':
                showError('signup-email', 'This email is already in use');
                break;
            case 'auth/invalid-email':
                showError('signup-email', 'Please enter a valid email address');
                break;
            case 'auth/weak-password':
                showError('signup-password', 'Password should be at least 6 characters');
                break;
            default:
                showError('signup-email', 'An error occurred. Please try again.');
                break;
        }
    }
});

// Login with email and password
document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    clearErrorMessages();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    showLoading('login-btn');

    try {
        // Sign in with Firebase
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        alert(`Welcome back, ${user.displayName || user.email}! You will be redirected to the dashboard.`);
        this.reset();
        
        // Redirect to dashboard or home page after successful login
    window.location.href = 'Dash.html';
    } catch (error) {
        hideLoading('login-btn');
        console.error('Login error:', error);
        
        // Handle specific Firebase errors
        switch (error.code) {
            case 'auth/user-not-found':
                showError('login-email', 'No account found with this email');
                break;
            case 'auth/wrong-password':
                showError('login-password', 'Incorrect password');
                break;
            case 'auth/invalid-email':
                showError('login-email', 'Please enter a valid email address');
                break;
            case 'auth/user-disabled':
                showError('login-email', 'This account has been disabled');
                break;
            default:
                showError('login-email', 'An error occurred. Please try again.');
                break;
        }
    }
});

// Password reset
document.getElementById('reset-password-link').addEventListener('click', async function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    
    if (!email) {
        alert('Please enter your email address first');
        return;
    }
    
    try {
        await auth.sendPasswordResetEmail(email);
        alert('Password reset email sent. Please check your inbox.');
    } catch (error) {
        console.error('Password reset error:', error);
        alert('Error sending password reset email. Please try again.');
    }
});

// Google authentication
// function setupGoogleAuth(buttonId, isSignup = false) {
//     const provider = new firebase.auth.GoogleAuthProvider();
//     document.getElementById(buttonId).addEventListener('click', async function() {
//         try {
//             const result = await auth.signInWithPopup(provider);
//             const user = result.user;
            
//             alert(`Welcome ${user.displayName}! You will be redirected to the dashboard.`);
            
//             // Redirect to dashboard or home page after successful authentication
//             window.location.href = 'Dash.html';
//         } catch (error) {
//             console.error('Google auth error:', error);
//             alert('Error authenticating with Google. Please try again.');
//         }
//     });
// }

// Facebook authentication
function setupFacebookAuth(buttonId, isSignup = false) {
    const provider = new firebase.auth.FacebookAuthProvider();
    document.getElementById(buttonId).addEventListener('click', async function() {
        try {
            const result = await auth.signInWithPopup(provider);
            const user = result.user;
            
            alert(`Welcome ${user.displayName}! You will be redirected to the dashboard.`);
            
            // Redirect to dashboard or home page after successful authentication
            //window.location.href = 'Dash.html';
        } catch (error) {
            console.error('Facebook auth error:', error);
            alert('Error authenticating with Facebook. Please try again.');
        }
    });
}

// Initialize social auth buttons
// setupGoogleAuth('google-signup-btn', true);
// setupGoogleAuth('google-login-btn');
// setupFacebookAuth('facebook-signup-btn', true);
// setupFacebookAuth('facebook-login-btn');

// Check if user is already logged in
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in, redirect to dashboard
        //window.location.href = 'Dash.html';
    }
});
