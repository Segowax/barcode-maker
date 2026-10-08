import { logActivity } from './log-activity.js';

/**
 * Records a `toilet-start` activity for the given target, clears local storage,
 * and signs the user out.
 *
 * If recording the activity or signing out fails, the returned promise rejects.
 *
 * @param {SupabaseClient} client - Supabase client used to retrieve the user and sign out.
 * @param {string} eventTarget - Target value stored with the activity record.
 * @returns {Promise<void>} Resolves after the activity is recorded, local storage is cleared,
 * and sign-out completes.
 */
export async function fuckItImOut(client, eventTarget) {
    await logActivity(client, 'toilet-start', eventTarget);

    localStorage.clear();
    await client.auth.signOut();
}