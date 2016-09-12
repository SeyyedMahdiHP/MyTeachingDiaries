var TPUtil = {

    createURL: function (srcURL, params) {
        "undefined" === typeof params && (params = {});
        var url = srcURL, data = [], prop;
        for (prop in params)
            data.push(prop + "=" + encodeURIComponent(params[prop]));

        0 < data.length && -1 < url.indexOf("?") ? url = url + "&" + data.join("&") : 0 < data.length && (url = url + "?" + data.join("&"));
        TPUtil.debug("createURL: " + url);
        return url
    },

    hasClass: function (element, cls) {
        return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
    },

    loadScript: function (srcURL, callback) {
        var elem = document.createElement("script");
        var callbackName = "_cb_" + TPUtil.uniqueString();
        var url = TPUtil.createURL(srcURL, {cb: callbackName});
        window[callbackName] = callback;
        elem.src = url;
        elem.type = "text/javascript";
        elem.async = true;
        document.getElementsByTagName("body")[0].appendChild(elem)
    },
    uniqueString: function () {
        var a = [], b = "0123456789ABCDEF".split(""), e;
        for (e = 0; 36 > e; e++)a[e] = 15 & 16 * Math.random();
        a[14] = 4;
        a[19] = a[19] & 3 | 8;
        for (e = 0; 36 > e; e++)a[e] = b[a[e]];
        return a.join("")
    },
    loadCSS: function (href) {
        var elem = document.createElement("link");
        elem.media = "screen";
        elem.rel = "stylesheet";
        elem.type = "text/css";
        elem.href = href;
        document.getElementsByTagName("body")[0].appendChild(elem)
    },

    getTarget: function (e) {
        if (e.target) targ = e.target;
        else if (e.srcElement) targ = e.srcElement;
        if (targ.nodeType == 3) // defeat Safari bug
            targ = targ.parentNode;
        return targ;
    },

    onPageReady: function (callback) {
        window.addEventListener ? "complete" === window.document.readyState ? callback() : window.addEventListener("load", callback, false) : window.attachEvent && window.attachEvent("onload", callback)
    },

    debug: function (msg) {
        return;
        if (typeof console != 'undefined' && typeof console.log != 'undefined') {
            console.log(msg);
        }
    },

    center: function(width, height){
        try {
            var left = (screen.width - width) / 2;
            var top = (screen.height - height) / 2;
            return {left:left, top:top};
        } catch (e) {
            TPUtil.debug(e);
            return {left:500, top:500};
        }
    },

    refreshPage: function () {
        window.location.reload();
    },

    exceedsGETLimits: function (str) {
        return str != null && (TPUtil.IE.Version() <= 7 && str.length > 2045) || (TPUtil.IE.Version() > 7 && str.length > 8093);
    },

    exceedsRequestLimit: function (requests) {
        var s = '';
        if (requests.length > 1)
            return true;
        for (var i = 0; i < requests.length; i++) {
            s += requests[i].getGUIDData();
            if (i > 0 && TPUtil.exceedsGETLimits(s))
                return true;
        }
        return false;
    },

    merge: function (obj1, obj2) {
        var arr = [];
        for (var i = 0; i < obj1.length; i++) {
            arr.push(obj1[i]);
        }
        for (var i = 0; i < obj2.length; i++) {
            arr.push(obj2[i]);
        }
        return arr;
    },

    setTokenCookie: function (name, value, expires) {
        if (typeof name == "undefined" || name == "")
            return;
        var domain = location.hostname;
        if (typeof value != "undefined") {
            this.setCookie(name, value, expires, '/', domain);
        } else {
            this.deleteCookie(name);
        }
    },

    setCookie: function (name, value, expires, path, domain, secure) {
        var today = new Date();
        today.setTime(today.getTime());

        var expires_date = new Date(today.getTime() + (expires));

        if (!domain) domain = location.hostname;

      if( domain.match(/\.herokuapp\.com/) ){
            domain = location.hostname;
        } else if (domain.match(/.*[.](uk\.com)$/)) {
            domain = domain.replace(/(.*[.]|^)(\w+[.]\w+[.]\w+)/, '.$2');
        } else if (domain.match(/.*[.](com|net|org|edu|gov|info|biz|cat|cl|eu|aero)$/)) {
            domain = domain.replace(/(.*[.]|^)(\w+[.]\w+)/, '.$2');
        }

        if (domain == 'localhost') domain = "";

        TPUtil.debug(name + "=" + encodeURI(value) +
                             ( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
                             ( ( path ) ? ";path=" + path : "" ) +
                             ( ( domain ) ? ";domain=" + domain : "" ) +
                             ( ( secure ) ? ";secure" : "" ));

        document.cookie = name + "=" + encodeURI(value) +
                ( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
                ( ( path ) ? ";path=" + path : "" ) +
                ( ( domain ) ? ";domain=" + domain : "" ) +
                ( ( secure ) ? ";secure" : "" );
    },

    deleteCookie: function (name) {
        document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        TPUtil.setCookie(name, "", -100, "/", null, false);
    },

    findCookiesByName: function(regex){
        var cookies = document.cookie.split(';');

        var names = [];

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].split('=');
            var cn = cookie[0].replace(/^\s+|\s+$/g, '');
            if (regex instanceof RegExp && regex.test(cn)) {
                names.push(cn);
            }
        }
        return names;
    },

    getCookie: function (name) {
        var cookies = document.cookie.split(';');

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].split('=');
            var cn = cookie[0].replace(/^\s+|\s+$/g, '');
            var cv = cookie.length > 1 ? this.trim(cookie[1]) : "";

            if (name instanceof RegExp && name.test(cn)) {
                return cv;
            } else if (cn == name) {
                return cv;
            }
        }
        return null;
    },

    trim: function (s) {
        return s && decodeURI(s.replace(/^\s+|\s+$/g, ''));
    },

    IE: {
        Version: function () {
            var version = 999;
            if (navigator.appVersion.indexOf("MSIE") != -1) version = parseFloat(navigator.appVersion.split("MSIE")[1]);
            return version;
        }
    },

    getElementsByClassName: function (node, classname) {
        var a = [];
        var re = new RegExp('(^| )' + classname + '( |$)');
        var els = node.getElementsByTagName("*");
        for (var i = 0, j = els.length; i < j; i++)
            if (re.test(els[i].className))
                a.push(els[i]);
        return a;
    }

};

