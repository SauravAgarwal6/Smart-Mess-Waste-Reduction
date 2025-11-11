// This script runs only on index.html and assumes auth.js has already validated the user

const API_URL = 'https://smart-mess-waste-reduction-backend-y838.onrender.com/api';

// --- Global variable to hold our chart object ---
let mealChart = null;

// --- Initial Setup on Page Load ---
window.addEventListener("load", () => {
    const preloader = document.getElementById("preloader");
    if(preloader) {
        preloader.style.opacity = 0;
        setTimeout(() => { preloader.style.display = "none"; }, 500);
    }
    
    // Auto-fill roll number in the vote form
    const voteRollInput = document.getElementById('student');
    if(voteRollInput && userState.rollNo) {
        voteRollInput.value = userState.rollNo;
    }

    // Load all the application parts
    fetchAndDisplayComplaints();
    setupEventListeners();
    revealElementsOnScroll();
    
    // --- NEW VOTING SYSTEM ---
    initializeEmptyChart(); // 1. Create the chart structure
    loadVoteData();         // 2. Fetch data and fill the chart
    setupAdminFeatures();   // 3. Add admin buttons if user is an admin
});

// --- Complaint Functions (Unchanged) ---
async function fetchAndDisplayComplaints() {
    try {
        const res = await fetch(`${API_URL}/complaints`);
        const complaints = await res.json();
        const complaintsListDiv = document.getElementById('complaintsList');
        complaintsListDiv.innerHTML = '';

        if (complaints.length === 0) {
            complaintsListDiv.innerHTML = '<p>No complaints submitted yet.</p>';
            return;
        }
        complaints.forEach(complaint => {
            const complaintItem = document.createElement('div');
            complaintItem.className = 'complaint-item';
            const canDelete = userState.id === complaint.authorId || userState.role === 'admin';
            complaintItem.innerHTML = `
                <div class="complaint-content">
                  <strong>${complaint.authorRoll}:</strong>
                  <p>${complaint.text}</p>
                </div>
                ${canDelete ? `<button class="delete-btn" onclick="handleDeleteComplaint('${complaint._id}')">Delete</button>` : ''}
            `;
            complaintsListDiv.appendChild(complaintItem);
        });
    } catch (error) {
        console.error("Failed to fetch complaints:", error);
    }
}

async function handleComplaintSubmit(e) {
    e.preventDefault();
    const text = document.getElementById('complaintText').value.trim();
    const responseEl = document.getElementById('complaintResponse');
    if (!text) {
        responseEl.textContent = 'Complaint text cannot be empty.';
        responseEl.style.color = 'red';
        return;
    }
    try {
        const res = await fetch(`${API_URL}/complaints`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': userState.token },
            body: JSON.stringify({ text })
        });
        if (!res.ok) throw new Error((await res.json()).message);
        responseEl.textContent = 'Complaint submitted successfully!';
        responseEl.style.color = 'green';
        document.getElementById('complaintForm').reset();
        fetchAndDisplayComplaints();
    } catch (error) {
        responseEl.textContent = error.message;
        responseEl.style.color = 'red';
    }
}

async function handleDeleteComplaint(complaintId) {
    if (!confirm('Are you sure you want to delete this complaint?')) return;
    try {
        const res = await fetch(`${API_URL}/complaints/${complaintId}`, {
            method: 'DELETE',
            headers: { 'x-auth-token': userState.token }
        });
        if (!res.ok) throw new Error((await res.json()).message);
        fetchAndDisplayComplaints();
    } catch (error) {
        alert(error.message);
    }
}

// --- Event Listeners Setup ---
function setupEventListeners() {
    // Complaint form listener
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmit);
    }
    
    // --- NEW: Vote form listener ---
    const voteForm = document.getElementById('voteForm');
    if (voteForm) {
        voteForm.addEventListener('submit', handleVoteSubmit);
    }

    // Scroll listener
    window.addEventListener('scroll', revealElementsOnScroll);

    // Back to top button listener
    const backToTopButton = document.getElementById('backToTop');
    if(backToTopButton) {
        backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => {
            backToTopButton.style.display = window.scrollY > 300 ? "flex" : "none";
        });
    }
}

// --- Scroll Animation (Unchanged) ---
function revealElementsOnScroll() {
    const elementsToReveal = document.querySelectorAll('.feature-card, .team-card');
    elementsToReveal.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const revealPoint = window.innerHeight - 100;
        if (elementTop < revealPoint) { 
            el.classList.add('visible'); 
        }
    });
}

// ===================================
//   NEW VOTING & CHART LOGIC
// ===================================

