function genereerEmail() {
    const type = document.getElementById('emailtype').value;
    const klant = document.getElementById('klantnaam').value;
    const model = document.getElementById('model').value;
    const kleur = document.getElementById('kleur').value;
    const prijs = document.getElementById('prijs').value;
    const levertijd = document.getElementById('levertijd').value;
    const inruilprijs = document.getElementById('inruilprijs').value;
    const kenteken = document.getElementById('kenteken').value;
    const datum = document.getElementById('datum').value;
    const tijdstip = document.getElementById('tijdstip').value;
    
    let tekst = '';
    const aanspreekvorm = document.getElementById('aanspreekvorm').value;
    const voornaam = document.getElementById('voornaam').value;
    const achternaam = document.getElementById('klantnaam').value;
    const aanspreek = (aanspreekvorm === 'jij') ? voornaam : (aanspreekvorm === 'u_mevrouw' ? 'mevrouw ' + achternaam : 'heer ' + achternaam);
    const begroeting = (aanspreekvorm === 'jij') ? 'Beste ' + voornaam : 'Geachte ' + aanspreek;


    switch (type) {
        case 'internetlead':
            tekst = `${begroeting},\n\nHartelijk dank voor uw interesse in een nieuwe SEAT ${model} via onze website.\n\nConform uw aanvraag ontvangt u hierbij een vrijblijvende offerte voor de uitvoering in de kleur ${kleur}.\nDe rijklaarprijs bedraagt €${prijs}, inclusief actiekorting, afleverpakket, leges en fabrieksgarantie.\nDe verwachte levertijd is ${levertijd} na akkoord.\n\nIndien u graag een proefrit wilt maken of de auto in het echt wilt bekijken, vernemen wij dit graag van u.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
        case 'telefonisch':
            tekst = `${begroeting},\n\nZoals telefonisch besproken ontvangt u hierbij een vrijblijvende offerte voor een nieuwe SEAT ${model} in de kleur ${kleur}.\n\nDe rijklaarprijs bedraagt €${prijs}, inclusief alle bijkomende kosten en fabrieksgarantie.\nDe levertijd is circa ${levertijd} na akkoord.\n\nIndien u vragen heeft of de auto wenst te bezichtigen, neem dan gerust contact met ons op.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
        case 'showroom':
            tekst = `${begroeting},\n\nHartelijk dank voor uw bezoek aan onze showroom. Zoals besproken ontvangt u hierbij de offerte voor een nieuwe SEAT ${model}, in de kleur ${kleur}.\n\nDe rijklaarprijs bedraagt €${prijs}, inclusief afleverpakket, leges en fabrieksgarantie.\nDe verwachte levertijd is ${levertijd} na akkoord.\n\nMocht u nog vragen hebben of de offerte nader willen bespreken, dan staan wij graag voor u klaar.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
        case 'offerte_zonder_inruil':
            tekst = `${begroeting},\n\nConform onze afspraak ontvangt u hierbij de offerte voor een nieuwe SEAT ${model} in de kleur ${kleur}, zonder inruil.\n\nDe rijklaarprijs bedraagt €${prijs}, inclusief afleverpakket, garantie en leges.\nLevertijd: ${levertijd}.\n\nLaat ons gerust weten indien u vragen heeft of de offerte verder wenst te bespreken.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
        case 'offerte_met_inruil':
            tekst = `${begroeting},\n\nHierbij ontvangt u de offerte voor een nieuwe SEAT ${model} in de kleur ${kleur}, inclusief een voorlopig inruilvoorstel voor uw huidige auto (kenteken: ${kenteken}).\n\nDe rijklaarprijs bedraagt €${prijs}.\nDe indicatieve inruilwaarde van uw voertuig is €${inruilprijs}, onder voorbehoud van fysieke inspectie.\nDe levertijd bedraagt ${levertijd}.\n\nWij nodigen u graag uit in onze showroom voor een definitieve taxatie.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
        case 'private_lease':
            tekst = `${begroeting},\n\nZoals besproken ontvangt u hierbij de private leaseofferte voor een nieuwe SEAT ${model} in de kleur ${kleur}.\n\nLooptijd: 48 maanden\nKilometrage: 15.000 km/jaar\nMaandbedrag: €XXX incl. btw\nInclusief: onderhoud, verzekering, wegenbelasting, pechhulp en vervangend vervoer\n\nDe levertijd is ${levertijd}.\n\nLaat ons weten indien u interesse heeft of aanvullende vragen.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
        case 'proefrit':
            tekst = `${begroeting},\n\nUw proefrit met de SEAT ${model} in de kleur ${kleur} is bevestigd.\n\nWij verwachten u graag op ${datum} om ${tijdstip} bij Wittebrug SEAT, Donau 120, 2491 BC in Den Haag.\n\nLaat het ons weten indien u verhinderd bent of aanvullende vragen heeft.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
        case 'afspraak':
            tekst = `${begroeting},\n\nUw afspraak staat gepland op ${datum} om ${tijdstip} bij Wittebrug SEAT, Donau 120, 2491 BC in Den Haag.\n\nIndien u verhinderd bent of iets wenst te wijzigen, vernemen wij dat graag van u.\n\nMet vriendelijke groet,\nWittebrug SEAT`;
            break;
    }

    document.getElementById('emailPreview').innerText = tekst;
}

function kopieerTekst() {
    const tekst = document.getElementById('emailPreview').innerText;
    navigator.clipboard.writeText(tekst).then(() => {
        alert('De e-mailtekst is gekopieerd!');
    });
}
function formatDatum(d) {
    if (!d) return '';
    const maanden = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
                     'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    const parts = d.split('-'); // yyyy-mm-dd
    return parseInt(parts[2]) + ' ' + maanden[parseInt(parts[1]) - 1] + ' ' + parts[0];
}

function toonVelden() {
    const type = document.getElementById('emailtype').value;

    const velden = {
        model: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil", "private_lease", "proefrit"],
        kleur: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil", "private_lease", "proefrit"],
        prijs: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil"],
        levertijd: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil", "private_lease"],
        inruilprijs: ["offerte_met_inruil"],
        kenteken: ["offerte_met_inruil"],
        datum: ["proefrit", "afspraak"],
        tijdstip: ["proefrit", "afspraak"]
    };

    for (let veld in velden) {
        const div = document.getElementById("veld-" + veld);
        if (velden[veld].includes(type)) {
            div.style.display = "block";
        } else {
            div.style.display = "none";
        }
    }
}

document.addEventListener("DOMContentLoaded", toonVelden);

function formatDatum(d) {
    if (!d) return '';
    const maanden = ['januari', 'februari', 'maart', 'april', 'mei', 'juni',
                     'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    const parts = d.split('-');
    return parseInt(parts[2]) + ' ' + maanden[parseInt(parts[1]) - 1] + ' ' + parts[0];
}

function toonVelden() {
    const type = document.getElementById('emailtype').value;
    const velden = {
        model: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil", "private_lease", "proefrit"],
        kleur: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil", "private_lease", "proefrit"],
        prijs: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil"],
        levertijd: ["internetlead", "telefonisch", "showroom", "offerte_zonder_inruil", "offerte_met_inruil", "private_lease"],
        inruilprijs: ["offerte_met_inruil"],
        kenteken: ["offerte_met_inruil"],
        datum: ["proefrit", "afspraak"],
        tijdstip: ["proefrit", "afspraak"],
        looptijd: ["private_lease"],
        km: ["private_lease"],
        risico: ["private_lease"],
        maandbedrag: ["private_lease"]
    };

    for (let veld in velden) {
        const div = document.getElementById("veld-" + veld);
        if (div) {
            div.style.display = velden[veld].includes(type) ? "block" : "none";
        }
    }
}

document.addEventListener("DOMContentLoaded", toonVelden);

function setOutlookLink(subject, body) {
    const outlookLink = document.getElementById('outlookButton');
    outlookLink.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    outlookLink.style.display = 'inline-block';
}

// Aan einde van genereerEmail functie
setOutlookLink(subject, tekst);
