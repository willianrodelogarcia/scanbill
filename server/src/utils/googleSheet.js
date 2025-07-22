const { google } = require('googleapis');

const {
  config: { googleSheetsConst },
  credentials: { credentials: keys },
} = require('../config');

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
  ],
});

async function addRow(text, name) {
  const { productos, total } = text;
  const values = [...productos, { descripcion: 'Total', valor: total }];
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const spreadsheetId = googleSheetsConst.spreadsheetId;

  const newSheet = `Facturas_${new Date().toISOString().slice(0, 10)}`;
  const sheetId = await ensureSheetExists(sheets, spreadsheetId, newSheet);
  const startCol = await findNextFreeColumn(sheets, spreadsheetId, newSheet);
  const colLetter = columnToLetter(startCol);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${newSheet}!${colLetter}1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[name]] },
  });

  const data = values.map(p => [p.descripcion, p.valor]);
  const dataStartRange = `${newSheet}!${colLetter}2`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: dataStartRange,
    valueInputOption: 'USER_ENTERED',
    resource: { values: data },
  });

  await applyStyleTable({
    spreadsheetId,
    sheetId,
    count: data.length,
    startColumnIndex: startCol - 1,
  });

  console.log('✅ Factura añadida con solo encabezado:', name);
}

async function ensureSheetExists(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = res.data.sheets.find(s => s.properties.title === sheetName);

  if (sheet) return sheet.properties.sheetId;

  const createRes = await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          addSheet: {
            properties: { title: sheetName },
          },
        },
      ],
    },
  });

  return createRes.data.replies[0].addSheet.properties.sheetId;
}

function columnToLetter(column) {
  let letter = '';
  while (column > 0) {
    const temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

async function findNextFreeColumn(sheets, spreadsheetId, sheetName) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!1:1`,
  });

  let colIndex = 1;

  while (true) {
    const letter = columnToLetter(colIndex);
    const test = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!${letter}2:${letter}10`,
    });
    const hasData =
      test.data.values &&
      test.data.values.some(r => r.some(cell => cell.trim() !== ''));
    if (!hasData) break;
    colIndex += 3; // deja espacio entre bloques
  }

  return colIndex;
}

async function applyStyleTable({
  spreadsheetId,
  sheetId,
  count,
  startColumnIndex,
}) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const endCol = startColumnIndex + 2;
  const endRow = count + 1; // +1 por la fila del título

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        // Estilo del encabezado de la factura (nombre)
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
              startColumnIndex,
              endColumnIndex: endCol,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                textFormat: {
                  bold: true,
                  fontSize: 12,
                },
                horizontalAlignment: 'CENTER',
              },
            },
            fields:
              'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
          },
        },

        // Estilo para filas de productos (excepto título y total)
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 1,
              endRowIndex: endRow - 1,
              startColumnIndex,
              endColumnIndex: endCol,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: false },
                horizontalAlignment: 'LEFT',
              },
            },
            fields: 'userEnteredFormat(textFormat,horizontalAlignment)',
          },
        },

        // Alineación derecha para valores (columna de valor)
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 1,
              endRowIndex: endRow,
              startColumnIndex: startColumnIndex + 1,
              endColumnIndex: startColumnIndex + 2,
            },
            cell: {
              userEnteredFormat: {
                numberFormat: {
                  type: 'NUMBER',
                  pattern: '#,##0',
                },
                horizontalAlignment: 'RIGHT',
              },
            },
            fields: 'userEnteredFormat(numberFormat,horizontalAlignment)',
          },
        },

        // Estilo para fila TOTAL
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: endRow - 1,
              endRowIndex: endRow,
              startColumnIndex,
              endColumnIndex: endCol,
            },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
                textFormat: { bold: true },
              },
            },
            fields: 'userEnteredFormat(backgroundColor,textFormat)',
          },
        },

        // Bordes para toda la tabla
        {
          updateBorders: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: endRow,
              startColumnIndex,
              endColumnIndex: endCol,
            },
            top: border(),
            bottom: border(),
            left: border(),
            right: border(),
            innerHorizontal: border(),
            innerVertical: border(),
          },
        },
      ],
    },
  });
}

function border() {
  return {
    style: 'SOLID',
    width: 1,
    color: { red: 0, green: 0, blue: 0 },
  };
}

module.exports = { addRow };
