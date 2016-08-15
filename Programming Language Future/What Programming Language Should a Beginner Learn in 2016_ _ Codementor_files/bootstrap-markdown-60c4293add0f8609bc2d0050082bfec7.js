/* ===================================================
 * bootstrap-markdown.js v2.7.0
 * http://github.com/toopay/bootstrap-markdown
 * ===================================================
 * Copyright 2013-2014 Taufan Aditya
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */
!function($){"use strict";var Markdown=function(element,options){this.$ns="bootstrap-markdown",this.$element=$(element),this.$editable={el:null,type:null,attrKeys:[],attrValues:[],content:null},this.$options=$.extend(!0,{},$.fn.markdown.defaults,options,this.$element.data(),this.$element.data("options")),this.$oldContent=null,this.$isPreview=!1,this.$isFullscreen=!1,this.$editor=null,this.$textarea=null,this.$handler=[],this.$callback=[],this.$nextTab=[],this.showEditor()};Markdown.prototype={constructor:Markdown,__alterButtons:function(name,alter){var handler=this.$handler,isAll="all"==name,that=this;$.each(handler,function(k,v){var halt=!0;halt=isAll?!1:v.indexOf(name)<0,0==halt&&alter(that.$editor.find('button[data-handler="'+v+'"]'))})},__buildButtons:function(buttonsArray,container){var i,ns=this.$ns,handler=this.$handler,callback=this.$callback;for(i=0;i<buttonsArray.length;i++){var y,btnGroups=buttonsArray[i];for(y=0;y<btnGroups.length;y++){var z,buttons=btnGroups[y].data,btnGroupContainer=$("<div/>",{"class":"btn-group"});for(z=0;z<buttons.length;z++){var buttonContainer,buttonIconContainer,button=buttons[z],buttonHandler=ns+"-"+button.name,buttonIcon=this.__getIcon(button.icon),btnText=button.btnText?button.btnText:"",btnClass=button.btnClass?button.btnClass:"btn",tabIndex=button.tabIndex?button.tabIndex:"-1",hotkey="undefined"!=typeof button.hotkey?button.hotkey:"",hotkeyCaption="undefined"!=typeof jQuery.hotkeys&&""!==hotkey?" ("+hotkey+")":"";buttonContainer=$("<button></button>"),buttonContainer.text(" "+this.__localize(btnText)).addClass("btn-default btn-sm").addClass(btnClass),btnClass.match(/btn\-(primary|success|info|warning|danger|link)/)&&buttonContainer.removeClass("btn-default"),buttonContainer.attr({type:"button",title:this.__localize(button.title)+hotkeyCaption,tabindex:tabIndex,"data-provider":ns,"data-handler":buttonHandler,"data-hotkey":hotkey}),1==button.toggle&&buttonContainer.attr("data-toggle","button"),buttonIconContainer=$("<span/>"),buttonIconContainer.addClass(buttonIcon),buttonIconContainer.prependTo(buttonContainer),btnGroupContainer.append(buttonContainer),handler.push(buttonHandler),callback.push(button.callback)}container.append(btnGroupContainer)}}return container},__setListener:function(){var hasRows="undefined"!=typeof this.$textarea.attr("rows"),maxRows=this.$textarea.val().split("\n").length>5?this.$textarea.val().split("\n").length:"5",rowsVal=hasRows?this.$textarea.attr("rows"):maxRows;this.$textarea.attr("rows",rowsVal),this.$options.resize&&this.$textarea.css("resize",this.$options.resize),this.$textarea.on("focus",$.proxy(this.focus,this)).on("keypress",$.proxy(this.keypress,this)).on("keyup",$.proxy(this.keyup,this)).on("change",$.proxy(this.change,this)),this.eventSupported("keydown")&&this.$textarea.on("keydown",$.proxy(this.keydown,this)),this.$textarea.data("markdown",this)},__handle:function(e){var target=$(e.currentTarget),handler=this.$handler,callback=this.$callback,handlerName=target.attr("data-handler"),callbackIndex=handler.indexOf(handlerName),callbackHandler=callback[callbackIndex];$(e.currentTarget).focus(),callbackHandler(this),this.change(this),handlerName.indexOf("cmdSave")<0&&this.$textarea.focus(),e.preventDefault()},__localize:function(string){var messages=$.fn.markdown.messages,language=this.$options.language;return"undefined"!=typeof messages&&"undefined"!=typeof messages[language]&&"undefined"!=typeof messages[language][string]?messages[language][string]:string},__getIcon:function(src){return"object"==typeof src?src[this.$options.iconlibrary]:src},setFullscreen:function(mode){var $editor=this.$editor,$textarea=this.$textarea;mode===!0?($editor.addClass("md-fullscreen-mode"),$("body").addClass("md-nooverflow"),this.$options.onFullscreen(this)):($editor.removeClass("md-fullscreen-mode"),$("body").removeClass("md-nooverflow")),this.$isFullscreen=mode,$textarea.focus()},showEditor:function(){var textarea,instance=this,ns=this.$ns,container=this.$element,editable=(container.css("height"),container.css("width"),this.$editable),handler=this.$handler,callback=this.$callback,options=this.$options,editor=$("<div/>",{"class":"md-editor",click:function(){instance.focus()}});if(null==this.$editor){var editorHeader=$("<div/>",{"class":"md-header btn-toolbar"});editorHeader.append('<b class="markdownHeader">Markdown</b>');var allBtnGroups=[];if(options.buttons.length>0&&(allBtnGroups=allBtnGroups.concat(options.buttons[0])),options.additionalButtons.length>0&&(allBtnGroups=allBtnGroups.concat(options.additionalButtons[0])),options.reorderButtonGroups.length>0&&(allBtnGroups=allBtnGroups.filter(function(btnGroup){return options.reorderButtonGroups.indexOf(btnGroup.name)>-1}).sort(function(a,b){return options.reorderButtonGroups.indexOf(a.name)<options.reorderButtonGroups.indexOf(b.name)?-1:options.reorderButtonGroups.indexOf(a.name)>options.reorderButtonGroups.indexOf(b.name)?1:0})),allBtnGroups.length>0&&(editorHeader=this.__buildButtons([allBtnGroups],editorHeader)),options.fullscreen.enable&&editorHeader.append('<div class="md-controls"><a class="md-control md-control-fullscreen" href="#"><span class="'+this.__getIcon(options.fullscreen.icons.fullscreenOn)+'"></span></a></div>').on("click",".md-control-fullscreen",function(e){e.preventDefault(),instance.setFullscreen(!0)}),editor.append(editorHeader),container.is("textarea"))container.before(editor),textarea=container,textarea.addClass("md-input"),textarea[0].setAttribute("placeholder","Start your tutorial here !"),editor.append(textarea);else{var rawContent="function"==typeof toMarkdown?toMarkdown(container.html()):container.html(),currentContent=$.trim(rawContent);textarea=$("<textarea/>",{"class":"md-input",val:currentContent}),editor.append(textarea),editable.el=container,editable.type=container.prop("tagName").toLowerCase(),editable.content=container.html(),$(container[0].attributes).each(function(){editable.attrKeys.push(this.nodeName),editable.attrValues.push(this.nodeValue)}),container.replaceWith(editor)}var editorFooter=$("<div/>",{"class":"md-footer"}),createFooter=!1,footer="";if(options.savable){createFooter=!0;var saveHandler="cmdSave";handler.push(saveHandler),callback.push(options.onSave),editorFooter.append('<button class="btn btn-success" data-provider="'+ns+'" data-handler="'+saveHandler+'"><i class="icon icon-white icon-ok"></i> '+this.__localize("Save")+"</button>")}if(footer="function"==typeof options.footer?options.footer(this):options.footer,""!==$.trim(footer)&&(createFooter=!0,editorFooter.append(footer)),createFooter&&editor.append(editorFooter),options.width&&"inherit"!==options.width&&(jQuery.isNumeric(options.width)?(editor.css("display","table"),textarea.css("width",options.width+"px")):editor.addClass(options.width)),options.height&&"inherit"!==options.height)if(jQuery.isNumeric(options.height)){var height=options.height;editorHeader&&(height=Math.max(0,height-editorHeader.outerHeight())),editorFooter&&(height=Math.max(0,height-editorFooter.outerHeight())),textarea.css("height",height+"px")}else editor.addClass(options.height);this.$editor=editor,this.$textarea=textarea,this.$editable=editable,this.$oldContent=this.getContent(),this.__setListener(),this.$editor.attr("id",(new Date).getTime()),this.$editor.on("click",'[data-provider="bootstrap-markdown"]',$.proxy(this.__handle,this)),(this.$element.is(":disabled")||this.$element.is("[readonly]"))&&(this.$editor.addClass("md-editor-disabled"),this.disableButtons("all")),this.eventSupported("keydown")&&"object"==typeof jQuery.hotkeys&&editorHeader.find('[data-provider="bootstrap-markdown"]').each(function(){var $button=$(this),hotkey=$button.attr("data-hotkey");""!==hotkey.toLowerCase()&&textarea.bind("keydown",hotkey,function(){return $button.trigger("click"),!1})}),"preview"===options.initialstate?this.showPreview():"fullscreen"===options.initialstate&&options.fullscreen.enable&&this.setFullscreen(!0)}else this.$editor.show();return options.autofocus&&(this.$textarea.focus(),this.$editor.addClass("active")),options.fullscreen.enable&&options.fullscreen!==!1&&(this.$editor.append('          <div class="md-fullscreen-controls">            <a href="#" class="exit-fullscreen" title="Exit fullscreen"><span class="'+this.__getIcon(options.fullscreen.icons.fullscreenOff)+'"></span></a>          </div>'),this.$editor.on("click",".exit-fullscreen",function(e){e.preventDefault(),instance.setFullscreen(!1)})),this.hideButtons(options.hiddenButtons),this.disableButtons(options.disabledButtons),options.onShow(this),this.showPreview(),this},parseContent:function(){var content,callbackContent=this.$options.onPreview(this),converter=new Showdown.converter({extensions:["table"]});if("string"==typeof callbackContent)content=callbackContent;else{var val=this.$textarea.val();$("<div>");content="object"==typeof markdown?converter.makeHtml(val):"function"==typeof marked?converter.makeHtml(val):converter.makeHtml(val)}return content},showPreview:function(){var container=(this.$options,this.$textarea);container.next(),$("<div/>",{"class":"md-preview","data-provider":"markdown-preview"});return this.$isPreview=!0,$.post(gon.api_host+"/api/articles/sanitize",{content:this.parseContent()}).done(function(c0){var c1=addLanguageToCodeClass(c0.content),c2=changeYoutubeToImg(c1),c3=addClassToTable(c2);document.getElementsByClassName("preview").length>0&&(document.getElementsByClassName("preview")[0].innerHTML=c3,Prism.highlightAll()),$("table").wrap("<div class='table-container'></div>")}),this},hidePreview:function(){this.$isPreview=!1;var container=this.$editor.find('div[data-provider="markdown-preview"]');return container.remove(),this.enableButtons("all"),this.disableButtons(this.$options.disabledButtons),this.$textarea.show(),this.__setListener(),this},isDirty:function(){return this.$oldContent!=this.getContent()},getContent:function(){return this.$textarea.val()},setContent:function(content){return this.$textarea.val(content),this},findSelection:function(chunk){var startChunkPosition,content=this.getContent();if(startChunkPosition=content.indexOf(chunk),startChunkPosition>=0&&chunk.length>0){var selection,oldSelection=this.getSelection();return this.setSelection(startChunkPosition,startChunkPosition+chunk.length),selection=this.getSelection(),this.setSelection(oldSelection.start,oldSelection.end),selection}return null},getSelection:function(){var e=this.$textarea[0];return("selectionStart"in e&&function(){var l=e.selectionEnd-e.selectionStart;return{start:e.selectionStart,end:e.selectionEnd,length:l,text:e.value.substr(e.selectionStart,l)}}||function(){return null})()},setSelection:function(start,end){var e=this.$textarea[0];return("selectionStart"in e&&function(){e.selectionStart=start,e.selectionEnd=end}||function(){return null})()},replaceSelection:function(text){var e=this.$textarea[0];return("selectionStart"in e&&function(){return e.value=e.value.substr(0,e.selectionStart)+text+e.value.substr(e.selectionEnd,e.value.length),e.selectionStart=e.value.length,this}||function(){return e.value+=text,jQuery(e)})()},getNextTab:function(){if(0==this.$nextTab.length)return null;var nextTab,tab=this.$nextTab.shift();return"function"==typeof tab?nextTab=tab():"object"==typeof tab&&tab.length>0&&(nextTab=tab),nextTab},setNextTab:function(start,end){if("string"==typeof start){var that=this;this.$nextTab.push(function(){return that.findSelection(start)})}else if("number"==typeof start&&"number"==typeof end){var oldSelection=this.getSelection();this.setSelection(start,end),this.$nextTab.push(this.getSelection()),this.setSelection(oldSelection.start,oldSelection.end)}},__parseButtonNameParam:function(nameParam){var buttons=[];return buttons="string"==typeof nameParam?nameParam.split(","):nameParam},enableButtons:function(name){var buttons=this.__parseButtonNameParam(name),that=this;return $.each(buttons,function(i){that.__alterButtons(buttons[i],function(el){el.removeAttr("disabled")})}),this},disableButtons:function(name){var buttons=this.__parseButtonNameParam(name),that=this;return $.each(buttons,function(i){that.__alterButtons(buttons[i],function(el){el.attr("disabled","disabled")})}),this},hideButtons:function(name){var buttons=this.__parseButtonNameParam(name),that=this;return $.each(buttons,function(i){that.__alterButtons(buttons[i],function(el){el.addClass("hidden")})}),this},showButtons:function(name){var buttons=this.__parseButtonNameParam(name),that=this;return $.each(buttons,function(i){that.__alterButtons(buttons[i],function(el){el.removeClass("hidden")})}),this},eventSupported:function(eventName){var isSupported=eventName in this.$element;return isSupported||(this.$element.setAttribute(eventName,"return;"),isSupported="function"==typeof this.$element[eventName]),isSupported},keyup:function(e){var blocked=!1;switch(e.keyCode){case 40:case 38:case 16:case 17:case 18:break;case 9:var nextTab;if(nextTab=this.getNextTab(),null!=nextTab){var that=this;setTimeout(function(){that.setSelection(nextTab.start,nextTab.end)},500),blocked=!0}else{var cursor=this.getSelection();cursor.start==cursor.end&&cursor.end==this.getContent().length?blocked=!1:(this.setSelection(this.getContent().length,this.getContent().length),blocked=!0)}break;case 13:blocked=!1;break;case 27:this.$isFullscreen&&this.setFullscreen(!1),blocked=!1;break;default:blocked=!1}blocked&&(e.stopPropagation(),e.preventDefault()),this.$options.onChange(this),this.showPreview()},change:function(){return this.$options.onChange(this),this},focus:function(){var options=this.$options,editor=(options.hideable,this.$editor);return editor.addClass("active"),$(document).find(".md-editor").each(function(){if($(this).attr("id")!=editor.attr("id")){var attachedMarkdown;attachedMarkdown=$(this).find("textarea").data("markdown"),null==attachedMarkdown&&(attachedMarkdown=$(this).find('div[data-provider="markdown-preview"]').data("markdown")),attachedMarkdown&&attachedMarkdown.blur()}}),options.onFocus(this),this},blur:function(){var options=this.$options,isHideable=options.hideable,editor=this.$editor,editable=this.$editable;if(editor.hasClass("active")||0==this.$element.parent().length){if(editor.removeClass("active"),isHideable)if(null!=editable.el){var oldElement=$("<"+editable.type+"/>"),content=this.getContent(),currentContent="object"==typeof markdown?markdown.toHTML(content):content;$(editable.attrKeys).each(function(k){oldElement.attr(editable.attrKeys[k],editable.attrValues[k])}),oldElement.html(currentContent),editor.replaceWith(oldElement)}else editor.hide();options.onBlur(this)}return this}};var old=$.fn.markdown;$.fn.markdown=function(option){return this.each(function(){var $this=$(this),data=$this.data("markdown"),options="object"==typeof option&&option;data||$this.data("markdown",data=new Markdown(this,options))})},$.fn.markdown.messages={},$.fn.markdown.defaults={autofocus:!1,hideable:!1,savable:!1,width:"inherit",height:"inherit",resize:"none",iconlibrary:"fa",language:"en",initialstate:"editor",buttons:[[{name:"groupFont",data:[{name:"cmdBold",hotkey:"Ctrl+B",title:"Bold",icon:{glyph:"glyphicon glyphicon-bold",fa:"fa fa-bold","fa-3":"icon-bold",fi:"fi fi-bold"},callback:function(e){var chunk,cursor,selected=e.getSelection(),content=e.getContent();chunk=0==selected.length?e.__localize("strong text"):selected.text,"**"==content.substr(selected.start-2,2)&&"**"==content.substr(selected.end,2)?(e.setSelection(selected.start-2,selected.end+2),e.replaceSelection(chunk),cursor=selected.start-2):(e.replaceSelection("**"+chunk+"**"),cursor=selected.start+2),e.setSelection(cursor,cursor+chunk.length)}},{name:"cmdItalic",title:"Italic",hotkey:"Ctrl+I",icon:{glyph:"glyphicon glyphicon-italic",fa:"fa fa-italic","fa-3":"icon-italic",fi:"fi fi-italic"},callback:function(e){var chunk,cursor,selected=e.getSelection(),content=e.getContent();chunk=0==selected.length?e.__localize("emphasized text"):selected.text,"_"==content.substr(selected.start-1,1)&&"_"==content.substr(selected.end,1)?(e.setSelection(selected.start-1,selected.end+1),e.replaceSelection(chunk),cursor=selected.start-1):(e.replaceSelection("_"+chunk+"_"),cursor=selected.start+1),e.setSelection(cursor,cursor+chunk.length)}},{name:"cmdHeading",title:"Heading",hotkey:"Ctrl+H",icon:{glyph:"glyphicon glyphicon-header",fa:"fa fa-header","fa-3":"icon-font",fi:"fi fi-header"},callback:function(e){var chunk,cursor,pointer,prevChar,selected=e.getSelection(),content=e.getContent();chunk=0==selected.length?e.__localize("heading text"):selected.text+"\n",pointer=4,"## "==content.substr(selected.start-pointer,pointer)||(pointer=3,"##"==content.substr(selected.start-pointer,pointer))?(e.setSelection(selected.start-pointer,selected.end),e.replaceSelection(chunk),cursor=selected.start-pointer):selected.start>0&&(prevChar=content.substr(selected.start-1,1),!!prevChar&&"\n"!=prevChar)?(e.replaceSelection("\n\n## "+chunk),cursor=selected.start+5):(e.replaceSelection("## "+chunk),cursor=selected.start+3),e.setSelection(cursor,cursor+chunk.length)}}]},{name:"groupLink",data:[{name:"cmdUrl",title:"URL/Link",hotkey:"Ctrl+L",icon:{glyph:"glyphicon glyphicon-link",fa:"fa fa-link","fa-3":"icon-link",fi:"fi fi-link"},callback:function(e){var chunk,cursor,link,selected=e.getSelection();e.getContent();if(chunk=0==selected.length?e.__localize("enter link description here"):selected.text,link=prompt(e.__localize("Insert Hyperlink"),"http://"),null!=link&&""!=link&&"http://"!=link&&"http"==link.substr(0,4)){var sanitizedLink=$("<div>"+link+"</div>").text();e.replaceSelection("["+chunk+"]("+sanitizedLink+")"),cursor=selected.start+1,e.setSelection(cursor,cursor+chunk.length)}}},{name:"cmdImage",title:"Image",hotkey:"Ctrl+G",icon:{glyph:"glyphicon glyphicon-picture",fa:"fa fa-picture-o","fa-3":"icon-picture",fi:"icon-picture"},callback:function(e){var chunk,cursor,link,selected=e.getSelection();e.getContent();chunk=0==selected.length?e.__localize("enter image description here"):selected.text,filepicker.pick(function(InkBlob){if(link=InkBlob.url,null!=link&&""!=link&&"http://"!=link&&"http"==link.substr(0,4)){var sanitizedLink=$("<div>"+link+"</div>").text();e.replaceSelection("!["+chunk+"]("+sanitizedLink+' "'+e.__localize("enter image title here")+'")'),cursor=selected.start+2,e.setNextTab(e.__localize("enter image title here")),e.setSelection(cursor,cursor+chunk.length),e.showPreview()}})}},{name:"cmdYoutube",title:"Youtube",hotkey:"Ctrl+Y",icon:{glyph:"glyphicon glyphicon-link",fa:"fa fa-youtube","fa-3":"icon-link",fi:"fi fi-link"},callback:function(e){var chunk,cursor,youtubeID,selected=e.getSelection();e.getContent();if(chunk=0==selected.length?e.__localize("youtube"):selected.text,youtubeID=prompt(e.__localize("Insert Youtube ID"),""),null!=youtubeID&&""!=youtubeID){var sanitizedLink=$("<div>"+youtubeID+"</div>").text();e.replaceSelection("{"+chunk+"}("+sanitizedLink+")"),cursor=selected.start+1,e.setSelection(cursor+sanitizedLink.length+11,cursor+sanitizedLink.length+11),e.showPreview()}}}]},{name:"groupMisc",data:[{name:"cmdList",hotkey:"Ctrl+U",title:"Unordered List",icon:{glyph:"glyphicon glyphicon-list",fa:"fa fa-list","fa-3":"icon-list-ul",fi:"fi-list"},callback:function(e){var chunk,cursor,selected=e.getSelection();e.getContent();if(0==selected.length)chunk=e.__localize("list text here"),e.replaceSelection("- "+chunk),cursor=selected.start+2;else if(selected.text.indexOf("\n")<0)chunk=selected.text,e.replaceSelection("- "+chunk),cursor=selected.start+2;else{var list=[];list=selected.text.split("\n"),chunk=list[0],$.each(list,function(k,v){list[k]="- "+v}),e.replaceSelection("\n\n"+list.join("\n")),cursor=selected.start+4}e.setSelection(cursor,cursor+chunk.length)}},{name:"cmdListO",hotkey:"Ctrl+O",title:"Ordered List",icon:{glyph:"glyphicon glyphicon-th-list",fa:"fa fa-list-ol","fa-3":"icon-list-ol",fi:"fi-list-number"},callback:function(e){var chunk,cursor,selected=e.getSelection();e.getContent();if(0==selected.length)chunk=e.__localize("list text here"),e.replaceSelection("1. "+chunk),cursor=selected.start+3;else if(selected.text.indexOf("\n")<0)chunk=selected.text,e.replaceSelection("1. "+chunk),cursor=selected.start+3;else{var list=[];list=selected.text.split("\n"),chunk=list[0],$.each(list,function(k,v){list[k]="1. "+v}),e.replaceSelection("\n\n"+list.join("\n")),cursor=selected.start+5}e.setSelection(cursor,cursor+chunk.length)}},{name:"cmdCode",hotkey:"Ctrl+K",title:"Code",icon:{glyph:"glyphicon glyphicon-asterisk",fa:"fa fa-code","fa-3":"icon-code",fi:"icon-code"},callback:function(e){var chunk,cursor,selected=e.getSelection(),content=e.getContent();chunk=0==selected.length?e.__localize("code text here"):selected.text,"```\n"===content.substr(selected.start-4,4)&&"\n```"===content.substr(selected.end,4)?(e.setSelection(selected.start-4,selected.end+4),e.replaceSelection(chunk),cursor=selected.start-4):"`"===content.substr(selected.start-1,1)&&"`"===content.substr(selected.end,1)?(e.setSelection(selected.start-1,selected.end+1),e.replaceSelection(chunk),cursor=selected.start-1):content.indexOf("\n")>-1?(e.replaceSelection("```\n"+chunk+"\n```"),cursor=selected.start+4):(e.replaceSelection("`"+chunk+"`"),cursor=selected.start+1),e.setSelection(cursor,cursor+chunk.length)}},{name:"cmdQuote",hotkey:"Ctrl+Q",title:"Quote",icon:{glyph:"glyphicon glyphicon-comment",fa:"fa fa-quote-left","fa-3":"icon-quote-left",fi:"fi icon-quote-left"},callback:function(e){var chunk,cursor,selected=e.getSelection();e.getContent();if(0==selected.length)chunk=e.__localize("quote here"),e.replaceSelection("> "+chunk),cursor=selected.start+2;else if(selected.text.indexOf("\n")<0)chunk=selected.text,e.replaceSelection("> "+chunk),cursor=selected.start+2;else{var list=[];list=selected.text.split("\n"),chunk=list[0],$.each(list,function(k,v){list[k]="> "+v}),e.replaceSelection("\n\n"+list.join("\n")),cursor=selected.start+4}e.setSelection(cursor,cursor+chunk.length)}}]}]],additionalButtons:[],reorderButtonGroups:[],hiddenButtons:[],disabledButtons:[],footer:"",fullscreen:{enable:!1,icons:{fullscreenOn:{fa:"fa fa-expand",glyph:"glyphicon glyphicon-fullscreen","fa-3":"icon-resize-full"},fullscreenOff:{fa:"fa fa-compress",glyph:"glyphicon glyphicon-fullscreen","fa-3":"icon-resize-small"}}},onShow:function(){},onPreview:function(){},onSave:function(){},onBlur:function(){},onFocus:function(){},onChange:function(){},onFullscreen:function(){}},$.fn.markdown.Constructor=Markdown,$.fn.markdown.noConflict=function(){return $.fn.markdown=old,this};var initMarkdown=function(el){var $this=el;return $this.data("markdown")?void $this.data("markdown").showEditor():void $this.markdown()},blurNonFocused=function(){var $activeElement=$(document.activeElement);$(document).find(".md-editor").each(function(){var $this=$(this),focused=$activeElement.closest(".md-editor")[0]===this,attachedMarkdown=$this.find("textarea").data("markdown")||$this.find('div[data-provider="markdown-preview"]').data("markdown");attachedMarkdown&&!focused&&attachedMarkdown.blur()})},addClassToTable=function(val){return val.replace(/<table>/g,'<table class="table table-bordered">')},addLanguageToCodeClass=function(val){return val.replace(/code class="([^"]+)"/g,'code class="language-$1 $1"')},changeYoutubeToImg=function(val){return val.replace(/<p>{youtube}\((.+?)\)<\/p>/g,'<img class="YoutubeImage" src="http://img.youtube.com/vi/$1/0.jpg" alt="" width="100%" height="auto">')};$(document).on("click.markdown.data-api",'[data-provide="markdown-editable"]',function(e){initMarkdown($(this)),e.preventDefault()}).on("click focusin",function(e){blurNonFocused(e)}).ready(function(){$('textarea[data-provide="markdown"]').each(function(){initMarkdown($(this))})})}(window.jQuery);