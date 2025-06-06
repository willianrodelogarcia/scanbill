const { createWorker, PSM } = require('tesseract.js');

function normalizarValor(valorCrudo) {
  return parseInt(valorCrudo.replace(/\s/g, '').replace(/[.,]/g, ''));
}

const extractData = textoOCR => {
  const lineas = textoOCR.split('\n');

  const productos = [];

  const regex = /^(\d{13,})\s+(.+?)\s+(\d{1,3}(?:[.,]\d{3})*|\d+)\s+[A-Z]?$/;
  const regexTotal = /total\s*[:\-]?\s*([\d\s.,]+)/i;

  let total = null;

  for (const linea of lineas) {
    const limpia = linea.trim();
    const match = limpia.match(regex);

    if (total === null) {
      const matchTotal = limpia.match(regexTotal);
      if (matchTotal) {
        const valorCrudo = matchTotal[1];
        const valorNormalizado = valorCrudo.replace(/[^\d]/g, '');
        total = parseInt(valorNormalizado);
        continue;
      }
    }

    if (match) {
      const [, codigo, descripcion, valorCrudo] = match;

      const valor = normalizarValor(valorCrudo);

      productos.push({
        descripcion: descripcion.trim(),
        valor,
      });
    }
  }

  return { productos, total };
};

const readText = async url => {
  const worker = await createWorker('eng', 1, {
    tessedit_pageseg_mode: PSM.SINGLE_LINE,
  });

  const {
    data: { text },
  } = await worker.recognize(url);

  const result = extractData(text);
  await worker.terminate();
  return result;
};

module.exports = { readText };
