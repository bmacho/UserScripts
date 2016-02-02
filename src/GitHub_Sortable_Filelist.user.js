﻿// ==UserScript==
// @name        GitHub Sortable Filelist
// @namespace   trespassersW
// @description appends sorting function to github directories
// @include https://github.com/*
// @version 16.02.02
// 16.02.02 * GH changes -- embedded octicons font 
// 15.08.12 ++ octicons for file extensions
// 15.08.07  + case-insensitive sorting
// 15.05.07  sorting is now faster
//  .12 new age format; fix for chrome
//  .10 datetime auto-updating fix; right-aligned datetime column; proper local time; .ext sorting fix; 
//  .8 sorting by file extention
//  .7 date/time display mode switching
// @created 2014-11-10
// 
// @author  trespassersW
// @license MIT
// @icon https://i.imgur.com/8buFLcs.png
// (C) Icon: Aaron Nichols CC Attribution 3.0 Unported
// @run-at document-end
// @grant unsafeWindow
// ==/UserScript==

if(document.body && document.querySelector('#js-repo-pjax-container')){

var llii=0, _l= function(){/* * /
 for (var s=++llii +':', li=arguments.length, i = 0; i<li; i++) 
  s+=' ' + arguments[i];
 console.log(s)
/* */
}
//_l=console.log.bind(console);
var fakejs = // avoid compiler warning
(function(){ "use strict"; 

var ii=0,tt;
var d0=[0,0,1];
var C=[{c:1, d: 0, s: 0},{c:2, d: 0, s: 0},{c:3, d: 1, s: 0}];
var ASC;
var oa=[],ca=[],clock,ext,dtStyle,upc;
var D=document, TB;
var catcher,locStor;
var prefs={dtStyle:0, ext: 0, upc: 1};
var W= unsafeWindow || window;

// see: https://octicons.github.com/ 
var extIcon=[
//0...........1..............2..............3..............4.......
 "octoface"  ,"zap"        ,"list-unordered","paintcan"   ,"eye"
//5...........6..............7..............8..............9.......
,"globe"    ,"file-binary" ,"file-zip"      ,"file-pdf"   ,"megaphone"
//10..........11.............12.............13.............14......
,"gear"     ,"triangle-right","ruby"        ,"info"       ,"device-camera"    
//15..........16.............17.............18.............19......
,"pencil"   ,"terminal"      ,"book"    
]
var extList={ 
md:0,
js:1,jsm:1,
json:2,xml:2,xul:2,rdf:2,yml:2,
css:3,scss:3,less:3,
png:4,bmp:4,gif:4,cur:4,ico:4,svg:4,
htm:5,html:5,php:5,
bin:6,exe:6,dll:6,
zip:7,rar:7,arj:7,
pdf:8,
wav:9,mp3:9,ogg:9,mp4:9,aac:9,
cfg:10,ini:10,
c:11,cpp:11,cc:11,h:11,hpp:11,asm:11,m:11,
rb:12,py:12,
EmptyExt:13,
jpg:14,jpeg:14,
pl:15,java:15,jar:15,cs:15,
sh:16,mak:16,cmd:16,bat:16,
doc:17,rtf:17,djvu:17
}

function stickStyle(css){
 var s=document.createElement("style"); s.type="text/css";
 s.appendChild(document.createTextNode(css));
 return (document.head||document.documentElement).appendChild(s);
}
function insBefore(n,e){
  return e.parentNode.insertBefore(n,e);
}
function insAfter(n,e){
  if(e.nextElementSibling)
   return e.parentNode.insertBefore(n,e.nextElementSibling);
  return e.parentNode.appendChild(n);
}
function outerNode(target, node) {
 if (target.nodeName==node) return target;
  if (target.parentNode) 
  while (target = target.parentNode) try{
   if (target.nodeName==node)
    return target;
  }catch(e){};
 return null;
}
function savePrefs(){
 if(locStor) locStor.setItem('GHSFL',JSON.stringify(prefs));
}

function css(){
stickStyle('\
.fsort-butt,\n\
.tables.file td.content, .tables.file td.message, .tables.file td.age\n\
 {position: relative; }\n\
 \n\
.fsort-butt:before{\n\
 position: absolute; display: inline-block;\n\
 cursor: pointer;\n\
 text-align:center; vertical-align: top;\n\
 width: 18px;   height: 14px;\n\
 line-height: 14px;\n\
 padding:0; margin:0;\n\
 border-color: transparent;\n\
 border-width: 0;\n\
 content: "";\n\
 opacity: .2;\n\
 z-index: 99;\
}\n\
.fsort-butt.fsort-asc:before,.fsort-butt.fsort-desc:before{\n\
 left:1.5em; top: -1em;\n\
}\n\
td.age .fsort-butt.fsort-asc:before, td.age .fsort-butt.fsort-desc:before{\n\
 left: 4.5em; \n\
}\n\
.fsort-asc:before,.fsort-desc:before{\n\
 background-color: #48C;\n\
}\n\
.fsort-asc:before{\n\
 border-radius: 24px 24px 8px 8px;\n\
}\n\
.fsort-desc:before{\n\
 border-radius: 8px 8px 24px 24px;\n\
}\n\
.fsort-asc:before,\n\
.fsort-desc.fsort-sel:hover:before\n\
{\n\
content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAMCAYAAABbayygAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAqklEQVR42mNgQAIfPnzg//fv3z4g3vjs2TNOBmzg27dv0kAFl/5DAZB95OPHj4Ioin79+qUFlHj0Hw0Axa5+//5dFqzo58+fGkCB9/9xAKDcw69fv0ow/P37twAqAAJLkRQsgLGBapIZQO4ACk798+eP9+/fv21gkkArZYAKYoFy09++fcuL4lZ0hQy4wMAqtIQpBEaAFE6FL1684AL6chcQb1m1ahUTshwAw2kAJAeNI30AAAAASUVORK5CYII=);\n\
}\n\
.fsort-desc:before,\n\
.fsort-asc.fsort-sel:hover:before{content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAMCAYAAABbayygAAAACXBIWXMAAAsTAAALEwEAmpwYAAAApUlEQVR42mNgQAKrVq1i+vfv3xYg3vXixQsuBlzg27dvUv+h4Pfv35Y4FX7//l0GSaHNYFH49u1bXqAvp//9+zcWXeGfP3+8gXJTP378KMgAVJAMkwQKLkBiLwXifyA2UE0Bw9evXyWA/If/cQCg3PufP39qwNwmCxS4ikXRo1+/fmmhuBXkDqDEESRFl4ARII3V18+ePeMEKtgIxPs+fPjAjywHANCcACRZ1c8XAAAAAElFTkSuQmCC);\n\
}\n\
\n\
.fsort-butt.fsort-sel:before\n\
{\n\
  background-color: #4183C4 !important;\n\
  opacity:.6 !important;\n\
}\n\
\n\
span.fsort-butt:hover:before\n\
,span.fsort-butt:hover span:before\n\
{ opacity: 1 !important;}\n\
\n\
#fsort-clock:before{\n\
 left:6.5em; top: -15px; \n\
 text-align:center; vertical-align: top; top:-15px;\n\
 width: 16px; height: 16px;\
 border-radius: 16px;\n\
  content: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAlZJREFUeNqkU0tLG1EUvjORFJPMw6mhTUgxy75EUxiJj6CGLKQV0o2IQd3pxp2bbPs/3MVCIHSRgC3uXBhCSErjtLRkK7TcNCYhk4eGPHvO6AwjXXrgu/fOOff77plzz2VGoxF5iI3hEA6HCcuyxGKxEIZhOMBLcHsAwt0+FfAbDvsFaA4GAzIcDkkqlboVMNlzB8+vzgUCq3N+v+xyOl3opFdXNJfN5nPn52dNVT0DV/FeBjpZcjrfR/b3Dzwul0e02ciPiwsyPTtLptxur7C25n0xMzMfPzoSypQmdREWB0iLt3NcKLK3dzAhSR5+fFxT/JbPG+row9g2HABZhpBjCMA/vZYDgRVOFD02q5WwDKOROp2OIYA+jDlgz8Ly8gpyDIF+v++d9vlkXDdubshlpaKhWCwaawTGsHg+WZaRY9QAPiYEUXyinzY1OanNzWbTWGv7gPynViO4FzlmARavcWgivw2FSDAYJDubm4TjOA0Oh4O8WVwk80tLGscsoLZUtWwThGf6afFEgmxvbZGP8biRAbac2u2S60ajjByjBr1e7/JrJqOMQSNhmmiCJGlknHVAAckjuI1cOq0gx3wLyudkMt1ttejgTkAXMRsWkO106KdEIo0cQwAC9b+l0umHaPRYrVaphWX/63n0XasqjR4eHlNKT5FzrxPBoXxXFEtkY6Ozs7u78G59/dVTt/sxdkSJ0uqXk5OfsVgsU6lUUjzPKzqPwdfo8/lIF4pTr9dJu92WID0/tjZAv8MKti48tqzdbq+JUAsrNFWhULgVeIj9E2AAamUckFr2UCoAAAAASUVORK5CYII=\n\
);}\n\
.fsort-on:before{ background-color: #4183C4 !important; } \n\
#fsort-ext:before{\n\
 left:4em; top:-14px;\n\
 width:28px; height: 14px;\n\
 border-radius: 6px;\n\
content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAANCAYAAAC3mX7tAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAABWUlEQVQ4y+2SP0sDQRDFT7BQTGtnITYSK8Emha1NCrXwC4gWYiUKiiB4jYKdWAmC4AewtxEExSqVjZ1/OEgwrEQwkLvbmd/aTCBI0IBYCD7YYmaYfW/mTRT9VWRZNq6qm79OBBwBrueGPM8ngWvgHbgXkQX7aC+EEFR1x+IDi7dUdQOQYACuviSp1+tDQA2oquoycAlInucT1Wp1EHgA3r3300AG3FUqlX4RKQOvQFNVV0Rk9ksiEZkzRbtJkgx476faqq1etnoK4L0vdazuqefVqepq6ALgKIqiKI7jPuDRcpVPHn1P5JwrxHHc1zHRofe+1H5pmo6akCWrv4QQgojMdxA9AI3vzPfAsXOuACRAXVW3VXUNOM2yrNhsNofNh1qapmPAG5A45wpGdGMiToD9bvdftKZ9I54ALoCGXd5tq9UaAc7Mr0Wbbr09vfk3Azybf+fRP36KDxJ2sN2uMATcAAAAAElFTkSuQmCC);\n\
}\n\
#fsort-ext:before{ background-color: #BBB}\n\
/* 150806 uppercase */\n\
#fsort-upc:before{\n\
 left:7em; top:-14px;\n\
 width:16px; height: 16px;\n\
 border-radius: 0 4px 0 4px;\n\
content:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QAAAAAAAD5Q7t/AAAACXBIWXMAAAsTAAALEwEAmpwYAAABcElEQVQ4y5WSsWoVQRSG/7kbyL1VCosgeQBBbFIYtBCsLYOx1QewiZgqr5HOF5ALRlALbcUigsK1TOUWooUaEbOL2d3z/TaTsOBduPeHYQ4zZ77555yRJEXEDnAE/AZ+As/qur6sBbSS50uS1iQ9lbSZUtoej8eWdHcRiKbT6eg8bprmqm0D37Souq7bBt4BP4AuA04XOtw0zTUggLOIeBgR95YBjIqi2EwpjSTNiqI4sP1dy6ht21v5xjPgCfAZaPoOImLfWRGx/x8EOAD+AF8j4gFw2AcAx8DfPI6XdXgzO3wNvLHttm1vXNRAkmzfGQIURXE/57ywfdhfu5Dt57av59i2b0tSWZarwC+Auq43qqpazx07KctytQ+4Yvuj7c52advnXzzbP+rV420u5s5cy30HwCsPCHgpSWno7VVVrU8mky8ppRXb73tbKaW0Zbur63pjsPoR8Sjf9GFO22f5GbuDAOBTTno8B76X4bN/RgN/lIzFNCAAAAAASUVORK5CYII=);\n\
}\n\
#fsort-upc:before{ background-color: #BBB}\n\
\n\
table.files td.age .css-truncate.css-truncate-target{\n\
 width: 99% !important; \n\
 max-width: none !important;\n\
}\n\
/*table.files td.age span.css-truncate time{\n\
 position: relative !important;\n\
}*/\n\
.fsort-time {\n\
 visibility: hidden;\n\
 display: none;\n\
 padding-right: 0px;\n\
}\n\
.fsort-time i {\n\
 display:inline-block;\
 color: #BBB;\
 font-style: normal !important;\n\
 transform:  scale(0.9);\n\
 margin-left: 0px;\n\
/* font-size: 12px;*/\n\
}\n\
\n\
/* patches (--min-width:12em!important;) */\n\
table.files td.age {text-align: right !important; padding-right: 4px !important;\n\
width:12em!important;\n\
\n\
max-width:none!important;\n\
overflow:visible!important;\n\
}\n\
table.files td.message {overflow: visible !important;}\n\
/*.file-wrap .include-fragment-error { display: table-row !important;}*/\n\
/* 150315 wide filelist *150426 better not touch this* /\n\
div.wrapper div.container{\n\
min-width: 980px!important;\n\
width:90%!important;}\n\
div.wrapper div#js-repo-pjax-container{\n\
min-width: 790px!important;\n\
width: calc(100% - 200px)!important;\n\
}/* */\n\
\
');

dtStyle=stickStyle('\
td.age  span.css-truncate time{\
 visibility: hidden !important;\
 display: none !important;\
}\
td.age  span.css-truncate .fsort-time {\
 visibility: visible !important;\
 display: inline !important;\
}\
')
}
/* https://cdnjs.cloudflare.com/ajax/libs/octicons/3.4.1/octicons.min.css */
stickStyle("\
@font-face {\
  font-family: 'octicons';\
  src:\
       url('https://cdnjs.cloudflare.com/ajax/libs/octicons/3.4.1/octicons.woff') format('woff'),\
       url('https://cdnjs.cloudflare.com/ajax/libs/octicons/3.4.1/octicons.ttf') format('truetype');\
  font-weight: normal;\
  font-style: normal;\
}\
.octicon{font:normal normal normal 16px/1  octicons;display:inline-block;text-decoration:none;text-rendering:auto;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.mega-octicon{font-size:32px}.octicon-alert:before{content:'\\f02d'}.octicon-arrow-down:before{content:'\\f03f'}.octicon-arrow-left:before{content:'\\f040'}.octicon-arrow-right:before{content:'\\f03e'}.octicon-arrow-small-down:before{content:'\\f0a0'}.octicon-arrow-small-left:before{content:'\\f0a1'}.octicon-arrow-small-right:before{content:'\\f071'}.octicon-arrow-small-up:before{content:'\\f09f'}.octicon-arrow-up:before{content:'\\f03d'}.octicon-microscope:before,.octicon-beaker:before{content:'\\f0dd'}.octicon-bell:before{content:'\\f0de'}.octicon-bold:before{content:'\\f0e2'}.octicon-book:before{content:'\\f007'}.octicon-bookmark:before{content:'\\f07b'}.octicon-briefcase:before{content:'\\f0d3'}.octicon-broadcast:before{content:'\\f048'}.octicon-browser:before{content:'\\f0c5'}.octicon-bug:before{content:'\\f091'}.octicon-calendar:before{content:'\\f068'}.octicon-check:before{content:'\\f03a'}.octicon-checklist:before{content:'\\f076'}.octicon-chevron-down:before{content:'\\f0a3'}.octicon-chevron-left:before{content:'\\f0a4'}.octicon-chevron-right:before{content:'\\f078'}.octicon-chevron-up:before{content:'\\f0a2'}.octicon-circle-slash:before{content:'\\f084'}.octicon-circuit-board:before{content:'\\f0d6'}.octicon-clippy:before{content:'\\f035'}.octicon-clock:before{content:'\\f046'}.octicon-cloud-download:before{content:'\\f00b'}.octicon-cloud-upload:before{content:'\\f00c'}.octicon-code:before{content:'\\f05f'}.octicon-comment-add:before,.octicon-comment:before{content:'\\f02b'}.octicon-comment-discussion:before{content:'\\f04f'}.octicon-credit-card:before{content:'\\f045'}.octicon-dash:before{content:'\\f0ca'}.octicon-dashboard:before{content:'\\f07d'}.octicon-database:before{content:'\\f096'}.octicon-clone:before,.octicon-desktop-download:before{content:'\\f0dc'}.octicon-device-camera:before{content:'\\f056'}.octicon-device-camera-video:before{content:'\\f057'}.octicon-device-desktop:before{content:'\\f27c'}.octicon-device-mobile:before{content:'\\f038'}.octicon-diff:before{content:'\\f04d'}.octicon-diff-added:before{content:'\\f06b'}.octicon-diff-ignored:before{content:'\\f099'}.octicon-diff-modified:before{content:'\\f06d'}.octicon-diff-removed:before{content:'\\f06c'}.octicon-diff-renamed:before{content:'\\f06e'}.octicon-ellipsis:before{content:'\\f09a'}.octicon-eye-unwatch:before,.octicon-eye-watch:before,.octicon-eye:before{content:'\\f04e'}.octicon-file-binary:before{content:'\\f094'}.octicon-file-code:before{content:'\\f010'}.octicon-file-directory:before{content:'\\f016'}.octicon-file-media:before{content:'\\f012'}.octicon-file-pdf:before{content:'\\f014'}.octicon-file-submodule:before{content:'\\f017'}.octicon-file-symlink-directory:before{content:'\\f0b1'}.octicon-file-symlink-file:before{content:'\\f0b0'}.octicon-file-text:before{content:'\\f011'}.octicon-file-zip:before{content:'\\f013'}.octicon-flame:before{content:'\\f0d2'}.octicon-fold:before{content:'\\f0cc'}.octicon-gear:before{content:'\\f02f'}.octicon-gift:before{content:'\\f042'}.octicon-gist:before{content:'\\f00e'}.octicon-gist-secret:before{content:'\\f08c'}.octicon-git-branch-create:before,.octicon-git-branch-delete:before,.octicon-git-branch:before{content:'\\f020'}.octicon-git-commit:before{content:'\\f01f'}.octicon-git-compare:before{content:'\\f0ac'}.octicon-git-merge:before{content:'\\f023'}.octicon-git-pull-request-abandoned:before,.octicon-git-pull-request:before{content:'\\f009'}.octicon-globe:before{content:'\\f0b6'}.octicon-graph:before{content:'\\f043'}.octicon-heart:before{content:'\\2665'}.octicon-history:before{content:'\\f07e'}.octicon-home:before{content:'\\f08d'}.octicon-horizontal-rule:before{content:'\\f070'}.octicon-hubot:before{content:'\\f09d'}.octicon-inbox:before{content:'\\f0cf'}.octicon-info:before{content:'\\f059'}.octicon-issue-closed:before{content:'\\f028'}.octicon-issue-opened:before{content:'\\f026'}.octicon-issue-reopened:before{content:'\\f027'}.octicon-italic:before{content:'\\f0e4'}.octicon-jersey:before{content:'\\f019'}.octicon-key:before{content:'\\f049'}.octicon-keyboard:before{content:'\\f00d'}.octicon-law:before{content:'\\f0d8'}.octicon-light-bulb:before{content:'\\f000'}.octicon-link:before{content:'\\f05c'}.octicon-link-external:before{content:'\\f07f'}.octicon-list-ordered:before{content:'\\f062'}.octicon-list-unordered:before{content:'\\f061'}.octicon-location:before{content:'\\f060'}.octicon-gist-private:before,.octicon-mirror-private:before,.octicon-git-fork-private:before,.octicon-lock:before{content:'\\f06a'}.octicon-logo-gist:before{content:'\\f0ad'}.octicon-logo-github:before{content:'\\f092'}.octicon-mail:before{content:'\\f03b'}.octicon-mail-read:before{content:'\\f03c'}.octicon-mail-reply:before{content:'\\f051'}.octicon-mark-github:before{content:'\\f00a'}.octicon-markdown:before{content:'\\f0c9'}.octicon-megaphone:before{content:'\\f077'}.octicon-mention:before{content:'\\f0be'}.octicon-milestone:before{content:'\\f075'}.octicon-mirror-public:before,.octicon-mirror:before{content:'\\f024'}.octicon-mortar-board:before{content:'\\f0d7'}.octicon-mute:before{content:'\\f080'}.octicon-no-newline:before{content:'\\f09c'}.octicon-octoface:before{content:'\\f008'}.octicon-organization:before{content:'\\f037'}.octicon-package:before{content:'\\f0c4'}.octicon-paintcan:before{content:'\\f0d1'}.octicon-pencil:before{content:'\\f058'}.octicon-person-add:before,.octicon-person-follow:before,.octicon-person:before{content:'\\f018'}.octicon-pin:before{content:'\\f041'}.octicon-plug:before{content:'\\f0d4'}.octicon-repo-create:before,.octicon-gist-new:before,.octicon-file-directory-create:before,.octicon-file-add:before,.octicon-plus:before{content:'\\f05d'}.octicon-primitive-dot:before{content:'\\f052'}.octicon-primitive-square:before{content:'\\f053'}.octicon-pulse:before{content:'\\f085'}.octicon-question:before{content:'\\f02c'}.octicon-quote:before{content:'\\f063'}.octicon-radio-tower:before{content:'\\f030'}.octicon-repo-delete:before,.octicon-repo:before{content:'\\f001'}.octicon-repo-clone:before{content:'\\f04c'}.octicon-repo-force-push:before{content:'\\f04a'}.octicon-gist-fork:before,.octicon-repo-forked:before{content:'\\f002'}.octicon-repo-pull:before{content:'\\f006'}.octicon-repo-push:before{content:'\\f005'}.octicon-rocket:before{content:'\\f033'}.octicon-rss:before{content:'\\f034'}.octicon-ruby:before{content:'\\f047'}.octicon-search-save:before,.octicon-search:before{content:'\\f02e'}.octicon-server:before{content:'\\f097'}.octicon-settings:before{content:'\\f07c'}.octicon-shield:before{content:'\\f0e1'}.octicon-log-in:before,.octicon-sign-in:before{content:'\\f036'}.octicon-log-out:before,.octicon-sign-out:before{content:'\\f032'}.octicon-smiley:before{content:'\\f0e7'}.octicon-squirrel:before{content:'\\f0b2'}.octicon-star-add:before,.octicon-star-delete:before,.octicon-star:before{content:'\\f02a'}.octicon-stop:before{content:'\\f08f'}.octicon-repo-sync:before,.octicon-sync:before{content:'\\f087'}.octicon-tag-remove:before,.octicon-tag-add:before,.octicon-tag:before{content:'\\f015'}.octicon-tasklist:before{content:'\\f0e5'}.octicon-telescope:before{content:'\\f088'}.octicon-terminal:before{content:'\\f0c8'}.octicon-text-size:before{content:'\\f0e3'}.octicon-three-bars:before{content:'\\f05e'}.octicon-thumbsdown:before{content:'\\f0db'}.octicon-thumbsup:before{content:'\\f0da'}.octicon-tools:before{content:'\\f031'}.octicon-trashcan:before{content:'\\f0d0'}.octicon-triangle-down:before{content:'\\f05b'}.octicon-triangle-left:before{content:'\\f044'}.octicon-triangle-right:before{content:'\\f05a'}.octicon-triangle-up:before{content:'\\f0aa'}.octicon-unfold:before{content:'\\f039'}.octicon-unmute:before{content:'\\f0ba'}.octicon-verified:before{content:'\\f0e6'}.octicon-versions:before{content:'\\f064'}.octicon-watch:before{content:'\\f0e0'}.octicon-remove-close:before,.octicon-x:before{content:'\\f081'}.octicon-zap:before{content:'\\26A1'}\
");

function setC(n){
 for(var i=0,il=C.length; i<il; i++ ){
  if(i!=n) C[i].s= 0, C[i].d=d0[i];
  else C[i].s=1;
  oa[i].className='fsort-butt fsort-'+(C[i].d?'desc':'asc')+(C[i].s?' fsort-sel':'') ;
  //oa[i].title=C[i].d? '\u21ca' : '\u21c8';
 }
}

function dd(s)
{ s=s.toString(); if(s.length<2)return'0'+s; return s}
function d2s(n){
 var hs=dd(n.getHours())+':'+dd(n.getMinutes());
 return {  
   d: n.getFullYear()+'-'+dd(n.getMonth()+1)+'-'+dd(n.getDate())+'<i>'+ hs+'</i>',
   t: hs+':'+dd(n.getSeconds())
 }
}

var xmatch=/(.*)\.(.*)$/;
function filext(x){
 var m= x.match(xmatch);
 if(!m || !m[2]) return "EmptyExt";
 return m[2].toLowerCase();
}
function setIcon(tr){
  var xt,tc,ti=tr.querySelector('td.icon > .octicon-file-text');
  if(!ti) return;
  tc=tr.querySelector('td.content > span.css-truncate');
  if(!tc) return;
  tc=tc.textContent;
  if(!tc) return;
  xt=filext(tc);
  if(!xt) return;
  xt=extList[xt];
  if(typeof xt === "undefined") return;
  var tn= document.createElement('span');
  tn.className='octicon octicon-'+ extIcon[xt];
  ti.parentNode.replaceChild(tn, ti);
  
  //_l('setIcon '+xt);
}

function setDateTime(x){
 var dt,dtm,dta,dtd,tc,m,now,t;
 var DT=D.querySelectorAll('td.age span.css-truncate time');
 _l('sDT',x?'refresh':'create');
 try{
  now = new Date();
 for(var dl=DT.length, i=0; i<dl; i++){
  dta=DT[i].getAttribute('datetime');
  dtd=new Date(dta);
  dt= d2s(dtd); // 2014-07-24T17:06:11Z
  dtm=null;
  if(x){
   dtm=DT[i].parentNode.querySelector('.fsort-time');
  }
  if(!dtm){
   dtm=D.createElement('span');
   dtm.className='fsort-time';
   x=0;
  }
  if(!x || !dtm.title || dtm.title != DT[i].title)
  { dtm.title= DT[i].title;
    t= dt.d;
    if( (now.getTime() -  dtd.getTime() < 12*3600*1000) ||
        ((now.getTime() -  dtd.getTime() < 24*3600*1000) &&
         (now.getDate() == dtd.getDate()) )
      )  t=dt.t;
    dtm.innerHTML=t;
  }
  if(!x) insAfter(dtm,DT[i]);
  if(!x)
    setIcon(outerNode(DT[i],'TR'));
 }
 /* 150810 */
 }catch(e){(console.log(e+'\n*GHSFL* wrong datetime'+x))}
}

function isDir(x){
 var c= TB.rows[x].cells[0].querySelector(".octicon"); //<svg> now!!!11
 try{
 c=c.getAttribute('class');
 if(c.indexOf("-directory")>0) return 0;
 if(c.indexOf("octicon-")>0) return -1;
 } catch(e){ console.log(c,'n',e)};
 return 1;
}
function getCell(r,c,s,p){
 var rc=TB.rows[r].cells[c],q=null;
 if(typeof rc == "undefined") {
 _l('r:',r,'c:',c,'- ???' );
 }else
   q=rc.querySelector(s);
 if(q) q= p? q.getAttribute(p): q.textContent;
 if(q) return q;
 return "";
}
var sDir,sCells,sExts;
 var fa=[
  function(a){
   var r=getCell(a,1,'span.css-truncate-target a');
   return prefs.upc? r.toUpperCase(): r;
  },
  function(a){
   var r= getCell(a,2,'span.css-truncate');
   r=r.replace(/\s+/,' ').replace(/^\s|\s$/,'');
   return prefs.upc? r.toUpperCase(): r;
  },
  function(a){
   var c = getCell(a,3,'span.css-truncate>time','datetime');
   if(c) return c;
   return "2099-12-31T23:59:59Z"
  }
 ]

var b9='\x20\x20\x20'; b9+=b9+b9;
function pad9(s){
 if(s.length<9) return (s+b9).substr(0,9);
 return s;
}
function sort_p(n){// prepare data for sorting
 sDir=[],sCells=[];
 for(var tl=TB.rows.length, a=0; a<tl; a++) 
   sDir.push(isDir(a));
 if( n === 0 && prefs.ext ){
  for( a=0; a<tl; a++){ // f.x -> x.f
   var x=fa[n](a),
   m= x.match(/(.*)(\..*)$/);
   if(!m || !m[2]) m=['',x,''];
   x=pad9(m[2])+' '+m[1];
   sCells.push(x);
  }
 }else{
   for( a=0; a<tl; a++) sCells.push(fa[n](a));
 }
}

function sort_fn(a,b){ 
 var x=sDir[a], y=sDir[b];
 if(x!=y) return ((x<y)? 1: -1);
 x= sCells[a], y= sCells[b];
 return x==y? 0: (((x>y)^ASC)<<1)-1;
}

var CNn={content: 0, message: 1, age: 2}

function oClr(){
 var o= catcher.querySelectorAll('.fsort-butt,.fsort-time')
 for(var ol=o.length,i=0;i<ol;i++)
  o[i] && o[i].parentNode.removeChild(o[i]);
}
//
function extclassName(){
  ext.className='fsort-butt'+ (prefs.ext? ' fsort-on': '' );
}
function clockclassName(){
  clock.className='fsort-butt'+ (prefs.dtStyle? '': ' fsort-on');
}
function upcclassName(){
  upc.className='fsort-butt'+ (prefs.upc? ' fsort-on': '' );
}
//
function doSort(t){
 TB=outerNode(t,'TBODY');
 if(!TB){  _l( "*GHSFL* TBODY not found"); return; }
 var n = CNn[t.parentNode.className];
 if(typeof n=="undefined") n= CNn[t.parentNode.parentNode.className];
 if(typeof n=="undefined"){  _l( "*GHSFL* undefined col"); return; }
 
 if(t.id=='fsort-clock'){
   dtStyle.disabled = (prefs.dtStyle ^= 1);
   savePrefs();
   clockclassName();
   return;
 }
 if (t.id=='fsort-ext'){
  if(C[n].s) prefs.ext ^= 1; 
  else prefs.ext= 1;
  savePrefs();
  extclassName();
  C[n].d^=C[n].s; // don't toggle dir on ext.click
 }else 
 if (t.id=='fsort-upc'){
  if(C[n].s) prefs.upc ^= 1; 
  else prefs.upc= 1;
  savePrefs();
  upcclassName();
  C[n].d^=C[n].s; // don't toggle case on upc.click
 }
 var tb=[],ix=[], i, tl,ti,tx;
 _l('n:'+n);
 tl=TB.rows.length;
 ASC=C[n].d^=C[n].s;
 for( i=0; i<tl; i++)
  ix.push(i);
 oClr();
              //var ms=new Date();
 sort_p(n);
 ix.sort(sort_fn);
 for( i=0; i<tl; i++) 
   tb.push(TB.rows[ix[i]]);
 for( i=tl-1; i>=0; i--)
   TB.removeChild(TB.rows[i]);
 for( i=0; i<tl; i++) 
   TB.appendChild(tb[i]);
              //ms=(new Date())-ms;
              //console.info('sorted by '+ms+'ms');
  setC(n);
 gitDir(0);
}

function onClik(e){doSort(e.target)}

function gitDir(x){
 if(x && document.querySelector('.fsort-butt')) {
  _l('gitDir'+x+ '- already'); return;
 }
 _l('gitDir',x?'create':'refresh')
 var c,o;
 ca=[];
 c= D.querySelector('.file-wrap table.files td.content >span');
 if(!c){ _l( '*GHSFL* no content') ; return; }
 ca.push(c);
 c=D.querySelector('.file-wrap table.files td.message >span');
 if(!c){ _l( '*GHSFL* no messages'); return; }
 ca.push(c);
 c=D.querySelector('.file-wrap table.files td.age >span');
 if(!c){_l( '*GHSFL* no ages'); return; }
 ca.push(c);
 if(x){  oClr(); oa=[];
  o=D.createElement('span'); 
  o.textContent=''; 
  oa.push(o);
  o=o.cloneNode(true); 
  oa.push(o);
  o=o.cloneNode(true); 
  oa.push(o);
  clock=D.createElement('span');
  clock.id='fsort-clock'; clockclassName();
  ext=D.createElement('span');
  ext.id='fsort-ext'; extclassName();
  upc=D.createElement('span');
  upc.id='fsort-upc'; upcclassName();
  setDateTime(); 
  setC(-1);
 }
  o=insBefore(oa[0],ca[0]);
  o.appendChild(upc);
  o.appendChild(ext);
  insBefore(oa[1],ca[1]);
  o=insBefore(oa[2],ca[2]);
  o.appendChild(clock);
}


catcher= D.querySelector('#js-repo-pjax-container');
if(!catcher){  _l( "*GHSFL* err0r"); return; }

catcher.addEventListener('mousedown',function(e){
if(e.target.nodeName && e.target.nodeName=='SPAN' &&
   e.target.className.indexOf('fsort-butt')>-1)
 { onClik(e); }
}
,false);

_l('startup()');

try {
  locStor = W.localStorage;
  tt=locStor.getItem("GHSFL");
} catch(e){ locStor =null}

if(locStor && tt) try{
 var pa =JSON.parse(tt); 
 for (var a in pa) prefs[a]=pa[a];
 _l('prefs:'+JSON.stringify(prefs));
}catch(e){ console.log(e+"\n*GHSFL* bad prefs") }

css();
dtStyle.disabled=(prefs.dtStyle===1);

gitDir(1);
var target = catcher; //document.body; //D.querSelector('.file-wrap');
var  MO = window.MutationObserver;
if(!MO) MO= window.WebKitMutationObserver;
if(!MO) return;
var __started=0;
var mII=0,mI=0;;
var  observer = new MO(function(mutations) {
  var t=mutations[0].target;
//mI++; _l('mut'+mI+'.'+mutations[0].target.nodeName);
 var fc=document.getElementById('fsort-clock')
 if(!fc){
         gitDir(1);
          __started=1;
 return; }
 if(!fc.parentNode.parentNode.querySelector('.fsort-time')){
      setDateTime(1); 
 return;}
});
// D.body
observer.observe(catcher, { attributes: true, childList: true, subtree: true } );
/* attributes: true , childList: true, subtree: true,  
  characterData: true,  attributeOldValue:true,  characterDataOldValue:true
*/

})()};
