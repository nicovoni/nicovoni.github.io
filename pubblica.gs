// Costanti per l'API GitHub
const GITHUB_API_URL = 'https://api.github.com/repos/';
const CONTENT_TYPE_JSON = 'application/json';

// Variabili globali per le impostazioni GitHub
var githubOwner = 'nicovoni'; // Nome utente o organizzazione proprietaria del repository
var githubRepo = 'nicovoni.github.io';
var githubBranch = 'main'; // Cambia il nome del ramo se necessario
var githubToken = 'secret';

function generaPaginaOrario() {
  // Ottieni il foglio di lavoro dell'orario fisso
  var orarioFissoSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('orariofisso');

  // Ottieni il foglio di lavoro delle risposte del modulo
  var risposteSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('risposte');

// inserisci l'id effettivo del tuo altro spreadsheet
const altroSpreadsheetId = '1G0bVJn0meh4wQ2X7Flxb_k6bjgEEgOMphMWShBdrTY0';

// Recupera il foglio "vengo" dal tuo altro spreadsheet
const vengosheet = SpreadsheetApp.openById(altroSpreadsheetId).getSheetByName('vengo');

  // Verifica se il foglio "vengo" è stato trovato correttamente
  if (!vengosheet) {
    console.error('Foglio vengo non trovato. Assicurati che il foglio esista e abbia il nome corretto.');
    return;
  }

// Trova l'ultima riga con dati nel foglio "vengo"
let ultimaRigaVengo = vengosheet.getLastRow();
let ultimaColonnaVengo = vengosheet.getLastColumn();

// Aggiungi log per verificare la posizione delle colonne
console.log('Ultima riga nel foglio vengo: ' + ultimaRigaVengo);
console.log('Ultima colonna nel foglio vengo: ' + ultimaColonnaVengo);

// Considera la colonna delle date e delle ore nella prima riga di dati (escludendo l'intestazione)
let dataVengo = vengosheet.getRange(ultimaRigaVengo, 3).getValue();
// dataVengo = Utilities.formatDate(dataVengo, "GMT+1", "dd/MM/yyyy"); // Formatta la data nel formato desiderato
dataVengo = isNaN(Date.parse(dataVengo)) ? dataVengo : Utilities.formatDate(new Date(dataVengo), "GMT+1", "dd/MM/yyyy");
let oreVengo = vengosheet.getRange(ultimaRigaVengo, 4).getValue();

// Log per debug
console.log('Data in cui vengo in lab:', dataVengo);
console.log('Ore in cui vengo in lab:', oreVengo);

  // Crea la tabella HTML per tutte e quattro le settimane
  var paginaHTML = '<!DOCTYPE html><html lang="it"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="orario del laboratorio multimediale del liceo di follonica"><meta name="author" content="Nicola Cantalupo"><title>Orario laboratorio multimediale | Liceo di Follonica</title><link rel="stylesheet" type="text/css" href="stile.css"></head><body><a href="https://nicovoni.github.io/">torna alla home</a><br><h1>Orario laboratorio multimediale - Liceo di Follonica</h1>';

  for (var settimana = 1; settimana <= 4; settimana++) {
    // Aggiungi la tabella HTML per la settimana corrente
    paginaHTML += '<table class="container">';

    // Aggiungi l'intestazione della tabella con le ore
    paginaHTML += '<tr><th></th>';
    for (var ora = 1; ora <= 6; ora++) {
      paginaHTML += '<th>' + ora + 'ª ora</th>';
    }
    paginaHTML += '</tr>';

    // Aggiungi le righe della tabella con i giorni della settimana e le prenotazioni per la settimana corrente
    var nomiGiorni = ["", "LUN", "MAR", "MER", "GIO", "VEN"];
    for (var giorno = 1; giorno <= 5; giorno++) {
      paginaHTML += '<tr>';
      
      // Ottieni la data corrispondente al giorno della settimana corrente
      var dataCorrispondente = getDataCorrispondente(settimana, giorno);

      paginaHTML += '<td><strong>' + nomiGiorni[giorno] + ' ' + dataCorrispondente + '</strong></td>';

      for (var ora = 1; ora <= 6; ora++) {
        var docenteOrarioFisso = orarioFissoSheet.getRange(giorno, ora).getValue();
        var prenotazione = estraiPrenotazioniLab(settimana, risposteSheet, giorno, ora);


    // Aggiungi la classe "dada" se il valore contiene "dada"
    var cellClass = '';
    if (docenteOrarioFisso.toLowerCase().includes("dada")) {
      cellClass = 'dada'; // Imposta la classe a "dada"
    }


  // Aggiungi la classe "classe-lampeggiante" solo se il docente ha confermato di venire in laboratorio
  if (ultimaRigaVengo > 1 && dataCorrispondente === dataVengo && oreVengo.includes(ora.toString() + 'ª ora')) {
      // Evidenzia il testo con la classe "classe-lampeggiante"
      paginaHTML += '<td class="orario-fisso classe-lampeggiante">' + docenteOrarioFisso + '</td>';
    } else if (prenotazione) {
      paginaHTML += '<td slotora="' + ora + '" slotdata="' + dataCorrispondente + '" class="spazioprenotato ' + cellClass + '">' + prenotazione + '</td>';
    } else {
      paginaHTML += docenteOrarioFisso ? '<td slotora="' + ora + '" slotdata="' + dataCorrispondente + '" class="orario-fisso ' + cellClass + '">' + docenteOrarioFisso + '</td>' : '<td slotora="' + ora + '" slotdata="' + dataCorrispondente + '"><button class="btn-aggiungi" onclick="btnprenota(this)">+</button></td>';
    }
  }

  paginaHTML += '</tr>';
}

    paginaHTML += '</table>';

    // Aggiungi una separazione tra le tabelle
    paginaHTML += '<br>';
  }

  paginaHTML += '<script src="btnscript.js" defer></script></body></html>';
  Logger.log('Pagina HTML generata con successo');
  return paginaHTML;
}


