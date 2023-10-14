const topicsPhpUrl = '../topics.php';
const accountPhpUrl = '../account.php';


const handleNavButtonClick = (event) => {
    if (event.target.classList.contains('nav_button')) {
        const button = event.target.parentElement;
        const index = Array.from(button.parentElement.children).indexOf(button);

        if (index === 0) {
            togglePost();
        } else if (index === 1 || index === 2) {
            const page = index === 1 ? '' : 'account/';
            window.location.href = `../${page}`;
        }
    }
}

const togglePost = () => {
    const element = document.getElementById('post');
    element.style.display = element.style.display === 'block' ? 'none' : 'block';
}

const getTopicAndPosts = async () => {
    try {
        const id = getTopicIDFromURL();
        const [topic, posts] = await Promise.all([
            fetchDataFromServer('get_topic_by_id', id),
            fetchDataFromServer('get_posts', id)
        ]);
        return { topic, posts };
    } catch (error) {
        console.error('Error retrieving topic and posts:', error);
        throw error;
    }
}

const getTopicIDFromURL = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('id');
}

const fetchDataFromServer = async (operation, id) => {
    const response = await fetch(topicsPhpUrl, {
        method: 'POST',
        body: new URLSearchParams({ operation, id })
    });

    if (!response.ok) {
        throw new Error('Request failed with status: ' + response.status);
    }

    return await response.json();
}

const generatePostElements = (posts) => {
    return posts.map((post, index) => `
        <div>
            <p class="post">
                <span class="post_number">${index + 1}: </span>
                <span class="date">${post.created_at} </span>
                <span class="content">${post.content.replace(/\n/g, '<br>')} </span>
            </p>
        </div>
    `).join('');
}

// Add event listener to the submit button in the post form
const attachPostSubmitListener = () => {
    const submitButton = document.querySelector('#post [type=submit]');

    submitButton.addEventListener('click', async (event) => {
        event.preventDefault();
        const form = document.querySelector('#post form');
        const formData = new FormData(form);

        try {
            const response = await postComment(
                formData.get('operation'),
                formData.get('topic_id'),
                formData.get('content')
            );

            if (response === true) {
                window.location.reload();
            } else {
                alert('コメントを投稿できませんでした.\n' + response);
            }
        } catch (error) {
            throw new Error('Error posting comment: ' + error.message);
        }
    });
}

const postComment = async (operation, id, content) => {
    const response = await fetch(topicsPhpUrl, {
        method: 'POST',
        body: new URLSearchParams({ operation, id, content })
    });

    if (!response.ok) {
        throw new Error('Request failed with status: ' + response.status);
    }

    return await response.json();
}


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


const main = async () => {
    // Add event listeners
    document.addEventListener('click', handleNavButtonClick);
    attachPostSubmitListener();

    try {
        const { topic, posts } = await getTopicAndPosts();
        document.title = topic.title;
        document.querySelector('#title').textContent = topic.title;
        document.querySelector('#outline').textContent = topic.content;
        document.getElementById('posts').innerHTML = generatePostElements(posts);
        document.querySelector('#post > form > [name=topic_id]').value = topic.topic_id;
    } catch (error) {
        console.error('An error occurred:', error);
        throw error;
    }

    verifyLoginToken();
}

main();
