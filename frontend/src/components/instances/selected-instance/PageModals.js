import React from 'react';
import PropTypes from 'prop-types';

import ConfirmationModal from '../../common/ConfirmationModal';

const PageModals = ({modalOpen, toggleModal, toggleInstance, instanceName}) => {
    const stopInstance = () => {
      toggleInstance(0);
    };
    return (
        <div>
            <ConfirmationModal
                modalOpen={modalOpen}
                toggleModal={toggleModal}
                onConfirmAction={stopInstance}
                title="Warning!"
                titleColor="red"
                message={`Are you sure you want to stop ${instanceName}?`}/>
        </div>
    );
};

PageModals.propTypes = {
    modalOpen: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    instanceName: PropTypes.string.isRequired,
    toggleInstance: PropTypes.func.isRequired,
};


export default PageModals;
