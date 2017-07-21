const download = require('download');
const md5 = require('md5');
const scraperjs = require('scraperjs');
const fs = require('fs');
const url = 'https://nodejs.org/api/fs.html';
exports.start = function() {
	scraperjs.StaticScraper
		.create(url)
		.scrape(function($) {
			// return $("#readme h2").map(function() {
			// 	return $(this).text();
			// }).get();
			return $('#content #column2 ul li').map(function() {
				return $(this).html();
			}).get();
		})
		.then(function(titles) {
			fs.writeFileSync('public/download/1.txt', titles.join('\r\n'));
		});
};
