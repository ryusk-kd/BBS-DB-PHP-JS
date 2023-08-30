// Attach click event listener to each .nav_button element.
function attachNavButtonListeners() {
    const navButtons = document.querySelectorAll('.nav_button');

    const handleNavButtonClick = (event, index) => {
        event.preventDefault();
        const button = event.target;

        if (index === 0) {
            togglePost();
        } else if (index === 1) {
            window.location.href = "../main.html";
        } else if (index === 2) {
            window.location.href = "../account.html";
        }
    };

    navButtons.forEach((button, index) => {
        button.addEventListener('click', (event) => handleNavButtonClick(event, index));
    });
}


// Toggle post visibility
const togglePost = () => {
    const element = document.getElementById("post");
    element.style.display = element.style.display === "block" ? "none" : "block";
};


// Retrieve the topic and posts associated with the ID from the server
async function getTopicAndPosts() {
    try {
        const id = getIDFromURL();
        const topic = await fetchTopicFromServer(id);
        const posts = await fetchPostsFromServer(id);
        return { topic, posts };
    } catch (error) {
        console.error("Error retrieving topic and posts:", error);
        throw error;
    }
}


function getIDFromURL() {
    const currentUrl = window.location.search;
    const urlParams = new URLSearchParams(currentUrl);
    const id = urlParams.get('id');
    return id;
}

async function fetchTopicFromServer(ID) {
    const response = await fetch('../topics.php', {
        method: 'POST',
        body: new URLSearchParams({
            operation: 'get_topic_by_id',
            id: ID
        })
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}

async function fetchPostsFromServer(ID) {
    const response = await fetch('../topics.php', {
        method: 'POST',
        body: new URLSearchParams({
            operation: 'get_posts',
            id: ID
        })
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return response.json();
}


/**
 * Generate HTML for the given posts.
 * @param {Array} posts - The array of posts.
 * @returns {string} - The generated HTML.
 */
function generatePostsHTML(posts) {
    let html = '';
    let postNumber = 1;

    // Loop through each fetched post and generate the HTML
    for (const post of posts) {
        html += `<div>
            <p class="post">
                <span class="post_number">${postNumber}: </span>
                <span class="date">${post['created_at']} </span>
                <span class="content">${post['content'].replace(/\n/g, "<br>")} </span>
            </p>
            <!-- div class="gradientScreen"></div -->
        </div>`;

        // Increment the post number
        postNumber++;
    }

    return html;
}

// Main function
async function main() {
    /*
    const topics = await getTopics();
    console.log(topics);
    const topicsHTML = topics.map(generateTopicHTML).join("");

    const topicsContainer = document.getElementById("topics");
    topicsContainer.lastElementChild.innerHTML = topicsHTML;
    */
    attachNavButtonListeners();
    // attachPostSubmitListener();

    const { topic, posts } = await getTopicAndPosts();
    document.title = topic.title;
    document.querySelector('#title').innerHTML = topic.title;
    document.querySelector('#outline').innerHTML = topic.content;
    document.getElementById('posts').innerHTML = generatePostsHTML(posts);
}

main();