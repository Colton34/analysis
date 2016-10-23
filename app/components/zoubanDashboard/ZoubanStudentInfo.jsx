import _ from 'lodash';
import React, { PropTypes } from 'react';
import {Link, browserHistory} from 'react-router';
import dashboardStyle from '../dashboard/dashboard.css';

export default function ZoubanStudentInfo({zoubanLessonStudentsInfo, zoubanExamInfo, goNext}) {
    debugger;
    var lessonMap = _.keyBy(zoubanExamInfo.lessons, 'objectId');
    var simpleLessonObjectId = _.keys(zoubanLessonStudentsInfo)[0];
    var simpleLesson = zoubanLessonStudentsInfo[simpleLessonObjectId];
    var simpleLessonStudents = _.sortBy(_.unionBy(..._.values(simpleLesson), (obj) => obj.id), 'score');
    var simpleStudent = simpleLessonStudents[_.ceil(_.multiply(0.8, simpleLessonStudents.length))];
//上面是找到拥有此优势学科的学生，下面获取到此学生其他各个学科的排名，找到排名最靠后的--使用排名是因为分数是绝对值，不具有比较的意义。
    var simpleStudentDisadvantageLesson = getSimpleStudentDisadvantage(zoubanLessonStudentsInfo, simpleStudent, zoubanExamInfo);
    var result = {
        name: simpleStudent.name,
        totalScore: simpleStudent.score,
        advantage: lessonMap[simpleLessonObjectId].name,
        disadvantage: simpleStudentDisadvantageLesson
    }
    debugger;
    return (
        <div style={{display: 'inline-block', height: 317, padding: '0px 0px 0px 10px', cursor: 'pointer'}}  className='col-lg-4' onClick={goNext}>
            <div className='dashboard-card' style={{width: '100%', height: '100%', backgroundColor: '#fff', borderRadius: 2, padding: '0 30px'}}>
                <CardHeader  />
                <div style={{width:'320px'}}>
                    <div style={{width:'100%',padding:'15px 0px ',display:'tablCell',textAlign:'center',fontSize:'18px',color:'#1daef8'}}><span>{result.name}同学</span>
                    </div>
                    <div style={{padding:'0px 0px 30px 0px',position:'relative'}}>
                        <div style={{display:'inline-block',width:'80px'}}>
                            <div>总分：</div>
                            <div style={{color:'#1daef8',marginBottom:'50px',fontSize:'18px'}}>{result.totalScore}</div>
                            <div >优势学科：</div>
                            <div style={{color:'#1daef8',fontSize:'18px'}}>{result.advantage}</div>
                        </div>
                        <div style={{display:'inline-block',position:'absolute'}}>
                            <div style={{display:'tableCell', textAlign:'center',width:'120px',height:'120px',border:'5px solid #1daef8',borderRadius:'50%',margin:'0 auto',lineHeight:'110px',fontSize:'18px'}}>{result.totalScore}分</div>
                        </div>
                        <div style={{display:'inline-block',width:'80px',float:'right'}}>
                            <div>超过年级：</div>
                            <div style={{color:'#1daef8',marginBottom:'50px',fontSize:'18px'}}>80%</div>
                            <div >劣势学科：</div>
                            <div style={{color:'#1daef8',fontSize:'18px'}}>{result.disadvantage}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
class CardHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverLink: false
        }
    }
     onHeaderMouseEnter() {
        this.setState({
            hoverLink: true
        })
    }
    onHeaderMouseLeave() {
        this.setState({
            hoverLink: false
        })
    }
    render() {
        return (
            <Link to={{ pathname: '/rank/report', query: this.props.queryOptions}}
                onMouseEnter={this.onHeaderMouseEnter.bind(this) }
                onMouseLeave={this.onHeaderMouseLeave.bind(this) }
                style={_.assign({}, styles.linkHeader, this.state.hoverLink ? { color: '#27aef8', textDecoration: 'none' } : { color: '#333' }) }>
                <span style={{ fontSize: 16, marginRight: 10 }}>学生成绩分析</span>
                <span style={_.assign({}, { float: 'right' }, this.state.hoverLink ? { color: '#27aef8' } : { color: '#bfbfbf' }) }>
                    <i className='icon-right-open-2'></i>
                </span>
            </Link>
        )
    }
}

var localStyles = {
     linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
}
const styles = {
    linkHeader: {
        display: 'block', height: 58, lineHeight: '58px', borderBottom: '1px solid #f2f2f2', cursor: 'pointer'
    }
};
function getSimpleStudentDisadvantage(zoubanLessonStudentsInfo, simpleStudent, zoubanExamInfo) {
    var lessonStudentsMap, lessonMap = _.keyBy(zoubanExamInfo.lessons, 'objectId');
    var simpleStudentLessonRanks = []
    _.each(zoubanLessonStudentsInfo, (lessonStudentsInfo, lessonObjectId) => {
        lessonStudentsMap = _.keyBy(_.unionBy(..._.values(lessonStudentsInfo), (obj) => obj.id), 'id');
        if(!lessonStudentsMap[simpleStudent.id]) return;
        simpleStudentLessonRanks.push({
            name: lessonMap[lessonObjectId].name,
            rank: lessonStudentsMap[simpleStudent.id].lessonRank
        });
    });
    return _.last(_.sortBy(simpleStudentLessonRanks, 'rank')).name;
}
