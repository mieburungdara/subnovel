(function () {
    "use strict";

    var bar = document.querySelector("[data-bottom-bar]");
    var fill = document.querySelector("[data-progress-fill]");
    var progress = document.querySelector("[data-bottom-bar-progress]");
    var percentLabel = document.querySelector("[data-progress-label]");
    var topButton = document.querySelector("[data-scroll-top]");
    var searchButton = document.querySelector("[data-focus-search]");
    var searchInput = document.querySelector("[data-filter-input]");

    if (!bar) {
        return;
    }

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var ticking = false;

    function updateProgress() {
        var doc = document.documentElement;
        var max = doc.scrollHeight - window.innerHeight;
        var ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        var percent = Math.round(ratio * 100);

        if (fill) {
            fill.style.width = percent + "%";
        }

        if (progress) {
            progress.setAttribute("aria-valuenow", String(percent));
        }

        if (percentLabel) {
            percentLabel.textContent = percent + "%";
        }
    }

    function handleScroll() {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(function () {
            try {
                updateProgress();
            } finally {
                ticking = false;
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

    if (topButton) {
        topButton.addEventListener("click", function () {
            scrollToPosition(0);
        });
    }

    if (searchButton && searchInput) {
        searchButton.hidden = false;
        searchButton.addEventListener("click", function () {
            scrollToPosition(0);
            searchInput.focus();
            searchInput.select();
        });
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    updateProgress();
})();
