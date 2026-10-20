(function () {
    "use strict";

    var form = document.querySelector("[data-chapter-filter]");
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    var counter = document.querySelector("[data-filter-count]");
    var empty = document.querySelector("[data-filter-empty]");
    var queryLabel = document.querySelector("[data-filter-query]");
    var resetLink = document.querySelector("[data-filter-reset]");

    if (!form || !input || !list) {
        return;
    }

    var items = Array.prototype.slice.call(list.querySelectorAll(".chapter-item"));

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

            item.hidden = !matches;

            if (matches) {
                visible += 1;
            }
        });

        if (counter) {
            counter.textContent = query
                ? visible + " dari " + items.length + " chapter cocok"
                : items.length + " chapter";
        }

        if (queryLabel) {
            queryLabel.textContent = raw.trim();
        }

        if (empty) {
            empty.hidden = visible !== 0;
        }

        list.hidden = visible === 0;
    }

    input.addEventListener("input", function (event) {
        applyFilter(event.target.value);
    });

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        var first = list.querySelector(".chapter-item:not([hidden]) a");
        if (first) {
            first.focus();
        }
    });

    if (resetLink) {
        resetLink.addEventListener("click", function () {
            input.value = "";
            applyFilter("");
            input.focus();
        });
    }

    document.addEventListener("keydown", function (event) {
        var active = document.activeElement;
        var isTyping = active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);

        if (event.key === "/" && !isTyping) {
            event.preventDefault();
            input.focus();
            input.select();
        }
    });
})();
