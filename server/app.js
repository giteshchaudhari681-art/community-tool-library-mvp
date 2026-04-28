require('dotenv/config');
const express = require('express');
const cors = require('cors');
const toolRoutes = require('./routes/tools');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', toolRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

module.exports = app;
