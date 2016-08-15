function Notification() {

    this.node = $('#notifier');
    this.header = $('#notifier .header');
    this.closeButton = $('#notifier .header button');
    this.effect = "scale";
    this.centerClass = "center"

    this.draggable = false;

    if (this.node) {
        this.height = this.node.outerHeight();
        this.width = this.node.outerWidth();
    }

    var minWindowTop, maxWindowTop;
    var minWindowLeft, maxWindowLeft;
    var startDragPointX = 0;
    var startDragPointY = 0;

    var self = this;

    this.hide = function (e) {
        self.preventDefault(e);
        self.node.hide(self.effect);
    };

    var controlHeight = function () {
        if ((self.node.height() + 15) > $(window).height()) {
            self.node.css({
                'top': (self.node.height() - $(window).height()) + 10
            });
        } else {
            self.node.css({
                'top': 0
            });
        }
    };

    this.show = function () {
        self.node.show(self.effect);
        setTimeout(controlHeight, 500);

        $(window).resize(function () {
            controlHeight();
        });
    };


    this.start = function (e) {
        self.preventDefault(e);
        maxWindowTop = $(window).height() + $(window).scrollTop() - self.height;
        maxWindowLeft = $(window).width() + $(window).scrollLeft() - self.width;
        minWindowTop = $(window).scrollTop();
        minWindowLeft = $(window).scrollLeft();
        startDragPointY = e.clientY;
        startDragPointX = e.clientX;
        self.top = self.node.offset().top;
        self.left = self.node.offset().left;
        self.draggable = true;
    }

    this.stop = function (e) {
        self.preventDefault(e);
        self.startDragPointX = 0;
        self.startDragPointY = 0;
        self.draggable = false;
    }

    this.move = function (top, left) {
        self.node.offset({
            top: top,
            left: left
        });
    }

    this.initialize = function () {
        self.closeButton.click(self.hide);
        self.header.mousedown(self.start);
        $(document).keydown(function (event) {
            if (event.keyCode == 27) {
                self.preventDefault(event);
                self.hide(event);
            }
        });
        $(document).mouseup(self.stop);
        self.header.css('cursor', 'move');
        $(document).mousemove(function (e) {
            if (self.draggable) {
                if (self.node.hasClass(self.centerClass)) {
                    self.node.removeClass(self.centerClass);
                }
                var deltaY = self.top + e.clientY - startDragPointY;
                var deltaX = self.left + e.clientX - startDragPointX;
                var top, left;
                top = deltaY < minWindowTop ? minWindowTop : deltaY > maxWindowTop ? maxWindowTop : deltaY
                left = deltaX < minWindowLeft ? minWindowLeft : deltaX > maxWindowLeft ? maxWindowLeft : deltaX
                self.move(top, left);
            }
        });
    };

    this.preventDefault = function (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }
};

$(document).ready(function () {

    var HOUR = 3600000;

    var CLICK_COUNT_COOKIE_NAME = "cacm_click_count";
    var NOTIFICATION_STATUS_COOKIE_NAME = "cacm_notification_status";

    var clickCount = parseInt(Cookie.getValue(CLICK_COUNT_COOKIE_NAME));
    var notificationStatus = parseInt(Cookie.getValue(NOTIFICATION_STATUS_COOKIE_NAME));

    var date = new Date(Date.now() + HOUR)

    if (isNaN(clickCount) || isNaN(notificationStatus)) {
        Cookie.add(CLICK_COUNT_COOKIE_NAME, 0, {path: "/", date: date});
        Cookie.add(NOTIFICATION_STATUS_COOKIE_NAME, 0, {path: "/", date: date});
        clickCount = 0;
        notificationStatus = 0;
    }

    if (clickCount > 4 && notificationStatus == 0) {
        notificationStatus = 1;
        Cookie.add(NOTIFICATION_STATUS_COOKIE_NAME, notificationStatus, {path: "/", date: date});
        var notification = new Notification();
        notification.initialize();
        notification.show();
    }


    $('a').click(function () {
        clickCount = clickCount + 1;
        Cookie.add(NOTIFICATION_STATUS_COOKIE_NAME, notificationStatus, {path: '/', date: date});
        Cookie.add(CLICK_COUNT_COOKIE_NAME, clickCount, {path: "/", date: date});
    });

});









