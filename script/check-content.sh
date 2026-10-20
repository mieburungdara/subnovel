#!/usr/bin/env bash
# Content sanity checks for the chapter sources.
#
# Usage: bash script/check-content.sh [BUILD_DIR]
#
# Every novel lives in its own collection folder (`_<slug>/`) with the tracker
# in `chapter/<slug>/done` and `chapter/<slug>/undone`. This script guards the
# conventions that are easy to break when editing the markdown:
#   * separator lines must not contain non-breaking spaces (kramdown reads them as lists)
#   * footnote numbers must use "N : " and never "N." (a period turns the notes into a list)
#   * every post must carry the credits block and, when it has notes, the notes IAL
#   * the chapter tracker must agree with what is published
#
# Exits non-zero when a check fails.

set -uo pipefail

cd "$(dirname "$0")/.."

BUILD_DIR="${1:-}"
status=0
fail() {
    echo "FAIL: $*"
    status=1
}

# Novel folders are the top level directories that start with an underscore and
# contain markdown files. Jekyll's own folders are skipped.
novel_dirs() {
    for dir in _*/; do
        name=$(basename "$dir")
        case "$name" in
            _posts | _layouts | _data | _site | _drafts | _includes) continue ;;
        esac
        if ls "$dir"*.md >/dev/null 2>&1; then
            echo "$dir"
        fi
    done
}

for posts_dir in $(novel_dirs); do
    novel=$(basename "$posts_dir" | sed "s/^_//")
    echo "== $novel =="

    echo "-- non-breaking spaces --"
    nbsp_files=$(grep -l $'\xc2\xa0' "$posts_dir"/*.md 2>/dev/null || true)
    if [ -n "$nbsp_files" ]; then
        fail "non-breaking space found in:"
        echo "$nbsp_files" | sed 's/^/  /'
    else
        echo "OK: no non-breaking spaces"
    fi

    echo "-- footnote markers --"
    marker_files=$(grep -lE '^[0-9]+\. ' "$posts_dir"/*.md 2>/dev/null || true)
    if [ -n "$marker_files" ]; then
        fail "footnote numbers must use 'N : ' instead of 'N. ' in:"
        echo "$marker_files" | sed 's/^/  /'
    else
        echo "OK: all footnote numbers use the 'N : ' form"
    fi

    echo "-- post structure --"
    missing_credits=$(grep -L '{: \.credits}' "$posts_dir"/*.md || true)
    if [ -n "$missing_credits" ]; then
        fail "missing '{: .credits}' in:"
        echo "$missing_credits" | sed 's/^/  /'
    else
        echo "OK: every post marks its credits block"
    fi

    missing_notes=$(grep -lE '^[0-9]+ *:' "$posts_dir"/*.md 2>/dev/null | while read -r post; do
        if ! tail -3 "$post" | grep -q '{: \.notes}'; then
            echo "$post"
        fi
    done)
    if [ -n "$missing_notes" ]; then
        fail "missing '{: .notes}' in:"
        echo "$missing_notes" | sed 's/^/  /'
    else
        echo "OK: every post with notes marks its notes block"
    fi

    echo "-- chapter tracker --"
    tracker="chapter/$novel"
    if [ ! -d "$tracker" ]; then
        fail "missing tracker directory $tracker"
    else
        unpublished=$(for source in "$tracker"/done/*.txt; do
            [ -e "$source" ] || continue
            number=$(basename "$source" .txt)
            if ! ls "$posts_dir"/*chapter-"$number".md >/dev/null 2>&1; then
                echo "$source"
            fi
        done)
        if [ -n "$unpublished" ]; then
            fail "chapter sources without a published post:"
            echo "$unpublished" | sed 's/^/  /'
        else
            echo "OK: every chapter source has a published post"
        fi

        published_in_undone=$(for source in "$tracker"/undone/*.txt; do
            [ -e "$source" ] || continue
            number=$(basename "$source" .txt)
            if ls "$posts_dir"/*chapter-"$number".md >/dev/null 2>&1; then
                echo "$source"
            fi
        done)
        if [ -n "$published_in_undone" ]; then
            fail "already published but still tracked as undone:"
            echo "$published_in_undone" | sed 's/^/  /'
        else
            echo "OK: no published chapter is still tracked as undone"
        fi
    fi
done

if [ -n "$BUILD_DIR" ] && [ -d "$BUILD_DIR" ]; then
    echo "== rendered output =="
    stray=$(grep -lE '<(ul|ol)>' "$BUILD_DIR"/*/*/*/chapter-*.html 2>/dev/null || true)
    if [ -n "$stray" ]; then
        fail "unexpected list markup inside chapter pages:"
        echo "$stray" | sed "s|$BUILD_DIR/||" | sed 's/^/  /'
    else
        echo "OK: no list markup inside chapter pages"
    fi

    without_notes=$(grep -l 'class="chapter"' "$BUILD_DIR"/*/*/*/chapter-*.html 2>/dev/null | while read -r page; do
        if grep -qE '^[0-9]+ :' "$page" && ! grep -q 'class="notes"' "$page"; then
            echo "$page"
        fi
    done)
    if [ -n "$without_notes" ]; then
        fail "chapter pages with notes that are not styled as notes:"
        echo "$without_notes" | sed "s|$BUILD_DIR/||" | sed 's/^/  /'
    else
        echo "OK: every chapter page with notes styles them"
    fi
fi

if [ "$status" -eq 0 ]; then
    echo "OK: content checks passed"
else
    echo "content checks FAILED"
fi

exit "$status"
