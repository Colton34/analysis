/*
* @Author: liucong
* @Date:   2016-03-31 11:19:09
* @Last Modified by:   HellMagic
* @Last Modified time: 2016-04-27 22:12:48
*/

export function fetchComponentDataBeforeRender(dispatch, components, params) {
  const needs = components.reduce((prev, current) => {
    return (current.need || [])
      // .concat((current.WrappedComponent ? current.WrappedComponent.need : []) || [])
      .concat(prev);
    }, []);

    const promises = needs.map(need => dispatch(need(params)));

console.log('promises.length  = ', promises.length);

//Debug: 这里Promise好像没有返回


    return Promise.all(promises);
}
