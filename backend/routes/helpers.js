const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const sample = require('../data/sampleEvents.json');

router.get('/list-samples', (req, res) => {
  res.json(sample.slice(0, 50));
});

router.get('/inbox', (req, res) => {
  const inboxPath = path.join(__dirname, '..', '..', 'logs', 'inbox.json');
  try {
    const arr = JSON.parse(fs.readFileSync(inboxPath, 'utf8') || '[]');
    res.json(arr);
  } catch (e) {
    res.json([]);
  }
});

module.exports = router;
