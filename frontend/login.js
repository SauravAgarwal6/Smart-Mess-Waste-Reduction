const API_URL = 'https://smart-mess-waste-reduction-backend-y838.onrender.com/api';

document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const responseEl = document.getElementById('loginResponse');
    if (params.get('registered') === 'true') {
        responseEl.textContent = 'Registration successful! Please login.';
        responseEl.style.color = 'green';
    }
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    const rollNo = document.getElementById('loginRollNo').value.trim().toUpperCase();
    const password = document.getElementById('loginPassword').value;
    const responseEl = document.getElementById('loginResponse');

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNo, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        localStorage.setItem('token', data.token);
        window.location.href = 'index.html';
    } catch (error) {
        responseEl.textContent = error.message || 'An error occurred.';
        responseEl.style.color = 'red';
    }
}