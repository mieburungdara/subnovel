document.addEventListener('DOMContentLoaded', function() {
    var fabToggleBtn = document.getElementById("fabToggleBtn");
    var scrollTopBtn = document.getElementById("scrollToTopBtn");
    var scrollBottomBtn = document.getElementById("scrollToBottomBtn");
    var fabChildButtons = document.querySelectorAll('.fab-child-button');

    let fabOpen = false;

    function toggleFab() {
        fabOpen = !fabOpen;
        fabChildButtons.forEach(function(button) {
            if (fabOpen) {
                button.classList.add('show');
            } else {
                button.classList.remove('show');
            }
        });
        fabToggleBtn.textContent = fabOpen ? '✕' : '+'; // Change icon
    }

    fabToggleBtn.addEventListener('click', toggleFab);

    window.onscroll = function() {
        scrollFunction();
        if (fabOpen) {
            toggleFab(); // Close FAB on scroll
        }
    };

    function scrollFunction() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            fabToggleBtn.style.display = "flex"; // Show FAB toggle button
        } else {
            fabToggleBtn.style.display = "none"; // Hide FAB toggle button
        }
    }

    scrollTopBtn.onclick = function() {
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        if (fabOpen) toggleFab(); // Close FAB after action
    }

    scrollBottomBtn.onclick = function() {
        window.scrollTo(0, document.body.scrollHeight);
        if (fabOpen) toggleFab(); // Close FAB after action
    }

    // Initially hide child buttons
    fabChildButtons.forEach(function(button) {
        button.classList.remove('show');
    });
});