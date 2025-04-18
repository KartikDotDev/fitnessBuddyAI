// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app = initializeApp(firebaseConfig);

let database;

// Wait for DOM to fully load
document.addEventListener('DOMContentLoaded', function() {
  // Initialize date input to today
  document.getElementById('workout-date').valueAsDate = new Date();

  // Initialize Firebase
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
  //const workoutsRef = database.ref('workouts');

  // Load workout history from Firebase
  loadWorkoutHistory();

  // Event Listeners
  document.getElementById('add-exercise').addEventListener('click', addExerciseInput);
  document.getElementById('workout-form').addEventListener('submit', saveWorkout);

  // Add initial exercise input
  addExerciseInput();
});



// Workout plans data
const workoutPlans = {
  'full-body': [
    { name: 'Squats', sets: 3, reps: 12 },
    { name: 'Push-ups', sets: 3, reps: 15 },
    { name: 'Deadlifts', sets: 3, reps: 10 },
    { name: 'Bench Press', sets: 3, reps: 10 },
    { name: 'Shoulder Press', sets: 3, reps: 12 }
  ],
  'upper-body': [
    { name: 'Bench Press', sets: 4, reps: 10 },
    { name: 'Pull-ups', sets: 3, reps: 8 },
    { name: 'Shoulder Press', sets: 3, reps: 12 },
    { name: 'Bicep Curls', sets: 3, reps: 15 },
    { name: 'Tricep Dips', sets: 3, reps: 15 }
  ],
  'lower-body': [
    { name: 'Squats', sets: 4, reps: 12 },
    { name: 'Deadlifts', sets: 3, reps: 10 },
    { name: 'Lunges', sets: 3, reps: 10 },
    { name: 'Leg Press', sets: 3, reps: 12 },
    { name: 'Calf Raises', sets: 3, reps: 20 }
  ],
  'core': [
    { name: 'Plank', sets: 3, reps: '30 sec' },
    { name: 'Crunches', sets: 3, reps: 20 },
    { name: 'Russian Twists', sets: 3, reps: 15 },
    { name: 'Leg Raises', sets: 3, reps: 12 },
    { name: 'Mountain Climbers', sets: 3, reps: '30 sec' }
  ],
  'hiit': [
    { name: 'Jumping Jacks', sets: 1, reps: '45 sec' },
    { name: 'Burpees', sets: 1, reps: '45 sec' },
    { name: 'High Knees', sets: 1, reps: '45 sec' },
    { name: 'Mountain Climbers', sets: 1, reps: '45 sec' },
    { name: 'Jump Squats', sets: 1, reps: '45 sec' }
  ],
  'custom': []
};

// Function to load a workout plan
function loadWorkoutPlan(planType) {
  // Clear current exercises
  document.getElementById('exercise-list').innerHTML = '';

  // Set workout type in dropdown
  const workoutTypeSelect = document.getElementById('workout-type');

  switch (planType) {
    case 'full-body':
      workoutTypeSelect.value = 'Full Body';
      break;
    case 'upper-body':
      workoutTypeSelect.value = 'Upper Body';
      break;
    case 'lower-body':
      workoutTypeSelect.value = 'Lower Body';
      break;
    case 'core':
      workoutTypeSelect.value = 'Core';
      break;
    case 'hiit':
      workoutTypeSelect.value = 'HIIT';
      break;
    case 'custom':
      workoutTypeSelect.value = 'Custom';
      break;
  }

  // If it's a custom workout, just add an empty exercise input
  if (planType === 'custom') {
    document.getElementById('exercises-container').innerHTML = '';
    addExerciseInput();
    return;
  }

  // Load exercises from the selected plan
  const exercises = workoutPlans[planType];

  // Add exercises to the list
  exercises.forEach(exercise => {
    addExerciseToList(exercise.name, exercise.sets, exercise.reps);

    const container = document.getElementById('exercises-container');
    const inputDiv = document.createElement('div');
    inputDiv.innerHTML = `
                  <input type="hidden" class="exercise-name-hidden" value="${exercise.name}">
                  <input type="hidden" class="exercise-sets-hidden" value="${exercise.sets}">
                  <input type="hidden" class="exercise-reps-hidden" value="${exercise.reps}">
                `;
    container.appendChild(inputDiv);
  });


  // Scroll to the workout form
  document.querySelector('.workout-log').scrollIntoView({ behavior: 'smooth' });
}

