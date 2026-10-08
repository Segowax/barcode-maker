import { logActivity } from './log-activity.js';

/**
 * Looks up the user's GitHub login, records a `toilet-start` activity, clears
 * local storage, and signs the user out. The login is taken from the Supabase
 * user metadata, with `sessionStorage.ghLogin` as a fallback.
 *
 * If no login is available, shows a toast and returns without clearing storage
 * or signing out. If an awaited operation throws, the returned promise rejects.
 *
 * @param {SupabaseClient} client - Supabase client used to retrieve the user and sign out.
 * @returns {Promise<void>} Resolves after the activity is recorded and sign-out completes, or
 *                          immediately if no login is available.
 */
export async function fuckItImOut(client) {
    const ghLogin = (await client.auth.getUser()).data.user.user_metadata.user_name || sessionStorage.getItem('ghLogin');

    if (!ghLogin) {
        toast?.show('GitHub login not found. Cannot log activity.');
        return;
    }

    await logActivity(client, 'toilet-start', ghLogin);

    localStorage.clear();
    await client.auth.signOut();
}