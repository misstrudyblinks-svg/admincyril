// ==============================
// ADMIN LOGIN
// ==============================

const loginForm = document.getElementById("loginForm");

const emailInput = document.getElementById("email");

const passwordInput = document.getElementById("password");

const loginMessage = document.getElementById("loginMessage");


// Demo admin account

const adminEmail = "admin@bizmanager.com";

const adminPassword = "admin123";


// ==============================
// LOGIN
// ==============================

loginForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const email = emailInput.value.trim();

    const password = passwordInput.value.trim();


    if (email === adminEmail && password === adminPassword) {

        loginMessage.textContent =
            "Login successful! Redirecting...";

        loginMessage.className =
            "login-message success";


        // Save login session

        localStorage.setItem(
            "adminLoggedIn",
            "true"
        );


        localStorage.setItem(
            "adminEmail",
            email
        );


        // Redirect

        setTimeout(function () {

            window.location.href =
                "dashboard.html";

        }, 1000);

    }

    else {

        loginMessage.textContent =
            "Invalid email or password.";

        loginMessage.className =
            "login-message error";

    }

});


// ==============================
// SHOW / HIDE PASSWORD
// ==============================

const togglePassword =
    document.getElementById("togglePassword");


togglePassword.addEventListener(
    "click",
    function () {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye-slash"></i>';

        }

        else {

            passwordInput.type = "password";

            togglePassword.innerHTML =
                '<i class="fa-solid fa-eye"></i>';

        }

    }
);


// ==============================
// FORGOT PASSWORD
// ==============================

const forgotPassword =
    document.getElementById("forgotPassword");


forgotPassword.addEventListener(
    "click",
    function (event) {

        event.preventDefault();

        alert(
            "Please contact the system administrator to reset your password."
        );

    }
);