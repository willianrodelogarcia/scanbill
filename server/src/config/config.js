const googleSheetsConst = {
  spreadsheetId:
    process.env.GOOGLE_SHEETS_SPREADSHEET_ID || 'your-spreadsheet-id',
};

const urls = {
  frontend_url: process.env.FRONTEND_URL,
};

const JWT_SECRETS = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiry: process.env.JWT_EXPIRY || '1h',
};

module.exports = {
  googleSheetsConst,
  urls,
  JWT_SECRETS,
};
