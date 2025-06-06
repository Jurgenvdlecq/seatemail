// main.js

// Globale variabele voor prijslijst
let prijslijst = [];

// Wacht tot de pagina compleet is geladen
document.addEventListener('DOMContentLoaded', () => {
  // 1) Laad de prijslijst
  laadPrijslijst();

  // 2) Eventlistener voor handmatig prijs opzoeken
  document.getElementById('vulPrijsKnop').addEventListener('click', () => {
    vulPrijsHandmatig();
  });

  // 3) Eventlistener voor upload en verwerking
  document.getElementById('uploadOfferteKnop').addEventListener('click', () => {
    uploadEnVerwerkOfferte();
  });

  // 4) Eventlistener voor e-mail kopiëren
  document.getElementById('kopieerEmailKnop').addEventListener('click', () => {
    kopieerNaarKlembord();
  });
});


// ------------------------------
// FUNCTIE: laadPrijslijst
// ------------------------------
async function laadPrijslijst() {
  try {
    const response = await fetch('/data/prijslijst.json');
    if (!response.ok) {
      throw new Error('Kon prijslijst niet laden: ' + response.statusText);
    }
    prijslijst = await response.json();
    console.log('Prijslijst geladen:', prijslijst.length, 'records');
  } catch (error) {
    console.error('Fout bij inladen prijslijst:', error);
    alert('Er ging iets mis bij het inladen van de prijslijst. Neem contact op met IT.');
  }
}


// ------------------------------
// FUNCTIE: vulPrijsHandmatig
// ------------------------------
function vulPrijsHandmatig() {
  const merkValue  = document.getElementById('merk').value.trim();
  const modelValue = document.getElementById('model').value.trim();
  const motorValue = document.getElementById('motor').value.trim();

  if (!merkValue || !modelValue || !motorValue) {
    alert('Vul eerst merk, model én motor/uitvoering in om de prijs te laten invullen.');
    return;
  }

  // Zoek in de prijslijst
  const gevonden = prijslijst.find(item =>
    item.merk.toLowerCase() === merkValue.toLowerCase() &&
    item.model.toLowerCase() === modelValue.toLowerCase() &&
    item.motor.toLowerCase() === motorValue.toLowerCase()
  );

  if (gevonden) {
    document.getElementById('prijs').value = gevonden.vanafprijs;
  } else {
    document.getElementById('prijs').value = '';
    alert(`Geen prijs gevonden voor: ${merkValue} ${modelValue} (${motorValue}).\nControleer spelling of vraag IT om de prijslijst bij te werken.`);
  }
}


// ------------------------------
// FUNCTIE: uploadEnVerwerkOfferte
// ------------------------------
async function uploadEnVerwerkOfferte() {
  const fileInput = document.getElementById('offerteBestand');
  if (fileInput.files.length === 0) {
    alert('Selecteer eerst een PDF-bestand om te uploaden.');
    return;
  }

  const bestand = fileInput.files[0];
  if (bestand.type !== 'application/pdf') {
    alert('Kies alsjeblieft een PDF-bestand.');
    return;
  }

  // Maak FormData met het PDF-bestand
  const formData = new FormData();
  formData.append('offerte', bestand);

  try {
    // Verstuur naar server
    const response = await fetch('/api/verwerk-offerte', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Verwerking mislukt: ' + response.statusText);
    }

    const data = await response.json();
    console.log('Server-antwoord:', data);

    // Toon de juiste velden en vul automatisch in
    verwerkServerResultaat(data);
  } catch (err) {
    console.error('Fout bij uploaden/verwerken offerte:', err);
    alert('Er is een fout opgetreden bij het verwerken van de PDF-offerte. Controleer de console voor details.');
  }
}


