/**
 * Updates the timer element every second with the time remaining until
 * December 1, 2026 at 03:15 UTC, then displays "My Treasure".
 *
 * @returns {void}
 */
export function countdown() {
    const end = new Date("2026-12-01T03:15:00Z").getTime();

    let x = setInterval(function () {
        let now = new Date().getTime();
        let distance = end - now;

        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('the-timer').innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;

        if (distance < 0) {
            clearInterval(x);
            document.getElementById('the-timer').innerText = "My Treasure";
        }
    }, 1000);
}