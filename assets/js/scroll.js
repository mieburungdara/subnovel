(function () {
    "use strict";

    var bar = document.querySelector("[data-bottom-bar]");
    var fill = document.querySelector("[data-progress-fill]");
    var progress = document.querySelector("[data-bottom-bar-progress]");
    var percentLabel = document.querySelector("[data-progress-label]");
    var topButton = document.querySelector("[data-scroll-top]");
    var bottomButton = document.querySelector("[data-scroll-bottom]");
    var autoButton = document.querySelector("[data-auto-scroll]");
    var autoIcon = document.querySelector("[data-auto-scroll-icon]");
    var speedButton = document.querySelector("[data-speed-cycle]");
    var speedLabel = document.querySelector("[data-speed-label]");
    var searchButton = document.querySelector("[data-focus-search]");
    var searchInput = document.querySelector("[data-filter-input]");

    if (!bar) {
        return;
    }

    var SPEEDS = [35, 80, 180];
    var SPEED_LABELS = ["1\u00d7", "2\u00d7", "4\u00d7"];
    var SPEED_NAMES = ["lambat", "sedang", "cepat"];

    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    var ticking = false;
    var speedIndex = 0;
    var autoScroll = { active: false, frame: null, last: 0 };

    function maxScroll() {
        return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    }

    function updateProgress() {
        var max = maxScroll();
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

    function scrollToPosition(position, smooth) {
        var behavior = smooth && !reducedMotion.matches ? "smooth" : "auto";

        if ("scrollBehavior" in document.documentElement.style) {
            try {
                window.scrollTo({ top: position, behavior: behavior });
                return;
            } catch (error) {
                /* older engines reject unknown behaviour values */
            }
        }

        window.scrollTo(0, position);
    }

    function scrollBy(delta) {
        try {
            window.scrollTo({ top: window.scrollY + delta, behavior: "auto" });
        } catch (error) {
            window.scrollTo(0, window.scrollY + delta);
        }
    }

    function updateSpeedButton() {
        if (speedLabel) {
            speedLabel.textContent = SPEED_LABELS[speedIndex];
        }

        if (speedButton) {
            speedButton.setAttribute(
                "aria-label",
                "Kecepatan gulir otomatis " + (speedIndex + 1) + " kali, " + SPEED_NAMES[speedIndex]
            );
        }
    }

    function stopAutoScroll() {
        if (!autoScroll.active) {
            return;
        }

        autoScroll.active = false;
        autoScroll.last = 0;

        if (autoScroll.frame) {
            window.cancelAnimationFrame(autoScroll.frame);
            autoScroll.frame = null;
        }

        if (autoButton) {
            autoButton.setAttribute("aria-pressed", "false");
            autoButton.setAttribute("aria-label", "Gulir otomatis");
            autoButton.setAttribute("title", "Gulir otomatis");
        }

        if (autoIcon) {
            autoIcon.innerHTML = "&#9654;";
        }
    }

    function autoScrollStep(timestamp) {
        if (!autoScroll.active) {
            return;
        }

        if (!autoScroll.last) {
            autoScroll.last = timestamp;
        }

        var delta = Math.min(0.1, (timestamp - autoScroll.last) / 1000);
        autoScroll.last = timestamp;

        var max = maxScroll();
        var next = window.scrollY + SPEEDS[speedIndex] * delta;

        if (next >= max) {
            window.scrollTo(0, max);
            stopAutoScroll();
            return;
        }

        try {
            scrollBy(SPEEDS[speedIndex] * delta);
        } catch (error) {
            stopAutoScroll();
            return;
        }

        autoScroll.frame = window.requestAnimationFrame(autoScrollStep);
    }

    function startAutoScroll() {
        if (maxScroll() <= 0) {
            return;
        }

        autoScroll.active = true;
        autoScroll.last = 0;

        if (autoButton) {
            autoButton.setAttribute("aria-pressed", "true");
            autoButton.setAttribute("aria-label", "Hentikan gulir otomatis");
            autoButton.setAttribute("title", "Hentikan gulir otomatis");
        }

        if (autoIcon) {
            autoIcon.innerHTML = "&#10074;&#10074;";
        }

        autoScroll.frame = window.requestAnimationFrame(autoScrollStep);
    }

    function toggleAutoScroll() {
        if (autoScroll.active) {
            stopAutoScroll();
        } else {
            startAutoScroll();
        }
    }

    if (topButton) {
        topButton.addEventListener("click", function () {
            stopAutoScroll();
            scrollToPosition(0, true);
        });
    }

    if (bottomButton) {
        bottomButton.addEventListener("click", function () {
            stopAutoScroll();
            scrollToPosition(maxScroll(), false);
        });
    }

    if (autoButton) {
        autoButton.addEventListener("click", toggleAutoScroll);
    }

    if (speedButton) {
        speedButton.addEventListener("click", function () {
            speedIndex = (speedIndex + 1) % SPEEDS.length;
            updateSpeedButton();
        });
    }

    if (searchButton && searchInput) {
        searchButton.hidden = false;
        searchButton.addEventListener("click", function () {
            scrollToPosition(0, true);
            searchInput.focus();
            searchInput.select();
        });
    }

    document.addEventListener("wheel", stopAutoScroll, { passive: true });
    document.addEventListener("touchstart", stopAutoScroll, { passive: true });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    updateSpeedButton();
    updateProgress();
})();
