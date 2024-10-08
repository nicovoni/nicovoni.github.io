function btnprenota(button) {
    // Ottieni la cella padre del pulsante
    var cella = button.parentNode;

    // Estrai gli attributi slotora e slotdata
    var slotOra = cella.getAttribute("slotora");
    var slotData = cella.getAttribute("slotdata");

    // Crea il messaggio di conferma
    var messaggio = "Vuoi prenotare il laboratorio multimediale la " + slotOra + "a ora del " + slotData + "?";

    // Mostra il messaggio di conferma
    if (confirm(messaggio)) {
        // URL del deployment della tua applicazione web (modifica con il tuo URL reale)
        var baseURL = "https://script.google.com/a/macros/isufol.it/s/AKfycbzcN2KNBYCUeZ32qn4qDn1mNKDXGzoWz-M96JkXlAudqS6SL0nsvoh-cz2SUmqKvk0/exec";

        // Aggiungi i parametri alla URL
        var url = baseURL + "?slotOra=" + encodeURIComponent(slotOra) + "&slotData=" + encodeURIComponent(slotData);
        
        // Reindirizza l'utente alla nuova pagina HTML servita da Apps Script
        window.location.href = url;
    } else {
        alert("Prenotazione annullata.");
    }
}
