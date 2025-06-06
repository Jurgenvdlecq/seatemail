const express  = require('express');
const multer   = require('multer');
const pdfParse = require('pdf-parse');
const fs       = require('fs');
const path     = require('path');

const app = express();

// 1) Configureer Multer om uploads tijdelijk op te slaan in 'uploads/'
const upload = multer({ dest: 'uploads/' });

// 2) Zorg dat de map 'public' (en submappen) statisch worden geserveerd
app.use(express.static(path.join(__dirname, 'public')));

// 3) POST-endpoint om een PDF-offerte te ontvangen en te verwerken
app.post('/api/verwerk-offerte', upload.single('offerte'), async (req, res) => {
  try {
    // Als er geen bestand in de request zat, stuur gelijk fout
    if (!req.file) {
      return res.status(400).json({ error: 'Geen bestand ontvangen under key "offerte".' });
    }

    const pdfPath = req.file.path; // tijdelijke bestandsnaam

    // 3.1) Lees het PDF-bestand in als Buffer
    const dataBuffer = fs.readFileSync(pdfPath);

    // 3.2) Parse PDF naar platte tekst
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text; // hele tekst van de PDF

    // 3.3) Nadat we de tekst hebben opgehaald, kun je het tijdelijke bestand verwijderen
    fs.unlinkSync(pdfPath);

    // 3.4) Analyseer de tekst (zoek de juiste velden)
    const resultaat = analyseerOfferteTekst(text);

    // 3.5) Stuur het resultaat als JSON terug
    return res.json(resultaat);
  } catch (err) {
    console.error('Fout in /api/verwerk-offerte:', err);
    return res.status(500).json({ error: 'Interne serverfout bij verwerken offerte.' });
  }
});

// Functie die bepaalt of het een koop-offerte (met/zonder inruil) of private lease is
// en haalt op basis van vaste patterns de juiste velden eruit.
function analyseerOfferteTekst(rawText) {
  // Vervang nieuwe regels door spaties zodat onze regex niet gefragmenteerd raakt
  const inhoud = rawText.replace(/\r?\n/g, ' ');

  // --- 1) Private Lease?
  if (/Private Lease/i.test(inhoud)) {
    const maandprijsMatch    = inhoud.match(/Leaseprijs\s*(?:incl\.?\s*BTW)?\s*[:\-]?\s*€\s*([\d\.,]+)/i);
    const kmMatch            = inhoud.match(/Km\/jaar\s*[:\-]?\s*([\d\.,]+)/i);
    const looptijdMatch      = inhoud.match(/Looptijd\s*in\s*maanden\s*[:\-]?\s*([\d\.,]+)/i)
                             || inhoud.match(/Looptijd\s*[:\-]?\s*([\d\.,]+)\s*maand/i);
    const eigenRisicoMatch   = inhoud.match(/Eigen risico\s*[:\-]?\s*€\s*([\d\.,]+)/i);
    const bandenMatch        = inhoud.match(/Banden(?:product)?\s*(?:Zomerbanden|Winterbanden|[A-Za-z0-9 ]+)/i);

    return {
      typeOfferte: 'privateLease',
      maandprijs: maandprijsMatch    ? parseFloat(maandprijsMatch[1].replace(/\./g, '').replace(',', '.')) : null,
      kmPerJaar:  kmMatch            ? parseInt(kmMatch[1].replace(/\./g, '')) : null,
      looptijdMaanden: looptijdMatch ? parseInt(looptijdMatch[1].replace(/\./g, '')) : null,
      eigenRisico: eigenRisicoMatch  ? parseFloat(eigenRisicoMatch[1].replace(/\./g, '').replace(',', '.')) : null,
      banden: bandenMatch            ? bandenMatch[0].split(/\s+/).pop().trim() : null
    };
  }

  // --- 2) Koop mét inruil?
  else if (/Inruilauto/i.test(inhoud)) {
    const kentekenMatch    = inhoud.match(/Kenteken\s*[:\-]?\s*([A-Z0-9\-]+)/i);
    const inruilPrijsMatch = inhoud.match(/Inruilprijs\s*[:\-]?\s*€\s*([\d\.,]+)/i);
    const totaalMatch      = inhoud.match(/Totaal te betalen\s*[:\-]?\s*€\s*([\d\.,]+)/i)
                            || inhoud.match(/Te betalen bedrag\s*[:\-]?\s*€\s*([\d\.,]+)/i);

    return {
      typeOfferte: 'koopMetInruil',
      inruilAuto: {
        kenteken:   kentekenMatch    ? kentekenMatch[1].trim() : null,
        inruilprijs: inruilPrijsMatch ? parseFloat(inruilPrijsMatch[1].replace(/\./g, '').replace(',', '.')) : null
      },
      totaalTeBetalen: totaalMatch ? parseFloat(totaalMatch[1].replace(/\./g, '').replace(',', '.')) : null
    };
  }

  // --- 3) Anders: koop zonder inruil
  else {
    const totaalMatch = inhoud.match(/Totaal te betalen\s*[:\-]?\s*€\s*([\d\.,]+)/i)
                     || inhoud.match(/Te betalen bedrag\s*[:\-]?\s*€\s*([\d\.,]+)/i);

    return {
      typeOfferte: 'koopsansInruil',
      aanschafprijs: totaalMatch ? parseFloat(totaalMatch[1].replace(/\./g, '').replace(',', '.')) : null
    };
  }
}

// Start de server op poort 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});
