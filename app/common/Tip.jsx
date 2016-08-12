import React from 'react';
import {COLORS_MAP as colorsMap} from '../lib/constants';
/**
 * props:
 * content: tip显示的内容
 * direction: tip框显示的方向, 待开发
 */
class Tip extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showTip: false
        }
    }
    onMouseEnter() {
        this.setState({showTip: true});
    }
    onMouseLeave() {
        this.setState({showTip: false});
    }
    render() {
        return (
            <div style={{display: 'inline-block'}}>
                <div style={_.assign({}, { display: 'inline-block', width: 16, height: 16, lineHeight: '16px', borderRadius: '50%', textAlign: 'center', color: '#fff', position: 'relative' }, this.state.showTip ? { backgroundColor: colorsMap.C08 } : {
                    backgroundColor: colorsMap.C07})}
                    onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)}>
                    <i className='icon-help-1'></i>
                    <p className='tip-block' style={_.assign({},{color: colorsMap.C12, position: 'absolute', top: 26, right: '50%', marginRight: -130}, this.state.showTip ? {display: 'block'} : {display: 'none'})}>
                    {
                        this.props.content
                    }
                    </p>
                    
                </div>
            </div>
        )
    }
}

export default Tip;