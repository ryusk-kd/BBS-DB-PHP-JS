const topicsPhpUrl = 'topics.php';
const accountPhpUrl = 'account.php';

// Attach click event listener to each .nav_button element.
const attachNavButtonListeners = () => {
  const navButtons = document.querySelectorAll('.nav_button');

  const handleNavButtonClick = (event, index) => {
    event.preventDefault();
    const button = event.target;

    if (index === 0) {
      togglePost();
    } else if (index === 1) {
      window.location.href = "account/";
    }
  };

  navButtons.forEach((button, index) => {
    button.addEventListener('click', (event) => handleNavButtonClick(event, index));
  });
};


// Toggle post visibility
const togglePost = () => {
  const element = document.getElementById("post");
  element.style.display = element.style.display === "block" ? "none" : "block";
};


// Retrieve topics from the server
const getTopics = async () => {
  const response = await fetch(topicsPhpUrl, {
    method: 'POST',
    body: new URLSearchParams({
      operation: 'get_topics'
    })
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};


// Function to generate HTML for each topic
const generateTopicHTML = (topic) => {
  const { title, content, topic_id } = topic; // Destructure the topic object
  const outline = content.replace(/\n/g, "<br>");
  const topicLink = `./topic/?id=${topic_id}`;
  return `
    <li>
      <a href="${topicLink}">
        <h2>${title}</h2>
        <p>${outline}</p>
      </a>
    </li>`;
};


// Attaches a click event listener to the submit button.
const attachPostSubmitListener = () => {
  const submitButton = document.querySelector('#post [type=submit]');

  // Handles the click event of the submit button.
  const handleClick = async (event) => {
    event.preventDefault();
    const form = document.querySelector("#post form");
    const formData = new FormData(form);
    const topicID = await postTopic(formData);
    // if topicID is number, redirect to topic page
    window.location.href = `./topic/?id=${topicID}`;
  }

  submitButton.addEventListener('click', handleClick);
};


// Post a new topic to the server
const postTopic = async (formData) => {
  const response = await fetch(topicsPhpUrl, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

const postToken = async (token) => {
  // console.log(token);
  const response = await fetch(accountPhpUrl, {
      method: 'POST',
      body: new URLSearchParams({
          operation: 'verify_token',
          token
      })
  })
  if (!response.ok) {
      throw new Error(response.statusText);
  }

  // Delete "token" cookie
  if (!(await response.json())) {
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  }
};

/**
 * Verifies the login token by retrieving it from the cookie store
 * and posting it to the server.
 */
const verifyLoginToken = async () => {
  try {
    const tokenCookie = await cookieStore.get('token');

    if (tokenCookie) {
      const token = tokenCookie.value;
      // console.log('Token:', token);
      postToken(token);
    } else {
      // console.log('Token cookie not found');
    }
  } catch (error) {
    console.error('Error getting token cookie:', error);
  }
};

// Main function
const main = async () => {
  const topics = await getTopics();
  const topicsHTML = topics.map(generateTopicHTML).join("");

  const topicsContainer = document.getElementById("topics");
  topicsContainer.lastElementChild.innerHTML = topicsHTML;

  attachNavButtonListeners();
  attachPostSubmitListener();
  verifyLoginToken();
};

main();
