/* DOMContentLoaded: Ensures the script waits for the HTML to load 
 before trying to find the 'loginForm'. */

document.addEventListener("DOMContentLoaded", function () {
  console.log("JS loaded and HTML is ready!");

  // ===== LOGIN FORM =====

  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      // Prevents the form from refreshing the page on submit
      event.preventDefault();

      const emailInput = document.getElementById("email").value;
      const passwordInput = document.getElementById("password").value;
      const errorDisplay = document.getElementById("error-message");

      // Clear previous error messages
      if (errorDisplay) {
        errorDisplay.innerText = "";
      }

      // Send login credentials to the local server, which validates against MongoDB Atlas
      fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: emailInput,
          password: passwordInput,
        }),
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error("Invalid login credentials");
          }
        })
        .then((data) => {
          console.log("Success! Server found the user.");
          // Save user info to localStorage so other pages know who is logged in
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("userEmail", emailInput);
          localStorage.setItem("realName", data.userName);
          localStorage.setItem("userSemester", data.userSemester);

          // Redirect to the event overview page on successful login
          window.location.href = "event_overview.html";
        })
        .catch((error) => {
          // Show error message to the user on failed login
          if (errorDisplay) {
            errorDisplay.innerText = "Invalid student email or password.";
          } else {
            alert("Invalid credentials.");
          }
        });
    });
  }

  // ===== HEADER NAME =====
  const savedName = localStorage.getItem("realName");
  const userNameElement = document.querySelector(".user-name");

  if (savedName && userNameElement && savedName !== "undefined") {
    // Turns the name into a list of words
    const nameParts = savedName.trim().split(" "); 

    // Shorten long names to first and last word only (e.g. "Marius Piasecki Frey Hansen" → "Marius Hansen")
    if (nameParts.length > 1) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      // Injects the shortened name into the HTML header
      userNameElement.innerText = `${firstName} ${lastName}`;
    } else {
      userNameElement.innerText = savedName;
    }
    console.log("Header shows name correctly.");
  }
});