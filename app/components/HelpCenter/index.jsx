import React from 'react';
import _ from 'lodash';
import localClass from './helpCenter.css';
import Radium from 'radium';

@Radium
class HelpCenter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: ''
        }
    }
    render() {
        return (
            <div className={localClass['faq']}>
                <div className={localClass['left-bar']}>
                    <div className={localClass['leftbar-title']}><h3 style={{ display: 'inline',fontWeight: 'normal',marginLeft: 49, fontSize: 19}}>帮助中心</h3></div>
                    <div className={localClass['leftbar-introduce']}>
                        <dl className={localClass['dl-list']}>
                            <dt className={localClass['list-title'] + ' ' + localClass['list-item']}>
                                 <h4 style={{ display: 'inline',fontWeight: 'normal',marginLeft: 49, fontSize: 14}}>新手引导</h4>
                            </dt>
                            <dd key={'introduce-0'}className={localClass['list-item']} style={[{ color: '#fff', marginLeft: 0 }, localStyle.listItem]}>
                                <a href="javascript:;" className={localClass['list-btn']} id="learn_yxfx" style={localStyle.listLink}>了解云校分析2.0</a>
                            </dd>
                        </dl>
                    </div>
                    <div className={localClass['leftbar-introduce']} style={{marginBottom: 500}}>
                        <dl className={localClass['dl-list']}>
                            <dt className={localClass['list-title'] + ' ' + localClass['list-item']}>
                                <h4 style={{ display: 'inline',fontWeight: 'normal',marginLeft: 49, fontSize: 14}}>常见问题</h4>
                            </dt>
                            <dd key={'cq-'+ 0}className={localClass['list-item']} style={[{ color: '#fff', marginLeft: 0 }, localStyle.listItem]}>
                                <a key={'link-'+ 0} href="javascript:;" className={localClass['list-btn']} id="learn_yxfx" style={localStyle.listLink}>多校联考</a>
                            </dd>
                            <dd key={'cq-'+ 1}className={localClass['list-item']} style={[{ color: '#fff', marginLeft: 0 }, localStyle.listItem]}>
                                <a key={'link-'+ 1}  href="javascript:;" className={localClass['list-btn']} id="learn_yxfx" style={localStyle.listLink}>自定义分析</a>
                            </dd>
                            <dd key={'cq-'+ 2}className={localClass['list-item']} style={[{ color: '#fff', marginLeft: 0 }, localStyle.listItem]}>
                                <a key={'link-'+ 2}  href="javascript:;" className={localClass['list-btn']} id="learn_yxfx" style={localStyle.listLink}>分析内容编辑</a>
                            </dd>
                            <dd key={'cq-'+ 3}className={localClass['list-item']} style={[{ color: '#fff', marginLeft: 0 }, localStyle.listItem]}>
                                <a key={'link-'+ 3}  href="javascript:;" className={localClass['list-btn']} id="learn_yxfx" style={localStyle.listLink}>群体&个体分析</a>
                            </dd>
                            <dd key={'cq-'+ 4}className={localClass['list-item']} style={[{ color: '#fff', marginLeft: 0 }, localStyle.listItem]}>
                                <a key={'link-'+ 4}  href="javascript:;" className={localClass['list-btn']} id="learn_yxfx" style={localStyle.listLink}>分析内容质量</a>
                            </dd>
                        </dl>
                    </div>
                </div>
                <div className={localClass['content']}>
                    <span className={localClass['content-title']}>标题</span>
                    <ul style={{ padding: '0 30px' }}>
                        <li style={{ padding: '19px 0', borderBottom: '1px solid #f2f2f2' }}>
                            <p style={{ position: 'relative', cursor: 'pointer' }}>问题标题</p>
                            <div style={{ marginTop: 15 }}>问题内容</div>
                        </li>
                    </ul>

                </div>
                <div style={{ clear: 'both' }}></div>
            </div>
        )
    }
}

var localStyle= {
    listItem: {
        ':hover': {backgroundColor: '#6f737d'}
    },
    listLink: {
        ':hover': {textDecoration: 'none'}
    }
}
export default HelpCenter;