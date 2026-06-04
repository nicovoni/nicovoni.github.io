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

      var cella   = button.parentNode;
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
        // url.searchParams.append codifica già internamente — nessun encodeURIComponent manuale
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
  var target   = document.getElementById('settimana-' + numero);
  var tabAttiva = document.getElementById('tab-' + numero);
  if (target)   target.classList.add('tab-attiva');
  if (tabAttiva) tabAttiva.classList.add('attiva');
}
