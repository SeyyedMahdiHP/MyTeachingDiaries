window.ParsleyConfig=window.ParsleyConfig||{},function($){window.ParsleyConfig=$.extend(!0,{},window.ParsleyConfig,{validators:{minwords:function(val,nbWords){return val=val.replace(/(^\s*)|(\s*$)/gi,""),val=val.replace(/[ ]{2,}/gi," "),val=val.replace(/\n /,"\n"),val=val.split(" ").length,val>=nbWords},maxwords:function(val,nbWords){return val=val.replace(/(^\s*)|(\s*$)/gi,""),val=val.replace(/[ ]{2,}/gi," "),val=val.replace(/\n /,"\n"),val=val.split(" ").length,nbWords>=val},rangewords:function(val,obj){return val=val.replace(/(^\s*)|(\s*$)/gi,""),val=val.replace(/[ ]{2,}/gi," "),val=val.replace(/\n /,"\n"),val=val.split(" ").length,val>=obj[0]&&val<=obj[1]},greaterthan:function(val,elem,self){return self.options.validateIfUnchanged=!0,new Number(val)>new Number($(elem).val())},lessthan:function(val,elem,self){return self.options.validateIfUnchanged=!0,new Number(val)<new Number($(elem).val())},beforedate:function(val,elem){return Date.parse(val)<Date.parse($(elem).val())},afterdate:function(val,elem){return Date.parse($(elem).val())<Date.parse(val)},inlist:function(val,list,self){var delimiter=self.options.inlistDelimiter||",",listItems=(list+"").split(new RegExp("\\s*\\"+delimiter+"\\s*"));return-1!==listItems.indexOf(val.trim())},luhn:function(val){val=val.replace(/[ -]/g,"");var digit,n,sum,_j,_len1,_ref2;for(sum=0,_ref2=val.split("").reverse(),n=_j=0,_len1=_ref2.length;_len1>_j;n=++_j)digit=_ref2[n],digit=+digit,n%2?(digit*=2,sum+=10>digit?digit:digit-9):sum+=digit;return sum%10===0},americandate:function(val){if(!/^([01]?[0-9])[\.\/-]([0-3]?[0-9])[\.\/-]([0-9]{4}|[0-9]{2})$/.test(val))return!1;var parts=val.split(/[.\/-]+/),day=parseInt(parts[1],10),month=parseInt(parts[0],10),year=parseInt(parts[2],10);if(0==year||0==month||month>12)return!1;var monthLength=[31,28,31,30,31,30,31,31,30,31,30,31];return(year%400==0||year%100!=0&&year%4==0)&&(monthLength[1]=29),day>0&&day<=monthLength[month-1]}},messages:{minwords:"This value should have %s words at least.",maxwords:"This value should have %s words maximum.",rangewords:"This value should have between %s and %s words.",greaterthan:"This value should be greater than %s.",lessthan:"This value should be less than %s.",beforedate:"This date should be before %s.",afterdate:"This date should be after %s.",luhn:"This value should pass the luhn test.",americandate:"This value should be a valid date (MM/DD/YYYY)."}})}(window.jQuery||window.Zepto);