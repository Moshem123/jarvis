import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import range from 'lodash/range';

import { catLog, grepLog } from "../../actions/instanceLogsActions";

class CatLogPage extends PureComponent {
  state = {
    pages: [1],
    lines: [],
    searchQuery: '',
  };

  componentDidMount() {
    this.getLogLines();
  }

  getLogLines = (page) => {
    this.props.catLog(this.props.srv, this.props.logFile, page)
      .then(data => {
        let newState = {lines: data.message.split('\n')};
        if (data.hasOwnProperty('pages')) {
          newState = {...newState, pages: data.pages ? range(1, data.pages + 1) : [1]}
        }
        this.setState(newState)
      })
  };

  selectOnChange = event => {
    this.getLogLines(event.target.value);
  };

  changeSearchQuery = search => this.setState({searchQuery: search.target.value});

  grepQuery = () => {
    this.props.grepLog(this.props.srv, this.props.logFile, this.state.searchQuery)
      .then(data => this.setState({lines: data.message.split('\n')}));
  };

  clearSearch = () => {
    this.setState({searchQuery: ''});
    this.getLogLines();
  };

  renderSelectBox = () => (
    <select name="pages" id="pages" onChange={this.selectOnChange}>
      {this.state.pages.map(page => <option value={page} key={page}>{page}</option>)}
    </select>
  );

  renderLines = () => this.state.lines.map((line, i) => <pre style={{margin: 0}} key={i}>{line}</pre>);

  render() {
    return (
      <div style={{margin: '20px'}}>
        {'Pages: '}{this.renderSelectBox()}
        <input type="text" value={this.state.searchQuery} onChange={this.changeSearchQuery}/>
        <input type="button" value="grep" onClick={this.grepQuery}/>
        <input type="button" value="clear search" onClick={this.clearSearch}/>
        <br/>
        {this.renderLines()}
      </div>
    );
  }
}

CatLogPage.propTypes = {
  logFile: PropTypes.string.isRequired,
  srv: PropTypes.string.isRequired,
};


/*function reformatFilesAndDirs(data) {
  data = data.trim();
  let structure = { directories: ['..'], files: [] };
  const mapFileKeys = { 0: 'modifyDate', 1: 'size', 2: 'fileName' };
  let dataArr = data.split('\n');
  const selfDir = dataArr.shift() + "/";
  dataArr.forEach(e => {
    if (e[0] === '/') return structure.directories.push(e.replace(selfDir, ""));
    structure.files.push(e.split('\t').reduce((result, item, index) => {
      result[mapFileKeys[index]] = item;
      return result;
    }, {}));
  });
  return structure
}*/

const mapDispatchToProps = { catLog, grepLog };

export default connect(() => ({}), mapDispatchToProps)(CatLogPage);