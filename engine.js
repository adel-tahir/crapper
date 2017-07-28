const download = require('download');
const md5 = require('md5');
const phantom = require('phantom');
const cheerio = require('cheerio');
var rmdirSync = require('rmdir-sync');;
const _ = require('lodash');
const fs = require('fs');
const Q = require('q');

// const url = 'https://list.tmall.com/search_product.htm?spm=a220m.1000858.0.0.d811797tlPESO&cat=50024556&s={{#PAGE}}&q=3d%B4%F2%D3%A1%BB%FA&sort=s&style=g&from=rs_1_key-top-s&type=pc#J_Filter';
// const url = 'https://list.tmall.com/search_product.htm?q=filament&type=p&spm=a220m.1000858.a2227oh.d100&from=.list.pc_1_searchbutton';
exports.start = function(name, url, start, end) {
	start = parseInt(start) || 0;
	end = parseInt(end) || 99;
	const incre = 60;
	if(fs.existsSync('download/' + name)) {
		rmdirSync('download/' + name);
	}
	fs.mkdirSync('download/' + name);
	console.log('started(from ' + start + ' to ' + end + ')...');
	var result = Q();
	for(var page = start; page <= end; page++) {
		result = result.then(scrape.bind(null, url.replace(/{{#PAGE}}/g, page * incre), name, page));
	}
	result.then(function() {
		console.log('completed.');
	}, function(err) {
		console.log(err);
	});
};

var scrape = (url, name, pageNo) => {
	var deferred = Q.defer();

	var _ph, _page, _outObj;
	console.log('page # ' + (pageNo+1) + ' started...');
	if(fs.existsSync('download/' + name + '/' + (pageNo+1))) {
		rmdirSync('download/' + name + '/' + (pageNo+1));
	}
	fs.mkdirSync('download/' + name + '/' + (pageNo+1));
	phantom.create().then(ph => {
    _ph = ph;
    return _ph.createPage();
	}).then(page => {
    _page = page;
    return _page.open(url);
	}).then(status => {
		return _page.property('content')
	}).then(content => {
    return _page.evaluate(function() {
    	return document.getElementById('J_ItemList').innerHTML.replace(/\n/g, '');
    });
	}).then(contents => {
		const $ = cheerio.load(contents);
		var productList = [];
		var imageUrlList = [];
		var products = $('.product');
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
			item.image_url = 'https:' + imageUrl.replace(/_b.jpg/g, '_500x500.jpg');
			imageUrlList.push(item.image_url);

			var thumbs = $product.find('.productThumb');
			item.styles = [];
			
			if(thumbs) {
				var styleTags = $product.find('.productThumb b');
				_.each(styleTags, styleTag => {
					var thumbImageTag = $(styleTag).find('img');
					var thumbImageUrl = thumbImageTag.attr('data-ks-lazyload') ? thumbImageTag.attr('data-ks-lazyload') : thumbImageTag.attr('src');
					thumbImageUrl = 'https:' + img.replace(/_30x30.jpg/g, '_500x500.jpg');

					item.styles.push({
						sku: $(styleTag).attr('data-sku'),
						image_url: thumbImageUrl
					});

					imageUrlList.push(item.thumbImageUrl);
				});
			}

			productList.push(item);
		});

		_page.close();
		_ph.exit();

		fs.writeFileSync('download/' + name + '/' + (pageNo + 1) + '/meta.json', JSON.stringify(productList));

		var result = Q();
		imageUrlList.forEach(url => {
			var f = download.bind(null, url, 'download/' + name + '/' + (pageNo + 1), {filename: url.split('/').pop()});
			result = result.then(f, f);
		});
		result.then(res => {
			deferred.resolve(null);
			console.log('page # ' + (pageNo+1) + ' completed.');
		}, e => {
			deferred.reject(e)
		});
	}).catch(e => {
		console.log(e);
		deferred.reject(e);
	});

	return deferred.promise;
}