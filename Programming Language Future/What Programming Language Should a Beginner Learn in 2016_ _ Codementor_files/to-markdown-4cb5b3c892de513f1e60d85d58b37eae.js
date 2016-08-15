/*
 * to-markdown - an HTML to Markdown converter
 *
 * Copyright 2011, Dom Christie
 * Licenced under the MIT licence
 *
 */
var toMarkdown=function(string){function replaceEls(html,elProperties){var pattern="void"===elProperties.type?"<"+elProperties.tag+"\\b([^>]*)\\/?>":"<"+elProperties.tag+"\\b([^>]*)>([\\s\\S]*?)<\\/"+elProperties.tag+">",regex=new RegExp(pattern,"gi"),markdown="";return markdown="string"==typeof elProperties.replacement?html.replace(regex,elProperties.replacement):html.replace(regex,function(str,p1,p2,p3){return elProperties.replacement.call(this,str,p1,p2,p3)})}function attrRegExp(attr){return new RegExp(attr+"\\s*=\\s*[\"']?([^\"']*)[\"']?","i")}function replaceLists(html){return html=html.replace(/<(ul|ol)\b[^>]*>([\s\S]*?)<\/\1>/gi,function(str,listType,innerHTML){var lis=innerHTML.split("</li>");for(lis.splice(lis.length-1,1),i=0,len=lis.length;len>i;i++)if(lis[i]){var prefix="ol"===listType?i+1+".  ":"*   ";lis[i]=lis[i].replace(/\s*<li[^>]*>([\s\S]*)/i,function(str,innerHTML){return innerHTML=innerHTML.replace(/^\s+/,""),innerHTML=innerHTML.replace(/\n\n/g,"\n\n    "),innerHTML=innerHTML.replace(/\n([ ]*)+(\*|\d+\.) /g,"\n$1    $2 "),prefix+innerHTML})}return lis.join("\n")}),"\n\n"+html.replace(/[ \t]+\n|\s+$/g,"")}function replaceBlockquotes(html){return html=html.replace(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi,function(str,inner){return inner=inner.replace(/^\s+|\s+$/g,""),inner=cleanUp(inner),inner=inner.replace(/^/gm,"> "),inner=inner.replace(/^(>([ \t]{2,}>)+)/gm,"> >")})}function cleanUp(string){return string=string.replace(/^[\t\r\n]+|[\t\r\n]+$/g,""),string=string.replace(/\n\s+\n/g,"\n\n"),string=string.replace(/\n{3,}/g,"\n\n")}for(var ELEMENTS=[{patterns:"p",replacement:function(str,attrs,innerHTML){return innerHTML?"\n\n"+innerHTML+"\n":""}},{patterns:"br",type:"void",replacement:"\n"},{patterns:"h([1-6])",replacement:function(str,hLevel,attrs,innerHTML){for(var hPrefix="",i=0;hLevel>i;i++)hPrefix+="#";return"\n\n"+hPrefix+" "+innerHTML+"\n"}},{patterns:"hr",type:"void",replacement:"\n\n* * *\n"},{patterns:"a",replacement:function(str,attrs,innerHTML){var href=attrs.match(attrRegExp("href")),title=attrs.match(attrRegExp("title"));return href?"["+innerHTML+"]("+href[1]+(title&&title[1]?' "'+title[1]+'"':"")+")":str}},{patterns:["b","strong"],replacement:function(str,attrs,innerHTML){return innerHTML?"**"+innerHTML+"**":""}},{patterns:["i","em"],replacement:function(str,attrs,innerHTML){return innerHTML?"_"+innerHTML+"_":""}},{patterns:"code",replacement:function(str,attrs,innerHTML){return innerHTML?"`"+innerHTML+"`":""}},{patterns:"img",type:"void",replacement:function(str,attrs){var src=attrs.match(attrRegExp("src")),alt=attrs.match(attrRegExp("alt")),title=attrs.match(attrRegExp("title"));return"!["+(alt&&alt[1]?alt[1]:"")+"]("+src[1]+(title&&title[1]?' "'+title[1]+'"':"")+")"}}],i=0,len=ELEMENTS.length;len>i;i++)if("string"==typeof ELEMENTS[i].patterns)string=replaceEls(string,{tag:ELEMENTS[i].patterns,replacement:ELEMENTS[i].replacement,type:ELEMENTS[i].type});else for(var j=0,pLen=ELEMENTS[i].patterns.length;pLen>j;j++)string=replaceEls(string,{tag:ELEMENTS[i].patterns[j],replacement:ELEMENTS[i].replacement,type:ELEMENTS[i].type});string=string.replace(/<pre\b[^>]*>`([\s\S]*)`<\/pre>/gi,function(str,innerHTML){return innerHTML=innerHTML.replace(/^\t+/g,"  "),innerHTML=innerHTML.replace(/\n/g,"\n    "),"\n\n    "+innerHTML+"\n"}),string=string.replace(/^(\s{0,3}\d+)\. /g,"$1\\. ");for(var noChildrenRegex=/<(ul|ol)\b[^>]*>(?:(?!<ul|<ol)[\s\S])*?<\/\1>/gi;string.match(noChildrenRegex);)string=string.replace(noChildrenRegex,function(str){return replaceLists(str)});for(var deepest=/<blockquote\b[^>]*>((?:(?!<blockquote)[\s\S])*?)<\/blockquote>/gi;string.match(deepest);)string=string.replace(deepest,function(str){return replaceBlockquotes(str)});return cleanUp(string)};"object"==typeof exports&&(exports.toMarkdown=toMarkdown);