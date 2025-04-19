const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

app.post('/generate-diff', (req, res) => {
  const { originalText, editedText, changes } = req.body;

  if (!originalText || !editedText || !Array.isArray(changes)) {
    return res.status(400).json({ error: 'Missing originalText, editedText or changes' });
  }

  const sessionId = uuidv4();
  const filePath = path.join(dataDir, `${sessionId}.json`);

  const dataToSave = {
    sessionId,
    originalText,
    editedText,
    changes
  };

  fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));

  res.json({
    link: `http://localhost:${PORT}/canvas.html?session=${sessionId}`
  });
});

app.get('/data/:sessionId', (req, res) => {
  const filePath = path.join(dataDir, `${req.params.sessionId}.json`);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Session not found' });
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return res.json(JSON.parse(content));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at: http://localhost:${PORT}`);
});
