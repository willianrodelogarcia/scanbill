const { google } = require('googleapis');
const { authCredentials } = require('../config');

const oauth2Client = new google.auth.OAuth2(
  authCredentials.googleClientId,
  authCredentials.googleClientSecret,
  authCredentials.googleRedirectUri,
);

const SCOPES = [
  'https://www.googleapis.com/auth/userinfo.profile',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
];

const getAuthUrl = () => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
  });
  return authUrl;
};

const getAccessToken = async code => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();
  return { data, tokens };
};

module.exports = {
  getAuthUrl,
  getAccessToken,
};
