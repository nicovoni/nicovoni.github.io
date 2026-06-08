(function () {

  // ---------------------------------------------------------------------------
  // Dialog inline — sostituisce il confirm() nativo del browser,
  // che può essere bloccato silenziosamente da policy di dominio o iframe.
  // Iniettato una volta sola nel DOM al primo utilizzo.
  // ---------------------------------------------------------------------------
  var dialogIniettato = false;

  function iniettatDialog() {
    if (dialogIniettato) return;
    dialogIniettato = true;

    // Overlay + dialog
    var overlay = document.createElement('div');
    overlay.id = 'prenota-overlay';
    overlay.innerHTML = [
      '<div id="prenota-dialog" role="dialog" aria-modal="true" aria-labelledby="prenota-titolo">',
      '  <div id="prenota-icon">📅</div>',
      '  <div id="prenota-titolo">Conferma prenotazione</div>',
      '  <div id="prenota-dettagli"></div>',
      '  <div id="prenota-azioni">',
      '    <button id="prenota-btn-annulla" type="button">Annulla</button>',
      '    <button id="prenota-btn-conferma" type="button">Prenota</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(overlay);

    // Stili iniettati inline così non dipendono dall'ordine di caricamento del CSS
    var style = document.createElement('style');
    style.textContent = [
      '#prenota-overlay {',
      '  position: fixed; inset: 0;',
      '  background: rgba(0,0,0,0.45);',
      '  display: flex; align-items: center; justify-content: center;',
      '  z-index: 9999;',
      '  opacity: 0; visibility: hidden;',
      '  transition: opacity 0.2s ease, visibility 0s linear 0.2s;',
      '  padding: 16px;',
      '}',
      '#prenota-overlay.aperto {',
      '  opacity: 1; visibility: visible;',
      '  transition: opacity 0.2s ease;',
      '}',
      '#prenota-dialog {',
      '  background: var(--bg-alt, #fff);',
      '  border: 1px solid var(--border, #e5e7eb);',
      '  border-radius: var(--radius, 12px);',
      '  box-shadow: var(--shadow-lg, 0 8px 32px rgba(0,0,0,0.15));',
      '  padding: 28px 28px 24px;',
      '  width: 100%; max-width: 340px;',
      '  text-align: center;',
      '  transform: translateY(8px);',
      '  transition: transform 0.2s ease;',
      '}',
      '#prenota-overlay.aperto #prenota-dialog {',
      '  transform: translateY(0);',
      '}',
      '#prenota-icon {',
      '  font-size: 32px; margin-bottom: 10px;',
      '}',
      '#prenota-titolo {',
      '  font-family: var(--font, inherit);',
      '  font-size: 16px; font-weight: 700;',
      '  color: var(--text, #111827);',
      '  margin-bottom: 8px;',
      '}',
      '#prenota-dettagli {',
      '  font-size: 14px;',
      '  color: var(--text-muted, #6b7280);',
      '  line-height: 1.6;',
      '  margin-bottom: 22px;',
      '}',
      '#prenota-dettagli strong {',
      '  color: var(--text, #111827);',
      '  font-weight: 600;',
      '}',
      '#prenota-azioni {',
      '  display: flex; gap: 10px;',
      '}',
      '#prenota-btn-annulla {',
      '  flex: 1; padding: 10px;',
      '  background: var(--bg, #f3f4f6);',
      '  border: 1px solid var(--border, #e5e7eb);',
      '  border-radius: var(--radius-sm, 8px);',
      '  font-size: 14px; font-weight: 600;',
      '  color: var(--text-muted, #6b7280);',
      '  cursor: pointer;',
      '  font-family: inherit;',
      '}',
      '#prenota-btn-conferma {',
      '  flex: 1; padding: 10px;',
      '  background: var(--primary, #1a56db);',
      '  border: none;',
      '  border-radius: var(--radius-sm, 8px);',
      '  font-size: 14px; font-weight: 600;',
      '  color: #fff;',
      '  cursor: pointer;',
      '  font-family: inherit;',
      '}',
    ].join('\n');
    document.head.appendChild(style);

    // Chiudi cliccando l'overlay fuori dal dialog
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) chiudiDialog();
    });

    // Chiudi con Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') chiudiDialog();
    });
  }

  function apriDialog(slotOra, slotData, onConferma) {
    iniettatDialog();
    document.getElementById('prenota-dettagli').innerHTML =
      '<strong>' + sanitizeInput(slotOra) + 'ª ora</strong> del <strong>' + sanitizeInput(slotData) + '</strong>';

    var overlay  = document.getElementById('prenota-overlay');
    var btnConf  = document.getElementById('prenota-btn-conferma');
    var btnAnn   = document.getElementById('prenota-btn-annulla');

    // Rimuovi listener precedenti clonando i bottoni
    var nuovoBtnConf = btnConf.cloneNode(true);
    var nuovoBtnAnn  = btnAnn.cloneNode(true);
    btnConf.parentNode.replaceChild(nuovoBtnConf, btnConf);
    btnAnn.parentNode.replaceChild(nuovoBtnAnn, btnAnn);

    nuovoBtnConf.addEventListener('click', function () {
      chiudiDialog();
      onConferma();
    });
    nuovoBtnAnn.addEventListener('click', chiudiDialog);

    overlay.classList.add('aperto');
    nuovoBtnConf.focus();
  }

  function chiudiDialog() {
    var overlay = document.getElementById('prenota-overlay');
    if (overlay) overlay.classList.remove('aperto');
  }

  // ---------------------------------------------------------------------------
  // btnprenota — chiamata dal onclick="btnprenota(this)" nelle celle
  // ---------------------------------------------------------------------------
  function btnprenota(button) {
    try {
      if (!button || !button.parentNode) {
        throw new Error("Elemento pulsante non valido o mancante.");
      }

      var cella    = button.parentNode;
      var slotOra  = cella.getAttribute("slotora");
      var slotData = cella.getAttribute("slotdata");

      if (!slotOra || !slotData) {
        throw new Error("Dati mancanti per la prenotazione.");
      }

      apriDialog(slotOra, slotData, function () {
        var baseURL = "https://script.google.com/a/macros/isufol.it/s/AKfycbzN1P6AhCc0j47KShHcBnYooPegm2fA0zNbeSXUQymm_7Gv6Kc_blcoh5AZEJf6uO8M/exec";
        var url = buildSafeURL(baseURL, { slotOra: slotOra, slotData: slotData });
        window.location.href = url;
      });

    } catch (error) {
      console.error("Errore durante la prenotazione:", error);
      alert("Si è verificato un errore durante la prenotazione. Riprova più tardi.");
    }
  }

  // ---------------------------------------------------------------------------
  // Utilities
  // ---------------------------------------------------------------------------
  function buildSafeURL(baseURL, params) {
    var url = new URL(baseURL);
    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        url.searchParams.append(key, params[key]);
      }
    }
    return url.toString();
  }

  function sanitizeInput(input) {
    return String(input).replace(/</g, "&lt;").replace(/>/g, "&gt;").trim();
  }

  // Esporta globalmente
  window.btnprenota = btnprenota;

})();