// Function to add exercise input fields
function addExerciseInput() {
  const container = document.createElement('div');
  container.className = 'exercise-inputs';
  container.innerHTML = `
                <input type="text" placeholder="Exercise name" class="exercise-name" required>
                <input type="number" placeholder="Sets" class="exercise-sets" min="1" required>
                <input type="text" placeholder="Reps/Duration" class="exercise-reps" required>
                <button type="button" class="btn-add-exercise" onclick="addExerciseFromInput(this)">Add</button>
            `;

  document.getElementById('exercises-container').appendChild(container);
}

// Function to add an exercise from input to the list


// Function to add exercise to the list
function addExerciseToList(name, sets, reps) {
  const exerciseList = document.getElementById('exercise-list');

  const li = document.createElement('li');
  li.className = 'exercise-list-item';
  li.innerHTML = `
                <div class="exercise-details">
                    <strong>${name}</strong> - ${sets} sets × ${reps}
                </div>
                <span class="remove-exercise" onclick="removeExercise(this)">Remove</span>
            `;

  exerciseList.appendChild(li);
}
// First, add a global exercises array at the top of your script
let exercises = [];

// Then fix the addExerciseFromInput function:
function addExerciseFromInput(button) {
  const container = button.parentElement;
  const nameInput = container.querySelector('.exercise-name');
  const setsInput = container.querySelector('.exercise-sets');
  const repsInput = container.querySelector('.exercise-reps');

  const name = nameInput.value.trim();
  const sets = setsInput.value.trim();
  const reps = repsInput.value.trim();

  if (name && sets && reps) {
    // Check if exercises is defined, if not initialize it
    if (!window.exercises) {
      window.exercises = [];
    }

    // Add to exercises array
    window.exercises.push({ name, sets, reps });

    // Add to the visual list
    addExerciseToList(name, sets, reps);

    // Clear the inputs
    nameInput.value = '';
    setsInput.value = '';
    repsInput.value = '';
    nameInput.focus();
  } else {
    alert('Please fill in all exercise fields');
  }
}

// Function to remove an exercise from the list
function removeExercise(span) {
  const li = span.parentElement;
  const index = Array.from(li.parentElement.children).indexOf(li);

  // ✅ Remove from exercises array
  exercises.splice(index, 1);

  // ✅ Remove from UI
  li.remove();
}