// ------------------------------
// FUNCTIE: verwerkServerResultaat
// ------------------------------
function verwerkServerResultaat(data) {
  // 1) Verberg eerst ALLE result-blocks
  document.getElementById('koopZonderInruilVelden').classList.add('hidden');
  document.getElementById('koopMetInruilVelden').classList.add('hidden');
  document.getElementById('privateLeaseVelden').classList.add('hidden');

  // 2) Maak het result-deel zichtbaar
  document.getElementById('verwerkResultaten').classList.remove('hidden');

  let emailTekst = '';

  // 3) Afhankelijk van typeOfferte vullen we de velden en bouwen we de e-mail
  if (data.typeOfferte === 'koopsansInruil') {
    // Koop zonder inruil
    document.getElementById('koopZonderInruilVelden').classList.remove('hidden');
    document.getElementById('aanschafprijs').value = data.aanschafprijs ?? '';

    // E-mail template voor KOOP ZONDER INRUIL
    emailTekst = `
Beste [Klantnaam],

Hartelijk dank voor uw bestelling. Hieronder vindt u de gegevens van uw nieuwe SEAT:

• Aanschafprijs: € ${data.aanschafprijs?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}

Wij verzoeken u om deze gegevens te controleren. Als alles klopt, kunt u dit bericht beantwoorden met “Akkoord” 
en wij nemen contact met u op om de verdere afhandeling in te plannen.

Met vriendelijke groet,

[Uw Naam]
Verkoopmanager SEAT/CUPRA Wittebrug
Tel. 06-12 34 56 78
E-mail: verkoop@wittebrug.nl`;

  } else if (data.typeOfferte === 'koopMetInruil') {
    // Koop met inruil
    document.getElementById('koopMetInruilVelden').classList.remove('hidden');
    document.getElementById('inruilKenteken').value  = data.inruilAuto.kenteken ?? '';
    document.getElementById('inruilPrijs').value     = data.inruilAuto.inruilprijs ?? '';
    document.getElementById('totaalTeBetalen').value = data.totaalTeBetalen ?? '';

    // E-mail template voor KOOP MET INRUIL
    emailTekst = `
Beste [Klantnaam],

Bedankt voor uw interesse in de nieuwe SEAT. Hieronder vindt u uw offertegegevens:

• Aanschafprijs auto: € ${(data.totaalTeBetalen + (data.inruilAuto.inruilprijs)).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
• Inruilauto kenteken: ${data.inruilAuto.kenteken}
• Inruilprijs: € ${data.inruilAuto.inruilprijs?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
• Totaal te betalen (na inruil): € ${data.totaalTeBetalen?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}

Als bovenstaande gegevens kloppen, kunt u dit bericht beantwoorden met “Akkoord” en wij nemen meteen 
contact met u op voor het plannen van de aflevering.

Met vriendelijke groet,

[Uw Naam]
Verkoopmanager SEAT/CUPRA Wittebrug
Tel. 06-12 34 56 78
E-mail: verkoop@wittebrug.nl`;

  } else if (data.typeOfferte === 'privateLease') {
    // Private lease
    document.getElementById('privateLeaseVelden').classList.remove('hidden');
    document.getElementById('leaseMaandprijs').value   = data.maandprijs ?? '';
    document.getElementById('leaseKmPerJaar').value    = data.kmPerJaar ?? '';
    document.getElementById('leaseLooptijd').value     = data.looptijdMaanden ?? '';
    document.getElementById('leaseEigenRisico').value = data.eigenRisico ?? '';
    document.getElementById('leaseBanden').value       = data.banden ?? '';

    // E-mail template voor PRIVATE LEASE
    emailTekst = `
Beste [Klantnaam],

Hartelijk dank voor uw aanvraag voor Private Lease. Hieronder staan de belangrijkste details van uw prijsvoorstel:

• Maandprijs (incl. BTW): € ${data.maandprijs?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
• Jaarkilometrage: ${data.kmPerJaar?.toLocaleString('nl-NL')} km
• Looptijd: ${data.looptijdMaanden} maanden
• Eigen risico: € ${data.eigenRisico?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
• Banden: ${data.banden}

Controleer alstublieft of bovenstaande klopt. Als u akkoord gaat, antwoord dan met “Akkoord” en wij 
plannen het verdere traject voor u in.

Met vriendelijke groet,

[Uw Naam]
Verkoopmanager SEAT/CUPRA Wittebrug
Tel. 06-12 34 56 78
E-mail: verkoop@wittebrug.nl`;
  } else {
    alert('Onbekend type offerte ontvangen van de server.');
    return;
  }

  // 4) Toon de e-mailtekst in het tekstvak
  document.getElementById('emailVoorbeeld').value = emailTekst.trim();
}


// ------------------------------
// FUNCTIE: kopieerNaarKlembord
// ------------------------------
function kopieerNaarKlembord() {
  const emailVak = document.getElementById('emailVoorbeeld');
  emailVak.select();
  emailVak.setSelectionRange(0, 99999); // voor mobiele apparaten

  try {
    document.execCommand('copy');
    alert('E-mailtekst is gekopieerd naar het klembord.');
  } catch (err) {
    alert('Kon de e-mail niet kopiëren. Kopieer handmatig.');
  }
}
