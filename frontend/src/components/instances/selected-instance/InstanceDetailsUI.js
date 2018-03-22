import React from 'react';
import styled from 'styled-components';
import PropTypes from "prop-types";

import Back from '../../common/Back';
import ToggleButton from './ToggleButton';
import PageHeader from './PageHeader';

// Styles
const Container = styled.div`
    margin: 20px 40px;
`;

const InstanceDetailsUI = ({instance, timestamp, onToggleInstance, onToggleConfirmationModal, openLogsPopup}) => {
    return (
        <div>
            <Back/>
            <Container>
                <PageHeader
                    instance={instance}
                    timestamp={timestamp}/>
                <div className="button-group" role="group">
                    <ToggleButton className="button button-success" toggleMethod={onToggleInstance} action="1">
                        <i className="fa fa-play"/>{" "}Start
                    </ToggleButton>
                    <button className="button button-error" onClick={onToggleConfirmationModal}>
                        <i className="fa fa-stop"/>{" "}Stop
                    </button>
                    <button className="button button-secondary" onClick={openLogsPopup}>
                        <i className="fa fa-file-o"/>{" "}View logs
                    </button>
                </div>
            </Container>
            {/*<Button icon='database' content="Run DB"/>*/}
            {/*<Button icon='warning sign' color='red' content="Run DB++"/>*/}
        </div>
    );
};

InstanceDetailsUI.propTypes = {
    instance: PropTypes.object.isRequired,
    timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date)
    ]),
    onToggleInstance: PropTypes.func.isRequired,
    onToggleConfirmationModal: PropTypes.func.isRequired,
    openLogsPopup: PropTypes.func.isRequired,
};

export default InstanceDetailsUI;