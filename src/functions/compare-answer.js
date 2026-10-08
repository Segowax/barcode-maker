export async function compare(inputString) {
    let hash = 0;
    if (inputString.length === 0) return hash;

    const encodedString = new TextEncoder().encode(inputString);

    hash = await crypto.subtle.digest('SHA-256', encodedString).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));

        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    });

    if (hash === '14dae5801a7c44c8f4527fdf5d9a2a3bda982bbc426cf67d173b1afd8357dc1c') {
        return true;
    } else {
        return false;
    }
}