/**
 * DOMContentLoaded: This event waits for the browser to finish loading the HTML.
 * If we don't use this, the script might try to find the 'loginForm' before 
 * the browser has even drawn it on the screen, causing a "null" error.
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log("JS loaded and HTML is ready!");

    // We 'grab' the form from the HTML using its unique ID
    const loginForm = document.getElementById('loginForm');

    /**
     * IF Check: We make sure 'loginForm' actually exists before doing anything.
     * This prevents the code from crashing if this script is loaded on the wrong page.
     */
    if (loginForm) {
        
        // We 'listen' for when the user clicks the Submit button or presses Enter
        loginForm.addEventListener('submit', function(event) {
            
            /**
             * event.preventDefault(): By default, HTML forms try to refresh the whole page.
             * We stop that behavior so we can handle the login ourselves with JS.
             */
            event.preventDefault();

            // We grab the text the user actually typed into the input fields
            const emailInput = document.getElementById('email').value;
            const passwordInput = document.getElementById('password').value;
            
            // We grab the <p> tag where we want to display error messages
            const errorDisplay = document.getElementById('error-message');

            /**
             * The 'Fake' Database: An array of objects.
             * In a real website, these would be stored safely on a server.
             */
            const users = [
                { email: "jg60qk@student.aau.dk", password: "12345" },
                { email: "on64ow@student.aau.dk", password: "12345" },
                { email: "jz84bu@student.aau.dk", password: "12345" },
                { email: "wj04vk@student.aau.dk", password: "12345" },
                { email: "hi57op@student.aau.dk", password: "12345" },
                { email: "kn87ue@student.aau.dk", password: "12345" },
                { email: "aaam25@student.aau.dk", password: "12345" }
            ];

            /**
             * .find(): This looks through our 'users' list. 
             * It checks if ANY user has an email AND a password that match 
             * exactly what the user typed in the boxes.
             */
            const userExists = users.find(user => 
                user.email === emailInput && user.password === passwordInput
            );

            // If a matching user was found, userExists will be true (an object)
            if (userExists) {
                console.log("Success! Redirecting...");
                
                // This tells the browser to change the URL and go to the overview page
                window.location.href = "event_overview.html";
            } 
            // If no match was found, userExists will be 'undefined'
            else {
                console.log("Login failed.");
                
                // We check if the error message element exists in HTML
                if (errorDisplay) {
                    // We inject the text into the HTML and change the color to red
                    errorDisplay.innerText = "Invalid student email or password.";
                    errorDisplay.style.color = "#ff6b6b"; 
                } else {
                    /**
                     * Fallback: If you forgot to add <p id="error-message"></p> 
                     * to your HTML, we show a popup alert instead.
                     */
                    alert("Invalid credentials.");
                }
            }
        });
    } else {
        /**
         * Error logging: If the script can't find 'loginForm', 
         * we print a message in the browser console to help us debug.
         */
        console.error("Critical Error: Could not find 'loginForm' in your HTML. Check your ID!");
    }
});
