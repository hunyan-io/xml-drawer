const http = require('http');
const { parse } = require('querystring');
const xmlDrawer = require('./xml-drawer');

const appForm = 'application/x-www-form-urlencoded';

const throwError = function(res, errString) {
	res.writeHead(400, {'Content-Type': 'text/html'});
	res.end(errString);
}

const drawXml = function(data, res) {
	if (data.xml) {
		try {
			xmlDrawer(data.xml, (stream) => {
				res.writeHead(200, {'Content-Type': 'image/png'});
				stream.pipe(res);
				res.end();
			});
		} catch (err) {
			throwError(res, "Invalid xml.")
		}
	} else {
		throwError(res, "No xml recieved.")
	}
}

const onPostData = function(req, res, callback) {
	let body = '';
	req.on('data', chunk => {
		body += chunk.toString();
	});
	req.on('end', () => {
		callback(parse(body), res);
	});
}

http.createServer(function (req, res) {
	if (req.method == "POST") {
		if (req.headers['content-type'] == appForm) {
			onPostData(req, res, drawXml);
		}
	} else if (req.method == "GET") {
		drawXml(parse(req.path), res);
	}
}).listen(80);