module.exports=((t,e,l,o,n,r,a,i,d,f,p)=>{var s=t(490,280),c=s.getContext("2d");l(c);var h=new o(0,0,0,0,255,255,255,255),u=0;function v(t,e,l,o,n){var a=t.createLinearGradient(850,-576,8380,5606);a.addColorStop(0,r(e.apply(f(p[u],[128,128,128,1])))),a.addColorStop(.2823529411764706,r(e.apply(f(p[u],[112,109,109,1])))),a.addColorStop(.5843137254901961,r(e.apply(f(p[u],[128,128,128,1])))),a.addColorStop(1,r(e.apply(f(p[u],[116,116,116,1])))),t.fillStyle=a,d(t,"M 9599 5400 L 0 5400 0 0 9599 0 9599 5400",!1),t.fill("evenodd")}function y(t,e,l,o,r){switch(l%=1){case 0:n(v,s,t,[1,0,0,1,0,0],e,1,0,0,r)}}function S(t,e,l,o,n){var a="M 4799 -2700 L -4801 -2700 -4801 2700 4799 2700 4799 -2700 M 4900 -2800 L 4900 2800 -4900 2800 -4900 -2800 4900 -2800";t.fillStyle=r(e.apply([42,24,17,1])),d(t,a,!1),t.fill("evenodd");a="M 4900 -2800 L 4900 2800 -4900 2800 -4900 -2800 4900 -2800 Z";t.strokeStyle=r(e.apply([0,0,0,.8])),t.lineWidth=.3,t.lineCap="round",t.lineJoin="round",d(t,a,!0,"NORMAL")}var C=-1,L=0,w=[];w.push(0);var M="#ffffff00",g=490,m=280;function x(){c.fillStyle=M,c.fillRect(0,0,s.width,s.height),c.save(),c.transform(s.width/g,0,0,s.height/m,0,0),function(t,e,l,o,r){switch(t.save(),t.transform(1,0,0,1,245.15,140.15),l%=1){case 0:n(y,s,t,[.05,0,0,.05,-240,-135],e,1,(0+r)%1,0,r),n(S,s,t,[.05,0,0,.05,0,0],e,1,0,0,r)}t.restore()}(c,h,w[C],0,L),c.restore()}return function(t,e){var l=C;(C=(C+1)%w.length)==l?L++:L=0,x()}(),[s,490,280]});