/**
 * Created by roliy on 15/11/10.
 * Edited by bjgan on 16/05/26
 *
 */

/**
 * option的理解:
 * 函数里面主要分为两类,一类是带map前缀的,一类是不带的.
 * 不带map前缀的函数语义是,操作的的结果是行或列.
 * 如,getHeaderData的语义就是"获取的header是'行'header";
 * insertF的语义是"要插入的是一'行'数据".
 * 带map前缀的函数语义是,遍历的元素是行或列.
 * 因为后面的大多数方法遍历的元素和操作的元素刚好是正交的(比如遍历的是行,操作的往往就是列,遍历的是列,操作的往往就是行)
 * 所以可以理解为带map的函数刚好是不带map的函数的正交函数.
 * 含义可能会因为具体函数不同,以具体函数上对row/col的解释为准
 */
import _ from 'lodash';

var option = {
    'row': {
        getHeaderData: function (m) {
            return m.x;
        },
        getMapHeaderData: function (m) {
            return m.y;
        },
        getF: getRow,
        getMapF: getCol,
        insertMapF: insertCol,
        insertF: insertRow,
        lenHeaderF: function (m) {
            return m.x.length;
        },
        lenMapHeaderF: function (m) {
            return m.y.length;
        }
    },
    'col': {
        getHeaderData: function (m) {
            return m.y;
        },
        getMapHeaderData: function (m) {
            return m.x;
        },
        getF: getCol,
        insertF: insertCol,
        getMapF: getRow,
        insertMapF: insertRow,
        lenHeaderF: function (m) {
            return m.y.length;
        },
        lenMapHeaderF: function (m) {
            return m.x.length;
        }
    }
};

/**
 * 统一处理orie逻辑
 * @param orie
 * @returns {*}
 */
function getOption(orie) {
    if (orie == 'row' || orie == 'col') {
        return option[orie];
    } else {
        throw new Error("orie错误,请确认.");
    }
}

/**
 * xHeader,yHeader: [{id: -1, name: 'cyg'}, {id: -1, name:'dc'}]
 * data: [[1,1],[2,2]
 * @param array of object: xHeader 横向的头,是一个对象数组;
 * @param array of object: yHeader 纵向的头;
 * @param array of array: data
 * @returns {{x: *, y: *, m: *}}
 * @constructor
 */
function Matrix(xHeader, yHeader, data) {
    return {
        x: xHeader,
        y: yHeader,
        m: data
    };
}

/**
 * 检查一个对象是否满足Matrix的定义
 * @param matrix
 * @returns {boolean}
 */
function checkMatrix(matrix) {
    if (!matrix.x || matrix.x.length === 0) {
        console.log("xHeader有问题,请检查");
        return false;
    }
    if (!matrix.y || matrix.y.length === 0) {
        console.log("yHeader有问题,请检查");
        return false;
    }
    if (!matrix.m || matrix.m.length === 0) {
        console.log("m有问题,请检查");
        return false;
    }

    if (matrix.m.length !== matrix.y.length) {
        console.log("m的纵轴长度与header不一致,请检查");
        return false;
    }

    if (matrix.m[0].length !== matrix.x.length) {
        console.log("m的横轴长度与header不一致,请检查");
        return false;
    }

    return true;
}

/**
 * 深拷贝Header
 * @param matrix
 * @param orie为'row'时表示拷贝xHeader(行header),'col'时表示yHeader(列header)
 * @returns {Array}
 */
function copyHeader(matrix, orie) {

    var option = getOption(orie);

    var _data = option.getHeaderData(matrix);

    var res = new Array(_data.length);
    for (var i = 0; i !== _data.length; i++) {
        res[i] = $.extend(true, {}, _data[i]);
    }

    return res;
}

/**
 * 深拷贝matrix的数据字段
 * @param matrix
 * @returns {Array}
 */
function copyData(matrix) {
    var _data = new Array(matrix.y.length);

    for (var i = 0; i !== matrix.y.length; i++) {
        var tmp = new Array(matrix.x.length);
        for (var j = 0; j !== matrix.x.length; j++) {
            tmp[j] = matrix.m[i][j]
        }
        _data[i] = tmp;
    }

    return _data;
}

/**
 * 深拷贝matrix
 * @param matrix
 * @returns {Matrix}
 */
function copy(matrix) {
    return new Matrix(copyHeader(matrix, 'row'), copyHeader(matrix, 'col'), copyData(matrix));
}

/**
 * 获取某列
 * @param matrix
 * @param colIndex
 * @returns {Matrix}
 */
