import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import DocumentTitle from 'react-document-title';
import moment from 'moment';
import iziToast from 'izitoast';
import PropTypes from "prop-types";

import InstanceDetailsUI from "./InstanceDetailsUI";
import PageModals from "./PageModals";
import { loadInstance } from '../../../actions/loadInstancesActions';
import { toggleInstance } from '../../../actions/instanceLifecycleActions';
import { addServerLogs } from "../../../actions/instanceLogsActions";

moment.relativeTimeThreshold('s', 60);
moment.relativeTimeThreshold('ss', 30);
iziToast.settings({
  animateInside: false,
  pauseOnHover: false,
  position: 'bottomRight'
});

class InstanceDetailsPage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      instanceTimeStamp: moment(this.props.instance.timestamp).fromNow(),
      modalOpen: false,
      modalName: 'confirmModal',
    };
  }

  componentDidMount() {
    if (this.props.instance.id !== "") {
      this.updateInstanceDetails();
    }
    this.timerID = setInterval(this.updateLastUpdateTime, 3000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  updateLastUpdateTime = () => this.setState({ instanceTimeStamp: moment(this.props.instance.timestamp).fromNow() });

  updateInstanceDetails = () => this.props.loadInstance(this.props.instance);

  toggleInstance = status => {
    if (this.state.modalOpen) {
      this.toggleModal();
    }
    this.props.toggleInstance(this.props.instance, status)
      .then(data => {
        iziToast.success({
          title: 'OK.',
          message: `${data.message}`,
        });
        this.setInstanceToggleInterval(this.props.instance.statusColor, status);
      })
      .catch(err => iziToast.error({
        title: 'NOT OK.',
        message: `${err.message}`,
      }));
  };

  setInstanceToggleInterval = (initialStatusColor, action) => {
    if (this.toggleTimerID) {
      clearInterval(this.toggleTimerID);
    }
    this.toggleTimerID = setInterval(() => {
      this.updateInstanceDetails()
        .then(instance => {
          const currentStatus = {
            0: instance.statusColor === 'red', // User requested to stop, set bool if the new status is stopped
            1: instance.statusColor === 'green', // User requested to start, set bool if the new status is started /
                                                 // fulfilled
          };

          if (currentStatus[action]) {
            clearInterval(this.toggleTimerID);
          }
        });
      // this.updateInstanceOnToggle(initialStatusColor)

    }, 5000);
  };

  toggleModal = () => this.setState(prevState => ({ modalOpen: !prevState.modalOpen }));

  openLogsPopup = () => {
    const { instance, popups, addServerLogs } = this.props;
    if (instance.statusColor === 'green') {
      if (popups.hasOwnProperty(instance.ip)) {
        window.open('', instance.ip);
      } else {
        addServerLogs(instance.ip, instance.name);
      }
    } else {
      iziToast.error({
        title: 'Error!',
        message: `Server seems to be down. No logs can be displayed.`,
      });
    }
  };

  render() {
    const { instance } = this.props;
    const { modalOpen, instanceTimeStamp } = this.state;
    return (
      <DocumentTitle title={"Jarvis - " + instance.name}>
        <div>
          <PageModals
            toggleModal={this.toggleModal}
            modalOpen={modalOpen}
            instanceName={instance.name}
            toggleInstance={this.toggleInstance}/>
          <InstanceDetailsUI
            instance={instance}
            timestamp={instanceTimeStamp}
            onToggleInstance={this.toggleInstance}
            onToggleConfirmationModal={this.toggleModal}
            openLogsPopup={this.openLogsPopup}/>
        </div>
      </DocumentTitle>
    );
  }
}

InstanceDetailsPage.propTypes = {
  instance: PropTypes.object.isRequired,
};

function getInstanceById(instances, instanceId) {
  const instance = instances.filter(instance => instance.id === instanceId);
  if (instance.length) return instance[0];
  return null;
}

function mapStateToProps(state, ownProps) {
  const instanceId = ownProps.match.params.id;
  let instance = {
    id: '',
    name: '',
    ip: '',
    status: '',
    statusColor: '',
    type: '',
    client: '',
    amazonType: '',
    zone: '',
    timestamp: new Date(),
    tags: []
  };
  if (instanceId && state.instances.instances.length > 0) {
    instance = getInstanceById(state.instances.instances, instanceId) || instance;
  }
  return {
    instance,
    popups: state.logs,
  };
}

const mapDispatchToProps = {
  loadInstance,
  toggleInstance,
  addServerLogs,
};

export default connect(mapStateToProps, mapDispatchToProps)(InstanceDetailsPage);