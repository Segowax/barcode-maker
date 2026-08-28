document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const textInput = document.getElementById('barcodeText');
    const filenameInput = document.getElementById('filename');
    const canvas = document.getElementById('barcodeCanvas');

    generateBtn.addEventListener('click', () => {
        // Pobieramy tekst i zamieniamy wpisane "\t" na rzeczywisty znak tabulacji
        const text = textInput.value.trim().replace(/\\t/g, '\t');

        if (!text) {
            alert('Proszę wprowadzić tekst do zakodowania.');
            return;
        }

        try {
            // Generowanie kodu kreskowego
            JsBarcode(canvas, text, {
                format: "CODE128",
                displayValue: false, // Ta flaga wyłącza tekst/podpis pod kodem
                margin: 10,
                background: "#ffffff", // Wymagane białe tło do eksportu pliku PNG
                lineColor: "#000000"
            });

            // Po poprawnym wygenerowaniu pokazujemy przycisk pobierania
            downloadBtn.classList.remove('hidden');
        } catch (error) {
            alert('Wystąpił błąd podczas generowania kodu: ' + error.message);
        }
    });

    downloadBtn.addEventListener('click', () => {
        // Pobieramy nazwę pliku, lub ustawiamy domyślną jeśli pole jest puste
        let filename = filenameInput.value.trim();
        if (!filename) {
            filename = 'kod_kreskowy';
        }

        // Zamiana zawartości <canvas> na format base64 obrazu PNG
        const imgData = canvas.toDataURL("image/png");

        // Tworzenie "wirtualnego" linku i kliknięcie go, aby wywołać pobieranie w przeglądarce
        const link = document.createElement('a');
        link.href = imgData;
        link.download = `${filename}.png`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});
