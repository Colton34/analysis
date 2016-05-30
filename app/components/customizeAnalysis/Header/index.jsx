import React from 'react';
import ownClassNames from './header.css';
import _ from 'lodash';

/**
 * props:
 * pageIndex: 当前所在的页面;
 * onDiscardCurrent: 放弃当前编辑返回自定义分析主页面的回调函数；
 * status: 当前状态, 'create' or '',
 * onBackHomePage: 返回首页的回调方法;
 */
const Header = ({pageIndex, onDiscardCurrent, onBackHomePage, status}) => {
    
    return (
        <div className={ownClassNames.header}>
            {
                status === 'create' ?
                    <span onClick={onDiscardCurrent} className={ownClassNames['header-back']}><i class="icon-left-open-2"></i>返回自定义分析</span> :
                    <span onClick={onBackHomePage} className={ownClassNames['header-back']} >返回</span>
            }
            {
                status === 'create' ?
                    (
                        <div className={ownClassNames['header-title-wrapper']}>
                            <span className={pageIndex === 0 ? ownClassNames['header-title-active'] : ownClassNames['header-title']} >1填写学科</span>
                            <i class="split"></i>
                            <span className={pageIndex === 1 ? ownClassNames['header-title-active'] : ownClassNames['header-title']}>2选择科目和题目</span>
                            <i class="split"></i>
                            <span className={pageIndex === 2 ? ownClassNames['header-title-active'] : ownClassNames['header-title']}>3确认题目</span>
                            <i class="split"></i>
                            <span className={pageIndex === 3 ? ownClassNames['header-title-active'] : ownClassNames['header-title']}>4确认学生</span>
                        </div>
                    ) :
                    (
                        <div className={ownClassNames['header-title-wrapper']}>
                            <span className={ownClassNames['header-title-main']}>自定义分析</span>
                        </div>
                    )
                    
            }
        </div>
    )
}

export default Header;