// Funzione per ottenere l'SHA di un file su GitHub
function getSHA(fileName) {
  var apiUrl = GITHUB_API_URL + githubOwner + '/' + githubRepo + '/contents/' + fileName;

  var headers = {
    'Authorization': 'Bearer ' + githubToken,
    'Content-Type': CONTENT_TYPE_JSON
  };

  var options = {
    method: 'get',
    headers: headers,
    muteHttpExceptions: false
  };

  var response = UrlFetchApp.fetch(apiUrl, options);
  var responseCode = response.getResponseCode();

  if (responseCode !== 200) {
    var errorResponse = JSON.parse(response.getContentText());
    throw new Error('Errore durante l\'ottenimento dello SHA. ' + errorResponse.message);
  }

  var fileDetails = JSON.parse(response.getContentText());
  return fileDetails.sha;
}

// Funzione per caricare il file su GitHub
function uploadFileToGitHub(fileName, content) {
  try {
    var sha = getSHA(fileName);
    Logger.log('SHA passato a uploadFileToGitHub: ' + sha);

    var apiUrl = GITHUB_API_URL + githubOwner + '/' + githubRepo + '/contents/' + fileName;
    
    var headers = {
      'Authorization': 'Bearer ' + githubToken,
      'Content-Type': CONTENT_TYPE_JSON + '; charset=utf-8'
    };

    // Codifica il contenuto in base64 dopo aver gestito la codifica dei caratteri speciali
    // var encodedContent = encodeURIComponent(content);
    // Crea un Blob con la corretta codifica dei caratteri
    var blob = Utilities.newBlob(content, "text/plain;charset=UTF-8");
    // var base64Content = Utilities.base64Encode(content);
    // Codifica il Blob in base64
    var base64Content = Utilities.base64Encode(blob.getBytes());

    var payload = {
      message: 'nuova versione di: ' + fileName,
      content: base64Content,
      branch: githubBranch,
      sha: sha
    };

    var options = {
      method: 'put',
      headers: headers,
      payload: JSON.stringify(payload),
      muteHttpExceptions: false
    };

    Logger.log('Prima della chiamata fetch');
    var response = UrlFetchApp.fetch(apiUrl, options);
    Logger.log('Dopo la chiamata fetch');
    
    var responseCode = response.getResponseCode();
    Logger.log('Codice di risposta: ' + responseCode);

    if (responseCode !== 200) {
      var errorResponse = JSON.parse(response.getContentText());
      Logger.log('Dettagli dell\'errore:', errorResponse);
      throw new Error('Errore durante l\'upload su GitHub. ' + errorResponse.message);
    }

    return 'Upload completato con successo.';
  } catch (error) {
    Logger.log('Errore durante l\'upload su GitHub:', error);
    if (error.hasOwnProperty('stack')) {
      Logger.log('Stack Trace:', error.stack);
    }
    if (error.hasOwnProperty('message')) {
      Logger.log('Error Message:', error.message);
    }
    throw error;
  }
}