// 1. Creates the empty chart structure on page load
function initializeEmptyChart() {
    const ctx = document.getElementById('mealChart').getContext('2d');
    const gradientBreakfast = ctx.createLinearGradient(0, 0, 0, 400);
    gradientBreakfast.addColorStop(0, '#4facfe'); gradientBreakfast.addColorStop(1, '#00f2fe');
    const gradientLunch = ctx.createLinearGradient(0, 0, 0, 400);
    gradientLunch.addColorStop(0, '#43e97b'); gradientLunch.addColorStop(1, '#38f9d7');
    const gradientDinner = ctx.createLinearGradient(0, 0, 0, 400);
    gradientDinner.addColorStop(0, '#fa709a'); gradientDinner.addColorStop(1, '#fee140');
    
    // Initialize chart with empty data
    mealChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Breakfast', 'Lunch', 'Dinner'],
        datasets: [{
          label: 'Number of Votes',
          data: [0, 0, 0], // Start at 0
          backgroundColor: [gradientBreakfast, gradientLunch, gradientDinner],
          borderRadius: 10,
          barPercentage: 0.6
        }]
      },
      options: { /* ... (options from your original file) ... */ }
    });
}

// 2. Fetches the latest vote data from the server
async function loadVoteData() {
    try {
        const res = await fetch(`${API_URL}/votes`, {
            headers: { 'x-auth-token': userState.token }
        });
        if (!res.ok) throw new Error('Could not load votes.');
        const data = await res.json();
        
        updateChartAndCards(data);
        
    } catch (error) {
        console.error(error);
        document.getElementById('response').innerText = 'Error loading votes.';
    }
}

// 3. Handles the vote form submission
async function handleVoteSubmit(e) {
    e.preventDefault();
    const meal = document.getElementById("meal").value;
    const responseElement = document.getElementById("response");

    try {
        const res = await fetch(`${API_URL}/votes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-auth-token': userState.token },
            body: JSON.stringify({ meal: meal.toLowerCase() }) // "Breakfast" -> "breakfast"
        });
        
        const data = await res.json();
        
        if (!res.ok) {
            // This will show "You have already voted for breakfast."
            throw new Error(data.message);
        }
        
        // Success! Update the chart and summary cards
        responseElement.innerText = `Thank you, your vote for ${meal} has been recorded!`;
        responseElement.style.color = 'green';
        updateChartAndCards(data);

    } catch (error) {
        responseElement.innerText = error.message;
        responseElement.style.color = 'red';
    }
}

// 4. Helper function to update the UI
function updateChartAndCards(data) {
    // `data` is the object from the server: { counts: {...}, userVotes: {...} }
    const counts = data.counts;
    
    // Update summary cards
    document.getElementById('breakfastVotes').innerText = counts.breakfast;
    document.getElementById('lunchVotes').innerText = counts.lunch;
    document.getElementById('dinnerVotes').innerText = counts.dinner;
    
    // Update chart data
    if (mealChart) {
        mealChart.data.datasets[0].data = [
            counts.breakfast,
            counts.lunch,
            counts.dinner
        ];
        mealChart.update();
    }
    
    // Update form to show what user has voted for
    const voteForm = document.getElementById('voteForm');
    const mealSelect = document.getElementById('meal');
    
    // Disable meals they already voted for
    for (const meal of ['breakfast', 'lunch', 'dinner']) {
        const option = voteForm.querySelector(`option[value="${meal.charAt(0).toUpperCase() + meal.slice(1)}"]`);
        if (data.userVotes[meal]) {
            option.disabled = true;
            option.innerText = `${option.value} (Voted)`;
        } else {
            option.disabled = false;
            option.innerText = option.value;
        }
    }
}

// 5. Adds the admin "Reset Votes" button if user is an admin
function setupAdminFeatures() {
    if (userState.role === 'admin') {
        const chartSection = document.getElementById('voteChart');
        
        // Create the button
        const resetButton = document.createElement('button');
        resetButton.id = 'adminResetVotes';
        resetButton.className = 'btn'; // Use your existing .btn style
        resetButton.innerText = 'Reset Today\'s Votes';
        
        // Style it to be red (like a delete button)
        resetButton.style.backgroundColor = '#e74c3c';
        resetButton.style.marginTop = '2rem';
        resetButton.style.display = 'block';
        resetButton.style.margin = '2rem auto 0 auto'; // Center it
        
        // Add its click listener
        resetButton.addEventListener('click', handleAdminReset);
        
        // Add the button to the page
        chartSection.appendChild(resetButton);
    }
}

// 6. The function that runs when the admin clicks the reset button
async function handleAdminReset() {
    if (!confirm('ADMIN ACTION: Are you sure you want to reset all votes for today to 0?')) {
        return;
    }
    
    try {
        const res = await fetch(`${API_URL}/votes/reset`, {
            method: 'DELETE',
            headers: { 'x-auth-token': userState.token }
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        
        // Success! Refresh the chart and cards
        alert(data.message); // "Votes for today have been reset successfully."
        
        // We can just create a fake data object to reset the UI
        const resetData = {
            counts: { breakfast: 0, lunch: 0, dinner: 0 },
            userVotes: { breakfast: false, lunch: false, dinner: false }
        };
        updateChartAndCards(resetData);
        
    } catch (error) {
        alert(error.message);
    }
}