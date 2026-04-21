/**
  DOMContentLoaded: Ensures the script waits for the HTML to load 
 before trying to find the 'loginForm'.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("JS loaded and HTML is ready!");

    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        
        loginForm.addEventListener('submit', function(event) {
            // Stops the page from refreshing automatically
            event.preventDefault();

            // 1. Grab user input
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('password').value;
            const errorDisplay = document.getElementById('error-message');

            // 2. Clear previous error messages
            if (errorDisplay) {
                errorDisplay.innerText = "";
            }

            /*
              FETCH: Sends the email and password to your local server.
              Your server then checks the MongoDB Atlas 'users' collection.
             */
            fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailInput,
                    password: passwordInput
                })
            })
            .then(response => {
                // If the server finds the user, response.ok is true
                if (response.ok) {
                    return response.json();
                } else {
                    // If login is wrong (401), we jump to the .catch() block
                    throw new Error('Invalid login credentials');
                }
            })
            .then(data => {
                console.log("Success! Server found the user.");

                /*
                  LocalStorage: We save the User ID and Email in the browser.
                  This is CRITICAL so other pages (like the calendar) know 
                  which student is currently logged in.
                 */
                localStorage.setItem('userId', data.userId);
                localStorage.setItem('userEmail', emailInput);
                // 2. SAVE THE REAL NAME (Crucial for the header!)
                localStorage.setItem('realName', data.userName);

                // Redirect to the event overview page
                window.location.href = "event_overview.html";
            })
            .catch(error => {
                console.error("Login Error:", error.message);
                
                // Show error message to the user
                if (errorDisplay) {
                    errorDisplay.innerText = "Invalid student email or password.";
                    errorDisplay.style.color = "#ff6b6b"; 
                } else {
                    alert("Invalid credentials.");
                }
            });
        });

    } else {
        console.error("Critical Error: Could not find 'loginForm' in your HTML. Check your ID!");
    }
});

/* HEADER NAME CHANCE: */

document.addEventListener('DOMContentLoaded', function() {
    // Accesses the 'realName' we saved during the login process earlier
    const savedName = localStorage.getItem('realName');
    const userNameElement = document.querySelector('.user-name');
// Locates the paragraph tag in the header where the name should be displayed
    if (savedName && userNameElement && savedName !== "undefined") {
        // 1. Split the name into an array of words
        /*
          NAME FORMATTING: To keep the UI clean, we shorten long names.
          Example: "Marius Piasecki Frey Hansen" becomes "Marius Hansen".
         */
        const nameParts = savedName.trim().split(' '); // Turns the name into a list of words

        if (nameParts.length > 1) {
            // 2. Take the first word and the last word
            const firstName = nameParts[0];
            const lastName = nameParts[nameParts.length - 1];
            // Injects the shortened name into the HTML header
            userNameElement.innerText = `${firstName} ${lastName}`;
        } else {
            // If they only have one name, just show that
            userNameElement.innerText = savedName;
        }
        
        console.log("Header show name.");
    }
});
