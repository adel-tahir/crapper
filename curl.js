var engine = require('./engine');

// clear
const url = process.argv[2];

engine.scrape(url).then( (res) => {
	console.log(res);
});