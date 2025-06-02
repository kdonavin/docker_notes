const express = require('express');
const redis = require('redis');
const process = require('process');

const app = express();
const client = redis.createClient({
  host: 'redis-server', //Express node.js has no idea where this will go. Docker resolves this string to the other container on the network
  port: 6379, //Default port used with redis
});
client.set('visits', 1);

app.get('/', (req, res) => {
//		process.exit(0); //causes crashes
		client.get('visits', (err, visits) => {
		res.send('Number of visits ' + visits);
		client.set('visits', parseInt(visits) + 1); //redis sends visits back as string
	});
});

app.listen(8081, () => {
  console.log('listening on port 4001');
});
