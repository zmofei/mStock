function getStockFromLocal() {
    var ids = [];
    var obj = {};
    for (var i in localStorage) {
        var name = localStorage[i].split('_');
        if (!(name[0] != undefined && name[1] != undefined && name[2] != undefined)) {
            continue;
        }
        obj[i] = obj[i] || {};
        obj[i].name = name[0].toUpperCase();
        obj[i].hold = name[1] || 0;
        obj[i].cost = name[2] || 0;

        ids.push(i);

    }
    return {
        'obj': obj,
        'idStr': ids.join(',')
    };
}

var ajax = function(obj) {
    var xml = new XMLHttpRequest();
    xml.open(obj.method || 'get', obj.url);
    xml.send();
    xml.onreadystatechange = function() {
        if (xml.readyState === 4) {
            if (xml.status === 200) {
                obj.success && obj.success(xml.responseText);
            }
        }
    };
};

function getChange() {
    var stocksInfo = getStockFromLocal();

    // console.log(stocksInfo.idStr);
    if (stocksInfo.idStr !== '') {
        ajax({
            'url': 'http://hq.sinajs.cn/list=' + stocksInfo.idStr,
            'success': function(data) {

                var rest = data.match(/\".*?\"/g);

                var retData = {};

                var newObj = stocksInfo.obj;
                var ids = stocksInfo.idStr.split(',');
                // console.log(newObj);
                for (var i = 0; i < rest.length; i++) {
                    // console.log(,rest[i])
                    // =
                    var rests = rest[i].replace('"', '').split(',');
                    // retData[rests[0]] = retData[rests[0]] || {};
                    newObj[ids[i]].price = rests[3];
                    newObj[ids[i]].yesterday = rests[2];
                }

                showIt(newObj)
            }
        });
    }
};



function showIt(data) {
    var yesterday = 0,
        today = 0;
    for (var i in data) {
        var theData = data[i];
        console.log(theData.price, theData.hold)
        today += theData.price * theData.hold;
        yesterday += theData.yesterday * theData.hold;
    }
    var persent = ((today - yesterday) * 100 / yesterday).toFixed(2);
    persent = persent > 0 ? '+' + persent : persent;
    chrome.browserAction.setBadgeText({
        text: '' + persent
    })
};

getChange();
setInterval(function() {
    getChange();
}, 10000)
