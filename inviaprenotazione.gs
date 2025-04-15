function doGet(e) {
  // Recupera i parametri dalla URL
  var slotOra = e.parameter.slotOra;
  var slotData = e.parameter.slotData;

  Logger.log("slotOra: " + slotOra);
  Logger.log("slotData: " + slotData);

  // Controlla che entrambi i parametri siano presenti
  if (!slotOra || !slotData) {
    return HtmlService.createHtmlOutput("Errore: parametri mancanti");
  }

  // Carica il template prenotazione.html con i dati ricevuti
  var template = HtmlService.createTemplateFromFile('prenotazione');
  template.slotOraFrontend = slotOra;
  template.slotDataFrontend = slotData;

  // Restituisce la pagina renderizzata
  return template.evaluate()
    .setTitle('Prenotazione Laboratorio')
    .setFaviconUrl('https://nicovoni.github.io/favicon.ico');
}

function controlloprenotazione(e) {
  try {
    var timestamp, emaildocente, nomelab, dataprenotazioneString, oreprenotazione;
    var chiamataDaForm = false;
    var rigaCorrente = null; // Variabile per tenere traccia della riga corrente

    // --- 1. INPUT UTENTE ---
    if (e.values) {
      chiamataDaForm = true;
      var risposte = e.values;
      timestamp = risposte[0];
      emaildocente = risposte[1].trim();
      nomelab = risposte[2].trim();
      dataprenotazioneString = risposte[3].trim();
      oreprenotazione = [risposte[4].trim()];
      rigaCorrente = e.range.getRow(); // Identifica la riga appena inserita
    } else {
      chiamataDaForm = false;
      timestamp = new Date();
      emaildocente = Session.getActiveUser().getEmail();
      nomelab = e.nomelabs.trim();
      dataprenotazioneString = e.slotDataBackend.trim();
      oreprenotazione = [e.slotOraBackend.trim() + "ª ora"];
    }

    // Validazione data
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataprenotazioneString)) {
      throw new Error("Formato data non valido");
    }

    var parts = dataprenotazioneString.split('/');
    var dataprenotazione = new Date(parts[2], parts[1] - 1, parts[0]);
    if (isNaN(dataprenotazione.getTime())) {
      throw new Error("Data non valida");
    }

    var giornoSettimana = dataprenotazione.getDay(); // 0=Dom, ..., 6=Sab
    if (giornoSettimana < 1 || giornoSettimana > 5) {
      throw new Error("Le prenotazioni sono consentite solo dal Lunedì al Venerdì.");
    }

    var numeroOra = parseInt(oreprenotazione[0].match(/\d+/)[0], 10) - 1;
    if (isNaN(numeroOra)) {
      throw new Error("Ora non valida");
    }

    // --- 2. CONTROLLO ORARIO FISSO ---
    if (nomelab === "Lab. multimediale") {
      var orarioFissoSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orariofisso');
      
      // Calcola l'indice della riga in base al giorno della settimana (Lunedì = 1, Martedì = 2, ecc.)
      var rigaOrarioFisso = giornoSettimana; // Lunedì = 1, Martedì = 2, ..., Venerdì = 5

      var cellaFissa = orarioFissoSheet.getRange(rigaOrarioFisso, numeroOra + 1);

      // Log per debugging
      Logger.log("Giorno richiesto: " + giornoSettimana + " (Riga foglio: " + rigaOrarioFisso + ")");
      Logger.log("Ora richiesta: " + numeroOra);

      var docenteFisso = cellaFissa.getValue();
      Logger.log("Docente fisso trovato: " + docenteFisso);

      if (docenteFisso !== '') {
        if (chiamataDaForm && rigaCorrente) {
          // Cancella la riga appena inserita
          var foglio = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('risposte');
          foglio.deleteRow(rigaCorrente);
        }
        MailApp.sendEmail(emaildocente, "Attenzione: Aula già occupata", 
          "Hai provato a prenotare il " + nomelab + " per la " + oreprenotazione[0] +
          " del " + dataprenotazioneString + ", ma è già occupata da " + docenteFisso);
        return;
      }
    }

    // --- 3. CONTROLLO PRENOTAZIONI ESISTENTI ---
    var foglio = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('risposte');
    var dati = foglio.getDataRange().getValues();
    var dataString = Utilities.formatDate(dataprenotazione, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "dd/MM/yyyy");
    var oraString = oreprenotazione.join(', ').trim();

    for (var i = 1; i < dati.length; i++) {
      // Ignora la riga corrente se chiamata da interfaccia HTML
      if (!chiamataDaForm && e.range && e.range.getRow() === i + 1) {
        Logger.log("Saltata la riga della prenotazione corrente: " + (i + 1));
        continue;
      }

      // Recupera e normalizza i dati dalla riga
      var lab = dati[i][2] ? dati[i][2].trim().toLowerCase() : "";
      var dataPrenotata = dati[i][3] ? Utilities.formatDate(new Date(dati[i][3]), SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), "dd/MM/yyyy").trim() : "";
      var oraPrenotata = dati[i][4] ? dati[i][4].trim() : "";
      var docentePrenotante = dati[i][1] ? dati[i][1].trim() : ""; // Email del docente che ha prenotato

      // Log per debugging
      Logger.log("Confronto prenotazione:");
      Logger.log("Lab richiesto: " + nomelab.toLowerCase() + ", Lab registrato: " + lab);
      Logger.log("Data richiesta: " + dataString + ", Data registrata: " + dataPrenotata);
      Logger.log("Ora richiesta: " + oraString + ", Ora registrata: " + oraPrenotata);

      // Confronto dei dati
      if (nomelab.trim().toLowerCase() === lab &&
          dataString === dataPrenotata &&
          oraString === oraPrenotata &&
          emaildocente !== docentePrenotante // Ignora se è lo stesso utente
      ) {
        if (chiamataDaForm && rigaCorrente) {
          // Cancella la riga appena inserita
          foglio.deleteRow(rigaCorrente);
        }
        MailApp.sendEmail(emaildocente, "Errore nella prenotazione",
          "Hai provato a prenotare il " + nomelab + " per la " + oraString + 
          " del " + dataString + ", ma risulta già prenotata da " + docentePrenotante + ".");
        return;
      }
    }

    // --- 4. INSERIMENTO + CONFERMA ---
    if (!chiamataDaForm) {
      // Usa un blocco per evitare conflitti simultanei
      var lock = LockService.getScriptLock();
      if (lock.tryLock(10000)) {
        try {
          foglio.appendRow([timestamp, emaildocente, nomelab, dataprenotazioneString, oraString]);
        } finally {
          lock.release();
        }
      } else {
        throw new Error("Il sistema è occupato. Riprova più tardi.");
      }
    }

    MailApp.sendEmail(emaildocente, "Prenotazione confermata",
      "Hai prenotato il " + nomelab + " per la " + oraString + " del " + dataprenotazioneString);

    // --- 5. AGGIORNAMENTO DELLA PAGINA HTML ---
    uploadToGitHub();

  } catch (error) {
    Logger.log("Errore: " + error.message);
    MailApp.sendEmail(Session.getActiveUser().getEmail(), "Errore nella prenotazione", error.message);
  }
}
