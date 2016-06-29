'use strict';
const express = require('express');
const app = express();
const port = process.env.PORT || 8080;
const urllib= require('url');
const got = require('got');
const cheerio = require('cheerio');
const tmpl = require('consolidate');
const fs = require('fs');
const tress = require('tress');

let q,
	urlFirst,
	domin,
	links=[],
	results=[];

let conf = {
	maxToParse: 10
};

app.engine('hbs', tmpl.handlebars);
app.set('view engine', 'hbs');
app.set('views', __dirname +'/views');

app.get('/', function(req, res){
	res.render('tmpl', {
		placeholderText:'Please, enter your url',
		name:'urltoParse', 
		btnTxt:'Search',
		body: ''
	});
});

app.get('/search', function(req, res){

	let query = urllib.parse(req.url, true).query;

	if (query.urltoParse) {
		urlFirst = /^http:\/\//.test(query.urltoParse) && query.urltoParse || ('http://' + query.urltoParse);
		domin = !(query.urltoParse.startsWith('http://')) && query.urltoParse || query.urltoParse.slice(8) ;

		got(urlFirst).then(function(data) {
			let $ = cheerio.load(data.body);
			res.render('tmpl', {
				placeholderText:'Selected item class',
				name:'params',
				depthCount: 'depth',
				btnTxt:'Find',
				body: $.html()
			});
		});

	} else if (query.params) {

		let classSelector = '';
		let classStr = query.params.trim();
		if (classStr.charAt(0) !== '.') {
			let arrOfParams = classStr.split(' ');
			classSelector = '.'+ arrOfParams.join('.');
		} else {
			classSelector = classStr;
		}
		console.log(`selector: ${classSelector}`);

		let defaultDepth = urlFirst.split('/').length;
		let depth = query.depth;


		function addLink(link) {
			let currentDepth = link.split('/').length;

			if (currentDepth - defaultDepth <= depth) {
				links.push(link);
				q.push(link);
			}
		}

		q = tress(function(url, callback) {

			got(url).then(function(data) {
				let $ = cheerio.load(data.body);

				$(classSelector).each(function (index, item) {
					let text = $(item).text();
					results.push({href: url, text: text});
				});

				$('a').each(function() {
					let link = $(this).attr('href');

					if (link && link.charAt(0) == '/') {
						link = urllib.resolve(url, link);
					}
	
					if (link.indexOf(urlFirst) != -1 && links.indexOf(link) == -1 && link.indexOf('#') == -1 && link != url) {
						addLink(link);
					} 
				});

			}).catch(function(err){
				console.log(err);
			});
			callback();
		}, 10);


		q.drain = function(){
			let strResults = JSON.stringify(results, null, 4);
			console.log('results: ', results);
			fs.writeFileSync('./results.json', strResults);
		};

		q.error = function(err) {
    		console.log('err', err);
		};

		links.push(urlFirst);
		q.push(urlFirst);

		res.send('DONE!');
	}
});

app.listen(port, function() {
	console.log(`Listening on port ${port}`);
});

