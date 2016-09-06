/*
* @Author: HellMagic
* @Date:   2016-09-05 20:15:12
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-09-06 20:17:35
*/

'use strict';
import _ from 'lodash';
/*
    求某一个群定的xx属性的区间分布:<注意，因为查找的方式使用了二分法，所以群体必须是有序的！！！>
        参数：区间 segments；群体 base；属性 key
        输出：[
                {
                    low: <此区间的低位>,
                    high: <此区间的高位>,
                    count <分布在此区间的群体个数>:
                    targets: <分布在此区间的群体数组--实体还是传递的实体结构>,
                    index: <区间的索引>
                }, ...
            ]
*/
export function makeSegmentsDistribution(segments, base, key) {
    var groupCountDistribution = _.groupBy(base, function(item) {
        return getSegmentIndex(segments, item[key]);
    });

    return _.map(_.range(segments.length - 1), (index) => {
        var count = (groupCountDistribution[index]) ? groupCountDistribution[index].length : 0;
        var targets = (groupCountDistribution[index]) ? groupCountDistribution[index] : [];
        return {
            index: index,
            low: segments[index],
            high: segments[index + 1],
            count: count,
            targets: targets
        }
    });
}


/*
    计算一个区间：
        参数：开始值 start；结束值 end；步伐 step；多少个间隔：count(当step为null的时候，通过count来计算step)
        输出：包括start和end的，以step为步伐的计数数组
*/
export function makeSegments(end, start = 0, step, count = 12) {
    step = step || _.ceil(_.divide(_.subtract(end, start), count));
    var result = _.range(start, end + 1, step);
    if (_.last(result) < end) result.push(end);
    return result;
}

/*
    贡献率：
        参数：originalMatrix
        输出：对应的贡献率matrixFactors
*/


//在区间数组中查找所给的目标数值所归属的区间段
//判断归属区间的原则是：如果是第一个区间那么左右都是闭区间，如果不是第一个区间则左开右闭
function getSegmentIndex(segments, target) {
    var low = 0,
        high = segments.length - 1;
    while (low <= high) {
        var middle = _.ceil((low + high) / 2);
        if (target == segments[middle]) {
            return (target == segments[0]) ? middle : middle - 1;
        } else if (target < segments[middle]) {
            high = middle - 1;　　
        } else {
            low = middle + 1;
        }
    }
    return high;
}

/**
 * 将一个matrix通过行列操作计算离差
 * @param  {[type]} originalMatrix [description]
 * @return {[type]}                [description]
 */
export function makeFactor(originalMatrix) {
    var tempMatrix = []; //不用map是因为避免占位
    //1.行相减
    _.each(originalMatrix, (classRow, rowIndex) => {
        if (rowIndex == 0) return;
        var rowFactors = _.map(classRow, (perItem, columnIndex) => (_.isNumber(perItem) ? _.round(_.subtract(perItem, originalMatrix[0][columnIndex]), 2) : perItem));
        tempMatrix.push(rowFactors);
    });

    //2.列相减
    var resultMatrix = [];
    _.each(tempMatrix, (rowArr, rowIndex) => {
        var tempRow = [];
        _.each(rowArr, (tempFactor, columnIndex) => {
            if (columnIndex == 0) return;
            var resultTempFactor = (_.isNumber(tempFactor)) ? _.round(_.subtract(tempFactor, rowArr[0]), 2) : tempFactor;
            tempRow.push(resultTempFactor);
        });
        resultMatrix.push(tempRow);
    });

    return resultMatrix;
}
