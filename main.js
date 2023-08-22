// Function to generate HTML for each topic
function generateTopicHTML(topic) {
    const { title, content, topic_id } = topic; // Destructure the topic object
    const outline = content.replace(/\n/g, "<br>");
    const topicLink = `./topic/?id=${topic_id}`;
    return `
        <li>
            <a href="${topicLink}">
                <h2>${title}</h2>
                <p>${outline}</p>
            </a>
            <div class="gradientScreen"></div>
        </li>`;
}

// Attach click event listener to each .nav_button element.
function attachNavButtonListeners() {
    const navButtons = document.querySelectorAll('.nav_button');

    const handleNavButtonClick = (event, index) => {
        event.preventDefault();
        const button = event.target;

        if (index === 0) {
            togglePost();
        } else if (index === 1) {
            window.location.href = "account.html";
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

// Retrieve topics from the server
async function getTopics() {
    const response = await fetch('topics.php', {
        method: 'POST',
        body: new URLSearchParams({
            operation: 'get_topics'
        })
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

// Main function
async function main() {
    const topics = await getTopics();

    const topicsHTML = topics.map(generateTopicHTML).join("");

    const topicsContainer = document.getElementById("topics");
    topicsContainer.lastElementChild.innerHTML = topicsHTML;

    attachNavButtonListeners();
}

main();