function getCol(matrix, colIndex) {
    var res = new Array(matrix.y.length);
    for (var r = 0; r != matrix.y.length; r++) {
        res[r] = [matrix.m[r][colIndex]];
    }
    return new Matrix([$.extend(true, {}, matrix.x[colIndex])], copyHeader(matrix, 'col'), res);
}

/**
 * 获取某行
 * @param matrix
 * @param rowIndex
 * @returns {Matrix}
 */
function getRow(matrix, rowIndex) {
    return new Matrix(copyHeader(matrix, 'row'), [$.extend(true, {}, matrix.y[rowIndex])], [$.extend(true, [], matrix.m[rowIndex])]);
}

/**
 * 根据header名获取满足条件的第一行/列
 * @param matrix
 * @param name
 * @param orie = {'row', 'col'}
 * @param key表示用来标识的字段名
 * @returns {Matrix}
 */
function getByName(matrix, orie, key, value) {

    var option = getOption(orie);

    var mapHeaderData = option.getMapHeaderData(matrix);

    for (var i = 0; i !== mapHeaderData.length; i++) {
        if (mapHeaderData[i][key] === value) {
            return option.getF(matrix, i);
        }
    }
    return null;
}

/**
 * 根据name的列表,筛选出矩阵中满足要求的行或列
 * 如果存在name重复的情况,只取第一个结果
 * @param matrix
 * @param orie : {'row', 'col'} row取行,col取列
 * @param key
 * @param value
 */
function getByNames(matrix, orie, key, value) {

    if (!value || value.length == 0) {
        return null;
    }

    var option = getOption(orie);

    var res = null;
    var count = 0;
    while (!res && count < value.length) {
        res = getByName(matrix, orie, key, value[count++]);
    }

    for (var i = count; i < value.length; i++) {
        var tmp = getByName(matrix, orie, key, value[i]);
        if (!tmp) {
            continue;
        }
        option.insertF(res, option.lenMapHeaderF(res), tmp, false);
    }

    return res;
}

/**
 * 在原index插入colData,后面的元素依次后移,例如,[[1,2,3],[4,5,6]],colData=[[99],[99]]
 * index = 1,结果是[[1,99,2,3],[4,99,5,6]]
 * @param matrix
 * @param index
 * @param colData
 * @param returnNew 是否返回新的矩阵,如果为false,表示在原矩阵上修改,true表示返回新的矩阵,原矩阵不变.
 */
function insertCol(matrix, index, colData, returnNew) {

    if (matrix.y.length !== colData.y.length) {
        throw Error("col length != matrix length");
    }

    if (returnNew) {
        matrix = copy(matrix);
    }

    matrix.x.splice(index, 0, $.extend(1, colData.x[0]));

    var length = matrix.y.length;

    var count = 0;
    for (var i = 0; i != length; i++) {
        matrix.m[i].splice(index, 0, colData.m[count++][0]);
    }

    return Matrix(matrix.x, matrix.y, matrix.m);
}

/**
 * 选择是否返回新的矩阵
 * @param matrix
 * @param index
 * @param rowData
 * @param returnNew 是否返回新的矩阵
 */
function insertRow(matrix, index, rowData, returnNew) {

    if (matrix.x.length !== rowData.x.length) {
        throw Error("row length != matrix length");
    }

    if (returnNew) {
        matrix = copy(matrix);
    }

    matrix.y.splice(index, 0, $.extend(1, rowData.y[0]));
    matrix.m.splice(index, 0, $.extend(true, [], rowData.m[0]));

    return Matrix(matrix.x, matrix.y, matrix.m);
}

/**
 * 构造一个矩阵,矩阵的横纵轴长度如xLength和yLength,矩阵的所有元素为elem
 * @param xLength
 * @param yLength
 * @param elem
 * @returns
 */
function buildMatrix(xLength, yLength, elem) {

    var m = buildMatrixData(xLength, yLength, elem);
    var x = buildMatrixHeader(xLength);
    var y = buildMatrixHeader(yLength);

    return new Matrix(x, y, m);
}

/**
 * 将矩阵的m字段转换成array类型
 * @param matrix
 * @returns {Array}
 */
function buildArrayByMatrix(matrix) {
    var d = new Array(matrix.x.length * matrix.y.length);
    var count = 0;

    for (var i = 0; i !== matrix.y.length; i++) {
        for (var j = 0; j !== matrix.x.length; j++) {
            d[count++] = matrix.m[i][j];
        }
    }
    return d;
}

/**
 * 利用一维数组array中的元素,构建一个矩阵;
 * @param array
 * @param xLength
 * @param yLength
 * @param key
 */
