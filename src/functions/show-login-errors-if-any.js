/**
 * Displays any authentication error found in the current URL, then removes
 * authentication error parameters from the address bar.
 *
 * @param {ToastBar | null | undefined} toast - Toast element used to display the error, if available.
 * @returns {void}
 */
export function showLoginErrorsIfAny(toast) {
    const currentUrl = new URL(window.location.href);
    const queryParams = currentUrl.searchParams;
    const hashParams = new URLSearchParams(currentUrl.hash.replace('#', ''));
    const error = queryParams.get('error') || hashParams.get('error');
    const description = queryParams.get('error_description') || hashParams.get('error_description');

    if (error) {
        toast?.show(`${error}: ${description}`);
    }

    if (hashParams.size > 0 || queryParams.has('error') || queryParams.has('error_description')) {
        const cleanUrl = new URL(currentUrl);
        if (hashParams.size > 0) {
            cleanUrl.hash = '';
        }
        cleanUrl.searchParams.delete('error');
        cleanUrl.searchParams.delete('error_description');
        window.history.replaceState({}, document.title, cleanUrl.toString());
    }
}