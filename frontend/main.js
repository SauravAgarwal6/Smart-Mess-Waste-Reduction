// This script runs only on index.html and assumes auth.js has already validated the user

const API_URL = 'http://localhost:5000/api';

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
    revealElementsOnScroll(); // <-- ADDED BACK
    initializeChart(); // <-- ADDED BACK
});

// --- Complaint Functions (from before) ---
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
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleComplaintSubmit);
    }

    // ADDED SCROLL LISTENER BACK
    window.addEventListener('scroll', revealElementsOnScroll);

    const backToTopButton = document.getElementById('backToTop');
    if(backToTopButton) {
        backToTopButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        window.addEventListener('scroll', () => {
            backToTopButton.style.display = window.scrollY > 300 ? "flex" : "none";
        });
    }
}

// ===================================
//   SCROLL ANIMATION (ADDED BACK)
// ===================================
function revealElementsOnScroll() {
    // Finds all cards (from your original script)
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
//   VOTING & CHART LOGIC (ADDED BACK)
// ===================================
// This logic is from your original script.js
function initializeChart() {
    let voteData = JSON.parse(localStorage.getItem('voteCounts'));
    // Using your original default values
    if (!voteData) {
      voteData = { Breakfast: 213, Lunch: 213, Dinner: 213 };
      localStorage.setItem('voteCounts', JSON.stringify(voteData));
    }

    const ctx = document.getElementById('mealChart').getContext('2d');
    const gradientBreakfast = ctx.createLinearGradient(0, 0, 0, 400);
    gradientBreakfast.addColorStop(0, '#4facfe');
    gradientBreakfast.addColorStop(1, '#00f2fe');
    const gradientLunch = ctx.createLinearGradient(0, 0, 0, 400);
    gradientLunch.addColorStop(0, '#43e97b');
    gradientLunch.addColorStop(1, '#38f9d7');
    const gradientDinner = ctx.createLinearGradient(0, 0, 0, 400);
    gradientDinner.addColorStop(0, '#fa709a');
    gradientDinner.addColorStop(1, '#fee140');

    const mealChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(voteData),
        datasets: [{
          label: 'Number of Votes',
          data: Object.values(voteData),
          backgroundColor: [gradientBreakfast, gradientLunch, gradientDinner],
          borderRadius: 10,
          barPercentage: 0.6
        }]
      },
      options: {
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Live Meal Votes',
            font: { size: 22, weight: '600', family: 'Oswald' },
            color: '#333'
          }
        },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
          x: { grid: { display: false } }
        }
      }
    });

    // This function updates the summary cards
    function updateSummaryCards() {
      document.getElementById('breakfastVotes').innerText = voteData['Breakfast'];
      document.getElementById('lunchVotes').innerText = voteData['Lunch'];
      document.getElementById('dinnerVotes').innerText = voteData['Dinner'];
    }
    // Call it once to load the initial data
    updateSummaryCards();

    // This is your original vote form logic
    document.getElementById("voteForm").addEventListener("submit", function(e) {
      e.preventDefault();
      // The roll number is now read-only and pre-filled
      const roll = document.getElementById("student").value.trim().toUpperCase();
      const meal = document.getElementById("meal").value;
      const responseElement = document.getElementById("response");
      
      // We can skip the rollPattern test, as the user is logged in.
      
      let votedData = JSON.parse(localStorage.getItem('votedData')) || {};
      if (votedData[roll] && votedData[roll].includes(meal)) {
        responseElement.innerText = `You have already voted for ${meal}!`;
        responseElement.style.color = 'red';
        return;
      }
      
      voteData[meal] += 1;
      localStorage.setItem('voteCounts', JSON.stringify(voteData));
      mealChart.data.datasets[0].data = Object.values(voteData);
      mealChart.update();
      updateSummaryCards();
      
      if (!votedData[roll]) { votedData[roll] = []; }
      votedData[roll].push(meal);
      localStorage.setItem('votedData', JSON.stringify(votedData));
      
      responseElement.innerText = `Thank you ${roll}, your vote for ${meal} has been recorded!`;
      responseElement.style.color = 'green';
      // We don't reset the form, so the roll number stays
    });
}