/**
 * Inserts an activity record into the Supabase `activity_logs` table.
 *
 * @param {SupabaseClient} client - Supabase client used to perform the insert.
 * @param {string} eventType - Activity type to store in the `event_type` column.
 * @param {string} targetElement - Activity target to store in the `target_element` column.
 * @returns {Promise<void>} Resolves when the insert call completes; rejects if it throws.
 */
export async function logActivity(client, eventType, targetElement) {
    await client
        .from('activity_logs')
        .insert([
            { event_type: eventType, target_element: targetElement },
        ]);
}