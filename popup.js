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
                        var info = sList[i].split(',');
                        if (info[3] && info[4]) {
                            html += '<p sname="' + info[4] + '" code="' + info[3] + '">' + info[3] + ' ' + info[4] + '</p>';
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
    var nodate = document.querySelector('.nodate');
    return function() {

        var stocksInfo = getStockFromLocal();

        // console.log(stocksInfo.idStr);
        if (stocksInfo.idStr == '') {
            mainArae.style.display = "none";
            nodate.style.display = "block";
        } else {
            nodate.style.display = "none";
            mainArae.style.display = "block";
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


                    // console.log(stocksInfo.idStr, '@@', retData)

                    // for (var i in newObj) {
                    // var name = (newObj[i].name).toUpperCase();
                    // 
                    // newObj[i].price = retData[name].price;
                    // newObj[i].yesterday = retData[name].yesterday;
                    // }

                    showIt(newObj)
                }
            });
        }



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

            var totalView = (theData.price - theData.cost) * theData.hold;

            innerTr += '<td>' + nameId + '</td>' + '<td>' + holdTotal + '</td>' + '<td>' + (Math.ceil(totalView * 100) / 100).toFixed(2) + '</td>' + '<td>' + rangePercent + '</td>' + '<td>' + holePrice + '</td>';
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
    var addbar = document.querySelector('.addbar');
    var setList = document.querySelector('.setList');
    var stocklist = document.querySelector('.stocklist');
    return function(event) {
        var target = event.target;
        if (target.tagName == 'P') {
            var code = target.getAttribute('code');
            var name = target.getAttribute('sname');
            addbar.style.display = 'none';
            setList.style.display = 'block';

            var tr = document.createElement('tr');
            tr.innerHTML = '<tr><td><span>' + name + '</span><br><span>' + code + '</span></td><td><input type="text" style="width:60px;" value="0" /></td><td><input type="text" style="width:60px; " value="0"></td><td><a href="#">删除</a></td></tr>';
            stocklist.querySelector('tbody').appendChild(tr);
            // this.style.display = 'none';
        } else {
            return false;
        }

    }
})();

var setFn = (function() {
    var nodate = document.querySelector('.nodate');
    var setList = document.querySelector('.setList');
    var mainArae = document.querySelector('#mainArae');
    var mymoney = document.querySelector('.mymoney');
    var stocklist = document.querySelector('.stocklist');
    return function() {
        nodate.style.display = 'none';
        setList.style.display = 'block';
        mainArae.style.display = 'none';


        var tbody = stocklist.querySelector('tbody');
        var tbodyList = tbody.querySelectorAll('tr');
        for (var i = 1; i < tbodyList.length; i++) {
            tbody.removeChild(tbodyList[i]);
        }

        //my money
        mymoney.value = localStorage.getItem('mymoney') || 0;

        var tem = '';
        for (var i in localStorage) {
            if (/^(.+?)_(.+?)_(.+?)$/.test(localStorage[i])) {
                var infos = localStorage[i].split('_');
                var tr = document.createElement('tr');
                tr.innerHTML = '<td><span>' + infos[0] + '</span><br><span>' + i + '</span></td><td><input type="text" style="width:60px;" value="' + infos[1] + '" /></td><td><input type="text" style="width:60px; " value="' + infos[2] + '"></td><td><a href="#">删除</a></td>';
                tbody.appendChild(tr);
            }
        }
    }
})();

var addNewStocke = (function() {
    var setList = document.querySelector('.setList');
    var addbar = document.querySelector('.addbar');
    return function() {
        // console.log('ab')
        setList.style.display = 'none';
        addbar.style.display = 'block';
    }
})();

var storeAddOver = (function() {
    var mymoney = document.querySelector('.mymoney');
    var mainArae = document.querySelector('#mainArae');
    var setList = document.querySelector('.setList');
    return function() {
        for (var i in localStorage) {
            if (/^(.+?)_(.+?)_(.+?)$/.test(localStorage[i])) {
                localStorage.removeItem(i);
            }
        };

        localStorage.setItem('mymoney', mymoney.value);
        var stocklist = document.querySelector('.stocklist').querySelectorAll('tr');
        for (var i = 1; i < stocklist.length; i++) {
            var inps = stocklist[i].querySelectorAll('input');
            var spans = stocklist[i].querySelectorAll('span');
            var sname = spans[0].innerHTML;
            var scode = spans[1].innerHTML;
            var hold = inps[0].value;
            var cost = inps[1].value;
            localStorage.setItem(scode, sname + '_' + hold + '_' + cost);

        }
        showData();
        mainArae.style.display = 'block';
        setList.style.display = 'none';
    }
})();

var stocklistFn = (function() {

    return function(e) {

        if (e.target.tagName == 'A') {
            var tr = e.target.parentNode.parentNode;
            var trFather = e.target.parentNode.parentNode.parentNode;
            trFather.removeChild(tr);
        }
    };
})();


~(function() {
    //init

    //add new button
    // var addBtn = document.getElementById('addnew');
    // addBtn.addEventListener('click', addNewStock);

    //input stock
    var stockCode = document.getElementById('stockCode');
    stockCode.addEventListener('keyup', codeKeyUp);

    //choose stock
    var stockSug = document.querySelector('.suggestBar');
    stockSug.addEventListener('click', sugClick);

    var setting = document.querySelector('.setting button');
    setting.addEventListener('click', setFn);

    var addNewBtn = document.querySelector('.addNewStocke');
    addNewBtn.addEventListener('click', addNewStocke);

    var addover = document.querySelector('.addover');
    addover.addEventListener('click', storeAddOver);

    var stocklist = document.querySelector('.stocklist');
    stocklist.addEventListener('click', stocklistFn);

    showData();

})();
