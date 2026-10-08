import { ToastBar } from './custom-elements/toast-bar.js';
import { updateContentOverflow } from './functions/update-content-overflow.js';
import { showLoginErrorsIfAny } from './functions/show-login-errors-if-any.js';
import { countdown } from './functions/countdown.js';
import { authStateChangeCallback } from './functions/auth-state-change-callback.js';
import { fuckItImOut } from './functions/fuck-it-i-am-out.js';
import { compare } from './functions/compare-answer.js';

const SUPABASE_URL = 'https://hxkykopscbgorgkkpxvi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_LtRmS9nawffi11Yo_YT3Qg_WU_0D6sJ';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const viewLoading = document.getElementById('loading');
const viewLogin = document.getElementById('login');
const viewApp = document.getElementById('app');
/** @type {ToastBar | null} */
const toast = document.getElementById('toast');

let activeView = null;
const contentResizeObserver = new ResizeObserver((entries) => {
    const view = entries[0]?.target;
    if (view) updateContentOverflow(view);
});

showLoginErrorsIfAny(toast);

client.auth.onAuthStateChange(async (event, session) => {
    activeView = await authStateChangeCallback(event, session, {
        client,
        viewLoading,
        viewLogin,
        viewApp,
        contentResizeObserver,
        toast
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('loginBtn');
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const compareBtn = document.getElementById('compareBtn');
    const toiletBtn = document.getElementById('toiletBtn');
    const textInput = document.getElementById('barcodeText');
    const filenameInput = document.getElementById('filename');
    const canvas = document.getElementById('barcodeCanvas');

    client.functions.invoke("log-visit");
    window.addEventListener('resize', () => {
        if (activeView) updateContentOverflow(activeView);
    });
    countdown();

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

    toiletBtn.addEventListener('click', async () => {
        await fuckItImOut(client);
    });
});