/*
* @Author: liucong
* @Date:   2016-03-31 11:19:09
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-05-04 15:47:11
*/
import _ from 'lodash';

export function fetchComponentDataBeforeRender(dispatch, components, params, location) {
  const needs = components.reduce((prev, current) => {
    return (current.need || [])
      // .concat((current.WrappedComponent ? current.WrappedComponent.need : []) || [])
      .concat(prev);
    }, []);

    //把params和location.query中所有的属性都提取到一个对象中
    params = params || {};
    location.query = location.query || {};
    params = _.merge(params, location.query);


console.log('最终的params = ', params);

    const promises = needs.map(need => dispatch(need(params)));

console.log('promise.length = ', promises.length);

    return Promise.all(promises);
}
