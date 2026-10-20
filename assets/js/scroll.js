(function () {
    "use strict";

    var container = document.querySelector(".fab-container");
    var toggleButton = document.getElementById("fabToggleBtn");
    var topButton = document.getElementById("scrollToTopBtn");
    var bottomButton = document.getElementById("scrollToBottomBtn");

    if (!container || !toggleButton) {
        return;
    }

    var SCROLL_THRESHOLD = 20;
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isOpen = false;
    var scrollTicking = false;

    function setOpen(open) {
        if (isOpen === open) {
            return;
        }

        isOpen = open;
        container.setAttribute("data-open", String(open));
        toggleButton.setAttribute("aria-expanded", String(open));
    }

    function updateFabVisibility() {
        var scrolled = window.scrollY > SCROLL_THRESHOLD;
        toggleButton.classList.toggle("is-hidden", !scrolled);

        if (scrolled) {
            setOpen(false);
        }
    }

    function handleScroll() {
        if (scrollTicking) {
            return;
        }

        scrollTicking = true;
        window.requestAnimationFrame(function () {
            updateFabVisibility();
            scrollTicking = false;
        });
    }

    function scrollToPosition(position) {
        window.scrollTo({
            top: position,
            behavior: reducedMotion.matches ? "auto" : "smooth"
        });
    }

    toggleButton.addEventListener("click", function () {
        setOpen(!isOpen);
    });

    if (topButton) {
        topButton.addEventListener("click", function () {
            scrollToPosition(0);
            setOpen(false);
        });
    }

    if (bottomButton) {
        bottomButton.addEventListener("click", function () {
            scrollToPosition(document.documentElement.scrollHeight);
            setOpen(false);
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && isOpen) {
            setOpen(false);
            toggleButton.focus();
        }
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    updateFabVisibility();
})();
