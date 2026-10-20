(function () {
    "use strict";

    var SCROLL_THRESHOLD = 20;

    function init() {
        var container = document.querySelector(".fab-container");
        if (!container) {
            return;
        }

        var toggleButton = container.querySelector(".fab-button");
        var topButton = container.querySelector('[data-action="top"]');
        var bottomButton = container.querySelector('[data-action="bottom"]');

        if (!toggleButton) {
            return;
        }

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
            toggleButton.setAttribute("aria-label", open ? "Tutup pintasan navigasi" : "Buka pintasan navigasi");
        }

        function updateFabVisibility() {
            var scrolled = window.scrollY > SCROLL_THRESHOLD;
            toggleButton.classList.toggle("is-hidden", !scrolled);

            if (!scrolled) {
                setOpen(false);
            }
        }

        function handleScroll() {
            if (scrollTicking) {
                return;
            }

            scrollTicking = true;
            window.requestAnimationFrame(function () {
                try {
                    updateFabVisibility();
                } finally {
                    scrollTicking = false;
                }
            });
        }

        function scrollToPosition(position) {
            if ("scrollBehavior" in document.documentElement.style) {
                window.scrollTo({
                    top: position,
                    behavior: reducedMotion.matches ? "auto" : "smooth"
                });
                return;
            }

            window.scrollTo(0, position);
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
            if (event.key === "Escape" && isOpen && container.contains(document.activeElement)) {
                setOpen(false);
                toggleButton.focus();
            }
        });

        document.addEventListener("click", function (event) {
            if (isOpen && !container.contains(event.target)) {
                setOpen(false);
            }
        });

        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleScroll, { passive: true });

        updateFabVisibility();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