// Funzione per eseguire l'upload su GitHub
function uploadToGitHub() {
  // Nome del file da caricare su GitHub
  var fileName = 'labmulti.html';

  // Contenuto del file HTML
  var fileContent = generaPaginaOrario();
  Logger.log('Contenuto di fileContent: ' + fileContent);

  // Carica il file HTML nel repository su GitHub
  var uploadResult = uploadFileToGitHub(fileName, fileContent);

  if (typeof uploadResult === 'string') {
    Logger.log(uploadResult);
    Logger.log('Upload eseguito con successo.');
  } else {
    Logger.log('xErrore durante l\'upload su GitHub:', uploadResult);
  }
}

// Funzione per ottenere la data corrispondente al giorno della settimana per una specifica settimana
function getDataCorrispondente(settimana, giorno) {
  var oggi = new Date();
  var giornoCorrispondente = oggi.getDate() - oggi.getDay() + (settimana - 1) * 7 + giorno;
  var dataCorrispondente = new Date(oggi.setDate(giornoCorrispondente));

  // Formatta la data nel formato "dd/MM/yyyy"
  var dataFormattata = Utilities.formatDate(dataCorrispondente, "GMT", "dd/MM/yyyy");
  return dataFormattata;
}

// Funzione per estrarre le prenotazioni relative all'aula "Lab. multimediale - Liceo Scientifico" per una specifica settimana
function estraiPrenotazioniLab(settimana, sheet, giorno, ora) {
  // Inizializza una matrice vuota per le prenotazioni
  var prenotazioni = [];
  for (var i = 0; i < 6; i++) {
    prenotazioni[i] = [];
  }

  // Ottieni tutte le risposte dal foglio
  var rangeDati = sheet.getDataRange().getValues();

  // Scansiona le risposte e popola la matrice delle prenotazioni per l'aula specifica
  for (var i = 1; i < rangeDati.length; i++) {
    var labConfrontato = rangeDati[i][2];
    var dataConfrontata = rangeDati[i][3];
    var oraConfrontata = rangeDati[i][4];
    var docenteConfrontato = rangeDati[i][1];

    if (labConfrontato.trim() === "Lab. multimediale") {
      // Converti la data nel formato "dd/MM/yyyy"
      var dataConfrontataString = Utilities.formatDate(new Date(dataConfrontata), "GMT+0100", "dd/MM/yyyy");

      // Verifica se la data appartiene alla settimana specificata
      if (isSettimanaSpecificata(settimana, dataConfrontata)) {
        // Estrai il numero dell'ora dalla stringa
        var numeroOra = parseInt(oraConfrontata.match(/\d+/)[0], 10);

        // Popola la matrice delle prenotazioni
        prenotazioni[dataConfrontata.getDay()][numeroOra - 1] = docenteConfrontato;
      }
    }
  }

  return prenotazioni[giorno][ora - 1];
}

// Funzione per verificare se una data appartiene a una specifica settimana
function isSettimanaSpecificata(settimana, data) {
  var oggi = new Date();
  var dataConfronto = new Date(data);
  var inizioSettimana = new Date(oggi.getFullYear(), oggi.getMonth(), oggi.getDate() - oggi.getDay() + (settimana - 1) * 7);
  var fineSettimana = new Date(inizioSettimana);
  fineSettimana.setDate(inizioSettimana.getDate() + 7);

  return dataConfronto >= inizioSettimana && dataConfronto < fineSettimana;
}
