/**
 * addNewStock
 * @return {[type]}   [description]
 */
var addNewStock = (function() {
    var valus = document.querySelectorAll('.addbar input');

    return function() {
        var res = getValues();
        if (res) {
            ajax({
                'url': 'http://hq.sinajs.cn/list=' + res.code,
                'success': function(data) {
                    // console.log(data);
                    var data = /\".*?\"/.exec(data)[0];
                    data = data.replace('"', '');
                    data = data.split(',');
                    if (data.length > 5) {
                        localStorage.setItem(res.code, data[0] + '_' + res.count + '_' + res.cost);
                    }
                    showData();
                }
            });
        } else {
            // alert('请填入正确的数据')
        }
    }

    /**
     * get Values
     * @return {Object} the date object
     */
    function getValues() {
        var obj = {};
        for (var i = 0; i < valus.length; i++) {
            var val = valus[i].value;
            obj[valus[i].getAttribute('name')] = val;
        }
        return obj;
    }
})();


/**
 * [description]
 * @param  {[type]} ) {               return function() {        console.log(this.value)    }})( [description]
 * @return {[type]}   [description]
 */
var codeKeyUp = (function() {
    var timeOutId;
    var suggsetBar = document.querySelector('.suggestBar');
    return function() {
        var val = this.value;
        clearTimeout(timeOutId);
        timeOutId = setTimeout(function() {
            ajax({
                'url': 'http://suggest3.sinajs.cn/suggest/type=&key=' + val + '&name=suggestdata_' + +new Date(),
                'success': function(data) {
                    var sList = /\".*?\"/.exec(data)[0].split(';');
                    var html = '';
                    for (var i = 0; i < sList.length; i++) {
                        if (i == 5) {
                            break;
                        }
                        var info = sList[i].split(',');
                        if (info[3] && info[4]) {
                            html += '<p code="' + info[3] + '">' + info[3] + ' ' + info[4] + '</p>';
                        }
                    }
                    suggsetBar.innerHTML = html;
                    suggsetBar.style.display = 'block';
                }
            });
        }, 500);
    }
})();


/**
 * show Data base on the data
 * @param  {[type]} ) {               var mainArae [description]
 * @return {[type]}   [description]
 */
var showData = (function() {
    var mainArae = document.getElementById('mainArae');
    return function() {

        var stocksInfo = getStockFromLocal();

        ajax({
            'url': 'http://hq.sinajs.cn/list=' + stocksInfo.idStr,
            'success': function(data) {

                var rest = data.match(/\".*?\"/g);

                var retData = {};

                for (var i = 0; i < rest.length; i++) {
                    var rests = rest[i].replace('"', '').split(',');
                    retData[rests[0]] = retData[rests[0]] || {};
                    retData[rests[0]].price = rests[3];
                    retData[rests[0]].yesterday = rests[2];
                }

                var newObj = stocksInfo.obj;
                for (var i in newObj) {
                    var name = newObj[i].name;
                    console.log(name, retData);
                    newObj[i].price = retData[name].price;
                    newObj[i].yesterday = retData[name].yesterday;
                }

                showIt(newObj)
            }
        });

    }

    function showIt(data) {

        var trs = mainArae.querySelectorAll('tr');

        for (var i = 1; i < trs.length; i++) {
            mainArae.removeChild(trs[i]);
        };

        for (var i in data) {
            var theData = data[i]
            var tr = document.createElement('tr');

            var innerTr = '';

            var nameId = theData.name + '<br>' + i;
            var holdTotal = parseInt(theData.hold) + '<br>' + (theData.hold * theData.price).toFixed(2);
            var range = (theData.price - theData.yesterday) / theData.yesterday;
            var rangePercent = (theData.cost * range * theData.hold).toFixed(2) + '<br>' + (range * 100).toFixed(2) + '%';
            var holePrice = theData.cost + '<br>' + theData.price;

            innerTr += '<td>' + nameId + '</td>' + '<td>' + holdTotal + '</td>' + '<td>' + rangePercent + '</td>' + '<td>' + holePrice + '</td>';
            tr.innerHTML = innerTr;
            tr.setAttribute('class', range > 0 ? 'up' : 'down');

            mainArae.appendChild(tr);

        }
    }

    function getStockFromLocal() {
        var ids = [];
        var obj = {};
        for (var i in localStorage) {
            var name = localStorage[i].split('_');
            obj[i] = obj[i] || {};
            obj[i].name = name[0];
            obj[i].hold = name[1] || 0;
            obj[i].cost = name[2] || 0;
            ids.push(i);
        }
        return {
            'obj': obj,
            'idStr': ids.join(',')
        };
    }
})();

/**
 * ajax
 * @param  {String} obj.url [description]
 * @param  {String} obj.method [description]
 * @param  {String} obj.success [description]
 * @return {[type]}     [description]
 */
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

/**
 * sugClick
 * @param  {[type]} ) {               var stockCode [description]
 * @return {[type]}   [description]
 */
var sugClick = (function() {
    var stockCode = document.getElementById('stockCode');
    return function(event) {
        var target = event.target;
        if (target.tagName == 'P') {
            stockCode.value = target.getAttribute('code');
            this.style.display = 'none';
        } else {
            return false;
        }

    }
})();


(function() {
    //init

    //add new button
    var addBtn = document.getElementById('addnew');
    addBtn.addEventListener('click', addNewStock);

    //input stock
    var stockCode = document.getElementById('stockCode');
    stockCode.addEventListener('keyup', codeKeyUp);

    //choose stock
    var stockSug = document.querySelector('.suggestBar');
    stockSug.addEventListener('click', sugClick);


    showData();

})();
