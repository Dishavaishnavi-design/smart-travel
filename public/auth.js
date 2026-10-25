// Redirect to home if already logged in
if (localStorage.getItem("token")) {
    window.location.href = "/index.html";
}

// ── Switch between Login / Register tabs ──
function switchTab(tab) {
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const loginTab = document.getElementById("loginTab");
    const registerTab = document.getElementById("registerTab");

    if (tab === "login") {
        loginForm.classList.add("active");
        registerForm.classList.remove("active");
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        clearMessages();
    } else {
        registerForm.classList.add("active");
        loginForm.classList.remove("active");
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
        clearMessages();
    }
}

function clearMessages() {
    document.getElementById("loginMessage").textContent = "";
    document.getElementById("loginMessage").className = "auth-message";
    document.getElementById("registerMessage").textContent = "";
    document.getElementById("registerMessage").className = "auth-message";
}

// ── Show / Hide Password ──
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        btn.textContent = "🙈";
    } else {
        input.type = "password";
        btn.textContent = "👁️";
    }
}

// ── Handle Login ──
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");
    const btn = document.getElementById("loginBtn");

    btn.disabled = true;
    btn.innerHTML = "<span>Logging in...</span>";
    message.textContent = "";
    message.className = "auth-message";

    try {
        const response = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Login failed.";
            message.className = "auth-message error";
            btn.disabled = false;
            btn.innerHTML = "<span>Login</span>";
            return;
        }

        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role);

        message.textContent = "Login successful! Redirecting...";
        message.className = "auth-message success";

        setTimeout(function() {
            const pending = localStorage.getItem("pendingPlanDestination");
            if (pending) {
                window.location.href = "/index.html#planner";
            } else {
                window.location.href = "/index.html";
            }
        }, 1000);

    } catch (error) {
        message.textContent = "Server error. Make sure the server is running.";
        message.className = "auth-message error";
        btn.disabled = false;
        btn.innerHTML = "<span>Login</span>";
    }
}

// ── Handle Register ──
async function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById("regName").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;
    const message = document.getElementById("registerMessage");
    const btn = document.getElementById("registerBtn");

    message.textContent = "";
    message.className = "auth-message";

    if (password !== confirm) {
        message.textContent = "Passwords do not match.";
        message.className = "auth-message error";
        return;
    }

    if (password.length < 6) {
        message.textContent = "Password must be at least 6 characters.";
        message.className = "auth-message error";
        return;
    }

    btn.disabled = true;
    btn.innerHTML = "<span>Creating account...</span>";

    try {
        const response = await fetch("/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name, email: email, password: password })
        });

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message || "Registration failed.";
            message.className = "auth-message error";
            btn.disabled = false;
            btn.innerHTML = "<span>Create Account</span>";
            return;
        }

        // Save token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userRole", data.user.role);

        message.textContent = "Account created! Redirecting...";
        message.className = "auth-message success";

        setTimeout(function() {
            const pending = localStorage.getItem("pendingPlanDestination");
            if (pending) {
                window.location.href = "/index.html#planner";
            } else {
                window.location.href = "/index.html";
            }
        }, 1000);

    } catch (error) {
        message.textContent = "Server error. Make sure the server is running.";
        message.className = "auth-message error";
        btn.disabled = false;
        btn.innerHTML = "<span>Create Account</span>";
    }
}
