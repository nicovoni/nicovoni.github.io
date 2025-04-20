(function () {
    /**
     * Funzione per gestire il click del pulsante di prenotazione.
     * @param {HTMLElement} button - Il pulsante cliccato.
     */
    function btnprenota(button) {
        try {
            // Validazione del pulsante
            if (!button || !button.parentNode) {
                throw new Error("Elemento pulsante non valido o mancante.");
            }

            // Ottieni la cella padre del pulsante
            const cella = button.parentNode;

            // Estrai gli attributi slotora e slotdata
            const slotOra = cella.getAttribute("slotora");
            const slotData = cella.getAttribute("slotdata");

            // Validazione degli attributi
            if (!slotOra || !slotData) {
                throw new Error("Dati mancanti per la prenotazione. Verifica che gli attributi 'slotora' e 'slotdata' siano impostati.");
            }

            // Crea il messaggio di conferma
            const messaggio = `Vuoi prenotare la ${sanitizeInput(slotOra)}ª ora del ${sanitizeInput(slotData)}?`;

            // Mostra il messaggio di conferma
            if (confirm(messaggio)) {
                // Validazione e costruzione dell'URL
                const baseURL = "https://script.google.com/a/macros/isufol.it/s/AKfycbwoMGmDSNSeHlT1z7Xfb4_6kgarZaVl1rQJf7at18fQMerQvOCHWdysnTCgCsQVujjt/exec";
                const url = buildSafeURL(baseURL, { slotOra, slotData });

                // Reindirizza l'utente alla nuova pagina servita da Apps Script
                window.location.href = url;
            } else {
                // L'utente ha annullato l'operazione
                alert("Prenotazione annullata.");
            }
        } catch (error) {
            // Log dell'errore per debugging e messaggio all'utente
            console.error("Errore durante la prenotazione:", error);
            alert("Si è verificato un errore durante la prenotazione. Riprova più tardi.");
        }
    }

    /**
     * Funzione di utilità per costruire un URL sicuro con parametri.
     * @param {string} baseURL - L'URL base.
     * @param {Object} params - Oggetto con i parametri della query string.
     * @returns {string} - URL completo e sicuro.
     */
    function buildSafeURL(baseURL, params) {
        const url = new URL(baseURL);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.append(key, encodeURIComponent(value));
        }
        return url.toString();
    }

    /**
     * Funzione di utilità per sanificare input.
     * @param {string} input - La stringa da sanificare.
     * @returns {string} - Input sanificato.
     */
    function sanitizeInput(input) {
        return input.replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
    }

    // Esporta la funzione globalmente per l'uso nei pulsanti HTML
    window.btnprenota = btnprenota;
})();
