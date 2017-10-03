const download = require('download');
const md5 = require('md5');
const phantom = require('phantom');
const cheerio = require('cheerio');
var rmdirSync = require('rmdir-recursive-sync');
const _ = require('lodash');
const fs = require('fs');
// const url = 'https://list.tmall.com/search_product.htm?spm=a220m.1000858.0.0.d811797k7Xo1C&cat=50025135&s={{#PAGE}}&q=%B3%A4%D0%E4%C1%AC%D2%C2%C8%B9&sort=s&style=g&from=.list.pc_1_searchbutton&type=pc#J_Filter';
// const url = 'https://list.tmall.com/search_product.htm?spm=a220m.1000858.0.0.d811797tlPESO&cat=50024556&s={{#PAGE}}&q=3d%B4%F2%D3%A1%BB%FA&sort=s&style=g&from=rs_1_key-top-s&type=pc#J_Filter';
// const url = 'https://list.tmall.com/search_product.htm?q=filament&type=p&spm=a220m.1000858.a2227oh.d100&from=.list.pc_1_searchbutton';
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
		try {
			await scrape(url.replace(/{{#PAGE}}/g, page * incre), name, page);
		}
		catch(err) {
			console.log(err);
		}
	}
	console.log('completed.');
	return Promise.resolve();
};

var scrape = async function (url, name, pageNo){

	var _ph, _page, _outObj;
	console.log('page # ' + (pageNo+1) + ' started...');
	if(fs.existsSync('download/' + name + '/' + (pageNo+1))) {
		rmdirSync('download/' + name + '/' + (pageNo+1));
	}
	fs.mkdirSync('download/' + name + '/' + (pageNo+1));
	_ph = await phantom.create()
	_page = await _ph.createPage();
  await _page.property('viewportSize', { width: 1440, height: 900 });
	await _page.setting('userAgent', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/28.0.1500.71 Safari/537.36');
	await _page.setting('loadImages', false);
 	let _status = await _page.open(url);
 	let contents = await _page.property('content');

 	fs.writeFileSync('/home/ubuntu/1.txt', contents);

	_page.close();
	_ph.exit();

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

	console.log('page # ' + (pageNo+1) + ' completed.');

	return Promise.resolve();
}