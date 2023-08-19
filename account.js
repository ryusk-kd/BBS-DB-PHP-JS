/**
 * account.js
 */
(function() {
    // Listen for the click event of the navigation buttons
    // and change the form operation

    // Get all the navigation buttons
    const navButtons = document.querySelectorAll('.nav_button');

    // Add click event listener to each navigation button
    navButtons.forEach(button => {
      button.addEventListener('click', (event) => {
        // Prevent default behavior of the navigation button click
        event.preventDefault();

        // Handle the click event
        // Get the text content of the clicked button
        var buttonOperation = event.target.dataset.operation,
            buttonText = event.target.textContent,
            inputUserName = document.getElementById('user_name'),
            inputPassword = document.getElementById('password');

        // Change the form operation to the clicked button
        document.getElementById('operation').value = buttonOperation;

        // Change the submit button text
        document.getElementById('submit').value = buttonText;

        // Check if the clicked button is 'ログアウト'
        if (buttonText === 'ログアウト') {
            // Disable input of user name and password
            inputUserName.disabled = true;
            inputPassword.disabled = true;
        } else {
            // Enable input of user name and password
            inputUserName.disabled = false;
            inputPassword.disabled = false;
        }
      });
    });

    // Listen for the submit event of the form and send AJAX request
    const submitForm = document.getElementById('accountForm'),
      useNameFilled = document.getElementById('user_name'),
      passwordFilled = document.getElementById('password');
    submitForm.addEventListener("submit", (event) => {
      event.preventDefault();
      // console.log(useNameFilled.checkValidity(), passwordFilled.checkValidity(), event.target.querySelectorAll('#submit')[0].value);

      if (!useNameFilled.checkValidity() || !passwordFilled.checkValidity()) {
        alert('ユーザー名とパスワードを入力してください');
        return;
      }

    
      // Get the form data
      const formData = new FormData(submitForm);

      // Create a new XMLHttpRequest object
      const xhr = new XMLHttpRequest();

      // Set up the request
      xhr.open("POST", "account.php", true);

      // Set the request headers if needed
      // xhr.setRequestHeader("Content-Type", "application/json");

      // Set the response type if needed
      xhr.responseType = "json";

      // Set up the onload event handler
      xhr.onload = function() {
        if (xhr.status === 200) {
          // Request was successful
          const response = xhr.response;
          // Process the response as needed
          alert(response, event.target.querySelectorAll('#submit')[0].value);
        } else {
          // Request failed
          alert("Error: " + xhr.status);
        }
      };

      // Send the request
      xhr.send(formData);
    });
})();
