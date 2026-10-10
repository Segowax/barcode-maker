/**
 * Updates the toilet-events table in response to an activity log insert.
 * A `toilet-start` event adds a row for the user and reveals the table;
 * a `toilet-end` event removes that user's row and hides the table if empty.
 *
 * @param {{ new: { event_type: string, gh_login: string, created_at: string } }} payload
 *        Supabase Realtime payload containing the inserted activity log record.
 * @returns {void}
 */
export function updateToiletTable(payload) {
    const lel = {
        eventType: payload.new.event_type,
        ghLogin: payload.new.gh_login,
        createdAt: payload.new.created_at
    }
    const table = document.getElementById('toilet-events');
    const tbody = table.querySelector('tbody') || table;

    if (lel.eventType === 'toilet-start') {
        const rowHtml = `
                    <tr id="row-${lel.ghLogin}">
                        <td>${lel.ghLogin}</td>
                        <td>${new Date(lel.createdAt).toLocaleString()}</td>
                    </tr>
                    `;
        tbody.insertAdjacentHTML('afterbegin', rowHtml);
        if (!!tbody.querySelector('tr')) {
            table.hidden = false;
        }
    } else if (lel.eventType === 'toilet-end') {
        const rowToRemove = document.getElementById(`row-${lel.ghLogin}`)
        if (!!rowToRemove)
            rowToRemove.remove();
        if (!!!tbody.querySelector('tr')) {
            table.hidden = true;
        }
    }
}
