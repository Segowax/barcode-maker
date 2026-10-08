/**
 * Updates the body's `content-overflow` class based on whether the view is taller
 * than the viewport. Does nothing if no view is provided.
 *
 * @param {HTMLElement | null | undefined} activeView - The view element to check.
 *
 * @returns {void}
 */
export function updateContentOverflow(activeView) {
    if (!activeView) {
        return;
    }

    const exceedsViewport = activeView.getBoundingClientRect().height > window.innerHeight;
    document.body.classList.toggle('content-overflow', exceedsViewport);
}