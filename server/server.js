const http = require('http');
const mysql = require('mysql2');
const url = require('url');
const querystring = require('querystring');

// Building MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sonu@2359',
  database: 'student'
});

// Connecting to MySQL
db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    throw err;
  }
  console.log('Connected to the database');
});

// Creating the server
const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // CORS header
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Allow specific headers

  const parsedUrl = url.parse(req.url);
  const method = req.method;

  // Handle preflight requests (OPTIONS method)
  if (method === 'OPTIONS') {
    res.writeHead(204); // No Content
    res.end();
    return;
  }

  if (method === 'GET' && parsedUrl.pathname === '/get-personality') {
    const query = querystring.parse(parsedUrl.query);
    const name = query.name;
    const sub1 = parseInt(query.sub1, 10);
    const sub2 = parseInt(query.sub2, 10);
    const sub3 = parseInt(query.sub3, 10);

    // Log the received query parameters
    console.log('Received query parameters:');
    console.log('Name:', name);
    console.log('Subject 1:', sub1);
    console.log('Subject 2:', sub2);
    console.log('Subject 3:', sub3);

    if (isNaN(sub1) || isNaN(sub2) || isNaN(sub3)) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Error: Subject marks must be valid numbers.');
      return;
    }

    const averageMarks = (sub1 + sub2 + sub3) / 3;
    console.log('Calculated average marks:', averageMarks);

    // Querying the grade based on the average marks
    db.query('SELECT grade FROM grade_range WHERE ? <= max_avg AND ? >= min_avg', [averageMarks, averageMarks], (err, gradeResult) => {
      if (err) {
        console.error('Error fetching grade:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Error fetching grade');
        return;
      }

      console.log('Grade Result:', gradeResult); // Log the result of the grade query

      if (gradeResult.length === 0) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('No grade found for the given marks');
        return;
      }

      const grade = gradeResult[0].grade;

      // Querying the personality trait based on the grade

  // db.query('SELECT trait FROM grade_personality WHERE FIND_IN_SET(?, grade_value)', [grade], (err, personalityResult) =>

      db.query('SELECT trait FROM grade_personality WHERE grade_value LIKE ?', [`%${grade}%`], (err, personalityResult) => {
        if (err) {
          console.error('Error fetching personality trait:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Error fetching personality trait');
          return;
        }

        if (personalityResult.length === 0) {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('No personality trait found for the given grade');
          return;
        }

        const personalityTrait = personalityResult[0].trait;

        // Sending the result back to the client
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          name,
          averageMarks,
          grade,
          personalityTrait
        }));
      });
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

// Starting the server
server.listen(3000, () => {
  console.log('Server running on port 3000');
});
