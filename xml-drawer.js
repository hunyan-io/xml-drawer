const fs = require("fs");
const { parseString } = require('xml2js');
const resource = require('./resource');

//TODO LIST <Z INDEX ATTRIBUTE><(TAG/SUBTAG): P/DS P/mc D/DC D/DC2 D/DS>

const tiledGrounds = {"3":true,"5":true,"6":["5","6"],"7":true,"9":true,"10":["10","10p"],"11":["5","11"],"15":true}
const decorOrigins = [[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[1.35,1],[2,1],[2,1],[2,2],[2,1],[2,1],[2,1],[2,1],[2,1.162],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,2],[2,1],[2,1],[2.3,1.03],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[Infinity,Infinity],[2,2],[2,2],[2,1],[2,Infinity],[2,2],[2,1],[2,6.166],[2,1.028],[2,2],[2,1],[2,2],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1.028],[2,1],[2,2],[1.333,Infinity],[2,1],[24.9,5.833],[2,1],[Infinity,Infinity],[2,Infinity],[2,Infinity],[119,4],[2,1],[2,1],[Infinity,Infinity],[2,2],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[4,Infinity],[2,1],[2,1.1],[2,Infinity],[2,1],[3.8,1],[2,1],[2,2],[2,2],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,2],[2,2],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,1],[2,Infinity],[2,1],[2,1],[2,1],[2,1],[Infinity,Infinity],[2,2],[2,Infinity],[Infinity,1],[1,1],[2,2],[2,1],[2,2],[2,1],[2,1],[Infinity,Infinity],[2,1],[2,1],[2,1],[2,2],[2,1],[2,Infinity],[2,1],[2,1],[4,1],[2,1],[2,1],[2,1],[2,1],[2,2],[2,1.26],[1.77,1.2]];
const noStrokeGrounds = {"1":true,"8":true,"9":true,"15":true}

const promiseHandler = function() {
	this.promises = [];
	this.pending = [];
	this.add = (arr) => {
		if (!Array.isArray(arr)) return;
		let [promise, cb, ...args] = arr;
		const len = this.pending.length;
		const psLen = this.promises.length;
		this.pending[len] = true;
		const checkPending = value => {
			if (this.pending[len-1]) {
				return this.promises[psLen-1].then(() => {
					this.pending[len] = false;
					return cb(value, ...args);
				});
			} else {
				return cb(value, ...args);
			}
		}
		if (promise instanceof Promise) {
			this.promises[psLen] = promise.then(checkPending);
		} else {
			checkPending(promise);
		}
	}
	this.onFinish = callback => {
		return Promise.all(this.promises).then(callback);
	}
}

const drawRect = function(ctx, x, y, width, height, angle, style, stroke, x_repeat) {
	ctx.translate(x,y);
	ctx.rotate(angle);
	height = parseInt(height)+0.5;
	if (typeof style != "object" || resource.isPattern(style)) {
		ctx.fillStyle = style;
		ctx.fillRect(-width/2, -height/2, width, height);
	} else {
		if (x_repeat) {
			let	w = style.width,
				h = style.height;
			const len = Math.ceil(width/w);
			for (let i = 0; i < len; i++) {
				let wid = i==(len-1) ? width-w*i : w;
				ctx.drawImage(style, 0, 0, wid, h, w*i-width/2, -height/2, wid, h);
			}
		} else {
			ctx.drawImage(style, -width/2, -height/2, width, height);
		}
	}
	if (stroke) {
		ctx.strokeStyle = "#000000aa";
		ctx.lineWidth = 0.3;
		ctx.strokeRect(-width/2, -height/2, width, height);
	}
	ctx.rotate(-angle);
	ctx.translate(-x,-y);
}

const drawCircle = function(ctx, x, y, r, style) {
	ctx.fillStyle = style;
	ctx.beginPath();
	ctx.arc(x,y,r,0,Math.PI*2);
	ctx.fill();
}

const drawGround = function(map, ground, foreground) {
	if (ground.m==='') return;

	let p = (ground.p || "").split(","),
		a = p[4] || 0;
	let {x=0,y=0,l=10,h=10,o,t="0"} = ground;

	if ((ground.n!==undefined || t == 9) != foreground) return;

	a *= Math.PI/180;

	const stroke = (p[0]==='0') && !noStrokeGrounds[t];

	if (t == 12) {
		if (!o) return;
		if (o.length>6) {
			if (o.slice(-8)==='ffffffff')
				return;
			o = o.slice(-6);
		}
		o = '#'+'0'.repeat(6-o.length)+o
		return [map, drawRect, x, y, l, h, a, o];
	} else if (t == 13) {
		return [map, drawCircle, parseInt(x), parseInt(y), parseInt(l), "#"+o];
	} else if (tiledGrounds[t]) {
		if (typeof tiledGrounds[t] == "object") {
			return [resource.loadImage(__dirname+"/grounds/"+tiledGrounds[t][0]), (image) => {
				drawRect(map,x,y,l,h,a,map.createPattern(image,"repeat"),stroke);
				return resource.loadImage(__dirname+"/grounds/"+tiledGrounds[t][1]).then((top) => {
					drawRect(map,x,y,l,h,a,top,stroke,true);
				});
			}];
		} else {
			return [resource.loadImage(__dirname+"/grounds/"+t), (image) => {
				drawRect(map,x,y,l,h,a,map.createPattern(image,"repeat"),stroke);
			}];
		}
	} else if (t != 14) {
		return [resource.load("/grounds/"+t, [l,h]), (gcanvas) => {
			drawRect(map,x,y,gcanvas.width,gcanvas.height,a,gcanvas,stroke);
		}];
	}
	return;
}

