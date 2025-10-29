// =================================================================
// Daily Reset Logic
// =================================================================
function resetDataDaily() {
  const today = new Date().toISOString().split('T')[0];
  const lastVoteDate = localStorage.getItem('lastVoteDate');
  
  if (today !== lastVoteDate) {
    localStorage.removeItem('votedData');
    localStorage.removeItem('voteCounts');
    localStorage.removeItem('complaintsData'); // Also clear complaints daily
    localStorage.setItem('lastVoteDate', today);
    console.log('New day detected. All voting and complaint data has been reset.');
  }
}
resetDataDaily();


// =================================================================
// Global variable for Roll Number validation
// =================================================================
const rollPattern = /^2024UGPI0(?!12)[0-5]\d$/;


// Wait for the window to load
window.addEventListener("load", () => {
  const preloader = document.getElementById("preloader");
  preloader.style.opacity = 0;
  setTimeout(() => { preloader.style.display = "none"; }, 500);
  
  revealElementsOnScroll();
  displayComplaints(); // Display complaints when page loads
});


// ------------------ VOTING DATA & CHART SETUP ------------------
let voteData = JSON.parse(localStorage.getItem('voteCounts'));
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


// =================================================================
// FIXED CODE START: Restored the chart configuration
// =================================================================
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
// =================================================================
// FIXED CODE END
// =================================================================


// ------------------ SUMMARY CARDS ------------------
function updateSummaryCards() {
  document.getElementById('breakfastVotes').innerText = voteData['Breakfast'];
  document.getElementById('lunchVotes').innerText = voteData['Lunch'];
  document.getElementById('dinnerVotes').innerText = voteData['Dinner'];
}
updateSummaryCards();


// ------------------ VOTING FORM ------------------
document.getElementById("voteForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const roll = document.getElementById("student").value.trim().toUpperCase();
  const meal = document.getElementById("meal").value;
  const responseElement = document.getElementById("response");
  
  if (!rollPattern.test(roll)) {
    responseElement.innerText = 'Invalid Roll No. Use format 2024UGPI0xx (00-59, except 12).';
    responseElement.style.color = 'red';
    return;
  }
  
  let votedData = JSON.parse(localStorage.getItem('votedData')) || {};
  if (votedData[roll] && votedData[roll].includes(meal)) {
    responseElement.innerText = `Roll No: ${roll} has already voted for ${meal}!`;
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
  this.reset();
});


// ------------------ Complaint Box Logic ------------------
function displayComplaints() {
  const complaintsListDiv = document.getElementById('complaintsList');
  const complaints = JSON.parse(localStorage.getItem('complaintsData')) || [];
  
  complaintsListDiv.innerHTML = '';
  
  if (complaints.length === 0) {
    complaintsListDiv.innerHTML = '<p>No complaints submitted yet.</p>';
  } else {
    complaints.forEach(complaint => {
      const complaintItem = document.createElement('div');
      complaintItem.className = 'complaint-item';
      complaintItem.innerHTML = `<strong>${complaint.roll}:</strong> ${complaint.text}`;
      complaintsListDiv.appendChild(complaintItem);
    });
  }
}

document.getElementById("complaintForm").addEventListener("submit", function(e) {
  e.preventDefault();
  const rollInput = document.getElementById('complaintRoll');
  const textInput = document.getElementById('complaintText');
  const responseEl = document.getElementById('complaintResponse');
  
  const roll = rollInput.value.trim().toUpperCase();
  const text = textInput.value.trim();
  
  if (!rollPattern.test(roll)) {
    responseEl.innerText = 'Invalid Roll No. Use format 2024UGPI0xx (00-59, except 12).';
    responseEl.style.color = 'red';
    return;
  }
  if (text === '') {
    responseEl.innerText = 'Complaint text cannot be empty.';
    responseEl.style.color = 'red';
    return;
  }
  
  const complaints = JSON.parse(localStorage.getItem('complaintsData')) || [];
  const newComplaint = { roll: roll, text: text };
  complaints.push(newComplaint);
  localStorage.setItem('complaintsData', JSON.stringify(complaints));
  
  responseEl.innerText = 'Thank you, your complaint has been submitted!';
  responseEl.style.color = 'green';
  this.reset();
  displayComplaints();
});


// ------------------ SCROLL ANIMATIONS & BACK TO TOP ------------------
const elementsToReveal = document.querySelectorAll('.feature-card, .team-card');

function revealElementsOnScroll() {
  elementsToReveal.forEach(el => {
    const elementTop = el.getBoundingClientRect().top;
    const revealPoint = window.innerHeight - 100;
    if (elementTop < revealPoint) { el.classList.add('visible'); }
  });
}
window.addEventListener('scroll', revealElementsOnScroll);

const backToTopButton = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) { backToTopButton.style.display = "flex"; }
  else { backToTopButton.style.display = "none"; }
});
backToTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});