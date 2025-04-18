// Import necessary Firebase functions
import app from './firebase-config.js'; //
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import {
  getFirestore, collection, query, where, limit, getDocs, doc, setDoc, getDoc, onSnapshot, addDoc, serverTimestamp, orderBy
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

// --- DOM Elements ---
const partnerListContainer = document.getElementById('partner-list-container');
const newPartnerOptionsDiv = document.getElementById('new-partner-options');
const chatWithHeader = document.getElementById('chat-with-header');
const chatMessagesDiv = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const starterMessageButtons = document.querySelectorAll('.starter-message-btn');

let currentUserId = null;
let selectedPartnerId = null;
let unsubscribeChat = null; // Function to stop listening to chat updates

// --- Authentication ---
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("Messaging: User logged in:", user.uid);
    currentUserId = user.uid;
    await checkUserPartnerStatus(currentUserId);
  } else {
    console.log("Messaging: User logged out.");
    currentUserId = null;
    // Redirect to login or disable messaging features
    window.location.href = 'auth.html'; // Or handle appropriately
  }
});

// --- Partner Logic ---

async function checkUserPartnerStatus(userId) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists() && userSnap.data().partnerId) {
    selectedPartnerId = userSnap.data().partnerId;
    console.log("User already has partner:", selectedPartnerId);
    partnerListContainer.classList.add('hidden'); // Hide selector
    await loadChat(userId, selectedPartnerId);
  } else {
    console.log("User needs a partner. Fetching options...");
    partnerListContainer.classList.remove('hidden'); // Show selector
    fetchNewPartners(userId);
  }
}

async function fetchNewPartners(userId) {
  newPartnerOptionsDiv.innerHTML = '<p>Finding potential buddies...</p>'; // Clear previous
  try {
    // Query for users who don't have a partnerId set and are not the current user
    const usersRef = collection(db, 'users');
    // Consider adding a 'createdAt' field and ordering by it, or an 'isNewUser' flag
    // Simple version: find users without a partner, excluding self
    const q = query(
      usersRef,
      where('partnerId', '==', null), // Find users without a partner
      // where('uid', '!=', userId), // Exclude self - Firestore limitation: inequality needs index/different approach
      limit(10) // Fetch a bit more initially to filter out self
    );

    const querySnapshot = await getDocs(q);
    const partners = [];
    querySnapshot.forEach((doc) => {
      // Make sure not to list the current user as a potential partner
      if (doc.id !== userId) {
        partners.push({ id: doc.id, ...doc.data() });
      }
    });

    if (partners.length > 0) {
      // Limit to 3 actual options after filtering self
      const limitedPartners = partners.slice(0, 3);
      displayPartnerOptions(limitedPartners);
    } else {
      newPartnerOptionsDiv.innerHTML = '<p>No new buddies available right now. Check back later!</p>';
    }

  } catch (error) {
    console.error("Error fetching new partners: ", error);
    newPartnerOptionsDiv.innerHTML = '<p>Error loading buddies.</p>';
  }
}

function displayPartnerOptions(partners) {
  newPartnerOptionsDiv.innerHTML = ''; // Clear loading message
  partners.forEach(partner => {
    const partnerDiv = document.createElement('div');
    partnerDiv.classList.add('partner-item');
    partnerDiv.textContent = partner.name || partner.email; // Display name or email
    partnerDiv.dataset.partnerId = partner.id; // Store partner ID
    partnerDiv.addEventListener('click', () => selectPartner(partner.id, partner.name || partner.email));
    newPartnerOptionsDiv.appendChild(partnerDiv);
  });
}

async function selectPartner(partnerId, partnerName) {
  if (!currentUserId) {
    console.error("Cannot select partner, user not logged in.");
    return;
  }
  console.log(`Selecting partner: ${partnerId}`);

  const currentUserRef = doc(db, 'users', currentUserId);
  const partnerUserRef = doc(db, 'users', partnerId);

  try {
    // Use a transaction or batched write in a real app to ensure atomicity
    await setDoc(currentUserRef, { partnerId: partnerId }, { merge: true });
    await setDoc(partnerUserRef, { partnerId: currentUserId }, { merge: true });

    selectedPartnerId = partnerId;
    partnerListContainer.classList.add('hidden'); // Hide selector
    console.log("Partner selected successfully!");
    await loadChat(currentUserId, selectedPartnerId, partnerName);

  } catch (error) {
    console.error("Error selecting partner: ", error);
    // Optionally revert changes or notify user
  }
}

// --- Chat Logic ---

function generateChatId(userId1, userId2) {
  // Create a consistent chat ID regardless of who initiates
  return [userId1, userId2].sort().join('_');
}

async function loadChat(userId, partnerId, partnerName = 'your buddy') {
  if (unsubscribeChat) {
    unsubscribeChat(); // Stop listening to previous chat if any
  }

  chatWithHeader.textContent = `Chatting with ${partnerName}`;
  chatMessagesDiv.innerHTML = ''; // Clear previous messages

  const chatId = generateChatId(userId, partnerId);
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('timestamp', 'asc')); // Order messages by time

  // Listen for real-time updates
  unsubscribeChat = onSnapshot(q, (querySnapshot) => {
    console.log("Received chat update");
    chatMessagesDiv.innerHTML = ''; // Clear messages on update to redraw
    querySnapshot.forEach((doc) => {
      displayMessage(doc.data());
    });
    chatMessagesDiv.scrollTop = chatMessagesDiv.scrollHeight; // Scroll to bottom
  }, (error) => {
    console.error("Error listening to chat:", error);
  });
}

function displayMessage(messageData) {
  const messageElement = document.createElement('div');
  messageElement.classList.add('message');
  // Add a class to differentiate user's own messages
  if (messageData.senderId === currentUserId) {
    messageElement.classList.add('my-message');
    messageElement.style.textAlign = 'right'; // Simple alignment
    messageElement.style.marginLeft = 'auto'; // Push to right
    messageElement.style.backgroundColor = '#00509d'; // Different color for own messages
  } else {
    messageElement.classList.add('partner-message');
    messageElement.style.backgroundColor = '#444'; // Default partner message color
  }
  messageElement.style.padding = '5px 8px';
  messageElement.style.margin = '5px';
  messageElement.style.borderRadius = '8px';
  messageElement.style.maxWidth = '70%'; // Limit width
  messageElement.style.wordWrap = 'break-word'; // Wrap long words

  messageElement.textContent = messageData.text;
  chatMessagesDiv.appendChild(messageElement);
}

async function sendMessage() {
  const messageText = messageInput.value.trim();
  if (!messageText || !selectedPartnerId || !currentUserId) {
    console.log("Cannot send message. Check text, partner selection, and login status.");
    return;
  }

  const chatId = generateChatId(currentUserId, selectedPartnerId);
  const messagesRef = collection(db, 'chats', chatId, 'messages');

  try {
    await addDoc(messagesRef, {
      text: messageText,
      senderId: currentUserId,
      receiverId: selectedPartnerId, // Good to store receiver too
      timestamp: serverTimestamp() // Use server time
    });
    console.log("Message sent.");
    messageInput.value = ''; // Clear input field
  } catch (error) {
    console.error("Error sending message: ", error);
  }
}

// --- Event Listeners ---
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

starterMessageButtons.forEach(button => {
  button.addEventListener('click', () => {
    const message = button.getAttribute('data-message');
    messageInput.value = message; // Set input field value
    // Optionally send immediately: sendMessage();
  });
});

console.log("messaging.js loaded");

// Initial check when script loads (in case auth state is already known)
// Moved the initial check inside onAuthStateChanged to ensure auth is ready