function buildMatrixByArray(array, xLength, yLength, iteratee) {

    var count = 0;
    var m = new Array(yLength);
    for (var i = 0; i !== yLength; i++) {
        var tmp = new Array(xLength);
        for (var j = 0; j !== xLength; j++) {
            tmp[j] = iteratee(array[count++]);
        }
        m[i] = tmp;
    }

    return new Matrix(buildMatrixHeader(xLength), buildMatrixHeader(yLength), m);
}

/**
 * 构建一个长度为length的header
 * @param length
 * @returns {Array}
 */
function buildMatrixHeader(length) {
    var res = [];

    for (var i = 0; i !== length; i++) {
        res.push({
            id: -1,
            name: '-'
        })
    }

    return res;
}

/**
 * 构建矩阵的数据部分,按elem刷到y*x(与x,yheader数值一致)的矩阵块中
 * @param xLength
 * @param yLength
 * @param elem
 * @returns {Array}
 */
function buildMatrixData(xLength, yLength, elem) {

    var _data = new Array(yLength);

    for (var i = 0; i !== yLength; i++) {
        var rowData = new Array(xLength);
        for (var j = 0; j !== xLength; j++) {
            rowData[j] = elem;
        }
        _data[i] = rowData;
    }

    return _data;
}

/**
 * 通过matrix和func,map生成一个同size的matrix
 * @param matrix
 * @param func的实现以单个元素为入参
 */
function buildMatrixByMatrix(matrix, func) {

    var m = new Array(matrix.y.length);
    for (var i = 0; i !== matrix.y.length; i++) {
        var t = new Array(matrix.x.length);
        for (var j = 0; j !== matrix.x.length; j++) {
            t[j] = func(matrix.m[i][j]);
        }
        m[i] = t;
    }

    return new Matrix(copyHeader(matrix, 'row'), copyHeader(matrix, 'col'), m);
}

/**
 * 通过某种运算将矩阵所有数值计算成一个结果,比如sum,max,min等
 * @param matrix
 * @param op
 * @returns {*|number|ie}
 */
function uniteByMatrix(matrix, op) {
    var result = op.ie;
    for (var i = 0; i !== matrix.y.length; i++) {
        for (var j = 0; j !== matrix.x.length; j++) {
            result = op.func(matrix.m[i][j], result);
        }
    }
    return result;
}

/**
 * 矩阵所有元素的最小值
 * @param matrix
 * @returns {number}
 */
function minOfMatrix(matrix) {
    return uniteByMatrix(matrix, {
        ie: matrix.m[0][0],
        func: function (item, res) {
            return (item < res) ? item : res;
        }
    });
}

/**
 * 矩阵所有元素的最大值
 * @param matrix
 * @returns {number}
 */
function maxOfMatrix(matrix) {
    return uniteByMatrix(matrix, {
        ie: matrix.m[0][0],
        func: function (item, res) {
            return (item > res) ? item : res;
        }
    });
}

/**
 * 矩阵所有元素之和
 * @param matrix
 * @returns {number}
 */
function sumOfMatrix(matrix) {
    return uniteByMatrix(matrix, {
        ie: 0,
        func: function (item, res) {
            return item + res;
        }
    });
}

/**
 * 矩阵所有元素的平均值
 * @param matrix
 * @returns {number}
 */
function avgOfMatrix(matrix) {
    var sum = sumOfMatrix(matrix);
    return sum / (matrix.x.length * matrix.y.length);
}

/**
 * 通过某种计算将matrix从二维归约成一维(结果依然是列/行向量的矩阵),比如求每列的平均值,最大值等
 * row表示横向归约(得到的是列向量),col表示纵向归约;没有被归减的那维header保持不变
 * @param matrix
 * @param orie:{'row', 'col'}
 */
function reduceByMatrix(matrix, orie, op) {

    var option = getOption(orie);

    var len = option.lenHeaderF(matrix);

    if (option.lenMapHeaderF(op.ie) !== option.lenMapHeaderF(matrix)) {
        throw error("ie与矩阵size不一致");
    }

    for (var i = 0; i !== len; i++) {

        var thisData = option.getMapF(matrix, i);

        op.ie = op.func(op.ie, thisData);

    }

    return op.ie;
}

/**
 * @param matrix
 * @param oire {'row','col'} row表示横向归约,得到的是一个列向量,col表示纵向归约,得到的是一个行向量
 * @returns {*}
 */
function minReduceMatrix(matrix, oire) {

    var option = getOption(oire);

    var op = {
        ie: option.getMapF(matrix, 0),
        func: function (ie, data) {

            ie = mapMatrix(ie, data, function (a, b) {
                return a < b ? a : b;
            });

            return ie;
        }
    };

    return reduceByMatrix(matrix, oire, op);
}

