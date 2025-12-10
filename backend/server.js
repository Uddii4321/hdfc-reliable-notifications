const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const notifications = require('./routes/notifications');
const helpers = require('./routes/helpers');
const path = require('path');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use('/api/notifications', notifications);
app.use('/api/helpers', helpers);   


app.use('/', express.static(path.join(__dirname, '..', 'frontend')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
