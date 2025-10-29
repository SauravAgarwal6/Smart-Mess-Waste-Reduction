const API_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
});

async function handleRegister(e) {
    e.preventDefault();
    const rollNo = document.getElementById('registerRollNo').value.trim().toUpperCase();
    const password = document.getElementById('registerPassword').value;
    const responseEl = document.getElementById('registerResponse');

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNo, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        window.location.href = 'login.html?registered=true';
    } catch (error) {
        responseEl.textContent = error.message || 'An error occurred.';
        responseEl.style.color = 'red';
    }
}