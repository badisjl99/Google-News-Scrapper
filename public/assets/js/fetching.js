const canvas = document.getElementById('sentimentChart');
const ctx = canvas.getContext('2d');

const fetchData = async () => {
  try {
    const response = await fetch('http://localhost:3000/articles/sentimentPercentage');
    const data = await response.json();


    const sentimentChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Positive', 'Negative', 'Neutral'],
        datasets: [{
          data: [
            parseFloat(data.positive),
            parseFloat(data.negative),
            parseFloat(data.neutral),
          ],
          backgroundColor: ['#76c68f', '#de6e56', '#a7d5ed'],
        }]
      },
      options: {
        legend: {
          position: 'right',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};


document.addEventListener('DOMContentLoaded', fetchData);

fetch('http://localhost:3000/articles/topwords')
    .then(response => response.json())
    .then(data => {
        // Extract data for labels and values
        const labels = data.map(item => item.word);
        const counts = data.map(item => item.count);

        // Get the canvas element
        const ctx = document.getElementById('barChart').getContext('2d');

        // Create a bar chart
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Word Count',
                    data: counts,
                    backgroundColor: '#fff68f', 
                    borderColor: 'black', 
                    borderWidth: 3
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
    
function getCurrentTimeMinus30Min() {
  var currentDate = new Date();
  currentDate.setMinutes(currentDate.getMinutes() - 30);
  return currentDate.toLocaleString(); // You can format the date as needed
}
var updateTimeElement = document.getElementById("updateTime");
updateTimeElement.textContent = getCurrentTimeMinus30Min();


function getWarMap(){

// Fetch the image from the API
fetch('http://localhost:3000/articles/warsimage')
  .then(response => response.json())
  .then(data => {
    // Update the src attribute of the img tag with the fetched image URL
    document.getElementById('aboutImage').style.backgroundImage = `url(${data.imgSrc})`;
  })
  .catch(error => console.error('Error fetching image:', error));


  
}
function getLatestArticles(){


  document.addEventListener("DOMContentLoaded", function () {

    const apiUrl = 'http://localhost:3000/articles/latestarticles';
  
   
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => createCards(data))
      .catch(error => console.error('Error fetching data:', error));
  

    function createCards(data) {
      const articleCardsContainer = document.getElementById('articleCards');
  

      for (let i = 0; i < Math.min(12, data.length); i++) {
        const article = data[i];

        const truncatedTitle = truncateText(article.title, 12);
  
      
        const card = document.createElement('div');
        card.className = 'card mb-3 col-md-4'; 
  
        const cardHeader = document.createElement('h3');
        cardHeader.className = 'card-header';
        cardHeader.textContent = truncatedTitle;
  
        const cardBody1 = document.createElement('div');
        cardBody1.className = 'card-body';
  
        const img = document.createElement('img');
        img.src = article.image;
        img.className = 'd-block user-select-none';
        img.style.width = '100%';
        img.style.height = '200px'; 
  
        const cardBody2 = document.createElement('div');
        cardBody2.className = 'card-body';
  
        const link = document.createElement('a');
        link.href = article.fullArticle;
        link.className = 'card-link';
        link.textContent = 'Read more';
        link.style.color = '#FFC451' ;


        const cardFooter = document.createElement('div');
        cardFooter.className = 'card-footer text-muted';
        cardFooter.textContent = '2 days ago';
  
        cardBody1.appendChild(img);
        cardBody2.appendChild(link);
  
        card.appendChild(cardHeader);
        card.appendChild(cardBody1);
        card.appendChild(cardBody2);
        card.appendChild(cardFooter);
  
        articleCardsContainer.appendChild(card);
  
        if ((i + 1) % 3 === 0) {
          articleCardsContainer.appendChild(document.createElement('div'));
        }
      }
    }
  
    function truncateText(text, maxWords) {
      const words = text.split(' ');
      if (words.length > maxWords) {
        return words.slice(0, maxWords).join(' ') + '...';
      }
      return text;
    }
  });
  

}



function getColorForSentiment(sentiment) {
  if (sentiment === 'negative') {
    return 'red';
  } else if (sentiment === 'positive') {
    return 'lightgreen';
  } else {
    return 'default';
  }
}


function getNewsDataBase(){

document.addEventListener("DOMContentLoaded", function () {
  fetch('http://localhost:3000/articles/news')
    .then(response => response.json())
    .then(data => {
      const tableBody = document.querySelector('#articlesTable tbody');
      const loginPrompt = document.querySelector('#loginPrompt');

      const maxRowsToShow = 30;

      data.slice(0, maxRowsToShow).forEach(article => {
        const row = document.createElement('tr');

        const articleCell = document.createElement('td');
        articleCell.textContent = article.text;
        const sentimentCell = document.createElement('td');
        sentimentCell.textContent = article.label;
        sentimentCell.style.color = getColorForSentiment(article.label);

        row.appendChild(articleCell);
        row.appendChild(sentimentCell);

        tableBody.appendChild(row);
      });

      if (data.length > maxRowsToShow) {
        loginPrompt.style.display = 'block';
      }
    })
    .catch(error => console.error('Error fetching articles:', error));
});


}

function getMostUsedWord(){

document.addEventListener('DOMContentLoaded',function(){


fetch('http://localhost:3000/articles/topwords')
.then(response => response.json())
.then(topWords =>{
  const mostUsedWord = topWords[0] && topWords[0].word || 'N/A';

  const mostUsedWordElement = document.getElementById('mostUsedWord');
  mostUsedWordElement.textContent = mostUsedWord;
})
.catch(error => console.error('Error fetching top words:', error));


});


}

function getTodayGeneralSentiment(){
  document.addEventListener("DOMContentLoaded", function () {

    fetch('http://localhost:3000/articles/sentimentPercentage')
      .then(response => response.json())
      .then(sentimentData => {

        const highestSentiment = Object.entries(sentimentData).reduce((acc, [key, value]) => {
          return parseFloat(value) > parseFloat(acc.value) ? { key, value } : acc;
        }, { key: '', value: '0%' });
  
        
        const highestSentimentElement = document.getElementById('highestSentiment');
        highestSentimentElement.textContent = `${highestSentiment.key}: ${highestSentiment.value}`;
      })
      .catch(error => console.error('Error fetching sentiment data:', error));
  });
}



getLatestArticles();
getWarMap() ;
getNewsDataBase();
getMostUsedWord();
getTodayGeneralSentiment();
