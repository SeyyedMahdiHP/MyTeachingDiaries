// Copyright (c) 2007 John Fraser.
// Original Markdown Copyright (c) 2004-2005 John Gruber
var Showdown={extensions:{}},forEach=Showdown.forEach=function(obj,callback){if("function"==typeof obj.forEach)obj.forEach(callback);else{var i,len=obj.length;for(i=0;len>i;i++)callback(obj[i],i,obj)}},stdExtName=function(s){return s.replace(/[_-]||\s/g,"").toLowerCase()};Showdown.converter=function(converter_options){var g_urls,g_titles,g_html_blocks,g_list_level=0,g_lang_extensions=[],g_output_modifiers=[];if("undefined"!=typeof module&&"undefined"!=typeof exports&&"undefined"!=typeof require){var fs=require("fs");if(fs){var extensions=fs.readdirSync((__dirname||".")+"/extensions").filter(function(file){return~file.indexOf(".js")}).map(function(file){return file.replace(/\.js$/,"")});Showdown.forEach(extensions,function(ext){var name=stdExtName(ext);Showdown.extensions[name]=require("./extensions/"+ext)})}}if(this.makeHtml=function(text){return g_urls={},g_titles={},g_html_blocks=[],text=text.replace(/~/g,"~T"),text=text.replace(/\$/g,"~D"),text=text.replace(/\r\n/g,"\n"),text=text.replace(/\r/g,"\n"),text="\n\n"+text+"\n\n",text=_Detab(text),text=text.replace(/^[ \t]+$/gm,""),Showdown.forEach(g_lang_extensions,function(x){text=_ExecuteExtension(x,text)}),text=_DoGithubCodeBlocks(text),text=_HashHTMLBlocks(text),text=_StripLinkDefinitions(text),text=_RunBlockGamut(text),text=_UnescapeSpecialChars(text),text=text.replace(/~D/g,"$$"),text=text.replace(/~T/g,"~"),Showdown.forEach(g_output_modifiers,function(x){text=_ExecuteExtension(x,text)}),text},converter_options&&converter_options.extensions){var self=this;Showdown.forEach(converter_options.extensions,function(plugin){if("string"==typeof plugin&&(plugin=Showdown.extensions[stdExtName(plugin)]),"function"!=typeof plugin)throw"Extension '"+plugin+"' could not be loaded.  It was either not found or is not a valid extension.";Showdown.forEach(plugin(self),function(ext){ext.type?"language"===ext.type||"lang"===ext.type?g_lang_extensions.push(ext):"output"!==ext.type&&"html"!==ext.type||g_output_modifiers.push(ext):g_output_modifiers.push(ext)})})}var _ProcessListItems,_ExecuteExtension=function(ext,text){if(ext.regex){var re=new RegExp(ext.regex,"g");return text.replace(re,ext.replace)}return ext.filter?ext.filter(text):void 0},_StripLinkDefinitions=function(text){return text+="~0",text=text.replace(/^[ ]{0,3}\[(.+)\]:[ \t]*\n?[ \t]*<?(\S+?)>?[ \t]*\n?[ \t]*(?:(\n*)["(](.+?)[")][ \t]*)?(?:\n+|(?=~0))/gm,function(wholeMatch,m1,m2,m3,m4){return m1=m1.toLowerCase(),g_urls[m1]=_EncodeAmpsAndAngles(m2),m3?m3+m4:(m4&&(g_titles[m1]=m4.replace(/"/g,"&quot;")),"")}),text=text.replace(/~0/,"")},_HashHTMLBlocks=function(text){text=text.replace(/\n/g,"\n\n");return text=text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|ins|del)\b[^\r]*?\n<\/\2>[ \t]*(?=\n+))/gm,hashElement),text=text.replace(/^(<(p|div|h[1-6]|blockquote|pre|table|dl|ol|ul|script|noscript|form|fieldset|iframe|math|style|section|header|footer|nav|article|aside)\b[^\r]*?<\/\2>[ \t]*(?=\n+)\n)/gm,hashElement),text=text.replace(/(\n[ ]{0,3}(<(hr)\b([^<>])*?\/?>)[ \t]*(?=\n{2,}))/g,hashElement),text=text.replace(/(\n\n[ ]{0,3}<!(--[^\r]*?--\s*)+>[ \t]*(?=\n{2,}))/g,hashElement),text=text.replace(/(?:\n\n)([ ]{0,3}(?:<([?%])[^\r]*?\2>)[ \t]*(?=\n{2,}))/g,hashElement),text=text.replace(/\n\n/g,"\n")},hashElement=function(wholeMatch,m1){var blockText=m1;return blockText=blockText.replace(/\n\n/g,"\n"),blockText=blockText.replace(/^\n/,""),blockText=blockText.replace(/\n+$/g,""),blockText="\n\n~K"+(g_html_blocks.push(blockText)-1)+"K\n\n"},_RunBlockGamut=function(text){text=_DoHeaders(text);var key=hashBlock("<hr />");return text=text.replace(/^[ ]{0,2}([ ]?\*[ ]?){3,}[ \t]*$/gm,key),text=text.replace(/^[ ]{0,2}([ ]?\-[ ]?){3,}[ \t]*$/gm,key),text=text.replace(/^[ ]{0,2}([ ]?\_[ ]?){3,}[ \t]*$/gm,key),text=_DoLists(text),text=_DoCodeBlocks(text),text=_DoBlockQuotes(text),text=_HashHTMLBlocks(text),text=_FormParagraphs(text)},_RunSpanGamut=function(text){return text=_DoCodeSpans(text),text=_EscapeSpecialCharsWithinTagAttributes(text),text=_EncodeBackslashEscapes(text),text=_DoImages(text),text=_DoAnchors(text),text=_DoAutoLinks(text),text=_EncodeAmpsAndAngles(text),text=_DoItalicsAndBold(text),text=text.replace(/  +\n/g," <br />\n")},_EscapeSpecialCharsWithinTagAttributes=function(text){var regex=/(<[a-z\/!$]("[^"]*"|'[^']*'|[^'">])*>|<!(--.*?--\s*)+>)/gi;return text=text.replace(regex,function(wholeMatch){var tag=wholeMatch.replace(/(.)<\/?code>(?=.)/g,"$1`");return tag=escapeCharacters(tag,"\\`*_")})},_DoAnchors=function(text){return text=text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeAnchorTag),text=text.replace(/(\[((?:\[[^\]]*\]|[^\[\]])*)\]\([ \t]*()<?(.*?(?:\(.*?\).*?)?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeAnchorTag),text=text.replace(/(\[([^\[\]]+)\])()()()()()/g,writeAnchorTag)},writeAnchorTag=function(wholeMatch,m1,m2,m3,m4,m5,m6,m7){void 0==m7&&(m7="");var whole_match=m1,link_text=m2,link_id=m3.toLowerCase(),url=m4,title=m7;if(""==url)if(""==link_id&&(link_id=link_text.toLowerCase().replace(/ ?\n/g," ")),url="#"+link_id,void 0!=g_urls[link_id])url=g_urls[link_id],void 0!=g_titles[link_id]&&(title=g_titles[link_id]);else{if(!(whole_match.search(/\(\s*\)$/m)>-1))return whole_match;url=""}url=escapeCharacters(url,"*_");var result='<a href="'+url+'"';return""!=title&&(title=title.replace(/"/g,"&quot;"),title=escapeCharacters(title,"*_"),result+=' title="'+title+'"'),result+=">"+link_text+"</a>"},_DoImages=function(text){return text=text.replace(/(!\[(.*?)\][ ]?(?:\n[ ]*)?\[(.*?)\])()()()()/g,writeImageTag),text=text.replace(/(!\[(.*?)\]\s?\([ \t]*()<?(\S+?)>?[ \t]*((['"])(.*?)\6[ \t]*)?\))/g,writeImageTag)},writeImageTag=function(wholeMatch,m1,m2,m3,m4,m5,m6,m7){var whole_match=m1,alt_text=m2,link_id=m3.toLowerCase(),url=m4,title=m7;if(title||(title=""),""==url){if(""==link_id&&(link_id=alt_text.toLowerCase().replace(/ ?\n/g," ")),url="#"+link_id,void 0==g_urls[link_id])return whole_match;url=g_urls[link_id],void 0!=g_titles[link_id]&&(title=g_titles[link_id])}alt_text=alt_text.replace(/"/g,"&quot;"),url=escapeCharacters(url,"*_");var result='<img src="'+url+'" alt="'+alt_text+'"';return title=title.replace(/"/g,"&quot;"),title=escapeCharacters(title,"*_"),result+=' title="'+title+'"',result+=" />"},_DoHeaders=function(text){function headerId(m){return m.replace(/[^\w]/g,"").toLowerCase()}return text=text.replace(/^(.+)[ \t]*\n=+[ \t]*\n+/gm,function(wholeMatch,m1){return hashBlock('<h1 id="'+headerId(m1)+'">'+_RunSpanGamut(m1)+"</h1>")}),text=text.replace(/^(.+)[ \t]*\n-+[ \t]*\n+/gm,function(matchFound,m1){return hashBlock('<h2 id="'+headerId(m1)+'">'+_RunSpanGamut(m1)+"</h2>")}),text=text.replace(/^(\#{1,6})[ \t]*(.+?)[ \t]*\#*\n+/gm,function(wholeMatch,m1,m2){var h_level=m1.length;return hashBlock("<h"+h_level+' id="'+headerId(m2)+'">'+_RunSpanGamut(m2)+"</h"+h_level+">")})},_DoLists=function(text){text+="~0";var whole_list=/^(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/gm;return g_list_level?text=text.replace(whole_list,function(wholeMatch,m1,m2){var list=m1,list_type=m2.search(/[*+-]/g)>-1?"ul":"ol";list=list.replace(/\n{2,}/g,"\n\n\n");var result=_ProcessListItems(list);return result=result.replace(/\s+$/,""),result="<"+list_type+">"+result+"</"+list_type+">\n"}):(whole_list=/(\n\n|^\n?)(([ ]{0,3}([*+-]|\d+[.])[ \t]+)[^\r]+?(~0|\n{2,}(?=\S)(?![ \t]*(?:[*+-]|\d+[.])[ \t]+)))/g,text=text.replace(whole_list,function(wholeMatch,m1,m2,m3){var runup=m1,list=m2,list_type=m3.search(/[*+-]/g)>-1?"ul":"ol",list=list.replace(/\n{2,}/g,"\n\n\n"),result=_ProcessListItems(list);return result=runup+"<"+list_type+">\n"+result+"</"+list_type+">\n"})),text=text.replace(/~0/,"")};_ProcessListItems=function(list_str){return g_list_level++,list_str=list_str.replace(/\n{2,}$/,"\n"),list_str+="~0",list_str=list_str.replace(/(\n)?(^[ \t]*)([*+-]|\d+[.])[ \t]+([^\r]+?(\n{1,2}))(?=\n*(~0|\2([*+-]|\d+[.])[ \t]+))/gm,function(wholeMatch,m1,m2,m3,m4){var item=m4,leading_line=m1;return leading_line||item.search(/\n{2,}/)>-1?item=_RunBlockGamut(_Outdent(item)):(item=_DoLists(_Outdent(item)),item=item.replace(/\n$/,""),item=_RunSpanGamut(item)),"<li>"+item+"</li>\n"}),list_str=list_str.replace(/~0/g,""),g_list_level--,list_str};var _DoCodeBlocks=function(text){return text+="~0",text=text.replace(/(?:\n\n|^)((?:(?:[ ]{4}|\t).*\n+)+)(\n*[ ]{0,3}[^ \t\n]|(?=~0))/g,function(wholeMatch,m1,m2){var codeblock=m1,nextChar=m2;return codeblock=_EncodeCode(_Outdent(codeblock)),codeblock=_Detab(codeblock),codeblock=codeblock.replace(/^\n+/g,""),codeblock=codeblock.replace(/\n+$/g,""),codeblock="<pre><code>"+codeblock+"\n</code></pre>",hashBlock(codeblock)+nextChar}),text=text.replace(/~0/,"")},_DoGithubCodeBlocks=function(text){return text+="~0",text=text.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g,function(wholeMatch,m1,m2){var language=m1,codeblock=m2;return codeblock=_EncodeCode(codeblock),codeblock=_Detab(codeblock),codeblock=codeblock.replace(/^\n+/g,""),codeblock=codeblock.replace(/\n+$/g,""),codeblock="<pre><code"+(language?' class="'+language+'"':"")+">"+codeblock+"\n</code></pre>",hashBlock(codeblock)}),text=text.replace(/~0/,"")},hashBlock=function(text){return text=text.replace(/(^\n+|\n+$)/g,""),"\n\n~K"+(g_html_blocks.push(text)-1)+"K\n\n"},_DoCodeSpans=function(text){return text=text.replace(/(^|[^\\])(`+)([^\r]*?[^`])\2(?!`)/gm,function(wholeMatch,m1,m2,m3){var c=m3;return c=c.replace(/^([ \t]*)/g,""),c=c.replace(/[ \t]*$/g,""),c=_EncodeCode(c),m1+"<code>"+c+"</code>"})},_EncodeCode=function(text){return text=text.replace(/&/g,"&amp;"),text=text.replace(/</g,"&lt;"),text=text.replace(/>/g,"&gt;"),text=escapeCharacters(text,"*_{}[]\\",!1)},_DoItalicsAndBold=function(text){return text=text.replace(/(\*\*|__)(?=\S)([^\r]*?\S[*_]*)\1/g,"<strong>$2</strong>"),text=text.replace(/(\*|_)(?=\S)([^\r]*?\S)\1/g,"<em>$2</em>")},_DoBlockQuotes=function(text){return text=text.replace(/((^[ \t]*>[ \t]?.+\n(.+\n)*\n*)+)/gm,function(wholeMatch,m1){var bq=m1;return bq=bq.replace(/^[ \t]*>[ \t]?/gm,"~0"),bq=bq.replace(/~0/g,""),bq=bq.replace(/^[ \t]+$/gm,""),bq=_RunBlockGamut(bq),bq=bq.replace(/(^|\n)/g,"$1  "),bq=bq.replace(/(\s*<pre>[^\r]+?<\/pre>)/gm,function(wholeMatch,m1){var pre=m1;return pre=pre.replace(/^  /gm,"~0"),pre=pre.replace(/~0/g,"")}),hashBlock("<blockquote>\n"+bq+"\n</blockquote>")})},_FormParagraphs=function(text){text=text.replace(/^\n+/g,""),text=text.replace(/\n+$/g,"");for(var grafs=text.split(/\n{2,}/g),grafsOut=[],end=grafs.length,i=0;end>i;i++){var str=grafs[i];str.search(/~K(\d+)K/g)>=0?grafsOut.push(str):str.search(/\S/)>=0&&(str=_RunSpanGamut(str),str=str.replace(/^([ \t]*)/g,"<p>"),str+="</p>",grafsOut.push(str))}end=grafsOut.length;for(var i=0;end>i;i++)for(;grafsOut[i].search(/~K(\d+)K/)>=0;){var blockText=g_html_blocks[RegExp.$1];blockText=blockText.replace(/\$/g,"$$$$"),grafsOut[i]=grafsOut[i].replace(/~K\d+K/,blockText)}return grafsOut.join("\n\n")},_EncodeAmpsAndAngles=function(text){return text=text.replace(/&(?!#?[xX]?(?:[0-9a-fA-F]+|\w+);)/g,"&amp;"),text=text.replace(/<(?![a-z\/?\$!])/gi,"&lt;")},_EncodeBackslashEscapes=function(text){return text=text.replace(/\\(\\)/g,escapeCharacters_callback),text=text.replace(/\\([`*_{}\[\]()>#+-.!])/g,escapeCharacters_callback)},_DoAutoLinks=function(text){return text=text.replace(/<((https?|ftp|dict):[^'">\s]+)>/gi,'<a href="$1">$1</a>'),text=text.replace(/<(?:mailto:)?([-.\w]+\@[-a-z0-9]+(\.[-a-z0-9]+)*\.[a-z]+)>/gi,function(wholeMatch,m1){return _EncodeEmailAddress(_UnescapeSpecialChars(m1))})},_EncodeEmailAddress=function(addr){var encode=[function(ch){return"&#"+ch.charCodeAt(0)+";"},function(ch){return"&#x"+ch.charCodeAt(0).toString(16)+";"},function(ch){return ch}];return addr="mailto:"+addr,addr=addr.replace(/./g,function(ch){if("@"==ch)ch=encode[Math.floor(2*Math.random())](ch);else if(":"!=ch){var r=Math.random();ch=r>.9?encode[2](ch):r>.45?encode[1](ch):encode[0](ch)}return ch}),addr='<a href="'+addr+'">'+addr+"</a>",addr=addr.replace(/">.+:/g,'">')},_UnescapeSpecialChars=function(text){return text=text.replace(/~E(\d+)E/g,function(wholeMatch,m1){var charCodeToReplace=parseInt(m1);return String.fromCharCode(charCodeToReplace)})},_Outdent=function(text){return text=text.replace(/^(\t|[ ]{1,4})/gm,"~0"),text=text.replace(/~0/g,"")},_Detab=function(text){return text=text.replace(/\t(?=\t)/g,"    "),text=text.replace(/\t/g,"~A~B"),text=text.replace(/~B(.+?)~A/g,function(wholeMatch,m1){for(var leadingText=m1,numSpaces=4-leadingText.length%4,i=0;numSpaces>i;i++)leadingText+=" ";return leadingText}),text=text.replace(/~A/g,"    "),text=text.replace(/~B/g,"")},escapeCharacters=function(text,charsToEscape,afterBackslash){var regexString="(["+charsToEscape.replace(/([\[\]\\])/g,"\\$1")+"])";afterBackslash&&(regexString="\\\\"+regexString);var regex=new RegExp(regexString,"g");return text=text.replace(regex,escapeCharacters_callback)},escapeCharacters_callback=function(wholeMatch,m1){var charCodeToEscape=m1.charCodeAt(0);return"~E"+charCodeToEscape+"E"}},"undefined"!=typeof module&&(module.exports=Showdown),"function"==typeof define&&define.amd&&define("showdown",function(){return Showdown});