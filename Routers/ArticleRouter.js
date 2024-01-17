const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const Sentiment = require('sentiment');
const cors = require('cors');

const router = express.Router();
const port = 3000;

router.use(cors());

const stopWords = [
  'on', 'off', 'and', 'the', 'is', 'in', 'at', 'it', 'of', 'for', 'with',
  'to', 'from', 'by', 'an', 'as', 'but', 'or', 'not', 'are', 'was', 'were',
  'am', 'be', 'being', 'been', 'this', 'that', 'these', 'those', 'a', 'an',
  'the', 'I', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his',
  'its', 'our', 'their', 'me', 'him', 'her', 'us', 'them', 'mine', 'yours',
  'hers', 'ours', 'theirs', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'whose', 'if', 'because', 'so', 'due', 'while', 'as',
  'until', 'since', 'after', 'before', 'when', 'where', 'why', 'how', 'all',
  'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
  's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o',
  're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven',
  'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
  'september', 'october', 'november', 'december','over','says','2024'
];

const url = 'https://news.google.com/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRGx1YlY4U0FtVnVHZ0pWVXlnQVAB?hl=en-US&gl=US&ceid=US%3Aen';
const excludeWords = ['Sign in', 'Home', 'For you', 'Following', 'U.S.', 'World', 'Local', 'Business', 'Technology', 'Entertainment', 'Sports', 'Science', 'Health', 'News'];

const sentiment = new Sentiment();

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

const getTopWords = (html, count, stopWords) => {
  const $ = cheerio.load(html);
  const wordsCount = {};

  $('a').each((index, element) => {
    const text = $(element).text().trim();

    if (!excludeWords.includes(text) && !text.includes('Full Coverage') && text !== '') {
      const words = text.split(/\s+/);
      words.forEach((word) => {
        const sanitizedWord = word.toLowerCase().replace(/[^\w\s]/g, '');

        if (sanitizedWord && !excludeWords.includes(sanitizedWord) && !stopWords.includes(sanitizedWord)) {
          wordsCount[sanitizedWord] = (wordsCount[sanitizedWord] || 0) + 1;
        }
      });
    }
  });

  const sortedWords = Object.entries(wordsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

  return sortedWords.map(([word, count]) => ({ word, count }));
};

router.get('/news', async (req, res) => {
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

router.get('/topwords', async (req, res) => {
  try {
    const response = await axios.get(url);
    if (response.status === 200) {
      const html = response.data;
      const topWords = getTopWords(html, 10, stopWords);

      res.json(topWords);
    } else {
      res.status(500).json({ error: 'Unable to fetch the data.' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/sentimentPercentage', async (req, res) => {
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

router.get('/warsimage', async (req, res) => {
  try {
    const imgSrcResponse = await axios.get('https://www.statista.com/chart/21652/countries-with-armed-clashes-reported/');
    if (imgSrcResponse.status === 200) {
      const html = imgSrcResponse.data;
      const $ = cheerio.load(html);

      // Select the div with class "article__graphic" and get the img src attribute
      const imgSrc = $('div.article__graphic img').attr('src');

      // Send the img src in the response
      res.json({ imgSrc });
    } else {
      res.status(500).json({ error: 'Unable to fetch the img src data.' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
router.get('/latestarticles', async (req, res) => {
  try {
    const response = await axios.get('https://swentr.site/');
    if (response.status === 200) {
      const html = response.data;
      const $ = cheerio.load(html);
      const latestArticles = [];

      $('li.main-promobox__item').each((index, element) => {
        const title = $(element).find('.main-promobox__heading').text().trim();
        const image = $(element).find('.media__item').attr('data-src');
        const relativeFullArticle = $(element).find('.main-promobox__heading').attr('href');
        const fullArticle = 'https://swentr.site/' + relativeFullArticle;

        latestArticles.push({
          title,
          image,
          fullArticle,
        });
      });

      res.json(latestArticles);
    } else {
      res.status(500).json({ error: 'Unable to fetch the data.' });
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







module.exports = router;
