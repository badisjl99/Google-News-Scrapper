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



/*fetch('http://localhost:3000/articles/warsimage')
.then(response => response.json())
.then(data => {
    // Update the src attribute of the img tag with the fetched image URL
    document.getElementById('aboutImage').src = data.imgSrc; // Fix the key here
})
.catch(error => console.error('Error fetching image:', error));*/