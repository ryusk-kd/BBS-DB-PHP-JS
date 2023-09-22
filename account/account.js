(async function() {
  // URL of the account API
  const ACCOUNT_API_URL = '../account.php';

  // Select all the navigation buttons
  const navButtons = document.querySelectorAll('.nav_button');
  const submitForm = document.getElementById('accountForm');
  const useNameFilled = document.getElementById('user_name');
  const passwordFilled = document.getElementById('password');

  // Attach a click event listener to each navigation button
  navButtons.forEach(button => {
    button.addEventListener('click', handleNavButtonClick);
  });

  // Check if login and toggle navButtons visibility
  toggleNavButtonVisibility();

  // Attach a submit event listener to the form
  submitForm.addEventListener("submit", handleFormSubmit);

  // Display posts of the current user
  /*if (document.cookie.match(/user_name=([^;]*)/)) {
    await displayPosts(true);
  }*/

  // Function to handle the click event of the navigation buttons
  function handleNavButtonClick(event) {
    // Get the button operation and text content
    const buttonOperation = event.target.dataset.operation;
    const buttonText = event.target.textContent;
    const inputUserName = document.getElementById('user_name');
    const inputPassword = document.getElementById('password');

    // Redirect to main page if the operation is "topics"
    if (buttonOperation === "topics") {
      window.location.href = '../';
      return;
    }

    // Prevent the default form submission behavior
    event.preventDefault();

    // Change the form operation and submit button text
    document.getElementById('operation').value = buttonOperation;
    document.getElementById('submit').value = buttonText;

    // Disable or enable input fields based on the button text
    const isLogout = buttonText === 'ログアウト';
    inputUserName.disabled = isLogout;
    inputPassword.disabled = isLogout;
  }

  
  // Function to handle the form submission
  function handleFormSubmit(event) {
    event.preventDefault();

    // Check if input fields are valid
    if (!useNameFilled.checkValidity() || !passwordFilled.checkValidity()) {
      alert('ユーザー名とパスワードを入力してください');
      return;
    }

    // Get form data
    const formData = new FormData(submitForm);

    // Create an XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Configure the request
    xhr.open("POST", ACCOUNT_API_URL, true);
    xhr.responseType = "json";

    // Define the onload event handler
    xhr.onload = function() {
      if (xhr.status === 200) {
        // Request was successful
        const response = xhr.response;
        alert(response, submitForm.querySelector('#submit').value);
        toggleNavButtonVisibility();
      } else {
        // Request failed
        alert("Error: " + xhr.status);
      }
    };

    // Send the request
    xhr.send(formData);
  }


  /**
   * Toggles the visibility of navigation buttons based on user login status.
   */
  function toggleNavButtonVisibility() {
    // Get all navigation buttons
    const navButtons = document.querySelectorAll('.nav_button');

    // Extract individual buttons
    const [button0, button1, button2, button3, button4] = navButtons;

    // Get user name from cookie
    const userName = document.cookie.match(/user_name=([^;]*)/);

    /**
     * Adds the 'hidden' class to the parent element of a button.
     * 
     * @param {Element} button - The button element.
     */
    const addHiddenClass = (button) => {
      button.parentNode.classList.add('hidden');
    }

    /**
     * Removes the 'hidden' class from the parent element of a button.
     * 
     * @param {Element} button - The button element.
     */
    const removeHiddenClass = (button) => {
      button.parentNode.classList.remove('hidden');
    }

    // Toggle button visibility based on user login status
    if (userName) {
      addHiddenClass(button1);
      removeHiddenClass(button2);
      addHiddenClass(button3);
      removeHiddenClass(button4);
      button2.click();
    } else {
      removeHiddenClass(button1);
      addHiddenClass(button2);
      removeHiddenClass(button3);
      addHiddenClass(button4);
      button1.click();
    }
  }


})();


// Display posts of the current user
if (document.cookie.match(/user_name=([^;]*)/)) {
  displayPosts(true);
}


async function displayPosts(flag) {
  if (flag) {
    const posts = await Promise.resolve(getPostsByUserName());
    const postElements = generatePostElements(posts);
    const divPosts = document.getElementById('posts');
    divPosts.innerHTML = postElements;
    divPosts.querySelectorAll(".deleteButton").forEach(button => {
      button.addEventListener('click', handleDeleteButtonClick);
    });
  } else {
    document.getElementById('posts').innerHTML = '';
  }
}


async function handleDeleteButtonClick(event) {
  event.preventDefault();
  // console.log(event.target.parentNode);
  const formData = new FormData(event.target.parentNode);
  // console.log(formData.get('post_id'));
  const TOPICS_API_URL = "../topics.php";
  const response = await fetch(TOPICS_API_URL, {
      method: 'POST',
      body: new URLSearchParams({
          operation: 'delete_post',
          post_id: formData.get('post_id')
      })
  });

  if (!response.ok) {
      throw new Error(response.statusText);
  } else {
    event.target.parentNode.parentNode.remove();
  }

  return response.json();
};


async function getPostsByUserName() {
  const TOPICS_API_URL = "../topics.php";
  const response = await fetch(TOPICS_API_URL, {
      method: 'POST',
      body: new URLSearchParams({
          operation: 'get_posts_by_user_name'
      })
  });

  if (!response.ok) {
      throw new Error(response.statusText);
  }

  return response.json();
}


function generatePostElements(posts) {
  return posts.map((post, index) => `
      <div>
          <p class="post">
              <span class="post_number">${index + 1}: </span>
              <span class="date">${post.created_at} </span>
              <span class="content">${post.content.replace(/\n/g, "<br>")} </span>
          </p>
          <form method="post">
              <input type=hidden name=post_id value=${post.post_id}>
              <input class="deleteButton" type=submit name=delete value="削除">
          </form>
      </div>
  `).join("");
}