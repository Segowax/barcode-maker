/**
 * Hides the loading, login, and application views, then displays the requested view.
 *
 * @param {HTMLElement} viewToShow - The view element to display.
 * @param {Object} options - UI elements and observer used to update the active view.
 * @param {HTMLElement} options.viewLoading - The loading view element.
 * @param {HTMLElement} options.viewLogin - The login view element.
 * @param {HTMLElement} options.viewApp - The main application view element.
 * @param {ResizeObserver} options.contentResizeObserver - Observes size changes in the displayed view.
 *
 * @returns {HTMLElement} The view that was displayed.
 */
export function showView(
    viewToShow,
    { viewLoading, viewLogin, viewApp, contentResizeObserver }
) {
    viewLoading.hidden = true;
    viewLogin.hidden = true;
    viewApp.hidden = true;

    viewToShow.hidden = false;

    let activeView = viewToShow;

    contentResizeObserver.disconnect();
    contentResizeObserver.observe(activeView);

    return activeView;
}