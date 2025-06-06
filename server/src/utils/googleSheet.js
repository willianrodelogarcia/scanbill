const { google } = require('googleapis');

const {
  config: { googleSheetsConst },
  credentials: { credentials: keys },
} = require('../config');

const auth = new google.auth.GoogleAuth({
  credentials: keys,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

async function addRow(text, name) {
  const { productos, total } = text;
  const values = [];
  values.push(...productos, { descripcion: 'Total', valor: total });
  let sheetId = null;
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  const spreadsheetId = googleSheetsConst.spreadsheetId;

  const newSheet = `${name}_${new Date().toISOString().slice(0, 10)}`;

  const sheetExists = await checkSheetExists(spreadsheetId, newSheet);

  if (!sheetExists) {
    try {
      const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              addSheet: {
                properties: {
                  title: newSheet,
                },
              },
            },
          ],
        },
      });
      sheetId = res.data.replies[0].addSheet.properties.sheetId;
    } catch (error) {
      if (
        error.errors?.[0]?.reason === 'duplicate' ||
        error.message.includes('already exists')
      ) {
        console.log(`ℹ️ La hoja '${newSheet}' ya existe.`);
      } else {
        console.error('❌ Error al crear hoja:', error.message);
        return;
      }
    }
  }

  const range = `${newSheet}!A2`;

  const valores = values.map(p => [p.descripcion, p.valor]);

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: valores,
    },
  });

  if (!sheetId) {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = res.data.sheets.find(s => s.properties.title === newSheet);
    sheetId = sheet.properties.sheetId;
  }

  await applyStyleTable({ spreadsheetId, sheetId, count: valores.length });

  console.log('Filas agregadas exitosamente');
}

const checkSheetExists = async (spreadsheetId, sheetName) => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId,
      ranges: sheetName,
      includeGridData: false,
    });
    return response.data.sheets.some(
      sheet => sheet.properties.title === sheetName,
    );
  } catch (error) {
    return false;
  }
};

async function applyStyleTable({ spreadsheetId, sheetId, count }) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    resource: {
      requests: [
        // Negrita y fondo gris en encabezados
        {
          repeatCell: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                horizontalAlignment: 'CENTER',
              },
            },
            fields:
              'userEnteredFormat(textFormat, backgroundColor, horizontalAlignment)',
          },
        },
        // Bordes en toda la tabla (asumiendo hasta fila 100 y 2 columnas)
        {
          updateBorders: {
            range: {
              sheetId,
              startRowIndex: 0,
              endRowIndex: count + 1,
              startColumnIndex: 0,
              endColumnIndex: 2,
            },
            top: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
            bottom: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
            left: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
            right: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
            innerHorizontal: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
            innerVertical: {
              style: 'SOLID',
              width: 1,
              color: { red: 0, green: 0, blue: 0 },
            },
          },
        },
      ],
    },
  });
}

module.exports = { addRow };