function maxReduceMatrix(matrix, oire) {

    var option = getOption(oire);

    var op = {
        ie: option.getMapF(matrix, 0),
        func: function (ie, data) {

            ie = mapMatrix(ie, data, function (a, b) {
                return a > b ? a : b;
            });

            return ie;
        }
    };

    return reduceByMatrix(matrix, oire, op);
}

function sumReduceMatrix(matrix, oire) {

    var option = getOption(oire);

    var tmp = option.getMapF(matrix, 0);

    var op = {
        ie: buildMatrix(tmp.x.length, tmp.y.length, 0),
        func: function (ie, data) {

            ie = mapMatrix(ie, data, function (a, b) {
                return a + b;
            });

            return ie;
        }
    };

    return reduceByMatrix(matrix, oire, op);
}



/**
 * 根据func返回的标签对matrix中的行或列分类
 * @param matrix
 * @param orie: {'row','col'} row表示是行header,col表示是列header
 * @param iteratee,与underscore一致
 */
function groupByHeader(matrix, orie, iteratee) {

    var option = getOption(orie);
    var res = {};

    var _header = option.getHeaderData(matrix);

    for (var i = 0; i !== _header.length; i++) {
        var key = iteratee(_header[i]);
        if (!res[key]) {
            res[key] = option.getMapF(matrix, i);
        } else {
            res[key] = option.insertMapF(res[key], option.lenMapHeaderF(res[key]), option.getMapF(matrix, i), false);
        }
    }

    return res;
}

/**
 * 去掉数据拷贝版矩阵相乘,矩阵较大时使用这个版本
 * @param matrix
 * @param mb
 * @param func
 */
function multiplyWithOutCopy(matrix, mb) {

    var mcxHeader = copyHeader(mb, 'row');
    var mcyHeader = copyHeader(matrix, 'col');
    var _data = buildMatrixData(mcxHeader.length, mcyHeader.length, 0);


    for (var rowIndex = 0; rowIndex != mcyHeader.length; rowIndex++) {
        for (var colIndex = 0; colIndex != mcxHeader.length; colIndex++) {
            var sum = 0.0;
            for (var z = 0; z !== matrix.x.length; z++) {
                var tmp = matrix.m[rowIndex][z] * mb.m[z][colIndex];
                sum += tmp;
            }
            _data[rowIndex][colIndex] = sum;
        }
    }

    return new Matrix(mcxHeader, mcyHeader, _data);
}

/**
 * 转置
 * @param matrix
 */
function transfer(matrix) {

    var _data = buildMatrixData(matrix.y.length, matrix.x.length, 0);

    for (var i = 0; i != matrix.y.length; i++) {
        for (var j = 0; j != matrix.x.length; j++) {
            _data[j][i] = matrix.m[i][j];
        }
    }

    return new Matrix(copyHeader(matrix, 'col'), copyHeader(matrix, 'row'), _data);
}

/**
 * 倒数 1/n
 * @param matrix
 * @returns {*}
 */
function daoshu(matrix) {
    var result = buildMatrixByMatrix(matrix, function (item) {
        if (item !== 0) {
            return 1 / item;
        } else {
            return 0;
        }
    });
    return new Matrix(result.x, result.y, result.m);
}

/**
 *  orie为row时,表示sumByRow,即每行的元素求和,得到的结果是一个列向量
 * @param matrix
 * @param header
 * @param orie = {'row', 'col'}
 */
function sumByOrie(matrix, header, orie) {
    if (orie === 'row') {
        // e.g. (3,4)*(4,1)
        var v = buildMatrix(1, matrix.x.length, 1);
        v.x = [{
            id: -1,
            name: header
        }];
        return multiplyWithOutCopy(matrix, v);
    } else if (orie === 'col') {
        // e.g. (1,3)*(3,4)
        var v = buildMatrix(matrix.y.length, 1, 1);
        v.y = [{
            id: -1,
            name: header
        }];
        return multiplyWithOutCopy(v, matrix);
    } else {
        console.log("orie参数不正确,请检查");
        return;
    }
}

/**
 * 使用一个向量来'刷'矩阵,得到新的矩阵
 * @param matrix
 * @param vector 特殊化的矩阵,比如只有一列或一行
 * @param func: function(a:num, b:num)=>num;
 * @param skip: list,表示要跳过的行/列
 * @returns {Matrix}
 */
