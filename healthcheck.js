import { request as _request } from 'http';

const options = {
  host: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 2000,
};

const request = _request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  if (res.statusCode === 200) {
    process.exit(0);
  } else {
    process.exit(1);
  }
});

request.on('error', (err) => {
  console.log('ERROR:', err.message);
  process.exit(1);
});

request.end();
