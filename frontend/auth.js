const userState = { token: localStorage.getItem('token') || null, role: null, id: null, rollNo: null };

(function() {
    if (!userState.token) {
        window.location.href = 'login.html';
        return;
    }
    try {
        const payload = JSON.parse(atob(userState.token.split('.')[1]));
        if (payload.exp * 1000 < Date.now()) {
            logout();
            return;
        }
        userState.id = payload.user.id;
        userState.role = payload.user.role;
        userState.rollNo = payload.user.rollNo;
    } catch (e) {
        logout();
    }
})();

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logout-btn').addEventListener('click', logout);
});