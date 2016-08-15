!function(){var table=function(converter){var filter,tables={},style="text-align:left;";return tables.th=function(header){if(""===header.trim())return"";var id=header.trim().replace(/ /g,"_").toLowerCase();return'<th id="'+id+'" style="'+style+'">'+header+"</th>"},tables.td=function(cell){return'<td style="'+style+'">'+converter.makeHtml(cell)+"</td>"},tables.ths=function(){var out="",i=0,hs=[].slice.apply(arguments);for(i;i<hs.length;i+=1)out+=tables.th(hs[i])+"\n";return out},tables.tds=function(){var out="",i=0,ds=[].slice.apply(arguments);for(i;i<ds.length;i+=1)out+=tables.td(ds[i])+"\n";return out},tables.thead=function(){var out,hs=[].slice.apply(arguments);return out="<thead>\n",out+="<tr>\n",out+=tables.ths.apply(this,hs),out+="</tr>\n",out+="</thead>\n"},tables.tr=function(){var out,cs=[].slice.apply(arguments);return out="<tr>\n",out+=tables.tds.apply(this,cs),out+="</tr>\n"},filter=function(text){var line,hs,i=0,lines=text.split("\n"),out=[];for(i;i<lines.length;i+=1){if(line=lines[i],line.trim().match(/^[|]{1}.*[|]{1}$/)){line=line.trim();var tbl=[];if(tbl.push("<table>"),hs=line.substring(1,line.length-1).split("|"),tbl.push(tables.thead.apply(this,hs)),line=lines[++i],line.trim().match(/^[|]{1}[-=|: ]+[|]{1}$/)){for(line=lines[++i],tbl.push("<tbody>");line.trim().match(/^[|]{1}.*[|]{1}$/);)line=line.trim(),tbl.push(tables.tr.apply(this,line.substring(1,line.length-1).split("|"))),line=lines[++i];tbl.push("</tbody>"),tbl.push("</table>"),out.push(tbl.join("\n"));continue}line=lines[--i]}out.push(line)}return out.join("\n")},[{type:"lang",filter:filter}]};"undefined"!=typeof window&&window.Showdown&&window.Showdown.extensions&&(window.Showdown.extensions.table=table),"undefined"!=typeof module&&(module.exports=table)}();