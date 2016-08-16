// Copyright (c) 1999 - 2009 Sam Steingold <sds@gnu.org>
// This file is distributed under the GNU GPL (v2+).
// See <URL:http://www.gnu.org/copyleft/gpl.html> for further details.

function toSt(nn) { return (nn < 10 ? "0" : "") + nn.toString(); }

function date_string(da) {
  var dd = new Date(da);
  return dd.getFullYear() + "-" +
    toSt(dd.getMonth() + 1) + "-" +
    toSt(dd.getDate());
}

function date_time_string(dd) {
  var wd = new Array ("Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat");
  return date_string(dd) + " " + wd[dd.getDay()]
    + " " + toSt(dd.getHours()) + ":" + toSt(dd.getMinutes()) + ":"
    + toSt(dd.getSeconds()); // + " " + dd.getTimezoneOffset();
}

function with_tag(tag,text) { return "<"+tag+">"+text+"</"+tag+">"; }

var eventdate = new Date("January 1, 2000");

function countdown() {
  cl = document.clock;
  dd = new Date();
  count = Math.floor((eventdate.getTime() - dd.getTime())/1000);
  if(count <= 0) {
    cl.days.value  = "----";
    cl.hours.value = "--";
    cl.mins.value  = "--";
    cl.secs.value  = "--";
    return;
  }
  cl.secs.value  = toSt(count % 60);
  count =    Math.floor(count / 60);
  cl.mins.value  = toSt(count % 60);
  count =    Math.floor(count / 60);
  cl.hours.value = toSt(count % 24);
  count =    Math.floor(count / 24);
  cl.days.value  = toSt(count);

  document.today.string.value = date_time_string(dd);

  setTimeout("countdown()",1000);
}
/*
<!-- <script type="text/javascript" src="timedate.js"></script> -->
<body onload="countdown()">

<!--
<p><br><hr>

<p>In case you are worried about how much time you have to fix the
outstanding Y2K problems, here is the answer:

<p><center><form name="clock">
<table border=1>
<tr><td>Days:</td><td>Hours:</td><td>Mins:</td><td>Secs:</td></tr>
<tr><td><input name="days" size=4></td><td><input name="hours" size=3></td>
<td><input name="mins" size=3></td><td><input name="secs" size=3></td></tr>
</table></form>
<form name="today">Now: <input name="string" size = 40></form>
</center>

<p>I fully subsribe to the <a
href="http://www.gnu.org/software/year2000.html">FSF's position</a> on
the matter.
 -->
 */
function updated() {
  return "touched: "+with_tag("strong",date_string(document.lastModified));
}

function now() { return with_tag("strong",date_time_string(new Date())); }

var today_d = new Date();
var today_s = now();

function plural(x) { return (x==1 ? "" : "s"); }

function time_diff (d0,d1) {
  var diff_sec = Math.round((d1.getTime() - d0.getTime())/1000);
  if (diff_sec <= 0) return "<li>"+diff_sec+" seconds</li>";
  var tmp = diff_sec;
  var d_sec  = tmp % 60;
  tmp = Math.floor(tmp / 60);
  var d_min = tmp % 60;
  tmp = Math.floor(tmp / 60);
  var d_hour  = tmp % 24;
  tmp = Math.floor(tmp / 24);
  var d_day = tmp;
  var d_week = Math.floor(tmp / 7);
  var d_wday = tmp % 7;
  var day_diff = d1.getDate() - d0.getDate();
  var d_months = (d1.getYear()-d0.getYear())*12 +
                 d1.getMonth()-d0.getMonth() -
                 (day_diff>=0 ? 0 : 1);
  //                       De Ja Fe Mr Ap My Jn Jl Au Se Oc No
  var mon_len = new Array (31,31,28,31,30,31,30,31,31,30,31,30);
  var d_mon_day  = day_diff + (day_diff>=0 ? 0 : mon_len[d1.getMonth()]);
  var d_year = Math.floor(d_months / 12);
  var d_ye_mon = d_months % 12;
  var ret = "<ul><li>"+diff_sec+" second"+plural(diff_sec)+"</li>"+
    "<li>"+d_day+" day"+plural(d_day)+", "+d_hour+" hour"+plural(d_hour)+", "+
    d_min+" minute"+plural(d_min)+" and "+d_sec+" second"+plural(d_sec)+
    "</li>";
  if (d_week > 0)
    ret += with_tag("li",d_week+" week"+plural(d_week)+", "+d_wday+" day"+
                    plural(d_wday));
  if (d_months > 0)
    ret += with_tag("li",d_months+" month"+plural(d_months)+
                    (d_year > 0 ? " ("+d_year+" year"+plural(d_year)+" "+
                     d_ye_mon+" month"+plural(d_ye_mon)+")" : "")+
                    ", "+d_mon_day+" day"+plural(d_mon_day));
  return ret+"</ul>";
}
