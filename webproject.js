function validateLogin() {
    document.getElementById('error').innerHTML = "";
    document.getElementById('emailerror').innerHTML = "";
    document.getElementById('passerror').innerHTML = "";

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    let passRegex = /.{8,}/;
    if (password === "" || email === "") {
        document.getElementById('error').innerHTML = "All fields must be filled.";
        return false;
    }
    if (!emailRegex.test(email)) {
        document.getElementById('emailerror').innerHTML = "Enter a valid email address.";
        return false;
    }
    if (!passRegex.test(password)) {
        document.getElementById('passerror').innerHTML = "Password must be atleast 8 characters long.";
        return false;
    }

    window.location.href = "dashboard.html";
    return false;
}

function validateSignup() {
    document.getElementById('error').innerHTML = "";
    document.getElementById('nameerror').innerHTML = "";
    document.getElementById('emailerror').innerHTML = "";
    document.getElementById('passerror').innerHTML = "";
    document.getElementById('confirmpasserror').innerHTML = "";

    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmPassword = document.getElementById('confirm-password').value;

    let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    let passRegex = /.{8,}/;

    if (name === "" || password === "" || email === "" || confirmPassword === "") {
        document.getElementById('error').innerHTML = "All fields must be filled.";
        return false;
    }
    if (!emailRegex.test(email)) {
        document.getElementById('emailerror').innerHTML = "Enter a valid email address.";
        return false;
    }
    if (!passRegex.test(password)) {
        document.getElementById('passerror').innerHTML = "Password must be at least 8 characters long.";
        return false;
    }
    if (password !== confirmPassword) {
        document.getElementById('confirmpasserror').innerHTML = "Passwords do not match.";
        return false;
    }
    window.location.href = "dashboard.html";
    return false;
}

function validateForgotPassword() {
    document.getElementById('error').innerHTML = "";
    document.getElementById('emailerror').innerHTML = "";

    let email = document.getElementById('email').value;
    let emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

    if (email === "") {
        document.getElementById('error').innerHTML = "Please enter your email.";
        return false;
    }
    if (!emailRegex.test(email)) {
        document.getElementById('emailerror').innerHTML = "Enter a valid email address.";
        return false;
    }

    return true;
}

document.addEventListener("DOMContentLoaded", function () {
    const typeContainer = document.getElementById("typewriter-container");
    const typeText = document.getElementById("typewriter-text");

    if (typeContainer && typeText) {
        const textToType = typeText.getAttribute("data-text");
        let isTyped = false;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !isTyped) {
                isTyped = true;
                let i = 0;
                let timer = setInterval(() => {
                    typeText.innerHTML += textToType.charAt(i);
                    i++;
                    if (i === textToType.length) clearInterval(timer);
                }, 40); /* typing speed */
            }
        }, { threshold: 0.5 });

        observer.observe(typeContainer);
    }
});
