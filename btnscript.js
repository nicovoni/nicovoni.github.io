(function () {
    /**
     * Funzione per gestire il click del pulsante di prenotazione.
     * @param {HTMLElement} button - Il pulsante cliccato.
     */
    function btnprenota(button) {
        try {
            // Ottieni la cella padre del pulsante
            const cella = button.parentNode;

            // Estrai gli attributi slotora e slotdata
            const slotOra = cella.getAttribute("slotora");
            const slotData = cella.getAttribute("slotdata");

            // Validazione degli attributi
            if (!slotOra || !slotData) {
                alert("Errore: dati mancanti per la prenotazione. Contatta l'amministratore.");
                return;
            }

            // Crea il messaggio di conferma
            const messaggio = `Vuoi prenotare la ${slotOra}ª ora del ${slotData}?`;

            // Mostra il messaggio di conferma
            if (confirm(messaggio)) {
                // URL del deployment della tua applicazione web
                const baseURL = "https://script.google.com/a/macros/isufol.it/s/AKfycbzck4MvG6BcR8F6L5nTQMu57GkbzM4O_wDGC6pK1kj6-Nt2cvrTQJ06vtHDLhcyYA6q/exec";

                // Costruisci l'URL con i parametri
                const url = `${baseURL}?slotOra=${encodeURIComponent(slotOra)}&slotData=${encodeURIComponent(slotData)}`;

                // Reindirizza l'utente alla nuova pagina servita da Apps Script
                window.location.href = url;
            } else {
                // L'utente ha annullato l'operazione
                alert("Prenotazione annullata.");
            }
        } catch (error) {
            // Log dell'errore per debugging
            console.error("Errore durante la prenotazione:", error);
            alert("Si è verificato un errore. Riprova più tardi.");
        }
    }

    // Esporta la funzione globalmente per l'uso nei pulsanti HTML
    window.btnprenota = btnprenota;
})();
