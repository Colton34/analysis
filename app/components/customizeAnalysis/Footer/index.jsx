import React from 'react';
import ownClassNames from './footer.css';
import _ from 'lodash';

/**
 * props: 
 *  pageIndex:  当前页码
 *  onPrePage:  跳转到上一页回调函数；
 *  onNextPage：跳转到下一页回调函数；
 *  
 */
const Footer = ({pageIndex, onPrevPage, onNextPage}) => {
    return (
        <div className={ownClassNames['footer']}>
            <div className={ownClassNames['footer-container']}>
                <button onClick={onPrevPage} style={pageIndex === 0 ? { display: 'none' } : {}}className={ownClassNames['fx-btn'] + ' ' + ownClassNames['fx-btn-default'] + ' ' + ownClassNames['footer-btn']}>上一步</button>
                <button onClick={onNextPage} className={ownClassNames['fx-btn'] + ' ' + ownClassNames['fx-btn-primary'] + ' ' + ownClassNames['footer-btn']}>下一步</button>
            </div>
        </div>
    )
}

export default Footer;