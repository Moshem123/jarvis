import React, { PureComponent } from 'react';
import { Switch, Route } from 'react-router-dom'
import { connect } from 'react-redux';
import iziToast from 'izitoast';

import Header from './header/Header';
import InstanceDetailsPage from "./instances/selected-instance/InstanceDetailsPage";
import InstancesPage from "./instances/all-instances/InstancesPage";
import PageWindows from './common/PageWindows';
import { removeServerLogs, removeRequestedLogs } from "../actions/instanceLogsActions";

iziToast.settings({
  animateInside: false,
  pauseOnHover: false,
  position: 'bottomRight'
});

class PrimaryLayout extends PureComponent {
  closeLogsPopup = srv => {
    this.props.removeServerLogs(srv)
  };

  closeReqLogsPopup = data => {
    const [server, log] = data.split(" - ");
    console.log(log);
    this.props.removeRequestedLogs(server, log)
  };

  popupBlockedHandler = () => iziToast.error({
    title: 'Error!',
    message: `Please allow popups in your browser for this website`,
  });

  render() {
    return (
      <div>
        <PageWindows
          popupBlockedHandler={this.popupBlockedHandler}
          closeLogsPopup={this.closeLogsPopup}
          closeReqLogsPopup={this.closeReqLogsPopup}
          popups={this.props.popups}/>
        <Header/>
        <Switch>
          <Route exact path={`${this.props.match.path}`} component={InstancesPage}/>
          <Route path={`${this.props.match.path}/instances/:id`} component={InstanceDetailsPage}/>
        </Switch>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    popups: state.logs
  };
}

function mapDispatchToProps(dispatch) {
  return {
    removeServerLogs: srv => dispatch(removeServerLogs(srv)),
    removeRequestedLogs: (srv, log) => dispatch(removeRequestedLogs(srv, log))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(PrimaryLayout)