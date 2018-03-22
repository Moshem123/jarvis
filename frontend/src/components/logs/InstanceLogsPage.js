import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getInstanceLogs, addRequestedLogs } from '../../actions/instanceLogsActions';
import InstanceLogsUI from "./InstanceLogsUI";

class InstanceLogsPage extends PureComponent {
  state = {
    directory: '/tradair/logs/tnet',
    errorMessage: '',
    data: { directories: [], files: [] },
  };

  componentDidMount() {
    if (this.props.srv !== '') {
      this.getInstanceLogs(this.props.srv, this.state.directory);
    }
  }

  getInstanceLogs = (srv, dir) => {
    this.setState({ errorMessage: '' });
    this.props.getInstanceLogs(srv, dir)
      .then(({ message }) => this.setState({ data: reformatFilesAndDirs(message) }))
      .catch(err => this.setState({ errorMessage: err.message }));
  };

  changeDirectory = event => this.setState({ directory: event.target.value });

  changeDirectorySubmit = event => {
    event.preventDefault();
    this.getInstanceLogs(this.props.srv, this.state.directory);

  };

  dirClick = event => {
    let dir = this.state.directory + "/" + event.target.textContent;
    if (dir.slice(-2) === '..') {
      let dirArr = this.state.directory.split("/");
      dirArr.pop();
      dir = dirArr.join("/");
      if (dir === '') {
        dir = "/";
      }
    }
    this.getInstanceLogs(this.props.srv, dir);
    this.changeDirectory({ target: { value: dir } }); // Utilize the changeDirectory onChange handler
  };

  fileClick = event => {
    let file = event.target.textContent.split(" (")[0];
    console.log(this.props.popups);
    if (this.props.popups.indexOf(file) === -1){
      this.props.addRequestedLogs(this.props.srv, `${this.state.directory}/${file}`);
    } else {
      window.open('',`${this.props.srv} - ${file}`); // Open the window by name
    }

  };

  render() {
    const { data, directory, errorMessage } = this.state;
    return (
      <div>
        <InstanceLogsUI
          structure={data}
          directory={directory}
          changeDirectory={this.changeDirectory}
          changeDirectorySubmit={this.changeDirectorySubmit}
          errorMessage={errorMessage}
          dirClick={this.dirClick}
          fileClick={this.fileClick}/>
      </div>
    );
  }
}

InstanceLogsPage.propTypes = { srv: PropTypes.string.isRequired, };

function reformatFilesAndDirs(data) {
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
}

const mapDispatchToProps = { getInstanceLogs, addRequestedLogs };

export default connect((state, ownProps) => ({popups: state.logs[ownProps.srv].logs || []}), mapDispatchToProps)(InstanceLogsPage);