const drawJoint = function(map, joint, foreground) {
	if (!joint.c || !joint.p1 || !joint.p2) return;

	const c = joint.c.split(","),
		  p1 = joint.p1.split(","),
		  p2 = joint.p2.split(","),
		  p3 = joint.p3 && joint.p3.split(","),
		  p4 = joint.p4 && joint.p4.split(",");

	if ((c[3]==1) != foreground) return;

	const alpha = Math.floor((c[2] || 1)*255).toString(16);

	map.lineWidth = c[1];
	map.lineCap = "round";
	map.strokeStyle = '#'+'0'.repeat(c[0].length-6)+c[0]+(alpha.length<2 ? '0'+alpha : alpha);
	console.log('#'+'0'.repeat(c[0].length-6)+c[0]+(alpha.length<2 ? '0'+alpha : alpha));
	map.beginPath();
	map.moveTo(p1[0],p1[1]);
	if (p3) map.lineTo(p3[0],p3[1]);
	if (p4) map.lineTo(p4[0],p4[1]);
	map.lineTo(p2[0],p2[1]);
	map.stroke();
}

const drawDecoration = function(map, obj, foreground) {
	const decoration = obj.$;
	if (!decoration) return;
	
	if (obj['#name'] == 'f')
		decoration.t = 132;
	else if (obj['#name'] == 't')
		decoration.t = 133;
	else if (obj['#name'] !== 'p')
		return;

	const p = (decoration.p || (decoration.d!==undefined ? '1,0' : '0,0')).split(',');

	if (decoration.t==34 || decoration.t==117) {
		if (foreground !== null)
			return;
	} else if ((p[0]==='1') != foreground)
		return;

	const reverse = (p[1]==='1');

	return [resource.load('/decorations/'+decoration.t,[ resource.shadeColor , decoration.c ? decoration.c.split(",").map(resource.hexToRgb) : [] ]), (deco)=>{
		const x = decoration.x - deco.width*(reverse?-1:1)/decorOrigins[decoration.t][0],
			  y = decoration.y - deco.height/decorOrigins[decoration.t][1];

		if (reverse) {
			map.save();
			map.translate(x, y);
			map.scale(-1,1)
			map.drawImage(deco,0,0);
			map.restore();
		} else {
			map.drawImage(deco,x,y);
		}
	}];
}

const drawShamanObject = function(map, obj) {
	const object = obj.$;
	if (!object) return;

	const p = (object.p || '0,0').split(',')
	const angle = p[0]*Math.PI/180;
	const ghost = p[1]==='1';

	return [resource.load('/shaman/'+object.c, resource.shadeColor), (img)=>{
		if (ghost)
			map.globalAlpha = 0.5;
		drawRect(map,object.x,object.y,img.width,img.height,angle,img);
		if (ghost)
			map.globalAlpha = 1;
	}];
}

const drawImages = function(map, dAttr, order) {
	if (!dAttr) return;

	const images = dAttr.split(';');

	for (i = 0; i < images.length; i++) {
		let [url='', x=0, y=0] = images[i].split(',');
		order.add([resource.loadImage('https://www.transformice.com/images/'+url), (image)=>{
			map.drawImage(image,x,y,image.width,image.height);
		}]);
	}
}

const drawXml = function(xml) {
	if (!xml.c || !xml.c.p || !xml.c.z || !xml.c.z[0]) throw error("Invalid tfm map xml format.");
	
	const order = new promiseHandler();

	const propreties = typeof xml.c.p[0] == 'object' && xml.c.p[0]['$'] || {};

	let {l:width=800,h:height=400} = propreties;
	width = parseInt(width), height = parseInt(height);

    const [canvas, map] = resource.createCanvas(width, height);

	map.fillStyle = "#6A7495";
	map.fillRect(0,0,width,height);
	
	const grounds = xml.c.z[0].s[0].s || [],
 		  joints = (xml.c.z[0].l || [''])[0].$$ || [],
 		  decorations = xml.c.z[0].d[0].$$ || [],
 		  shamanObjects = xml.c.z[0].o[0].o || [];

	//background images
	drawImages(map, propreties.dd, order);

	//background
	if (propreties.f)
		order.add([resource.load("/backgrounds/"+propreties.f, canvas), f=>f()]);

	//background decorations
	for (let i = decorations.length-1; i > -1; i--)
		order.add(drawDecoration(map, decorations[i], null));
	//decorations
	for (let i = 0; i < decorations.length; i++)
		order.add(drawDecoration(map, decorations[i], false));
	//joints
	for (let i = 0; i < joints.length; i++)
		if (joints[i].$)
			order.add([map, drawJoint, joints[i].$, false]);
	//grounds
	for (let i = 0; i < grounds.length; i++)
		order.add(drawGround(map, grounds[i].$, false));
	//shaman objects
	for (let i = 0; i < shamanObjects.length; i++)
		order.add(drawShamanObject(map, shamanObjects[i]));
	//foreground joints
	for (let i = 0; i < joints.length; i++)
		if (joints[i].$)
			order.add([map, drawJoint, joints[i].$, true]);
	//foreground decorations
	for (let i = 0; i < decorations.length; i++)
		order.add(drawDecoration(map, decorations[i], true));
	//foreground grounds
	for (let i = 0; i < grounds.length; i++)
		order.add(drawGround(map, grounds[i].$, true));
	//foreground images
	drawImages(map, propreties.d, order);

	return order.onFinish(() => {
		return canvas
	});
};

module.exports = function(xmlString,callback) {
	xmlString = xmlString.replace(/(<[pP][^>]+)D([^a-zA-Z])/, '$1dd$2').toLowerCase();
	return new Promise((resolve, reject) => {
		parseString(xmlString,{explicitChildren:true,preserveChildrenOrder:true},(err,xml) => {
			if (err) return reject(err);
			resolve(drawXml(xml));
		});
	});
}