// ---------------------------------------------------------------------------
// Gestione tab mobile per navigazione tra settimane
// ---------------------------------------------------------------------------
function mostraTab(numero) {
  for (var i = 1; i <= 5; i++) {
    var wrapper = document.getElementById('settimana-' + i);
    var tab     = document.getElementById('tab-' + i);
    if (wrapper) wrapper.classList.remove('tab-attiva');
    if (tab)     tab.classList.remove('attiva');
  }
  var target    = document.getElementById('settimana-' + numero);
  var tabAttiva = document.getElementById('tab-' + numero);
  if (target)    target.classList.add('tab-attiva');
  if (tabAttiva) tabAttiva.classList.add('attiva');
}

// ---------------------------------------------------------------------------
// BARRA DI PROGRESSO ORARIA
// Colora le celle del giorno corrente in base all'ora attuale.
//
// Scansione oraria:
//   1ª  08:00 – 08:50  (50 min)
//   2ª  08:50 – 09:45  (55 min)
//   --- ricreazione 09:45 – 09:55 ---
//   3ª  09:55 – 10:50  (55 min)
//   4ª  10:50 – 11:45  (55 min)
//   --- ricreazione 11:45 – 11:55 ---
//   5ª  11:55 – 12:50  (55 min)
//   6ª  12:50 – 13:40  (50 min)
//
// Logica:
//   - Prima delle 08:00: nessun effetto
//   - Ora passata: cella colorata al 100%
//   - Ora in corso: cella colorata proporzionalmente ai minuti trascorsi
//   - Ora futura: nessun effetto
//   - Dopo le 13:40: tutte le celle al 100%
//
// Tecnica: background-image con linear-gradient sovrapposto al colore
// esistente della cella, così spazioprenotato/dada/orario-fisso restano
// leggibili. L'attributo slotdata sulla cella viene confrontato con la
// data odierna per agire solo sulla riga del giorno corrente.
// ---------------------------------------------------------------------------
(function () {

  // Slot orari: [oraInizio, minutoInizio, oraFine, minutoFine]
  var SLOT = [
    [8,  0,  8,  50],  // 1ª ora
    [8,  50, 9,  45],  // 2ª ora
    [9,  55, 10, 50],  // 3ª ora (dopo ricreazione)
    [10, 50, 11, 45],  // 4ª ora
    [11, 55, 12, 50],  // 5ª ora (dopo ricreazione)
    [12, 50, 13, 40],  // 6ª ora
  ];

  // Colore della barra: grigio-blu semitrasparente, neutro su tutti i fondi
  var COLORE_PASSATO  = 'rgba(100, 116, 139, 0.18)';
  var COLORE_INCORSO  = 'rgba(26,  86, 219, 0.13)';

  /**
   * Restituisce la data odierna formattata "dd/MM/yyyy"
   */
  function oggiFormattato() {
    var d = new Date();
    var dd = String(d.getDate()).padStart(2, '0');
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var yyyy = d.getFullYear();
    return dd + '/' + mm + '/' + yyyy;
  }

  /**
   * Calcola i minuti dall'inizio della giornata per un orario hh:mm
   */
  function toMinuti(h, m) { return h * 60 + m; }

  /**
   * Applica il gradiente a una cella <td> in base alla percentuale (0-100).
   * Usa background-image così non sovrascrive background-color.
   * La direzione è da sinistra (passato) a destra (futuro).
   */
  function applicaGradiente(cella, pct, incorso) {
    var colore = incorso ? COLORE_INCORSO : COLORE_PASSATO;
    if (pct >= 100) {
      cella.style.backgroundImage =
        'linear-gradient(to right, ' + COLORE_PASSATO + ' 100%, transparent 100%)';
    } else {
      cella.style.backgroundImage =
        'linear-gradient(to right, ' + colore + ' ' + pct + '%, transparent ' + pct + '%)';
    }
  }

  /**
   * Rimuove il gradiente da una cella
   */
  function rimuoviGradiente(cella) {
    cella.style.backgroundImage = '';
  }

  /**
   * Aggiorna tutte le celle della tabella per il giorno corrente.
   * Viene chiamata subito al caricamento e poi ogni 60 secondi.
   */
  function aggiorna() {
    var oggi = oggiFormattato();
    var adesso = new Date();
    var minutiAdesso = toMinuti(adesso.getHours(), adesso.getMinutes());

    // Seleziona tutte le celle con attributo slotdata uguale a oggi
    var celle = document.querySelectorAll('td[slotdata="' + oggi + '"]');
    if (celle.length === 0) return; // giorno non presente nella pagina (weekend, fuori range)

    celle.forEach(function (cella) {
      var ora = parseInt(cella.getAttribute('slotora'), 10);
      if (!ora || ora < 1 || ora > 6) return;

      var slot       = SLOT[ora - 1];
      var inizioMin  = toMinuti(slot[0], slot[1]);
      var fineMin    = toMinuti(slot[2], slot[3]);
      var durataMin  = fineMin - inizioMin;

      if (minutiAdesso < inizioMin) {
        // Ora futura: nessun effetto
        rimuoviGradiente(cella);
      } else if (minutiAdesso >= fineMin) {
        // Ora completamente passata: 100%
        applicaGradiente(cella, 100, false);
      } else {
        // Ora in corso: percentuale proporzionale ai minuti trascorsi
        var trascorsi = minutiAdesso - inizioMin;
        var pct = Math.round((trascorsi / durataMin) * 100);
        applicaGradiente(cella, pct, true);
      }
    });
  }

  // Lo script è caricato con defer: il DOM è già pronto quando questo codice
  // viene eseguito, quindi chiamiamo aggiorna() direttamente senza attendere
  // DOMContentLoaded (che sarebbe già scattato e non si riattiva).
  setTimeout(function() {
    aggiorna();
    setInterval(aggiorna, 60000);
  }, 300);

})();
