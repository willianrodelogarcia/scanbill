const { google } = require('googleapis');

const {
  config: { googleSheetsConst },
  credentials: { credentials: keys },
  authCredentials,
} = require('../config');

const { userService } = require('../services');

async function addRow({ text, comercio, user, email, documentId }) {
  let spreadsheetId;
  const { productos, total } = text;
  const values = [...productos, { descripcion: 'Total', valor: total }];
  const oauth2Client = new google.auth.OAuth2(
    authCredentials.googleClientId,
    authCredentials.googleClientSecret,
    authCredentials.googleRedirectUri,
  );

  oauth2Client.setCredentials({
    access_token: user.access_token,
    refresh_token: user.refresh_token,
    scope: user.scope,
    token_type: user.token_type,
    expiry_date: user.expiry_date,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });
  const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

  const userEmail = await userService.findOneGoogle({ email });
  if (userEmail.google.sheets.length > 0 && documentId) {
    spreadsheetId = userEmail.google.sheets
      .filter(sheetId => sheetId.spreadsheetId === documentId)
      .map(sheet => sheet.spreadsheetId)[0];
  }
  const newSheet = `Facturas_${new Date().toISOString().slice(0, 10)}`;

  if (!spreadsheetId) {
    spreadsheetId = await createUserSheet({ drive, newSheet, email, comercio });
  }

  const sheetId = await ensureSheetExists(sheets, spreadsheetId, newSheet);
  const startCol = await findNextFreeColumn(sheets, spreadsheetId, newSheet);
  const colLetter = columnToLetter(startCol);

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${newSheet}!${colLetter}1`,
    valueInputOption: 'USER_ENTERED',
    resource: { values: [[comercio]] },
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
    sheets,
  });

  console.log('✅ Factura añadida con solo encabezado:', comercio);
  return {
    newSheet,
  };
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
  sheets,
}) {
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

async function createUserSheet({ drive, newSheet, email, comercio }) {
  const fileRes = await drive.files.create({
    resource: {
      name: newSheet,
      mimeType: 'application/vnd.google-apps.spreadsheet',
    },
    fields: 'id',
  });

  const spreadsheetId = fileRes.data.id;

  await userService.findAndUpdateByEmail({
    email,
    spreadsheetId,
    comercio,
    newSheet,
  });

  console.log(`✅ Spreadsheet creado para usuario: ${spreadsheetId}`);
  return spreadsheetId;
}

// Share the document with the user's email
async function shareDocument(drive, spreadsheetId, email) {
  await drive.permissions.create({
    fileId: spreadsheetId,
    requestBody: {
      role: 'writer',
      type: 'user',
      emailAddress: email,
    },
  });
}

module.exports = { addRow };
