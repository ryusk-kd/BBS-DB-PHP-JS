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

// Add event listener to the submit button in the post form
function attachPostSubmitListener() {
    const submitButton = document.querySelector('#post [type=submit]');
    const handleClick = async (event) => {
        event.preventDefault();
        // console.log("Clicked! Submitting...");
        const form = document.querySelector("#post form");
        const formData = new FormData(form);
        // Post comment
        const response = await postComment(formData);
        console.log(response);
        if (response === true) {
            // window.location.reload();
        } else {
            alert('コメントを投稿できませんでした。');
        }
    }
    submitButton.addEventListener('click', handleClick);
}


// Add event listener to the submit button in the post form
function attachPostSubmitListener() {
    const submitButton = document.querySelector('#post [type=submit]');
    
    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const form = document.querySelector("#post form");
        const formData = new FormData(form);
        //console.log(form, formData.get('operation'));
        const [ operation, topic_id, content] = [formData.get('operation'), formData.get('topic_id'), formData.get('content')];
        
        
            const response = await postComment(operation, topic_id, content);
            //console.log(response);
            
            if (response === true) {
                // Optionally, you can add a success message or redirect here
                window.location.reload();
                // alert('コメントを投稿しました。');
            } else {
                alert('コメントを投稿できませんでした。\n' + response);
            }
        
    });
}

async function postComment(operation, id, content) {
    try {
        const response = await fetch(BASE_URL, {
            method: 'POST',
            body: new URLSearchParams({
                operation,
                id,
                content
            })
        });

        if (!response.ok) {
            throw new Error('Request failed with status: ' + response.status);
        }

        return await response.json();
    } catch (error) {
        throw new Error('Error posting comment: ' + error.message);
    }
}


async function main() {
    try {
        attachNavButtonListeners();
        const { topic, posts } = await getTopicAndPosts();

        document.title = topic.title;
        document.querySelector('#title').textContent = topic.title;
        document.querySelector('#outline').textContent = topic.content;
        document.getElementById('posts').innerHTML = generatePostElements(posts);
        document.querySelector("#post>form>[name=topic_id]").value = topic.topic_id;

        attachPostSubmitListener();
    } catch (error) {
        console.error("An error occurred:", error);
        throw error;
    }
}

main();