function mapVector(matrix, vector, func, skip) {

    matrix = copy(matrix);

    if (vector.x.length === 1 && vector.y.length === 1) {
        var col_i = 0;
        var row_i = 0;
    } else if (vector.x.length === 1) {
        var col_i = 0;
        var row_i = 1;
        var col_skip = skip;
    } else if (vector.y.length === 1) {
        var row_i = 0;
        var col_i = 1;
        var row_skip = skip;
    }

    for (var i = 0; i != matrix.x.length; i++) {
        if (col_skip && (i in col_skip)) {
            continue;
        }
        for (var j = 0; j != matrix.y.length; j++) {
            if (row_skip && (j in row_skip)) {
                continue;
            }
            matrix.m[j][i] = func(matrix.m[j][i], vector.m[j * row_i][i * col_i]);
        }
    }

    return new Matrix(matrix.x, matrix.y, matrix.m);
}

/**
 * 两个同size的矩阵,一一对应生成新矩阵
 * @param matrix
 * @param func
 */
function mapMatrix(matrix1, matrix2, func) {
    if (matrix1.x.length !== matrix2.x.length || matrix1.y.length !== matrix2.y.length) {
        console.log("两个矩阵size不一致,此操作无法进行.");
        return null;
    }

    matrix1 = copy(matrix1);
    for (var i = 0; i !== matrix1.y.length; i++) {
        for (var j = 0; j !== matrix1.x.length; j++) {
            matrix1.m[i][j] = func(matrix1.m[i][j], matrix2.m[i][j]);
        }
    }
    return matrix1;
}

/**
 * 以line为标准来过滤矩阵中元素,flag为true情况下,
 * 大于等于line的为1,小于为0;
 * @param matrix
 * @param line
 * @param flag
 * @returns {*}
 */
function filterMatrixByLine(matrix, line, flag) {
    return buildMatrixByMatrix(matrix, function (i) {
        if (flag) {
            return (i >= line) ? (1) : (0);
        } else {
            return (i >= line) ? (0) : (1);
        }
    });
}

/**
 * 以range为标准来过滤矩阵中元素,flag为true情况下,
 * range中的元素为1
 * @param matrix
 * @param lowerBound
 * @param upperBound
 * @param flag
 * @returns {*}
 */
function filterMatrixByRange(matrix, lowerBound, upperBound, flag) {
    return buildMatrixByMatrix(matrix, function (i) {
        if (flag) {
            return (i >= lowerBound && i <= upperBound) ? (1) : (0);
        } else {
            return (i >= lowerBound && i <= upperBound) ? (0) : (1);
        }
    });
}

/**
 * 通过id的列表来过滤矩阵中的某些行
 * @param matrix
 * @param ids
 */
function buildMatrixByFilterRows(matrix, ids, key) {
    ids = _.sortBy(ids, function (item) {
        return item;
    });

    var _data = [];
    for (var rowIndex = 0; rowIndex != matrix.y.length; rowIndex++) {
        _data.push({
            name: matrix.y[rowIndex],
            data: matrix.m[rowIndex]
        });
    }
    _data = _.sortBy(_data, function (item) {
        return item.name[key];
    });

    var result = [];
    var j = 0;
    for (var i = 0; i !== _data.length; i++) {
        if (j === ids.length) {
            break;
        }
        if (_data[i].name[key] === ids[j]) {
            result.push(_data[i]);
            j++;
        } else if (_data[i].name[key] < ids[j]) {

        } else {
            j++;
            i--;
        }
    }

    var yHeader = [];
    var tData = [];

    for (var i = 0; i !== result.length; i++) {
        yHeader.push(result[i].name);
        tData.push(result[i].data)
    }

    return new Matrix(copyHeader(matrix, 'row'), yHeader, tData);
}

/**
 * 根据yheader中的headerKey字段排序,会生成新的矩阵,原矩阵不变
 * @param matrix
 * @param headerKey
 * @returns {Matrix}
 */
function sortRowByHeader(matrix, headerKey) {

    matrix = copy(matrix);

    var _data = [];
    for (var rowIndex = 0; rowIndex != matrix.y.length; rowIndex++) {
        _data.push({
            name: matrix.y[rowIndex],
            data: matrix.m[rowIndex]
        });
    }
    _data = _.sortBy(_data, function (item) {
        return item.name[headerKey];
    });

    var y = [];
    var m = [];
    for (var i = 0; i != _data.length; i++) {
        y.push(_data[i].name);
        m.push(_data[i].data)
    }

    return new Matrix(matrix.x, y, m);
}

/**
 * 根据xHeader中的headerKey字段排序,会生成新的矩阵,原矩阵不变
 * @param matrix
 * @param headerKey
 * @returns Matrix
 */