function saveWorkout(e) {
  e.preventDefault(); // Prevent default form submission

  // Get form values
  const date = document.getElementById('workout-date').value;
  const type = document.getElementById('workout-type').value;
  const duration = document.getElementById('workout-duration').value;
  const notes = document.getElementById('workout-notes').value;

  // --- FIX: Use the globally managed 'exercises' array ---
  // This array is correctly updated by addExerciseFromInput and removeExercise
  const currentWorkoutExercises = [...exercises]; // Use the global exercises array

  // Validate form - including check for exercises
  if (!date || !type || !duration || currentWorkoutExercises.length === 0) { // Check if exercises were added
    alert('Please fill in date, type, duration, and add at least one exercise.');
    return;
  }

  // Create workout object
  const workout = {
    createdAt: firebase.database.ServerValue.TIMESTAMP, // Use Firebase server timestamp
    date,
    type,
    duration: parseInt(duration) || 0, // Ensure duration is a number
    notes,
    exercises: currentWorkoutExercises // Use the collected exercises
  };

  // --- Firebase Interaction ---
  // Ensure 'database' is a valid Firebase reference object
  if (!database || typeof database.ref !== 'function') {
    console.error("Firebase database reference is not initialized correctly.");
    alert("Error: Cannot connect to the database. Please try again later.");
    return;
  }

  // Reference the 'workouts' path
  const workoutsRef = database.ref("workouts");

  // Use push to generate a unique key and save data
  workoutsRef.push(workout)
    .then(() => {
      // SUCCESS! Now run UI updates
      console.log("Workout saved successfully to Firebase!");
      alert('Workout saved successfully!');

      // Reload workout history (if function exists)
      if (typeof loadWorkoutHistory === 'function') {
        loadWorkoutHistory();
      }

      // --- FIX: Reset logic moved inside .then() ---
      // Reset form
      const workoutForm = document.getElementById('workout-form');
      if (workoutForm) workoutForm.reset();

      const workoutDateInput = document.getElementById('workout-date');
      if (workoutDateInput) workoutDateInput.valueAsDate = new Date(); // Set date back to today

      const exerciseList = document.getElementById('exercise-list');
      if (exerciseList) exerciseList.innerHTML = ''; // Clear UI list

      // Clear the global exercises array after successful save
      exercises = []; // Reset the global array

      const exercisesContainer = document.getElementById('exercises-container');
      // Clear existing input fields before adding a new one
      if (exercisesContainer) {
        exercisesContainer.innerHTML = '';
      }


      // Add back initial exercise input fields (if function exists)
      if (typeof addExerciseInput === 'function') {
        addExerciseInput(); // Add a fresh input row
      }
    })
    .catch((error) => {
      // ERROR! Log and inform user
      console.error("Error saving workout to Firebase: ", error);
      alert(`Error saving workout: ${error.message}. Please check console for details.`);
      // Don't reset the form here so the user doesn't lose input
    });
}

// Ensure the global exercises array is defined at the top level of your script
// let exercises = []; // Add this line if it's not already there

// Function to load workout history
function loadWorkoutHistory() {
  const historyContainer = document.getElementById('history-container');
  const noHistoryMessage = document.getElementById('no-history');

  database.ref('workouts').on('value', (snapshot) => {
    const workouts = snapshot.val();
    historyContainer.innerHTML = '';

    if (!workouts) {
      noHistoryMessage.style.display = 'block';
      return;
    }

    noHistoryMessage.style.display = 'none';

    const workoutArray = Object.entries(workouts).map(([key, val]) => ({ key, ...val }));
    workoutArray.sort((a, b) => new Date(b.date) - new Date(a.date));

    workoutArray.forEach(workout => {
      const workoutElement = document.createElement('div');
      workoutElement.className = 'history-item';
      const formattedDate = new Date(workout.date).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });

      let exercisesHTML = '';
      workout.exercises.forEach(exercise => {
        exercisesHTML += `<div class="history-exercise"><strong>${exercise.name}</strong> - ${exercise.sets} sets × ${exercise.reps}</div>`;
      });

      workoutElement.innerHTML = `
                  <div class="history-date">${formattedDate}</div>
                  <div><strong>Type:</strong> ${workout.type}</div>
                  <div><strong>Duration:</strong> ${workout.duration} minutes</div>
                  ${workout.notes ? `<div><strong>Notes:</strong> ${workout.notes}</div>` : ''}
                  <div class="history-exercises">
                    <div><strong>Exercises:</strong></div>
                    ${exercisesHTML}
                  </div>
                  <button class="btn" onclick="deleteWorkout('${workout.key}')">Delete</button>
                `;

      historyContainer.appendChild(workoutElement);
    });
  });
}


// Function to delete a workout
function deleteWorkout(workoutKey) {
  if (confirm('Are you sure you want to delete this workout?')) {
    database.ref("workouts/" + workoutKey).remove();


    // Reload workout history
    loadWorkoutHistory(database);
  }
}
