/**
 * 工具类函数
 */
var tools:obj = {};

tools.param2Obj = function (url) {
    const search = url.split('?')[1];
    if (!search) {
        return {}
    }
    return JSON.parse('{"' + decodeURIComponent(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
}
/**
 * @memberOf tools
 * @function isEmptyObject
 * @param {Object} obj 传入一个对象
 * @return {Boolean}  false：非空对象  true: 空对象
 * @description 判断对象是否为空对象
 */
tools.isEmptyObject = function (obj) {
    for (var key in obj) {
        return false;
    }
    return true;
};
/**数据格式转换 将数组对象中的每个值取出放入数组中[[obj数据],[obj数据]] */
tools.formatJson = function (filterVal, jsonData) {
    return jsonData.map(v => filterVal.map(j => v[j]))
};


/**判断变量是否有正确的值 */
tools.validateValue = function (variable) {
    var result = true;
    if (typeof variable === "string") {
        if (variable === '' || variable === 'undefined' || variable === 'null' || variable === 'NaN' || variable === 'Infinity') {
            result = false;
        }
    }
}
/** 二进制相加，解析成十进制数组 */
tools.binaryArray = function (num) {
    let list = [];
    num.toString(2).split("").reverse().forEach((item, index) => {
        if (Number(item) * Math.pow(2, index) > 0) {
            list.push(Number(item) * Math.pow(2, index))
        }

    })
    return list
}


//判断变量是否有正确的值
tools.validateValue = function (variable) {
    var result = true;
    if (typeof variable === "string") {
        if (variable === '' || variable === 'undefined' || variable === 'null' || variable === 'NaN' || variable === 'Infinity') {
            result = false;
        }
    } else if (typeof variable === "number") {
        if (isNaN(variable) || !isFinite(variable)) {
            result = false;
        }
    } else if (variable === null) {
        result = false;
    } else if (typeof variable === 'undefined') {
        result = false;
    } else if (this.isObject(variable)) {
        if (this.isEmptyObject(variable)) {
            result = false;
        }
    } else if (this.isArray(variable)) {
        if (variable.length === 0) {
            result = false;
        }
    }
    return result;
}

//判断变量是否是对象
tools.isObject = function (obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
};

/**
 * @memberOf tools 
 * @param {Array} arr 传入一个数组
 * @return {Boolean} true ：是数组  false :不是数组
 * @description 判断变量是否是数组
 */
tools.isArray = function (arr) {
    return Object.prototype.toString.call(arr) === "[object Array]";
};

/**
 * @memberOf tools
 * @function isCorrectVal
 * @param {String|Number|Object|Array|null} variable  要验证的数据
 * @return {Boolean}  false:不正确  true: 正确
 * @description 判断变量是否有正确的值
 */
tools.isCorrectVal = function (variable) {
    var result = true;
    if (typeof variable === "string") {
        if (variable === '' || variable === 'undefined' || variable === 'null' || variable === 'NaN' || variable === 'Infinity') {
            result = false;
        }
    } else if (typeof variable === "number") {
        if (isNaN(variable) || !isFinite(variable)) {
            result = false;
        }
    } else if (variable === null) {
        result = false;
    } else if (typeof variable === 'undefined') {
        result = false;
    } else if (this.isObject(variable)) {
        if (this.isEmptyObject(variable)) {
            result = false;
        }
    } else if (this.isArray(variable)) {
        if (variable.length === 0) {
            result = false;
        }
    }
    return result;
}
/**
* @memberOf tools
 * @function cloneDeep
 * @param {Object} obj  要进行拷贝的对象
 * @return {Object}  拷贝出的新对象，防止引用类型带来的问题
 * @description   数组|对象深拷贝
 */
tools.cloneDeep = function (obj) {
    var isObject = this.isObject(obj),
        isArray = this.isArray(obj);
    if (isObject) {
        var newObj = {};
        for (var key in obj) {
            newObj[key] = this.cloneDeep(obj[key]);
        }
        return newObj;
    } else if (isArray) {
        var newArr = [];
        for (var key in obj) {
            newArr[key] = this.cloneDeep(obj[key]);
        }
        return newArr;
    } else {
        return obj;
    }
}

/**
 * @memberOf tools
 * @function uniqueArr
 * @param {Array} 待处理必须带有Id的数组对象
 * @return {Array}
 * @description 数组去重(数组，去重唯一值)
 */
tools.uniqueArr = function (arr) {
    var hash = {};
    arr = arr.reduce(function (item, next) {
        hash[next.Id] ? '' : hash[next.Id] = true && item.push(next);
        return item
    }, [])
    return arr;
}

export default tools;