function sortColByHeader(matrix, key) {
    matrix = copy(matrix);

    var data = new Array(matrix.x.length);
    for (var i = 0; i !== matrix.x.length; i++) {
        data[i] = getCol(matrix, i);
    }

    data = _.sortBy(data, function (item) {
        return item.x[0][key];
    });

    for (var i = 1; i !== data.length; i++) {
        insertCol(data[0], data[0].x.length, data[i], false);
    }

    return data[0];
}

/**
 * 按colIndex列中的数值排序,order=-1表示升序,其他表示降序,原矩阵不变
 * @param matrix
 * @param colIndex
 * @param order
 * @returns {Matrix}
 */
function sortRowByCol(matrix, colIndex, order) {

    matrix = copy(matrix);

    var _data = [];
    for (var rowIndex = 0; rowIndex != matrix.y.length; rowIndex++) {
        _data.push({
            name: matrix.y[rowIndex],
            data: matrix.m[rowIndex]
        });
    }
    _data = _.sortBy(_data, function (item) {
        if (order == -1) {
            return item.data[colIndex];
        }
        return -item.data[colIndex];
    });

    var y = [];
    var m = [];
    for (var i = 0; i != _data.length; i++) {
        y.push(_data[i].name);
        m.push(_data[i].data)
    }

    return new Matrix(matrix.x, y, m);
}

/**
 * 将矩阵格式化为控件接受的统一格式
 * 如果fixed为false则不对矩阵格式化,否则对每个数值取两位小数
 * m字段中包含非数值字段时,fixed请设为false
 * @param matrix
 * @param dMap
 * @param filter
 * @returns {{x: *, y: ({x, data}|*), data: *}}
 */
function maskMatrix(matrix, dMap, fixed) {

    if (fixed) {
        matrix = toFixed(matrix);
    }

    var y = buildMaskYHeader(matrix, dMap);
    var x = buildMaskXHeader(matrix);
    return {
        x: x,
        y: y,
        data: matrix.m
    }
}

function buildMaskYHeader(matrix, dMap) {
    var data = [];
    var key = [];

    var first = [];
    for (var i in matrix.y[0]) {
        if (!dMap[i]) {
            continue;
        }
        key.push(i);
        first.push(dMap[i]);
    }

    for (var i = 0; i !== matrix.y.length; i++) {
        var tmp = [];
        for (var j = 0; j !== key.length; j++) {
            tmp.push(matrix.y[i][key[j]]);
        }
        data.push(tmp);
    }

    return { x: first, data: data };
}

function buildMaskXHeader(matrix) {
    var result = [];
    for (var i = 0; i !== matrix.x.length; i++) {
        result.push(matrix.x[i].name);
    }
    return result;
}

/**
 * 筛选缺考的成绩,目前认为(分数)数值为-1的项表示缺考,这里将其刷新成null
 * @param matrix
 * @returns {*}
 */
function maskMissExamination(matrix) {
    return buildMatrixByMatrix(matrix, function (i) {
        if (typeof i == 'number') {
            if (i <= -1) {
                return null;
            } else {
                return i;
            }
        } else {
            return i;
        }
    });
}

/**
 * 对矩阵中数值格式化,num表示保留的小数位数
 * @param matrix
 * @param num
 * @returns {*}
 */
function toFixed(matrix, num) {
    if (!num) {
        num = 2;
    }
    return buildMatrixByMatrix(matrix, function (i) {
        if (typeof i == 'number') {
            if (i || i == 0) {
                return +i.toFixed(num);
            }
        } else {
            return i;
        }

    });
}

/**
 * 按照方向将两个矩阵连接起来
 * @param matrixA
 * @param matrixB
 * @param orie
 */
function concatByOrie(matrixA, matrixB, orie) {
    matrixA = copy(matrixA);

    if (orie === 'row') {
        if (matrixA.x.length !== matrixB.x.length) {
            console.log('矩阵Size不同,不能连接');
            return null;
        }

        for (var i = 0; i !== matrixB.y.length; i++) {
            insertRow(matrixA, matrixA.y.length, getRow(matrixB, i), false);
        }
    } else if (orie === 'col') {
        if (matrixA.y.length !== matrixB.y.length) {
            console.log('矩阵Size不同,不能连接');
            return null;
        }

        for (var i = 0; i !== matrixB.x.length; i++) {
            insertCol(matrixA, matrixA.x.length, getCol(matrixB, i), false);
        }
    } else {
        console.log('orie参数有误,请确认');
        return null;
    }

    return matrixA;
}

/**
 * 将matrixArr中的元素拼接成一个矩阵
 * @param matrixArr
 */
