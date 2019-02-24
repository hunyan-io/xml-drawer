const fs = require("fs");
const Canvas = require("canvas");
const { parseString } = require('xml2js');

const tiledGrounds = {"3":true,"5":true,"6":["5","6"],"7":true,"9":true,"10":["10","10p"],"11":["5","11"],"15":true}

const hexToRgba = function(hex,alpha) {
	let r = parseInt(hex.slice(0,2), 16),
		g = parseInt(hex.slice(2,4), 16),
		b = parseInt(hex.slice(4,6), 16);
	return 'rgba('+r+','+g+','+b+','+alpha+')';
}

const promiseHandling = function() {
	this.promises = [];
	this.pending = [];
	this.add = (promise, cb) => {
		let len = this.promises.length;
		this.promises[len] = promise;
		this.pending[len] = true;
		if (promise instanceof Promise) {
			this.promises[len] = promise.then((value) => {
				if (this.pending[len-1]) {
					return this.promises[len-1].then(() => {
						this.pending[len] = false;
						return cb(value);
					});
				} else {
					return cb(value);
				} 
			});
		} else {
			this.pending[len] = false;
		}
	}
	this.onFinish = (callback) => {
		return Promise.all(this.promises).then(callback);
	}
}

const drawRect = function(ctx, x, y, width, height, angle, style) {
	ctx.translate(x,y);
	ctx.rotate(angle);
	if (style instanceof Canvas.Image) {
		ctx.drawImage(style, -width/2, -height/2, width, height)
	} else {
		ctx.fillStyle = style;
		ctx.fillRect(-width/2, -height/2, width, height);
	}
	ctx.rotate(-angle);
	ctx.translate(-x,-y);
}

const drawCircle = function(ctx, x, y, r, style, startAngle=0, endAngle=Math.PI*2) {
	ctx.fillStyle = style;
	ctx.beginPath();
	ctx.arc(x,y,r,startAngle,endAngle);
	ctx.fill();
}

const drawGround = function(bg, fg, ground) {
	if (ground.m) return;

	let a = (ground.p || "").split(",")[4] || 0;
	let {x=0,y=0,l=10,h=10,o=0,t=0} = ground;

	const map = (ground.n || t == 9) ? fg : bg;

	a *= Math.PI/180

	if (t == 12) {
		drawRect(map,x,y,l,h,a,"#"+o);
	} else if (t == 13) {
		drawCircle(map,x,y,l,"#"+o);
	} else if (tiledGrounds[t]) {
		if (typeof tiledGrounds[t] == "object") {
			return [Canvas.loadImage("grounds/"+tiledGrounds[t][0]+".png"), (image) => {
				drawRect(map,x,y,l,h,a,map.createPattern(image,"repeat"));
				return Canvas.loadImage("grounds/"+tiledGrounds[t][1]+".png").then((top) => {
					drawRect(map,x,y,l,top.height-1,a,map.createPattern(top,"repeat"));
				});
			}];
		} else {
			return [Canvas.loadImage("grounds/"+t+".png"), (image) => {
				drawRect(map,x,y,l,h,a,map.createPattern(image,"repeat"));
			}];
		}
	} else if (t != 14) {
		return [Canvas.loadImage("grounds/"+t+".png"), (image) => {
			drawRect(map,x,y,l,h,a,image);
		}];
	}
	return [];
}

const drawJoint = function(bg, fg, joint) {
	let c = joint.c.split(","),
		p1 = joint.p1.split(","),
		p2 = joint.p2.split(",");

	const map = (c[3] == "1") ? fg : bg;

	map.lineWidth = c[1];
	map.lineCap = "round";
	map.strokeStyle = hexToRgba(c[0],c[2]);
	map.beginPath();
	map.moveTo(p1[0],p1[1]);
	map.lineTo(p2[0],p2[1]);
	map.stroke();
}

const drawJointsList = function(bg, fg, joints) {
	if (joints) {
		for (let i = 0; i < joints.length; i++) {
			if (joints[i]) {
				drawJoint(bg, fg, joints[i]['$']);
			}
		}
	}	
}

const drawXml = function(xml) {
	if (!xml.c || !xml.c.p || !xml.c.z || !xml.c.z[0]) throw error("Invalid tfm map xml format.");
	
	const order = new promiseHandling();

	const propreties = typeof xml.c.p[0] == 'object' && xml.c.p[0]['$'] || {};

	const {l:width=800,h:height=400} = propreties;

    const bgcanvas = Canvas.createCanvas(width, height);
    const fgcanvas = Canvas.createCanvas(width, height);
	const bg = bgcanvas.getContext("2d");
	const fg = fgcanvas.getContext("2d");

	const grounds = xml.c.z[0].s[0].s;
 	const joints = (xml.c.z[0].l || [''])[0].jd;

	if (!propreties.f) {
		bg.fillStyle = "#6A7495";
		bg.fillRect(0,0,width,height);
		drawJointsList(bg, fg, joints);
	} else {
		order.add(Canvas.loadImage("backgrounds/BG"+propreties.f+".png"), (image) => {
			bg.drawImage(image,0,0,width,height);
			drawJointsList(bg, fg, joints);
		});
	}


 	if (grounds) {
		for (let i = 0; i < grounds.length; i++) {
			if (grounds[i]) {
				order.add(...drawGround(bg, fg, grounds[i]['$']));
			}
		}
	}

	bg.drawImage(fgcanvas,0,0);

	return order.onFinish(() => {
		return bgcanvas.createPNGStream()
	});
};

module.exports = function(xmlString,callback) {
	parseString(xmlString.toLowerCase(),(err,xml) => {
		if (err) throw err;
		drawXml(xml).then(callback);
	});
}