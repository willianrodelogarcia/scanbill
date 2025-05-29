const { createWorker, PSM } = require('tesseract.js');

function normalizarValor(valorCrudo) {
  // Quita espacios, puntos mal puestos y convierte a número
  return parseInt(valorCrudo.replace(/\s/g, '').replace(/[.,]/g, ''));
}

const extractData = textoOCR => {
  const lineas = textoOCR.split('\n');
  const productos = [];
  const regex = /^(?:\d+\s+)?(.+?)\s+(\d+[.,]?\s?\d+)\s?[A-Z]?$/;
  for (const linea of lineas) {
    const limpia = linea.trim();
    const match = limpia.match(regex);

    if (match) {
      let [, descripcion, valorCrudo] = match;

      const valor = normalizarValor(valorCrudo);

      // Normalizar: 14.600 o 4.360 => 14600 o 4360 (entero en centavos, por ejemplo)
      /*valor = parseFloat(
        valor.replace(/[.,](?=\d{3}\b)/g, '').replace(',', '.'),
      );*/

      productos.push({
        descripcion: descripcion.trim(),
        valor,
      });
    }
  }

  return productos;
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