function concatByArrayOrie(matrixArr, orie) {

    var res = copy(matrixArr[0]);

    var option = getOption(orie);

    for (var i = 1; i !== matrixArr.length; i++) {
        for (var j = 0; j !== option.lenMapHeaderF(matrixArr[i]); j++) {
            option.insertF(res, option.lenMapHeaderF(res), option.getF(matrixArr[i], j), false);
        }
    }

    return res;
}

function checkTwoMatrixSize(matrixA, matrixB, orie) {

    if (orie == 'row') {
        return matrixA.x.length == matrixB.x.length
    } else if (orie == 'col') {
        return matrixA.y.length == matrixB.y.length
    }

    return (matrixA.x.length == matrixB.x.length) && (matrixA.y.length == matrixB.y.length);
}

function checkTwoMatrixHeader(matrixA, matrixB, orie, key) {
    if (orie == 'row') {

        for (var i = 0; i !== matrixA.x.length; i++) {
            if (matrixA.x[i][key] != matrixB.y[i][key]) {
                return false
            }
        }
    } else if (orie == 'col') {

        for (var i = 0; i !== matrixA.y.length; i++) {
            if (matrixA.y[i][key] !== matrixB.y[i][key]) {
                return false;
            }
        }

    } else {

    }

    return true;
}

function markArrayItem(array, count) {

    if (!count) {
        count = 0;
    }
    _.each(array, function (item) {
        item['_count'] = count++;
    })
}

function array2map(array, key) {
    var res = {};
    _.map(array, function (item) {
        res[item[key]] = item;
    });
    return res;
}

/**
 * 合并两个矩阵
 * @param matrixA
 * @param matrixB
 * @param type,合并两个二维矩阵有四种模式,(x1Ux2,y1+y2),(x1Ux2,y1Uy2),(x1+x2,y1Uy2),(x1+x2,y1+y2)
 */
function mergeTwoMatrix(matrixA, matrixB, type, xKey, yKey) {

    var x1 = copyHeader(matrixA, 'row');
    var x2 = copyHeader(matrixB, 'row');
    var y1 = copyHeader(matrixA, 'col');
    var y2 = copyHeader(matrixB, 'col');

    var x1x2 = x1.concat(x2);
    var y1y2 = y1.concat(y2);


    var f = function (x1, x2, y1, y2, res) {

        for (var i = 0; i !== matrixA.x.length; i++) {
            var x = matrixA.x[i][xKey];
            for (var j = 0; j !== matrixA.y.length; j++) {
                var y = matrixA.y[j][yKey];
                res.m[y1[y]['_count']][x1[x]['_count']] = matrixA.m[j][i];

            }
        }

        for (var i = 0; i !== matrixB.x.length; i++) {
            var x = matrixB.x[i][xKey];
            for (var j = 0; j !== matrixB.y.length; j++) {
                var y = matrixB.y[j][yKey];
                res.m[y2[y]['_count']][x2[x]['_count']] = matrixB.m[j][i];
            }
        }

        return res;
    };

    if (type == 0) {
        var x1Ux2 = _.uniq(x1x2, false, function (item) {
            return item[xKey];
        });
        markArrayItem(x1Ux2);
        var x1Ux2Map = array2map(x1Ux2, xKey);

        markArrayItem(y1);
        var y1Map = array2map(y1, yKey);

        markArrayItem(y2, y1.length);
        var y2Map = array2map(y2, yKey);

        var res = new Matrix(x1Ux2, y1y2, buildMatrixData(x1Ux2.length, y1y2.length, 0));

        return f(x1Ux2Map, x1Ux2Map, y1Map, y2Map, res);

    } else if (type == 1) {
        var x1Ux2 = _.uniq(x1x2, false, function (item) {
            return item[xKey];
        });
        markArrayItem(x1Ux2);
        var x1Ux2Map = array2map(x1Ux2, xKey);

        var y1Uy2 = _.uniq(y1y2, false, function (item) {
            return item[yKey];
        });
        markArrayItem(y1Uy2);
        var y1Uy2Map = array2map(y1Uy2, yKey);

        var res = new Matrix(x1Ux2, y1Uy2, buildMatrixData(x1Ux2.length, y1Uy2.length, 0));

        return f(x1Ux2Map, x1Ux2Map, y1Uy2Map, y1Uy2Map, res);
    } else if (type == 2) {

        markArrayItem(x1);
        var x1Map = array2map(x1, xKey);

        markArrayItem(x2, x1.length);
        var x2Map = array2map(x2, xKey);

        var y1Uy2 = _.uniq(y1y2, false, function (item) {
            return item[yKey];
        });
        markArrayItem(y1Uy2);
        var y1Uy2Map = array2map(y1Uy2, yKey);

        var res = new Matrix(x1x2, y1Uy2, buildMatrixData(x1x2.length, y1Uy2.length, 0));

        return f(x1Map, x2Map, y1Uy2Map, y1Uy2Map, res);
    } else if (type == 3) {

        markArrayItem(x1);
        var x1Map = array2map(x1, xKey);

        markArrayItem(x2, x1.length);
        var x2Map = array2map(x2, xKey);

        markArrayItem(y1);
        var y1Map = array2map(y1, yKey);

        markArrayItem(y2, y1.length);
        var y2Map = array2map(y2, yKey);

        var res = new Matrix(x1x2, y1y2, buildMatrixData(x1x2.length, y1y2.length, 0));

        return f(x1Map, x2Map, y1Map, y2Map, res);
    } else {
        console.log("type错误");
        return null;
    }
}

