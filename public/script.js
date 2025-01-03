document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('student-form').addEventListener('submit', function (event) {
      event.preventDefault();
  
      const name = document.getElementById('name').value;
      const sub1 = parseInt(document.getElementById('sub1').value, 10);
      const sub2 = parseInt(document.getElementById('sub2').value, 10);
      const sub3 = parseInt(document.getElementById('sub3').value, 10);
  
      if (!name || isNaN(sub1) || isNaN(sub2) || isNaN(sub3)) {
        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '<p>Error: Please fill in all the fields correctly.</p>';
        return;
      }
  
      const url = `http://localhost:3000/get-personality?name=${name}&sub1=${sub1}&sub2=${sub2}&sub3=${sub3}`;
      console.log('Request URL:', url);  // Loggin our requested URL
  
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error('Server error: ' + response.status);
          }
          return response.json();
        })
        .then(data => {
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = `
            <p>Name: ${data.name}</p>
            <p>Average Marks: ${data.averageMarks}</p>
            <p>Grade: ${data.grade}</p>
            <p>Personality Trait: ${data.personalityTrait}</p>
          `;
        })
        .catch(error => {
          const resultDiv = document.getElementById('result');
          resultDiv.innerHTML = '<p>Error: ' + error.message + '</p>';
        });
    });
  });
  