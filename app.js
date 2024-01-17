const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const cors = require('cors');
const path = require('path');

const articlesRouter = require('./Routers/ArticleRouter');

const app = express();
const port = 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

app.use('/articles', articlesRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