var TPWebProxy = {
    ie: false,
    options: {'send_requests': true},
    ct: 0,

    olf: function (guid) {
        for (var i = 0; i < this.requests.length; i++) {
            if (this.requests[i].getGUID() == guid)
                TPWebProxy.embedRequest(this.requests[i]);
        }
    },

    nextID: function () {
        return "_tp_req_" + this.ct++;
    },

    embedRequest: function (req) {
        if (req.hasGUID()) {
            var t = document.getElementById('state' + req.getGUID());
            if (t == null || t.value != 'ok')
                return;
        }
        TPUtil.loadScript(req.buildURL());
    },


    findRequests: function (rid, name) {
        name = name || "request";
        var p1 = document.getElementsByTagName(name);
        if (p1.length == 0)
            p1 = document.getElementsByTagName("tp:" + name);

        var p2 = document.getElementsByTagName("tpxxxx");
        if (p1.length == 0 && document.getElementsByTagNameNS) {
            if (p2.length == 0)
                p2 = document.getElementsByTagNameNS("http://www.tinypass.com/NS", name);
        }

        elems = TPUtil.merge(p1, p2);
        if (TPWebProxy.ie && elems.length == 0) {
            elems = TPUtil.getElementsByClassName(document, 'tp-request');
        }

        if (TPWebProxy.ie && elems.length == 0) {
            elems = TPUtil.getElementsByClassName(document, 'tp-request');
        }

        if (rid) {
            var found = [];
            for (var i = 0; i < elems.length; i++) {
                if (elems[i].getAttribute("rid") == rid)
                    found.push(elems[i]);
            }
            return found;
        } else {
            return  elems;
        }

    },

    initRequests: function () {
        var elems = this.findRequests();
        var reqs = [];
        for (var i = 0; elems != null && i < elems.length; i++) {
            reqs.push(new tinypass.Request(elems[i]));
        }
        return reqs;
    },


    processRequests: function () {
        this.requests = this.initRequests();
        TPUtil.debug("Number of requests found on page:" + this.requests.length);

        if (this.options['send_requests']) {

            var bundle = null;
            if (this.requests.length > 1 && TPUtil.exceedsRequestLimit(this.requests)) {
                TPUtil.debug("Bundle:");

                bundle = new tinypass.Request(this.requests[0].elem);

                var data = "o=o";
                for (var i = 0; i < this.requests.length; i++) {
                    data += "&r=" + this.requests[i].attr("rdata");
                }

                bundle.getGUIDData = function () {
                    return data;
                }

                this.requests = [bundle];
            }

            for (var i = 0; i < this.requests.length; i++) {

                var req = this.requests[i];

                var url = req.buildURL();

                if (bundle || TPUtil.exceedsGETLimits(url)) {

                    (function (req) {

                        var formID = "reqform" + req.reqId;
                        var iframeID = "iframe" + req.reqId;
                        var guid = req.initGUID();

                        var tinypassform = document.createElement('div');
                        tinypassform.style.position = 'absolute';
                        tinypassform.style.visibility = 'hidden';
                        tinypassform.style.top = '-100px';
                        tinypassform.style.left = '-100px';
                        tinypassform.style.width = '0';
                        tinypassform.style.height = '0';
                        tinypassform.innerHTML = '<iframe onload="TPWebProxy.olf(\'' + guid + '\');" id="' + iframeID + '" name="' + iframeID + '" style="width:0;height:0;border:0"></iframe>' +
                                '<form id="' + formID + '" action="' + req.getDataRequestURL() + '" target="' + iframeID + '" method="post">' +
                                '<textarea name="data">' + req.getGUIDData() + '</textarea>' +
                                '<input type="hidden" name="guid" value="' + guid + '">' +
                                '<input type="hidden" id="state' + guid + '" value="' + guid + '">' +
                                '</form>';


                        var bodyel = document.getElementsByTagName('body')[0];
                        bodyel.appendChild(tinypassform);

                        document.getElementById(formID).submit();
                        document.getElementById('state' + guid).value = 'ok';

                    })(req);

                } else {
                    TPUtil.debug("Single request embed");
                    this.embedRequest(this.requests[i]);
                }


            }
        }

    }

}

