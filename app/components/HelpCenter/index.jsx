import React from 'react';
import _ from 'lodash';
import localClass from './helpCenter.css';
import Radium from 'radium';
import {B03} from '../../lib/constants';
@Radium
class HelpCenter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            active: {section: 'questions', sub: 'zidingyi'}
        }
    }
    onClickSubTitle(id, event) {
        var $target = $(event.target);
        var parentId = $target.parents('#section-title').data('section');
        this.setState({
            active: {section: parentId, sub: id}
        }, ()=> {
            if ($target.data('type') === 'video') {
                $('#example_video_1').load();
            }
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
                                                           data-type={sectionInfos[sectionId].sub[id].type}
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
                                                <p onClick={this.onClickQuestionItem}style={{ position: 'relative', cursor: 'pointer', margin: 0}}>
                                                    <i className={localClass['qicon']} ></i>
                                                    {item.title}
                                                </p>
                                                <div style={{ marginTop: 15, display: 'none' }}>
                                                {
                                                    item.content.map((paragraph,index) => {
                                                        return <p key={item.title + '-p' + index} style={{color: '#979797'}}>{paragraph}</p>
                                                    })
                                                }
                                                </div>
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
            },  'howToCheck' : {
                name: '如何查看分析报告',
                type: 'video',
                url: 'http://kaoshi2.kss.ksyun.com/fenxi/4f3b2de646a1b2d843b12ed7fe3b5c2b.mp4'
            },
            'howToUse': {
                name: '如何使用自定义分析',
                type: 'video',
                url: 'http://kaoshi2.kss.ksyun.com/fenxi/65f08ccc726690018ad43963922249ee.mp4'
            }
        }
    },
    'questions': {
        name: '常见问题',
        sub: {
            'zidingyi': {
                name: '自定义分析',
                type: 'text',
                list: [
                    {
                        title: '分析报告结果错误或不满意怎么办？',
                        content: [
                            '分析结果有错误有很多原因导致，最常见的原因有两个：1、来自阅卷时，考试题目设置的问题。2、创建自定义分析时，课目和题目选择以及学生数据导入有问题。一般出现这样的错误，建议直接重新创建新的正确的自定义分析即可。同时注意规范认真操作。',
                            '分析结果不满意，可以通过创建自定义分析，任意组合、合并等考试题目，来生成实际满意的分析报告。同时注意规范认真操作。'
                        ]
                    },{
                        title: '自定义分析时，导入考试数据、学生信息数据错误怎么办？',
                        content: [
                            '如果当前自定义分析已经生成分析报表，则没办法重新修改，可以在分析报告的面板处删除，重新创建新的正确的自定义分析即可。',
                            '如果当前自定义分析未生成分析报表，则通过编辑，修改当前分析的科目，重新导入正确的数据即可。'
                        ]
                    },{ 
                        title: '什么是题目合并、题目累加、将题目合并为一题',
                        content: [
                             '•题目合并',
                             '需要把多学科汇总成一门学科进行分析，例如：某次高三月考考试时，期望把物理、化学、生物三科汇总成理综一门学科进行分析，可以使用题目合并。',
                             '•题目累加',
                             '需要把一学科考试拆分成不同学科进行汇总分析，例如：某次高三期中考试时，期望把理综拆分成物理、化学、生物三学科进行汇总分析，可以使用累加',
                             '•题目合并为一道题',
                             '需要同一学科的不同考试数据合并在一起进行分析，查看相关的分析数据等，例如：期望把期中，期末的语文合并在一起进行分析，查看相关的分析数据等，可以使用题目合并成一道题；'
                         ]
                    },{ 
                        title: '如何再次编辑已创建的自定义分析？',
                        content: [
                             '如果当前自定义分析已经生成分析报表，则没办法重新修改，可以在分析报告的面板处删除，重新创建新的正确的自定义分析即可。',
                             '如果当前自定义分析未生成分析报表，则通过编辑，修改当前自定义分析即可。'
                         ]
                    },{
                        title: '想删除考试分析报告，怎么操作？',
                        content: [
                            ' 在［首页］，找到要删除的考试分析名称，点击［查看分析］，进入报告面包，在面板右上角，点击［删除］按钮即可，删除的报告无法回复，只能重新创建自定义分析。请谨慎操作。'
                        ]
                    },{
                        title: '自定义分析时，生成题号错误时怎么办？',
                        content: [
                            '如果当前自定义分析已经生成分析报表，则没办法重新修改，可以在分析报告的面板处删除，重新创建新的正确的自定义分析即可。',
                            '如果当前自定义分析未生成分析报表，则通过编辑，修改当前分析的科目，重新生成题号。'
                        ]
                    }
                ]
            },
            'mima': {
                name: '账号密码',
                type: 'text',
                list: [{ title: '帐号和密码忘记怎么办？', content: ['帐号和密码是有您当前学校最高管理员创建，可联系学校管理员。'] }]
            }
        }
    }
}

export default HelpCenter

    '分析报告结果错误或不满意怎么办？',
    '自定义分析时，导入考试数据、学生信息数据错误怎么办？',
    '什么是题目合并、题目累加、将题目合并为一题',
    '如何再次编辑已创建的自定义分析？',
    '想删除考试分析报告，怎么操作？'
    '自定义分析时，生成题号错误时怎么办？'
    '帐号和密码忘记怎么？'
