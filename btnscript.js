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
        // Reindirizza l'utente alla nuova pagina HTML per inserire lo username e scegliere cosa prenotare
        var url = "prenotazione.html?slotOra=" + encodeURIComponent(slotOra) + "&slotData=" + encodeURIComponent(slotData);
        window.location.href = url;
    } else {
        alert("Prenotazione annullata.");
    }
}