if(typeof tinypass == "undefined")
    var tinypass = {};

tinypass.Request = function (elem) {
    this.reqId = TPWebProxy.nextID();
    this.elem = elem;
    this.elem.setAttribute("id", this.reqId);
}
tinypass.Request.prototype.attr = function (name) {
    return this.elem.getAttribute(name);
}
tinypass.Request.prototype.getRequestURL = function () {
    return this.elem.getAttribute('url') + '/jsapi/prepare.js';
}
tinypass.Request.prototype.getDataRequestURL = function () {
    return this.elem.getAttribute('url') + '/jsapi/data.js';
}
tinypass.Request.prototype.getGUIDData = function () {
    var s = 'r=' + this.attr('rdata');
    s += "&c=" + TPUtil.getCookie(this.getTokenCookieName());
    return s;
}
tinypass.Request.prototype.getTokenCookieName = function () {
    return this.attr("cn");
}
tinypass.Request.prototype.hasGUID = function () {
    return typeof this.reqGUID != 'undefined';
}
tinypass.Request.prototype.initGUID = function () {
    if (!this.hasGUID()) {
        this.reqGUID = this.reqId + "_" + Math.floor(Math.random() * 1000000).toString(36) + '_' + Math.floor(new Date().getTime()).toString(36);
    }
    return this.reqGUID;
}
tinypass.Request.prototype.getGUID = function () {
    if (this.hasGUID()) {
        return this.reqGUID;
    }
    return "";
}
tinypass.Request.prototype.buildURL = function () {
    if (this.hasGUID()) {
        return this.getRequestURL() +
                '?aid=' + this.attr("aid") +
                '&guid=' + this.getGUID() +
                '&v=' + this.attr("ver") +
                '&curl=' + encodeURIComponent(document.location);
    } else {
        return this.getRequestURL() +
                '?aid=' + this.attr("aid") +
                '&r=' + this.attr("rdata") +
                '&v=' + this.attr("ver") +
                "&c=" + TPUtil.getCookie(this.getTokenCookieName()) +
                '&curl=' + encodeURIComponent(document.location);
    }
}

