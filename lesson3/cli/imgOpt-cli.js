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

let imgDir = '.\\';
let imgSaveDir = '.\\'

function downloadImg(imgTitle, imgUrl) {
	let fileName = imgTitle.split('.');
	let newFileName = imgSaveDir + fileName[fileName.length-2]+'_new'+imgUrl.slice(imgUrl.lastIndexOf('.'));

	let file = fs.createWriteStream(newFileName);

	let request = https.get(imgUrl, (response) => {
		response.pipe(file);

		response.on('end', () => {

			file.close(() => {
				console.log(`The image ${newFileName} is optimized and saved successfully.`);
			});

		}).on('error', (err) => {
			fs.unlink(newFileName);
			console.log(err.message);
		});

	}).on('error', (err) => {
		console.log(err.message);
	});
}

function optimizer(options, opts, cb) {
	kraken.upload(opts, (data) => {
		if (data.success) {
			cb(options.input, data.kraked_url);
		} else {
			console.log('Fail. Error message: %s', data.message);
			return;
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
		.act((options) => { 
			return JSON.parse(fs.readFileSync('./package.json')).version;
		})
		.end()
	.opt()
		.name('input').title('input image, required')
		.short('i').long('input')
		.val((val) => {
			return val || this.reject('Option --input must have a value.');
		})
		.act((options, args) => { 
			let pathImage = imgDir + options.input;
			let opts = {
				file: fs.createReadStream(pathImage),
				wait: true
			};

			optimizer(options, opts, downloadImg);
			return; 
		})
		.end()
	.cmd().name('resize').title('Resize image').helpful()
		.opt()
			.name('input').title('input image, required')
			.short('i').long('input')
			.val((val) => {
				return val || this.reject('Option --input must have a value.');
			})
			.req()
			.end()
		.opt()
			.name('exact').title('Resize image to exact width and height.')
			.short('e')
			.long('exact')
			.flag()
			.end()
		.arg()
			.name('width').title('width of new image')
			.def(500)
			.val((val) => {
				return isNumeric(val) ? val : 500;
			})
			.end()
		.arg()
			.name('height').title('height of new image')
			.def(300)
			.val((val) => {
				return isNumeric(val) ? val : 300;
			})
			.end()
		.completable()
		.act((options, args) => {
			if (args) {
				let pathImage =  imgDir + options.input;
				let opts = {
					file: fs.createReadStream(pathImage),
					wait: true,
					resize: {
						width: +args.width,
						height: +args.height,
						strategy: options.exact ? "exact" : "crop"
					}
				};
				optimizer(options, opts, downloadImg);
				return;
			}
			})
			.end() 
		.end()
	.run(process.argv.slice(2)); 