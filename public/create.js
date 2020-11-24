// Getting html elements by id
const age = document.getElementById('age');
const email = document.getElementById('email');
const username = document.getElementById('username');
const password = document.getElementById('password');
const submitBtn = document.getElementById('submitBtn');

//Errors text
const ageError = document.getElementById('ageError');
const emailError = document.getElementById('emailError');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const submitError = document.getElementById('submitError');

// Patterns
const age_pattern = /^[0-9]$/i;
const username_pattern = /^[a-zA-Z]{4,}$/i;
const email_pattern = /\w+@\w{2,}\.\w{2,}/i;
const password_pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W)(?!.*[-_=+|\\].*).{8,}$/;

// Storing valid input from form
_username = "";
_email = "";
_age = "";
_password = "";

let no_errors = true;

const validate = evt => {
    no_errors = true;

    switch (evt.target.id) {

        case 'age':
            if (!age_pattern.test(age.value)) {
                ageError.innerHTML = "Invalid Age";
                no_errors = false;
                return;
            } else {
                ageError.innerHTML = "&nbsp";
            }
            break;

        case 'email':
            if (!email_pattern.test(email.value)) {
                emailError.innerHTML = "Email Is Not Valid";
                no_errors = false;
                return;
            } else {
                emailError.innerHTML = "&nbsp";
            }
            break;

        case 'username':
            if (!username_pattern.test(username.value)) {
                usernameError.innerHTML = "Username Is Not Valid";
                no_errors = false;
                return;
            } else {
                usernameError.innerHTML = "&nbsp";
            }
            break;

        case 'password':
            if (!password_pattern.test(password.value)) {
                passwordError.innerHTML = "Requirements Not Satisfied";
                no_errors = false;
                return;
            } else {
                passwordError.innerHTML = "&nbsp";
            }
            break;

        default: // Executes when the submit button is clicked

            //Final Check before submit
            if (age_pattern.test(age.value)
                && email_pattern.test(email.value)
                && username_pattern.test(username.value)
                && password_pattern.test(password.value)) {
                console.log("Form is clean.")
                //Storing data
                _username = username.value;
                _email = email.value;
                _password = password.value;
                _age = age.value;

                //Returning true
                no_errors = true;
                saveUserToDatabase();
                return no_errors;
            } else {
                no_errors = false;
                console.log("You have Errors.")
                submitError.innerHTML = "Form Is Not Valid"
                setTimeout(() => { submitError.innerHTML = "&nbsp;" }, 2500);

                //Returning false
                return no_errors;
                
            }
            
    }
 
};



// Saving new user information to the database here.
const saveUserToDatabase = () => {

    // Send the values in the console logs to the database instead
    console.log("username", _username);
    console.log("email", _email);
    console.log("age", _age);
    console.log("password", _password);

}


email.addEventListener('input', validate);
username.addEventListener('input', validate);
password.addEventListener('input', validate);