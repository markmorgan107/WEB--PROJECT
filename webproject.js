function validateLogin() {

    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;

    let emailRegex = /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/;
    let passRegex = /.{8,}/;
    if (pass === ""){
        document.getElementById('error').innerHTML = "All fields must be filled.";
        return false;
    }
    if (email === ""){
        document.getElementById('error').innerHTML = "All fields must be filled.";
        return false;
    }
    if (!emailRegex.test(email)){
        document.getElementById('emailerror').innerHTML = "Enter a valid email address.";
        return false;
    }
    if (!passRegex.test(password)){
        document.getElementById('passerror').innerHTML = "Password must be atleast 8 characters long.";
        return false;
    }

    return true;
  }
