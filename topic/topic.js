const BASE_URL = '../topics.php';


function attachNavButtonListeners() {
    // Attach click event listener to the common ancestor of .nav_button elements.
    document.addEventListener('click', handleNavButtonClick);
}

function handleNavButtonClick(event) {
    if (event.target.classList.contains('nav_button')) {
        const button = event.target.parentElement;
        const index = Array.from(button.parentElement.children).indexOf(button);

        if (index === 0) {
            togglePost();
        } else if (index === 1 || index === 2) {
            const page = index === 1 ? 'main.html' : 'account.html';
            window.location.href = `../${page}`;
        }
    }
}

function togglePost() {
    const element = document.getElementById("post");
    element.style.display = element.style.display === "block" ? "none" : "block";
}

async function getTopicAndPosts() {
    try {
        const id = getTopicIDFromURL();
        const [topic, posts] = await Promise.all([fetchDataFromServer('get_topic_by_id', id), fetchDataFromServer('get_posts', id)]);
        return { topic, posts };
    } catch (error) {
        console.error("Error retrieving topic and posts:", error);
        throw error;
    }
}

function getTopicIDFromURL() {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('id');
}

async function fetchDataFromServer(operation, id) {
    const response = await fetch(BASE_URL, {
        method: 'POST',
        body: new URLSearchParams({
            operation,
            id
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
        </div>
    `).join("");
}

async function main() {
    try {
        attachNavButtonListeners();
        const { topic, posts } = await getTopicAndPosts();

        document.title = topic.title;
        document.querySelector('#title').textContent = topic.title;
        document.querySelector('#outline').textContent = topic.content;
        document.getElementById('posts').innerHTML = generatePostElements(posts);
    } catch (error) {
        console.error("An error occurred:", error);
    }
}

main();
