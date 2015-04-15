﻿// ==UserScript==
// @name        Y-marker
// @namespace   trespassersW
// @description Sets up keyboard shortcuts for placing bookmarks and navigation inside webpage.
// @include        http://*
// @include        https://*
// @include        file://*
// ** about:config -> greasemonkey.fileIsGreaseable <- true
// @version 15.04.15
// @license  MIT
// @updated  2015.04.15
// @released 2013-12-11
// @run-at document-end
// @grant unsafeWindow
// ==/UserScript==
/* 15.04.15 localStorage + unsafeWindow + ff37 + GM3.1 problems
 * 13-12-12 click on msg removes all marks
 * 1.1 don't run in editable fields
*/

(function(){ "use strict";
if(top!=self || !document || !document.body ) return;
var W = unsafeWindow || window; // localStorage doesn't live in sandbox?
/* key kombinations to invoke the skript */
var kShift = 1,  kCtrl = 2, kAlt = 4, kWin = 8; 
var kJump = kAlt; 
var kMark = kAlt+kShift;

/* sec; 0 to disable; -1 status bar only */
var tipShowtime = 2.2;  

var kNobs = "-0123456789";
var kKeys = { 
 173: 0, 48: 1, 49: 2, 50: 3, 51: 4, 52: 5, 53: 6, 54: 7, 55: 8, 56: 9, 57: 10,
 189: 0, /* chrome, opera caps lock */
 109: 0  /* opera */
};
var minus1="-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1";

function kNob(k){ return kNobs.charAt(k); }

var U=undefined, D=window.document;
function _L(s) { 0 && console.log(s) };

var statMsg;
function msg(t,k, y){
 statMsg = "";
 if(U!==k)
  statMsg += "["+kNob(k)+"] ";
 if(U!==y)
  statMsg += ""+pt(y)+"% ";
 statMsg += t+ (noCoo ? "\u2262 ": "");
}

var locStor;
var noCoo;
// see SQlite manager -> %FFpath%\webappstore.sqlite -> find -> key -> contains Ym#

if(!locStor) try {
  locStor = W.localStorage;
  locStor.getItem("Ym#");
} catch(e){ locStor =null;  };

if(!locStor) try {
  noCoo="no cookies!!1";
  locStor = W.sessionStorage;
  locStor.getItem("Ym#");
} catch(e){ locStor =null };

if(!locStor && U===W.YmStorage){
  noCoo= "cookies are disabled!!!11";
  W.YmStorage= { 
  setItem: function(k,v) {this.s[k]=v},
  getItem: function(k) {return this.s[k]? this.s[k]: null},
  removeItem: function(k) {this.s[k]=null},
  s: {}
 };
 locStor=W.YmStorage;
}

function pt(y) {
 try{
  y =Math.round(y*1000/(document.body.scrollHeight+1))/10;
 }catch(e){console.log("math\n"+e); return -1}
 return y;
}

var Ym;
var pz;

function ldYm(){
  var s= locStor.getItem(Ym);
  if(!s) s=minus1;
  pz=s.split(",")
}

function svYm(){
 var s=pz.join(",");
 locStor.setItem(Ym,s)
}

function jumpY(k){
 var y=pz[k];
 if(y > -1) {
   if( y!= scrollY ){
    pz[0] = scrollY;
    scroll(0,y);
    msg("jump",k,y);
   }else
    msg("here",k,y); 
   return 1;
 }
 msg("none",k); 
 return 0;
}

function markY(k){
 pz[k]=scrollY;
 if(k>=1)
  svYm();
 msg("mark",k,pz[k]);
 return 1;
}

var kMap= {16: kShift, 17:kCtrl, 18: kAlt, 91: kWin};
var keyMod=0;
var kkWin= (kMark | kJump) & kWin;

function klear(e) { 
 var k= e.keyCode; 
 if(!k) return;
 var km=kMap[k];
 if(km) {
  keyMod &= -1 ^ km;
 }
}

function onKeydown(e) {
 try{
 var rc=0, k= e.keyCode; 
 if(!k) return;
 // Don't run in input, select, textarea etc.
 var E = D.activeElement.tagName.toLowerCase();
 if (E == "input" || E == "select" || E == "textarea" ||
    (E=D.activeElement.contentEditable) == "true" ||
     E == "") 
   {  keyMod = 0; return; }
 
 var km =kMap[k]; // ff doesnt track metaKey. stsuko
 if(km) {
   keyMod |= km;
   if( kkWin && km === kWin ) //???
    e.preventDefault(), e.stopPropagation();
   return;
 }
 km=keyMod; 
 if( U=== (k=kKeys[k]) ){ keyMod = 0; return; }
 if( km === kJump ) {
   rc = jumpY(k);
 }else if( km === kMark ) {
   rc = markY(k);
 }else {
  return;
 }
 statSay();
 if(rc) e.preventDefault(),e.stopPropagation();
 }catch(e){console.log('smth wromg\n'+e)};
}
 
function mk(p, t, id, s) {
  var e = D.createElement(t);
  e.id=id;
  e.style.cssText = s;
  return p.appendChild(e);
};

/* RIP status bar replacement */
var sb;
function _css(){ 
if(!sb) sb = mk(
//D.body, 
D.documentElement, // 2014-06-30 ???!!1 
'section', "Y-marker-userjs-inf",
"position: fixed!important;\
z-index: 214748!important;\
top: 0px; right: 1px; bottom: auto; left: auto;\
background: rgba(221,255,221,.75);\
padding: 2px 3px 2px 8px; margin:0;\
border: none;\
border-radius: 12px 3px 3px 12px; \
color: #131;\
opacity: 1; display:none;\
font: normal 12px/14px sans-serif !important;\
text-shadow: #373 2px 2px 4px, #7F7 -2px -2px 4px;\
cursor:no-drop;\
"
);
/* click removes all  */
if(tipShowtime>0){
 sb.addEventListener("click",function (e) {
  locStor.removeItem(Ym);
  ldYm(); noTout();
 },false);
};
}


var tO;
function onTout(){
 tO=0; sb.style.display="none";
}
function noTout(){ 
 if(tO) clearTimeout(tO), onTout();
}

function statSay(t) {
 if(statMsg){
 _css();
   if(tipShowtime) 
     W.status=statMsg;
   if(tipShowtime>0){
     noTout();
     sb.innerHTML= statMsg;
     sb.style.display="block";
     tO=setTimeout(onTout, (t? t: tipShowtime)*1000);
   }
 } 
 statMsg="";
}

Ym="Ym#"+location.pathname;
_L("load: "+location+"\n >> "+Ym);

ldYm();
for(var k=1; k<2; k++){ /* pz.length */
 if(pz[k]>-1){ 
  scroll(0,pz[k]); 
  msg('jump',k,pz[k]);
  statSay(5);
  break; 
 }
};

if(noCoo)  msg(noCoo),   statSay(5);

addEventListener("keydown",onKeydown,false);
addEventListener("keyup",klear,false);
 
})();
