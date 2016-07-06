#!/usr/bin/env node
"use strict";
const coa = require("coa");
const fs = require('fs');
const util = require('util');
const Kraken = require('kraken');
const https = require('https');

let kraken = new Kraken({
	api_key: '1f116a73c4f59081fef508069106cadb',
	api_secret: '562f466ae5d59ef00210cf411e1ee760ab19740f'
});

function optimizer(options, args, opts) {

	kraken.upload(opts, function (data) {
		if (data.success) {
			let imgUrl = data.kraked_url;

			let fileName = options.input.split('.');
			let newFileName = '.\\' + fileName[fileName.length-2]+'_new'+imgUrl.slice(imgUrl.lastIndexOf('.'));

			let file = fs.createWriteStream(newFileName);

			let request = https.get(imgUrl, function(response) {
				console.log("statusCode: ", response.statusCode);
				console.log("headers: ", response.headers);
				response.pipe(file);
				response.on('end', function() {
					file.close(function() {
						console.log(`The image ${newFileName} is optimized and saved successfully.`);
					});
				}).on('error', function(err) {
					fs.unlink(newFileName);
					console.log(err);
				});
			}).on('error', function(err) {
				console.log(err.message);
			});
		} else {
			console.log('Fail. Error message: %s', data.message);
		}
	});
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

coa.Cmd() 
	.name(process.argv[1])
	.title('The command utility to optimize the images')  
	.helpful() 
	.opt() 
		.name('version').title('Version')
		.short('v') 
		.long('version') 
		.only()
		.flag() 
		.act(function(options) { 
			return JSON.parse(fs.readFileSync('./package.json')).version;
		})
		.end()
	.opt()
		.name('input').title('input image, required')
		.short('i').long('input')
		.val(function(val) {
			return val || this.reject('Option --input must have a value.');
		})
		.act(function(options, args) { 
			let pathImage = __dirname +'\\..\\..\\'+ options.input;
			let opts = {
				file: fs.createReadStream(pathImage),
				wait: true
			}

			optimizer(options, args, opts);
			return; 
		})
		.end()
	.cmd().name('resize').title('Resize image').helpful()
		.opt()
			.name('exact').title('Resize image to exact width and height.')
			.short('e')
			.long('exact')
			.val(function(val) {
				return val || this.reject('Option --exact must have a name of image file.');
			})
			.end()
			.arg()
				.name('width').title('width of new image')
				.def(500)
				.val(function(val){
					return isNumeric(val) ? val : 500;
				})
				.end()
			.arg()
				.name('height').title('height of new image')
				.def(300)
				.val(function(val){
					return isNumeric(val) ? val : 300;
				})
				.end()
			.completable()
			.act(function(options, args){
				if (args) {
					let pathImage = __dirname +'\\..\\..\\'+ options.exact;
					let opts = {
						file: fs.createReadStream(pathImage),
						wait: true,
						resize: {
							width: +args.width,
							height: +args.height,
							strategy: "crop"
						}
					}
					console.log(util.inspect(opts));
					optimizer(options, args, opts);
				}
				return;
			})
			.end() 
	.run(process.argv.slice(2)); 