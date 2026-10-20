(function () {
    "use strict";

    var sidebar = document.querySelector("[data-sidebar]");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    var openButton = document.querySelector("[data-sidebar-open]");
    var closeButton = document.querySelector("[data-sidebar-close]");

    if (!sidebar || !openButton) {
        return;
    }

    var isOpen = false;
    var lastFocused = null;

    function focusableElements() {
        return Array.prototype.slice.call(
            sidebar.querySelectorAll('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')
        ).filter(function (element) {
            return element.offsetParent !== null;
        });
    }

    function scrollActiveIntoView() {
        var active = sidebar.querySelector(".sidebar-item.is-active");

        if (active) {
            active.scrollIntoView({ block: "center" });
        }
    }

    function openSidebar() {
        if (isOpen) {
            return;
        }

        isOpen = true;
        lastFocused = document.activeElement;

        sidebar.classList.add("is-open");
        backdrop.classList.add("is-open");
        document.documentElement.classList.add("has-sidebar");
        sidebar.setAttribute("aria-hidden", "false");

        scrollActiveIntoView();

        window.requestAnimationFrame(function () {
            if (closeButton) {
                closeButton.focus();
            }
        });
    }

    function closeSidebar() {
        if (!isOpen) {
            return;
        }

        isOpen = false;

        sidebar.classList.remove("is-open");
        backdrop.classList.remove("is-open");
        document.documentElement.classList.remove("has-sidebar");
        sidebar.setAttribute("aria-hidden", "true");

        if (lastFocused && typeof lastFocused.focus === "function") {
            lastFocused.focus();
        }
    }

    openButton.addEventListener("click", openSidebar);

    if (closeButton) {
        closeButton.addEventListener("click", closeSidebar);
    }

    if (backdrop) {
        backdrop.addEventListener("click", closeSidebar);
    }

    sidebar.addEventListener("click", function (event) {
        var link = event.target.closest("a[href]");

        if (link) {
            closeSidebar();
        }
    });

    document.addEventListener("keydown", function (event) {
        if (!isOpen) {
            return;
        }

        if (event.key === "Escape") {
            closeSidebar();
            return;
        }

        if (event.key === "Tab") {
            var focusable = focusableElements();

            if (!focusable.length) {
                return;
            }

            var first = focusable[0];
            var last = focusable[focusable.length - 1];

            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 900) {
            closeSidebar();
        }
    });
})();
