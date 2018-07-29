/*!
 * ==========================================================
 *  COLOR PICKER PLUGIN 1.3.10
 * ==========================================================
 * Author: Taufik Nurrohman <https://github.com/tovic>
 * License: MIT
 * ----------------------------------------------------------
 */
!function(t,n,e){function r(t){return void 0!==t}function i(t){return"string"==typeof t}function o(t){return"object"==typeof t}function c(t){return Object.keys(t).length}function u(t,n,e){return n>t?n:t>e?e:t}function s(t,n){return parseInt(t,n||10)}function a(t){return Math.round(t)}function f(t){var n,e,r,i,o,c,u,s,f=+t[0],l=+t[1],h=+t[2];switch(i=Math.floor(6*f),o=6*f-i,c=h*(1-l),u=h*(1-o*l),s=h*(1-(1-o)*l),i=i||0,u=u||0,s=s||0,i%6){case 0:n=h,e=s,r=c;break;case 1:n=u,e=h,r=c;break;case 2:n=c,e=h,r=s;break;case 3:n=c,e=u,r=h;break;case 4:n=s,e=c,r=h;break;case 5:n=h,e=c,r=u}return[a(255*n),a(255*e),a(255*r)]}function l(t){return p(f(t))}function h(t){var n,e=+t[0],r=+t[1],i=+t[2],o=Math.max(e,r,i),c=Math.min(e,r,i),u=o-c,s=0===o?0:u/o,a=o/255;switch(o){case c:n=0;break;case e:n=r-i+u*(i>r?6:0),n/=6*u;break;case r:n=i-e+2*u,n/=6*u;break;case i:n=e-r+4*u,n/=6*u}return[n,s,a]}function p(t){var n=+t[2]|+t[1]<<8|+t[0]<<16;return n="000000"+n.toString(16),n.slice(-6)}function v(t){return h(d(t))}function d(t){return 3===t.length&&(t=t.replace(/./g,"$&$&")),[s(t[0]+t[1],16),s(t[2]+t[3],16),s(t[4]+t[5],16)]}function g(t){return[+t[0]/360,+t[1]/100,+t[2]/100]}function y(t){return[a(360*+t[0]),a(100*+t[1]),a(100*+t[2])]}function x(t){return[+t[0]/255,+t[1]/255,+t[2]/255]}function H(t){if(o(t))return t;var n=/\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)\s*$/i.exec(t),e=/\s*hsv\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)\s*$/i.exec(t),r="#"===t[0]&&t.match(/^#([\da-f]{3}|[\da-f]{6})$/i);return r?v(t.slice(1)):e?g([+e[1],+e[2],+e[3]]):n?h([+n[1],+n[2],+n[3]]):[0,1,1]}var b="__instance__",m="firstChild",k=setTimeout;!function(t){t.version="1.3.10",t[b]={},t.each=function(n,e){return k(function(){var e,r=t[b];for(e in r)n(r[e],e,r)},0===e?0:e||1),t},t.parse=H,t._HSV2RGB=f,t._HSV2HEX=l,t._RGB2HSV=h,t._HEX2HSV=v,t._HEX2RGB=function(t){return x(d(t))},t.HSV2RGB=function(t){return f(g(t))},t.HSV2HEX=function(t){return l(g(t))},t.RGB2HSV=function(t){return y(h(t))},t.RGB2HEX=p,t.HEX2HSV=function(t){return y(v(t))},t.HEX2RGB=d}(t[e]=function(s,a,h){function p(t,n,e){t=t.split(/\s+/);for(var r=0,i=t.length;i>r;++r)n.addEventListener(t[r],e,!1)}function v(t,n,e){t=t.split(/\s+/);for(var r=0,i=t.length;i>r;++r)n.removeEventListener(t[r],e)}function d(t,n){var e="touches",r="clientX",i="clientY",o=n[e]?n[e][0][r]:n[r],c=n[e]?n[e][0][i]:n[i],u=g(t);return{x:o-u.l,y:c-u.t}}function g(n){var e,r,i;return n===t?(e=t.pageXOffset||M.scrollLeft,r=t.pageYOffset||M.scrollTop):(i=n.getBoundingClientRect(),e=i.left,r=i.top),{l:e,t:r}}function y(t,n){for(;(t=t.parentElement)&&t!==n;);return t}function x(t){t&&t.preventDefault()}function H(n){return n===t?{w:t.innerWidth,h:t.innerHeight}:{w:n.offsetWidth,h:n.offsetHeight}}function w(t){return j||(r(t)?t:!1)}function E(t){j=t}function S(t,n,e){return r(t)?r(n)?(r(O[t])||(O[t]={}),r(e)||(e=c(O[t])),O[t][e]=n,$):O[t]:O}function X(t,n){return r(t)?r(n)?(delete O[t][n],$):(O[t]={},$):(O={},$)}function _(t,n,e){if(!r(O[t]))return $;if(r(e))r(O[t][e])&&O[t][e].apply($,n);else for(var i in O[t])O[t][i].apply($,n);return $}function B(t,n){t&&"h"!==t||_("change:h",n),t&&"sv"!==t||_("change:sv",n),_("change",n)}function R(){return T.parentNode}function V(e,r){function i(t){var n=t.target,e=n===s||y(n,s)===s;e?V():$.exit(),_(e?"enter":"exit",[$])}function o(t){var n=(f(I),f([I[0],1,1]));q.style.backgroundColor="rgb("+n.join(",")+")",E(I),x(t)}function c(t){var n=u(d(P,t).y,0,L);I[0]=(L-n)/L,F.style.top=n-D/2+"px",o(t)}function g(t){var n=d(q,t),e=u(n.x,0,j),r=u(n.y,0,O);I[1]=1-(j-e)/j,I[2]=(O-r)/O,J.style.right=j-e-tn/2+"px",J.style.top=r-nn/2+"px",o(t)}function b(t){U&&(c(t),on=l(I),K||(_("drag:h",[on,$]),_("drag",[on,$]),B("h",[on,$]))),Z&&(g(t),on=l(I),Q||(_("drag:sv",[on,$]),_("drag",[on,$]),B("sv",[on,$]))),K=0,Q=0}function m(t){var n=t.target,e=U?"h":"sv",r=[l(I),$],i=n===s||y(n,s)===s,o=n===T||y(n,T)===T;i||o?o&&(_("stop:"+e,r),_("stop",r),B(e,r)):R()&&a!==!1&&($.exit(),_("exit",[$]),B(0,r)),U=0,Z=0}function k(t){K=1,U=1,b(t),x(t),_("start:h",[on,$]),_("start",[on,$]),B("h",[on,$])}function S(t){Q=1,Z=1,b(t),x(t),_("start:sv",[on,$]),_("start",[on,$]),B("sv",[on,$])}e||((h||r||C).appendChild(T),$.visible=!0),en=H(T).w,rn=H(T).h;var X=H(q),M=H(J),L=H(P).h,j=X.w,O=X.h,D=H(F).h,tn=M.w,nn=M.h;e?(T.style.left=T.style.top="-9999px",a!==!1&&p(a,s,i),$.create=function(){return V(1),_("create",[$]),$},$.destroy=function(){return a!==!1&&v(a,s,i),$.exit(),E(!1),_("destroy",[$]),$}):G(),A=function(){I=w(I),o(),F.style.top=L-D/2-L*+I[0]+"px",J.style.right=j-tn/2-j*+I[1]+"px",J.style.top=O-nn/2-O*+I[2]+"px"},$.exit=function(){return R()&&(R().removeChild(T),$.visible=!1),v(N,P,k),v(N,q,S),v(W,n,b),v(Y,n,m),v(z,t,G),$},A(),e||(p(N,P,k),p(N,q,S),p(W,n,b),p(Y,n,m),p(z,t,G))}function G(){return $.fit()}var C=n.body,M=n.documentElement,$=this,L=t[e],j=!1,O={},T=n.createElement("div"),N="touchstart mousedown",W="touchmove mousemove",Y="touchend mouseup",z="orientationchange resize";if(!($ instanceof L))return new L(s,a);L[b][s.id||s.name||c(L[b])]=$,r(a)&&a!==!0||(a=N),E(L.parse(s.getAttribute("data-color")||s.value||[0,1,1])),T.className="color-picker",T.innerHTML='<div class="color-picker-container"><span class="color-picker-h"><i></i></span><span class="color-picker-sv"><i></i></span></div>';var A,D=T[m].children,I=w([0,1,1]),P=D[0],q=D[1],F=P[m],J=q[m],K=0,Q=0,U=0,Z=0,tn=0,nn=0,en=0,rn=0,on=l(I);return V(1),k(function(){var t=[l(I),$];_("create",t),B(0,t)},0),$.fit=function(n){var e=H(t),i=H(M),c=e.w-i.w,a=e.h-M.clientHeight,f=g(t),l=g(s);if(tn=l.l+f.l,nn=l.t+f.t+H(s).h,o(n))r(n[0])&&(tn=n[0]),r(n[1])&&(nn=n[1]);else{var h=f.l,p=f.t,v=f.l+e.w-en-c,d=f.t+e.h-rn-a;tn=u(tn,h,v)>>0,nn=u(nn,p,d)>>0}return T.style.left=tn+"px",T.style.top=nn+"px",_("fit",[$]),$},$.set=function(t){return r(t)?(i(t)&&(t=L.parse(t)),E(t),A(),$):w()},$.get=function(t){return w(t)},$.target=s,$.picker=T,$.visible=!1,$.on=S,$.off=X,$.fire=_,$.hooks=O,$.enter=function(t){return V(0,t)},$})}(window,document,"CP");