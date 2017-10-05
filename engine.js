const download = require('download');
const md5 = require('md5');
const phantom = require('phantom');
const cheerio = require('cheerio');
var rmdirSync = require('rmdir-recursive-sync');
const _ = require('lodash');
const fs = require('fs');
// const url = 'https://list.tmall.com/search_product.htm?spm=a220m.1000858.0.0.d811797k7Xo1C&cat=50025135&s={{#PAGE}}&q=%B3%A4%D0%E4%C1%AC%D2%C2%C8%B9&sort=s&style=g&from=.list.pc_1_searchbutton&type=pc#J_Filter';

exports.scrape = scrape;
exports.parse = parse;

exports.start = async function(name, url, start, end) {
	start = parseInt(start) || 0;
	end = parseInt(end) || 99;
	const incre = 60;
	if(fs.existsSync('download/' + name)) {
		rmdirSync('download/' + name);
	}
	fs.mkdirSync('download/' + name);
	console.log('started(from ' + start + ' to ' + end + ')...');
	for(var page = start; page <= end; page++) {
		console.log('page # ' + (page+1) + ' started...');
		try {
			let contents = await scrape(url.replace(/{{#PAGE}}/g, page * incre), name, page);
			await parse(contents, name, page);
		}
		catch(err) {
			console.log(err);
		}
		console.log('page # ' + (page+1) + ' completed.');
	}
	console.log('completed.');
	return Promise.resolve();
};

exports.startByFile = async function(name, path, start, end) {
	start = parseInt(start) || 0;
	end = parseInt(end) || 99;
	const incre = 60;
	if(fs.existsSync('download/' + name)) {
		rmdirSync('download/' + name);
	}
	fs.mkdirSync('download/' + name);
	console.log('started(from ' + start + ' to ' + end + ')...');
	for(var page = start; page <= end; page++) {
		console.log('page # ' + (page+1) + ' started...');
		try {
			let contents = await fs.readFile(path + '/' + (page+1) + '.html');
			await parse(contents, name, page);
		}
		catch(err) {
			console.log(err);
		}
		console.log('page # ' + (page+1) + ' completed.');
	}
	console.log('completed.');
	return Promise.resolve();
};

const scrape = async function (url, name, pageNo){

	var _ph, _page, _outObj;
	_ph = await phantom.create()
	_page = await _ph.createPage();
  // await _page.property('viewportSize', { width: 1440, height: 900 });
	await _page.setting('userAgent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36');
 	let _status = await _page.open(encodeURI(url));

 	let _readyState = '';
 	while(_readyState != 'complete') {
		_readyState = await _page.evaluate( function() {
			return document.readyState;
		});
	}

 	let contents = await _page.property('content');

	_page.close();
	_ph.exit();

 	return Promise.resolve(contents);
}

const parse = async function(contents, name, pageNo) {

	if(fs.existsSync('download/' + name + '/' + (pageNo+1))) {
		rmdirSync('download/' + name + '/' + (pageNo+1));
	}
	fs.mkdirSync('download/' + name + '/' + (pageNo+1));

	const $ = cheerio.load(contents);
	var productList = [];
	var imageUrlList = [];
	var products = $('#J_ItemList .product');
	_.each(products, (product, i) => {
		const $product = $(product);
		var item = {
			id: $product.attr('data-id'),
			title: $product.find('.productTitle a').text(),
			brand: $product.find('.productShop-name').text(),
			price: $product.find('.productPrice').text(),
			monthly_sales: $product.find('.productStatus span em').text(),
			votes: $product.find('.productStatus span a').text()
		};

		var imageTag = $product.find('.productImg img');
		var imageUrl = imageTag.attr('data-ks-lazyload') ? imageTag.attr('data-ks-lazyload') : imageTag.attr('src');
		item.image_url = imageUrl ? 'https:' + imageUrl.replace(/_b.jpg/g, '_500x500.jpg') : '';
		if(item.image_url != '') imageUrlList.push(item.image_url);

		var thumbs = $product.find('.productThumb');
		item.styles = [];
		
		if(thumbs) {
			var styleTags = $product.find('.productThumb b');
			_.each(styleTags, styleTag => {
				var thumbImageTag = $(styleTag).find('img');
				var thumbImageUrl = thumbImageTag.attr('data-ks-lazyload') ? thumbImageTag.attr('data-ks-lazyload') : thumbImageTag.attr('src');
				if(thumbImageUrl) {
					thumbImageUrl = 'https:' + thumbImageUrl.replace(/_30x30.jpg/g, '_500x500.jpg');

					item.styles.push({
						sku: $(styleTag).attr('data-sku'),
						image_url: thumbImageUrl
					});

					imageUrlList.push(thumbImageUrl);
				}
			});
		}

		productList.push(item);
	});

	fs.writeFileSync('download/' + name + '/' + (pageNo + 1) + '/meta.json', JSON.stringify(productList));

	for(let url of imageUrlList) {
		try {
			await download(url, 'download/' + name + '/' + (pageNo + 1), {filename: url.split('/').pop()});
		}
		catch(err) { }
	}

	return Promise.resolve();
}