var TinyPass = {};
TinyPass.AID = "";
TinyPass.ENV = "prod";
TinyPass.SANDBOX = false;

tinypass.logout = function () {
    var cns = TPUtil.findCookiesByName(/__TP*/);
    for(var i = 0; i < cns.length; i++){
        TPUtil.deleteCookie(cns[i]);
    }
    var cns = TPUtil.findCookiesByName(/umc_*/);
    for(var i = 0; i < cns.length; i++){
        TPUtil.deleteCookie(cns[i]);
    }

    TPUtil.loadScript(this.endpoint() + "logout", function(){});
}

tinypass.endpoint = function(){
    var endpoint = "https://api.tinypass.com/v2/jsapi/";
    if (TinyPass.SANDBOX === true || TinyPass.ENV == "sandbox")
        endpoint = "http://sandbox.tinypass.com/v2/jsapi/";
    if (TinyPass.ENV.indexOf("http://") == 0 || TinyPass.ENV.indexOf("https://") == 0 ) {
        endpoint = TinyPass.ENV
        if (endpoint.lastIndexOf('/') != endpoint.length - 1)
            endpoint += '/';
    }
    return endpoint;
}

tinypass.showOffer = function (params) {

    params = params || {};

    if (!params['aid'])
        params['aid'] = TinyPass.AID;

    var endpoint = tinypass.endpoint();

    params['rfr'] = document.location;

    var data = [];
    for (var prop in params) {
        data.push(prop + "=" + encodeURIComponent(params[prop]));
    }

    var popup_width = 680;
    var popup_height = 460;
    var position = TPUtil.center(popup_width, popup_height);
    var pos = ",top=" + position.top + ",left=" + position.left;

    if (TinyPassApi.tinypass_window != null) {
        try {
            TinyPassApi.tinypass_window.close();
            TinyPassApi.tinypass_window = null;
        } catch (e) {
        }
    }

    var poll = function () {
        if (TinyPassApi.tinypass_window && ( TinyPassApi.tinypass_window.closed || typeof TinyPassApi.tinypass_window.closed == 'undefined')) {
            while (TinyPassApi.tinypass_window_interval.length > 0)
                clearInterval(TinyPassApi.tinypass_window_interval.pop());
            TinyPassApi.poll_close();
        }
    };
    TinyPassApi.tinypass_window_interval.push(setInterval(poll, 500));
    TinyPassApi.poll_close = function(){};


    var loadingURL = endpoint.replace(/\/v2\/jsapi\//, '/tkt/ps/loading');
    TinyPassApi.tinypass_window = window.open(loadingURL, "tinypass_window", "scrollbars=1,status=0,toolbar=0,width=" + popup_width + ",height=" + popup_height + ",resizable=1,location=1" + pos);

    TPUtil.loadScript(endpoint + "initOffer?" + data.join("&"), function (initData) {
        if (initData['error_code']) {
            TinyPassApi.tinypass_window.location.replace(initData['error_url']);
            if (typeof params['onError'] == 'function')
                params['onError'](initData['message']);
        } else {

            var url = initData['auth_url'];
            var width = initData['popup_width'];
            var height = initData['popup_height'];
            var check_url = initData['check_url'];

            TinyPassApi.poll_close = function () {
                //on-close
                TPUtil.loadScript(check_url, function (checkResponse) {
                    if (checkResponse['state'] && checkResponse['state'] == 'granted') {
                        if (typeof params['onAccessGranted'] == 'function')
                            params['onAccessGranted'](checkResponse);
                        else
                            TPUtil.refreshPage();
                    }

                })

            };

            TinyPassApi.showTicket2_5(url, width, height, TinyPassApi.poll_close)
        }
    })


}

tinypass.showLogin = function (params) {

    params = params || {};

    if (!params['aid'])
        params['aid'] = TinyPass.AID;

    var endpoint = tinypass.endpoint();

    params['rfr'] = document.location;

    var data = [];
    for (var prop in params) {
        data.push(prop + "=" + encodeURIComponent(params[prop]));
    }

    var popup_width = 680;
    var popup_height = 460;
    var position = TPUtil.center(popup_width, popup_height);
    var pos = ",top=" + position.top + ",left=" + position.left;

    if (TinyPassApi.tinypass_window != null) {
        try {
            TinyPassApi.tinypass_window.close();
            TinyPassApi.tinypass_window = null;
        } catch (e) {
        }
    }

    var poll = function () {
        if (TinyPassApi.tinypass_window && ( TinyPassApi.tinypass_window.closed || typeof TinyPassApi.tinypass_window.closed == 'undefined')) {
            while (TinyPassApi.tinypass_window_interval.length > 0)
                clearInterval(TinyPassApi.tinypass_window_interval.pop());
            TinyPassApi.poll_close();
        }
    };
    TinyPassApi.tinypass_window_interval.push(setInterval(poll, 500));
    TinyPassApi.poll_close = function(){};


    var loadingURL = endpoint.replace(/\/v2\/jsapi\//, '/tkt/ps/loading');
    TinyPassApi.tinypass_window = window.open(loadingURL, "tinypass_window", "scrollbars=1,status=0,toolbar=0,width=" + popup_width + ",height=" + popup_height + ",resizable=1,location=1" + pos);

    TPUtil.loadScript(endpoint + "initOffer?" + data.join("&"), function (initData) {
        if (initData['error_code']) {
            TinyPassApi.tinypass_window.location.replace(initData['error_url']);
            if (typeof params['onError'] == 'function')
                params['onError'](initData['message']);
        } else {

            var url = initData['login_url'];
            var width = initData['popup_width'];
            var height = initData['popup_height'];
            var check_url = initData['check_url'];

            TinyPassApi.poll_close = function () {
                //on-close
                TPUtil.loadScript(check_url, function (checkResponse) {
                    if (checkResponse['state'] && checkResponse['state'] == 'granted') {
                        if (typeof params['onAccessGranted'] == 'function')
                            params['onAccessGranted'](checkResponse);
                        else
                            TPUtil.refreshPage();
                    }

                })

            };

            TinyPassApi.showTicket2_5(url, width, height, TinyPassApi.poll_close)
        }
    })


}

var TinyPassApi = {
    tinypass_window: null,
    tinypass_window_interval: [],
    showing_ticket: false,

    firePrepareEvent: function (state, elem) {
        try {
            if (typeof tpOnPrepare == 'function')
                tpOnPrepare(state, elem);
        } catch (e) {
        }
    },

    findCallback: function (cb) {

        var p = [cb, "tpOnCheckAccess"];
        for (var i = 0; i < p.length; i++) {
            var cbName = p[i];
            if (cbName == "") continue;
            if (eval('typeof ' + cbName) == 'function') {
                return eval(cbName);
            }
        }
        return null;
    },

    findButtonSlot: function (rid) {
        var elems = TPWebProxy.findRequests(rid);
        var elem;

        if (elems.length > 0) {
            for (var i = 0; i < elems.length; i++) {
                elem = elems[i];
                if (elem.getAttribute("status") != "loaded") {
                    if (elem.getAttribute("rid") == rid) {
                        if (elem.getAttribute("link")) {
                            return {elem: elem, type: 'link', text: elem.getAttribute('link')};
                        } else if (elem.getAttribute("custom")) {
                            return {elem: elem, type: 'custom', html: elem.getAttribute('custom')};
                        } else {
                            return {elem: elem, type: 'button'};
                        }
                    }
                }
            }
        }

        elem = document.getElementById(rid);
        if (elem == null)
            elem = document.createElement("span");
        return {elem: elem, type: 'button'};
    },

    doCheckRequest: function (url, tcn) {
        var checkURL = url.replace(/auth\?|login\?/, 'check?');
        if (checkURL.indexOf('&c=') < 0) {
            var c = TPUtil.getCookie(tcn);
            if (!TPUtil.exceedsGETLimits(checkURL + c)) {
                checkURL += '&c=' + c;
            } else {
                checkURL += '&msg=CTL';
            }
        }
        TPUtil.loadScript(checkURL);
    },

    buttonClickedOld: function (e) {
        var parent = this;

        (function () {
            var reqData = parent.reqData;
            var url = reqData.auth_url;
            TinyPassApi.showTicket2(url, reqData.popup_width, reqData.popup_height, function () {
                TinyPassApi.doCheckRequest(reqData.auth_url, reqData.tcn)
            });
        })();
        return false;
    },

    buttonClicked: function (e) {
        if (!e) var e = window.event;
        var target = TPUtil.getTarget(e);

        e.cancelBubble = true;
        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();
        e.returnValue = false;

        var parent = target.parentNode;
        while (!parent.reqData) {
            parent = parent.parentNode;
        }

        if (TPUtil.hasClass(target, "tp_button_click") || TPUtil.hasClass(target, "tp_login_click")) {
            (function () {
                var reqData = parent.reqData;
                var url = TPUtil.hasClass(target, "tp_button_click") ? reqData.auth_url : reqData.login_url;
                TinyPassApi.showTicket2(url, reqData.popup_width, reqData.popup_height, function () {
                    TinyPassApi.doCheckRequest(reqData.auth_url, reqData.tcn)
                });
            })();

        }

    },

    showTicket2: function (url, width, height, onClose) {

        if (TinyPassApi.showing_ticket)
            return;

        TinyPassApi.showing_ticket = true;

        if (TinyPassApi.tinypass_window != null) {
            try {
                onClose();
                TinyPassApi.tinypass_window.close();
                TinyPassApi.tinypass_window = null;
            } catch (e) {
            }
        }

        var pos = '';
        try {
            var popup_width = width.replace(/px/g, '');
            var popup_height = height.replace(/px/g, '');
            var left = (screen.width - popup_width ) / 2;
            var top = (screen.height - popup_height) / 2;
            pos = ",top=" + top + ",left=" + left;
        } catch (e) {
            TPUtil.debug(e);
        }


        try {
            TinyPassApi.tinypass_window = window.open(url, "tinypass_window", "scrollbars=1,status=0,toolbar=0,width=" + width + ",height=" + height + ",resizable=1,location=1" + pos);
            var poll = function () {
                if (TinyPassApi.tinypass_window && ( TinyPassApi.tinypass_window.closed || typeof TinyPassApi.tinypass_window.closed == 'undefined')) {
                    while (TinyPassApi.tinypass_window_interval.length > 0)
                        clearInterval(TinyPassApi.tinypass_window_interval.pop());
                    onClose();
                }
            };
            TinyPassApi.tinypass_window_interval.push(setInterval(poll, 50));
            TinyPassApi.poll = poll;
        } catch (e) {

        }
        TinyPassApi.showing_ticket = false;
        return false;

    },

    showTicket2_5: function (url, width, height, onClose) {

        if (TinyPassApi.showing_ticket)
            return;

        TinyPassApi.showing_ticket = true;

        try {

            TinyPassApi.tinypass_window.location.replace(url);

            /*
            var poll = function () {
                if (TinyPassApi.tinypass_window && ( TinyPassApi.tinypass_window.closed || typeof TinyPassApi.tinypass_window.closed == 'undefined')) {
                   while (TinyPassApi.tinypass_window_interval.length > 0)
                        clearInterval(TinyPassApi.tinypass_window_interval.pop());
                    onClose();
                }
            };
            TinyPassApi.tinypass_window_interval.push(setInterval(poll, 500));
            TinyPassApi.poll = poll;

            */

        } catch (e) { }

        TinyPassApi.showing_ticket = false;

    },
    prepareResponse: function (reqData) {

        var tpButton = document.createElement('span');

        var slot = TinyPassApi.findButtonSlot(reqData.rid);

        try {
            slot.elem.innerHTML = '';
        } catch (e) {
            TPWebProxy.ie = true;
            var node = document.createElement("span");
            node.id = reqData.rid;
            node.rid = reqData.rid;
            node.className = 'tp-request';
            node.setAttribute("oncheckaccess", slot.elem.getAttribute("oncheckaccess"));
            slot.elem.parentElement.replaceChild(node, slot.elem);
            slot.elem = node;
        }

        var elem = slot.elem;

        if (slot.type == "link") {
            tpButton = document.createElement('a');
            tpButton.innerHTML = decodeURIComponent(slot.text);
            tpButton.setAttribute("href", "#");
            tpButton.className = "tinypass_button_slot tinypass_button_link";
            tpButton.onclick = this.buttonClickedOld;
        } else if (slot.type == "custom") {
            tpButton = document.createElement('a');
            tpButton.innerHTML = decodeURIComponent(slot.html);
            tpButton.setAttribute("href", "#");
            tpButton.className = "tinypass_button_slot tinypass_button_custom";
            tpButton.onclick = this.buttonClickedOld;
        } else {
            if ('http:' == document.location.protocol)
                reqData.button_tag = reqData.button_tag.replace(/https:/, 'http:');
            tpButton.innerHTML = reqData.button_tag;
            tpButton.className = "tinypass_button_slot";
            tpButton.onclick = this.buttonClicked;
        }

        tpButton.reqData = reqData;

        elem.appendChild(tpButton);
        TinyPassApi.firePrepareEvent(reqData, tpButton);
        elem.setAttribute("status", "loaded");

    },


    checkResponse: function (event) {

        var elems = TPWebProxy.findRequests(event.rid);

        var f = '__noop__';
        for (var i = 0; i < elems.length; i++) {
            if (elems[i].getAttribute("oncheckaccess")) {
                f = elems[i].getAttribute("oncheckaccess");
                break;
            }
        }

        f = this.findCallback(f);

        if (f == null && event.state == 'granted') {
            f = TPUtil.refreshPage;
        } else if (f == null) {
            f = function () {
            };
        }

        // this is in for IE 7/8
        if (window['purchaseCompleted']) {
            f = window['purchaseCompleted'];
        }

        f(event);

    },

    loginResponse: function (event) {
        if (TPWebProxy.requests == null || TPWebProxy.requests.length == 0)
            return;
        var elems = TPWebProxy.findRequests("", "login");
        var loginURL = event['loginURL'];
        var cn = event['tcn'];
        var aid = event['aid'];

        for (var i = 0; elems != null && i < elems.length; i++) {

            var tplogin = elems[i];
            var url = loginURL;
            var a = document.createElement("a");
            a.setAttribute("class", "tinypass_login_link");
            a.onclick = function () {
                TinyPassApi.showTicket2(url, "680px", "480px", function () {
                    TinyPassApi.doCheckRequest(url, cn);
                });
            }
            a.reqData = {auth_url: url, popup_width: "680px", popup_height: "460px", tcn: cn};
            a.innerHTML = tplogin.getAttribute('text') || tplogin.innerHTML || "Sign In";
            a.style.cursor = "pointer";
            tplogin.style.display = 'none';
            if (tplogin.parentElement)
                tplogin.parentElement.insertBefore(a, tplogin);
            else
                tplogin.parentNode.insertBefore(a, tplogin);

        }
    }

}

TPUtil.onPageReady(function () {
    TPWebProxy.processRequests();
    try {
        //IE problem
        if (typeof window.tinypassOnReady == 'function')
            window.tinypassOnReady();
    } catch (ex) {
    }
});

