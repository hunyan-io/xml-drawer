module.exports=((t,e,o,l,a,r,n,f,i,d,p)=>{var c=t(210,120),s=c.getContext("2d");o(s);var h=new l(0,0,0,0,255,255,255,255),v=0;function u(t,e,o,l,a){var n=t.createLinearGradient(850,-576,8380,5606);n.addColorStop(0,r(e.apply(d(p[v],[128,128,128,1])))),n.addColorStop(.2823529411764706,r(e.apply(d(p[v],[112,109,109,1])))),n.addColorStop(.5843137254901961,r(e.apply(d(p[v],[128,128,128,1])))),n.addColorStop(1,r(e.apply(d(p[v],[116,116,116,1])))),t.fillStyle=n,i(t,"M 9599 5400 L 0 5400 0 0 9599 0 9599 5400",!1),t.fill("evenodd")}function y(t,e,o,l,r){switch(o%=1){case 0:a(u,c,t,[1,0,0,1,0,0],e,1,0,0,r)}}function S(t,e,o,l,a){t.fillStyle=r(e.apply([42,24,17,1])),i(t,"M -2000 -1100 L -2000 1100 2000 1100 2000 -1100 -2000 -1100 M -2100 -1200 L 2100 -1200 2100 1200 -2100 1200 -2100 -1200",!1),t.fill("evenodd")}var w=-1,C=0,g=[];g.push(0);var L="#ffffff00",m=210,M=120;function x(){s.fillStyle=L,s.fillRect(0,0,c.width,c.height),s.save(),s.transform(c.width/m,0,0,c.height/M,0,0),function(t,e,o,l,r){switch(t.save(),t.transform(1,0,0,1,105,60),o%=1){case 0:a(y,c,t,[.021428680419921874,0,0,.021428680419921874,-102.85,-57.85],e,1,(0+r)%1,0,r),a(S,c,t,[.05,0,0,.05,0,0],e,1,0,0,r)}t.restore()}(s,h,g[w],0,C),s.restore()}return function(t,e){var o=w;(w=(w+1)%g.length)==o?C++:C=0,x()}(),[c,210,120]});