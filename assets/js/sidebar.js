(function () {
    "use strict";

    var sidebar = document.querySelector("[data-sidebar]");
    var backdrop = document.querySelector("[data-drawer-backdrop]");
    var openButton = document.querySelector("[data-sidebar-open]");
    var closeButton = document.querySelector("[data-sidebar-close]");
    var filter = document.querySelector("[data-sidebar-filter]");
    var list = document.querySelector("[data-sidebar-list]");
    var empty = document.querySelector("[data-sidebar-empty]");

    if (!sidebar || !openButton) {
        return;
    }

    var items = list ? Array.prototype.slice.call(list.querySelectorAll(".sidebar-item")) : [];
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
            if (filter) {
                filter.focus();
                filter.select();
            } else if (closeButton) {
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

    function applyFilter(raw) {
        var query = raw.toLowerCase().trim();
        var numberMatch = query.match(/^#?(\d+)$/);
        var visible = 0;

        items.forEach(function (item) {
            var number = item.getAttribute("data-chapter") || "";
            var title = (item.getAttribute("data-title") || "").toLowerCase();
            var matches;

            if (!query) {
                matches = true;
            } else if (numberMatch) {
                matches = number === numberMatch[1];
            } else {
                matches = title.indexOf(query) !== -1 || number.indexOf(query) !== -1;
            }

            item.parentNode.hidden = !matches;

            if (matches) {
                visible += 1;
            }
        });

        if (empty) {
            empty.hidden = visible !== 0;
        }

        if (list) {
            list.hidden = visible === 0;
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

    if (filter) {
        filter.addEventListener("input", function (event) {
            applyFilter(event.target.value);
        });

        filter.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                var first = list && list.querySelector(".sidebar-item:not([disabled])");

                if (first) {
                    event.preventDefault();
                    first.click();
                }
            }
        });
    }

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
