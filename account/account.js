const accountPhpUrl = '../account.php';
const topicsPhpUrl = '../topics.php';

const navButtons = document.querySelectorAll('.nav_button');
const submitForm = document.getElementById('accountForm');
const useNameFilled = document.getElementById('user_name');
const passwordFilled = document.getElementById('password');

const clearTokenCookie = () => {
  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
};

const postToken = async () => {
  const token = (await cookieStore.get('token'))?.value;

  if (!token) return;

  const params = new URLSearchParams({
    operation: 'verify_token',
    token
  });

  const options = {
    method: 'POST',
    body: params
  };

  try {
    const response = await fetch(accountPhpUrl, options);

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const responseBody = await response.json();

    if (!responseBody) {
      clearTokenCookie();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const handleNavButtonClick = (event) => {
  const buttonOperation = event.target.dataset.operation;
  const buttonText = event.target.textContent;
  const inputUserName = document.getElementById('user_name');
  const inputPassword = document.getElementById('password');

  if (buttonOperation === "topics") {
    window.location.href = '../';
    return;
  }

  event.preventDefault();

  document.getElementById('operation').value = buttonOperation;
  document.getElementById('submit').value = buttonText;

  const isLogout = buttonText === 'ログアウト';
  inputUserName.disabled = isLogout;
  inputPassword.disabled = isLogout;
};

const handleFormSubmit = async (event) => {
  event.preventDefault();

  if (!useNameFilled.checkValidity() || !passwordFilled.checkValidity()) {
    alert('ユーザー名とパスワードを入力してください');
    return;
  }

  try {
    const formData = new FormData(submitForm);
    const response = await fetch(accountPhpUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    } else {
      const responseText = await response.text();
      alert(JSON.parse(responseText));
      toggleNavButtonVisibility();
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const toggleNavButtonVisibility = async () => {
  const navButtons = document.querySelectorAll('.nav_button');
  const [, button1, button2, button3, button4] = navButtons;

  const addHiddenClass = (button) => {
    button.parentNode.classList.add('hidden');
  };

  const removeHiddenClass = (button) => {
    button.parentNode.classList.remove('hidden');
  };

  const tokenObject = await cookieStore.get('token');

  if (tokenObject) {
    addHiddenClass(button1);
    removeHiddenClass(button2);
    addHiddenClass(button3);
    removeHiddenClass(button4);
    button2.click();
    displayPosts(true);
  } else {
    removeHiddenClass(button1);
    addHiddenClass(button2);
    removeHiddenClass(button3);
    addHiddenClass(button4);
    button1.click();
    displayPosts(false);
  }
};

const displayPosts = async (flag) => {
  const divPosts = document.getElementById('posts');

  if (flag) {
    try {
      const posts = await Promise.resolve(getPostsByUserName());
      const postElements = generatePostElements(posts);
      divPosts.innerHTML = postElements;

      divPosts.querySelectorAll('.deleteButton').forEach(button => {
        button.addEventListener('click', handleDeleteButtonClick);
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  } else {
    divPosts.innerHTML = '';
  }
};

const handleDeleteButtonClick = async (event) => {
  event.preventDefault();
  const formData = new FormData(event.target.parentNode);

  try {
    const response = await fetch(topicsPhpUrl, {
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
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const getPostsByUserName = async () => {
  try {
    const response = await fetch(topicsPhpUrl, {
      method: 'POST',
      body: new URLSearchParams({
        operation: 'get_posts_by_user_name'
      })
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    return response.json();
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const generatePostElements = (posts) => {
  return posts.map((post, index) => `
    <div>
      <p class="post">
        <span class="post_number">${index + 1}: </span>
        <span class="date">${post.created_at} </span>
        <span class="content">${post.content.replace(/\n/g, "<br>")} </span>
      </p>
      <form method="post">
        <input type="hidden" name="post_id" value="${post.post_id}">
        <input class="deleteButton" type="submit" name="delete" value="削除">
      </form>
    </div>
  `).join("");
};

// Verify login token
postToken();

// Attach a click event listener to each navigation button
navButtons.forEach(button => {
  button.addEventListener('click', handleNavButtonClick);
});

// Check if login and toggle navButtons visibility
toggleNavButtonVisibility();

// Attach a submit event listener to the form
submitForm.addEventListener("submit", handleFormSubmit);
