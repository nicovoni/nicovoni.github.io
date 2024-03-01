var passwordCorretta = 'tuaPassword';  // Sostituisci con la tua password effettiva

function verificaPassword() {
  var passwordInserita = $('#password').val();

  if (passwordInserita === passwordCorretta) {
    $('#loginContainer').hide();
    $('#selezioneOrarioContainer').show();
  } else {
    $('#message').text('Password errata - Utente non autorizzato alla modifica');
  }
}

function confermaSelezione() {
  var giorno = $('#giorno').val();
  var ora = $('#ora').val();

  if (giorno && ora) {
    $('#selezioneOrarioContainer').hide();
    $('#confermaLampeggioContainer').show();
  } else {
    alert('Si prega di selezionare giorno e ora.');
  }
}

function attivaLampeggio() {
  // Implementa qui la logica per far lampeggiare la cella corrispondente al giorno e all'ora selezionati
  // Ad esempio, puoi utilizzare una chiamata a una funzione esterna o aggiungere direttamente il codice qui.
  alert('Cella lampeggiata con successo!');
}
