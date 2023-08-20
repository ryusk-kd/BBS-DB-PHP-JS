(function () {
    onload();

    /**
     * Attach click event listener to each .nav_button element
     *
     */
    function onload() {
        // Get all .nav_button elements
        const navButtons = document.querySelectorAll('.nav_button');
    
        // Attach click event listener to each .nav_button element
        navButtons[0].addEventListener('click', (event) => {
            // Prevent default behavior of the navigation button click
            event.preventDefault();
    
            // Toggle #post display on click
            const element = document.getElementById("post");
    
            // Check the current display value
            if (element.style.display === "block") {
                // Change the display value to "block" if it's currently set to "none"
                element.style.display = "none";
            } else {
                // Otherwise, change it to "none"
                element.style.display = "block";
            }
        });
    
        // Attach click event listener to each .nav_button element
        navButtons[1].addEventListener('click', (event) => {
            // Prevent default behavior of the navigation button click
            event.preventDefault();
    
            // Move account.html
            window.location.href = "account.html";
        })
    }

    
}())
