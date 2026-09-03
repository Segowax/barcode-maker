document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const textInput = document.getElementById('barcodeText');
    const filenameInput = document.getElementById('filename');
    const canvas = document.getElementById('barcodeCanvas');
    const compareBtn = document.getElementById('compareBtn');

    generateBtn.addEventListener('click', () => {
        const text = textInput.value.trim().replace(/\\t/g, '\t');

        if (!text) {
            alert('Proszę wprowadzić tekst do zakodowania.');
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
            alert('Wystąpił błąd podczas generowania kodu: ' + error.message);
        }
    });

    downloadBtn.addEventListener('click', () => {
        let filename = filenameInput.value.trim();
        if (!filename) {
            filename = 'kod_kreskowy';
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
            console.error(['Error occurred while comparing string:', error]);
        }
    });
});

async function compare(inputString) {
    let hash = 0;
    if (inputString.length === 0) return hash;

    const encodedString = new TextEncoder().encode(inputString);

    console.log(encodedString);

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