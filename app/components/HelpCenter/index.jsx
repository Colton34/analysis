import React from 'react';
import _ from 'lodash';
import localClass from './helpCenter.css';
import Radium from 'radium';

@Radium
class HelpCenter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: {section: 'questions', sub: 'liankao'}
        }
    }
    onClickSubTitle(id, event) {
        var $target = $(event.target);
        var parentId = $target.parents('#section-title').data('section');
        this.setState({
            active: {section: parentId, sub: id}
        })
    }
    onClickQuestionItem(e) {
        var $target = $(e.target);
        if($target.hasClass('active')) {
            $target.removeClass('active').siblings('div').hide()
        } else {
            $target.addClass('active').siblings('div').show()
        }
    }
    componentDidMount() {
        var queries = this.props.location.query;
        if(queries.section && queries.sub) {
            this.setState({
                active: {section: queries.section, sub: queries.sub}
            })
        }
    }
    render() {
        var sectionInfoKeys = _.keys(sectionInfos);
        var activeSection = this.state.active.section;
        var activeSub = this.state.active.sub;
        return (
            <div className={localClass['faq']}>
                <div className={localClass['left-bar']}>
                    <div className={localClass['leftbar-title']}><h3 style={{ display: 'inline',fontWeight: 'normal',marginLeft: 49, fontSize: 19}}>帮助中心</h3></div>
                    {
                        sectionInfoKeys.map((sectionId, index) => {
                            return (
                                <div key={'leftbarIntro-' + index} className={localClass['leftbar-introduce']} style={index === sectionInfoKeys.length -1 ? {marginBottom: 500} : {}}>
                                    <dl id='section-title' data-section={sectionId} className={localClass['dl-list']}>
                                        <dt className={localClass['list-title'] + ' ' + localClass['list-item']}>
                                            <h4 style={{ display: 'inline', fontWeight: 'normal', marginLeft: 49, fontSize: 14 }}>{sectionInfos[sectionId].name}</h4>
                                        </dt>
                                        {
                                            _.keys(sectionInfos[sectionId].sub).map((id,index) =>{
                                                return (
                                                    <dd key={'qtitle-' + id + '-'+index} 
                                                        className={localClass['list-item']}
                                                        style={[{ color: '#fff', marginLeft: 0 }, localStyle.listItem].concat(id===activeSub ? [localStyle.listItemActive]: [])}>
                                                        <a id={id} key={'qlink-' + id + '-' + index} 
                                                           href="javascript:;" className={localClass['list-btn']} 
                                                           style={_.assign({},localStyle.listLink, (id === activeSub ? localStyle.listLinkActive: {}))}
                                                           onClick={this.onClickSubTitle.bind(this, id)}
                                                           >
                                                            {sectionInfos[sectionId]['sub'][id].name}
                                                        </a>
                                                    </dd>
                                                )
                                            })    
                                        }
                                    </dl>
                                </div>
                            )
                        })
                    }
                   </div>
                <div className={localClass['content']}>
                
                    <span className={localClass['content-title']}>{sectionInfos[activeSection]['sub'][activeSub].name}</span>
                    {
                        sectionInfos[activeSection]['sub'][activeSub].type ==='text' ?
                            <ul style={{ padding: '0 30px', listStyle:'none'}}>
                                {
                                    sectionInfos[activeSection]['sub'][activeSub].list.map((item, index) => {
                                        return (
                                            <li key={'content-' + index}style={{ padding: '19px 0', borderBottom: '1px solid #f2f2f2' }}>
                                                <p onClick={this.onClickQuestionItem}style={{ position: 'relative', cursor: 'pointer', margin: 0}}>{item.title}</p>
                                                <div style={{ marginTop: 15, display: 'none' }}>{item.content}</div>
                                            </li>
                                        )
                                    })
                                }
                            </ul> : 
                            <div style={{ width: 800, height: 565, margin: 20 }}>
                                <video style={{width: '100%', height: '100%'}}id="example_video_1" className="video-js vjs-default-skin vjs-big-play-centered vjs-paused example_video_1-dimensions vjs-controls-enabled vjs-workinghover vjs-user-active"
                                    controls preload="auto" 
                                    data-setup='{}'>
                                    <source src={sectionInfos[activeSection]['sub'][activeSub].url} type="video/mp4" />
                                </video>
                            </div>
                    }
                    

                </div>
                <div style={{ clear: 'both' }}></div>
            </div>
        )
    }
}

var localStyle= {
    listItem: {
        ':hover': {backgroundColor: '#6f737d', color: '#fff'},
        ':link': {textDecoration: 'none', color: '#fff'},
    },
    listItemActive: {
       backgroundColor: '#6f737d'
       
    }, 
    listLink: {
        ':hover': {textDecoration: 'none', color: '#fff'}
    },
    listLinkActive: {
        textDecoration: 'none', color: '#fff' 
        
    }
    
}

var sectionInfos = {
    'intro': {
        name: '新手引导',
        sub: {
            'introVideo': {
                name: '了解云校分析2.0',
                type: 'video',
                url: 'http://portal.kssws.ks-cdn.com/yunxiaoshow.mp4'
            }
        }
    },
    'questions': {
        name: '常见问题',
        sub: {
            'liankao': {
                name: '多校联考',
                type: 'text',
                list: [{ title: '多校联考', content: '多校联考' },{ title: '多校联考', content: '多校联考' },{ title: '多校联考', content: '多校联考' }]
            },
            'zidingyi': {
                name: '自定义分析',
                type: 'text',
                list: [{ title: '自定义分析', content: '自定义分析' }]
            },
            'bianji': {
                name: '分析内容编辑',
                type: 'text',
                list: [{ title: '分析内容编辑', content: '分析内容编辑' }]
            },
            'qungeti': {
                name: '群体与个体分析',
                type: 'text',
                list: [{ title: '群体与个体分析', content: '群体与个体分析' }]
            },
            'nrzl': {
                name: '分析内容质量',
                type: 'text',
                list: [{ title: '分析内容质量', content: '分析内容质量' }]
            }
        }
    }
}

export default HelpCenter;