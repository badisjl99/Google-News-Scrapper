const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');

const app = express();
const port = 3000;

const url = 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen';
const excludeWords = ['Sign in', 'Home', 'For you', 'Following', 'U.S.', 'World', 'Local', 'Business', 'Technology', 'Entertainment', 'Sports', 'Science', 'Health', 'News'];

const sentiment = new Sentiment();

// Function to analyze sentiment and count occurrences
const analyzeSentiments = (html) => {
  const $ = cheerio.load(html);

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  $('a').each((index, element) => {
    const text = $(element).text().trim();

    if (!excludeWords.includes(text) && !text.includes('Full Coverage') && text !== '') {
      const result = sentiment.analyze(text);
      const compoundScore = result.comparative;

      if (compoundScore >= 0.05) {
        positiveCount++;
      } else if (compoundScore <= -0.05) {
        negativeCount++;
      } else {
        neutralCount++;
      }
    }
  });

  const totalCount = positiveCount + negativeCount + neutralCount;
  const positivePercentage = ((positiveCount / totalCount) * 100).toFixed(2);
  const negativePercentage = ((negativeCount / totalCount) * 100).toFixed(2);
  const neutralPercentage = ((neutralCount / totalCount) * 100).toFixed(2);

  return {
    positive: `${positivePercentage}%`,
    negative: `${negativePercentage}%`,
    neutral: `${neutralPercentage}%`,
  };
};

app.get('/news', async (req, res) => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const html = response.data;
      const newsData = [];

      const $ = cheerio.load(html);
      $('a').each((index, element) => {
        const text = $(element).text().trim();

        if (!excludeWords.includes(text) && !text.includes('Full Coverage') && text !== '') {
          const result = sentiment.analyze(text);
          const compoundScore = result.comparative;

          let sentimentLabel;
          if (compoundScore >= 0.05) {
            sentimentLabel = 'positive';
          } else if (compoundScore <= -0.05) {
            sentimentLabel = 'negative';
          } else {
            sentimentLabel = 'neutral';
          }

          newsData.push({
            text,
            label: sentimentLabel,
          });
        }
      });

      res.json(newsData);
    } else {
      res.status(500).json({ error: 'Unable to fetch the data.' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/sentimentPercentage', async (req, res) => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const html = response.data;
      const sentimentPercentage = analyzeSentiments(html);

      res.json(sentimentPercentage);
    } else {
      res.status(500).json({ error: 'Unable to fetch the data.' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
