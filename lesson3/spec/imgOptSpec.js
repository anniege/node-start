'use strict';
const rewire = require("rewire");
const fs = require("fs");
const https = require('https');
const imgOpt = rewire('../cli/imgOpt-cli.js');

let optimizer = imgOpt.__get__('optimizer');

let options = {
	input: '.\\cat.jpg'
};

let opts = {
				file: fs.createReadStream(options.input),
				wait: true,
				resize: {
					width: 600,
					height: 300,
					strategy: "exact"
				}
			};

let dest_Url;

describe("Optimize uploading of image", () => {

	it("should return url", (done) => {
		optimizer(options, opts, (imgCurrPath, imgOptUrl) => {
			dest_Url = imgOptUrl;
			expect(imgOptUrl).not.toBeNull();
			done();
		});
	});

    it("should return status code 200", (done) => {
      https.get(dest_Url, (res) => {
      	expect(res.statusCode).toBe(200);
        done();
      });
    });
});


