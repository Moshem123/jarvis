import React from 'react';
import PropTypes from 'prop-types';

import NewWindow from './NewWindow';
import InstanceLogsPage from '../logs/InstanceLogsPage';
import CatLogPage from "../logs/CatLogPage";

const PageWindows = ({ popupBlockedHandler, closeLogsPopup, closeReqLogsPopup, popups }) => {
  // Popups for logs on a server
  let renderWindows = Object.keys(popups).map(popup =>
    <NewWindow
      key={popups[popup].name}
      name={popup}
      onBlock={popupBlockedHandler}
      onUnload={closeLogsPopup}
      features={{ height: '850', width: '800' }}
      title={popups[popup].name}>
      <InstanceLogsPage srv={popup}/>
    </NewWindow>);

  // Popups of specific logs
  for (let popup in popups) {
    if (!popups.hasOwnProperty(popup)) continue;
    const files = popups[popup].logs.map((log, i) =>
      <NewWindow
        key={log + i}
        name={`${popup} - ${log}`}
        title={`${popup} - ${log}`}
        onUnload={closeReqLogsPopup}>
        <CatLogPage
          logFile={log}
          srv={popup} />
      </NewWindow>
    );
    renderWindows = renderWindows.concat(files);
  }

  return (<div>{renderWindows}</div>);
};

PageWindows.propTypes = {
  popupBlockedHandler: PropTypes.func,
  closeLogsPopup: PropTypes.func.isRequired,
  closeReqLogsPopup: PropTypes.func.isRequired,
  popups: PropTypes.object
};

PageWindows.defaultProps = {
  popups: {}
};

export default PageWindows;

