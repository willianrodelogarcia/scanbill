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

const SECURE_HTTPS = process.env.SECURE_HTTPS || true;

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  googleSheetsConst,
  urls,
  JWT_SECRETS,
  SECURE_HTTPS,
  isProduction,
};
