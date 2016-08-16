// JScript File
function add(num) {
    document.getElementById(preid + "message").value += ("[«" + num + "»]");
}

function SetDirection(direct) {
    var d = document.getElementById(preid + "message");
    d.dir = direct;
    document.getElementById(preid + "direction").value = d.dir;
}

function checkValidation(fromMessage) {
    var d = document.getElementById(preid + "scoreNone");
    if (fromMessage)
        document.getElementById(preid + "SendScore").style.display = "none";
    if (d.checked) {
        if (fromMessage) {
            window.alert("لطفا نظر خود را در مورد این نوشته با انتخاب امتیاز مشخص نمایید");
        }
        else {
            window.alert("عدد امتیاز مشخص نشده است");
        }
        return false;
    }
    return true;
}

