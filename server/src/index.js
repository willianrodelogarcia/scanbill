const express = require('express');
const { uploadRouter } = require('./routes');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.use('/api/upload', uploadRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