function mergeMatrices(matrixArray, type, xKey, yKey) {

    if (matrixArray.length == 1) {
        return matrixArray[0];
    }

    var res = mergeTwoMatrix(matrixArray[0], matrixArray[1], type, xKey, yKey);
    if (matrixArray.length > 2) {
        for (var i = 2; i !== matrixArray.length; i++) {
            res = mergeTwoMatrix(res, matrixArray[i], type, xKey, yKey);
        }
    }

    return res;
}

/**
 * 根据关系矩阵的某行或某列,将满足条件的元素取出来
 * @param matrix
 * @param orie
 * @param name
 * @param flag: 为true的话,取1的元素,false的话取0的元素
 */
function relationMatrixRowCol2Array(matrix, name, orie, flag, key) {

    var res = [];

    if (typeof name == 'string') {
        var data = getByName(matrix, orie, 'name', name);
    } else if (typeof name == 'number') {
        var data = option[orie].getF(matrix, name);
    }

    if (orie === 'row') {
        for (var i = 0; i !== data.x.length; i++) {

            if (key) {
                var d = data.x[i][key];
            } else {
                var d = data.x[i];
            }

            if (flag && data.m[0][i] === 1) {
                res.push(d);
            } else if (!flag && data.m[0][i] === 0) {
                res.push(d);
            }
        }
    } else if (orie === 'col') {
        for (var i = 0; i !== data.y.length; i++) {

            if (key) {
                var d = data.y[i][key];
            } else {
                var d = data.y[i];
            }

            if (flag && data.m[i][0] === 1) {
                res.push(d);
            } else if (!flag && data.m[i][0] === 0) {
                res.push(d);
            }
        }
    } else {
        return null;
    }

    return res;
}

var matrixBase = {
    checkMatrix: checkMatrix,
    copyHeader: copyHeader,
    Matrix: Matrix,
    getCol: getCol,
    getRow: getRow,
    getByName: getByName,
    getByNames: getByNames,
    insertCol: insertCol,
    insertRow: insertRow,
    copy: copy,
    uniteByMatrix: uniteByMatrix,
    minOfMatrix: minOfMatrix,
    maxOfMatrix: maxOfMatrix,
    sumOfMatrix: sumOfMatrix,
    avgOfMatrix: avgOfMatrix,
    buildMatrix: buildMatrix,
    buildMatrixByMatrix: buildMatrixByMatrix,
    transfer: transfer,
    daoshu: daoshu,
    sumByOrie: sumByOrie,
    mapVector: mapVector,
    mapMatrix: mapMatrix,
    buildMatrixByFilterRows: buildMatrixByFilterRows,
    sortRowByHeader: sortRowByHeader,
    sortRowByCol: sortRowByCol,
    maskMatrix: maskMatrix,
    buildMaskYHeader: buildMaskYHeader,
    buildMaskXHeader: buildMaskXHeader,
    maskMissExamination: maskMissExamination,
    toFixed: toFixed,
    groupByHeader: groupByHeader,
    multiplyWithOutCopy: multiplyWithOutCopy,
    concatByOrie: concatByOrie,
    concatByArrayOrie: concatByArrayOrie,
    filterMatrixByLine: filterMatrixByLine,
    filterMatrixByRange: filterMatrixByRange,
    relationMatrixRowCol2Array: relationMatrixRowCol2Array,
    buildArrayByMatrix: buildArrayByMatrix,
    buildMatrixByArray: buildMatrixByArray,
    mergeTwoMatrix: mergeTwoMatrix,
    mergeMatrices: mergeMatrices,
    minReduceMatrix: minReduceMatrix,
    maxReduceMatrix: maxReduceMatrix,
    sumReduceMatrix: sumReduceMatrix,
    sortColByHeader: sortColByHeader
};

export default matrixBase;

