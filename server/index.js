require('dotenv/config');
const express = require('express');
const cors = require('cors');
const toolRoutes = require('./routes/tools');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/api', toolRoutes);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
