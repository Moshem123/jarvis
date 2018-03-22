import React from 'react';
import styled from "styled-components";
import PropTypes from 'prop-types';

import Modal from './Modal';

const colors = {green: "#56ee56", red: "#ee0005", orange: "#ffb510"};
const Flex = styled.div`
  display: flex;
`;
const Title = styled.h3`
  color: ${props => colors[props.color] !== 'undefined' ? colors[props.color] : props.color};
  text-decoration: underline;
`;
const ConfirmationButtons = Flex.extend`
  justify-content: space-between;
`;
const Divider = styled.hr`
  margin-bottom: 20px;
  box-shadow: 0 20px 20px -20px #333;
`;

const ConfirmationModal = ({modalOpen, toggleModal, onConfirmAction, overlay, confirmText, cancelText, title, titleColor, message}) => (
    <div>
        <Modal
            isModalOpen={modalOpen}
            toggleModal={toggleModal}
            overlay={overlay}>
            <Title color={titleColor}>{title}</Title>
            <h5>{message}</h5>
            <Divider/>
            <ConfirmationButtons>
                <button className="button button-success" onClick={onConfirmAction}>{confirmText}</button>
                <button className="button button-error" onClick={toggleModal}>{cancelText}</button>
            </ConfirmationButtons>
        </Modal>
    </div>
);

ConfirmationModal.propTypes = {
    modalOpen: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    onConfirmAction: PropTypes.func,
    overlay: PropTypes.bool,
    confirmText: PropTypes.string,
    cancelText: PropTypes.string,
    title: PropTypes.string,
    titleColor: PropTypes.string,
    message: PropTypes.string
};

ConfirmationModal.defaultProps = {
    onConfirmAction: () => alert('Clicked confirm!'),
    overlay: false,
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    title: 'Are you sure?',
    titleColor: '#fff',
    message: 'Are you sure you want to perform this action?'
};


export default ConfirmationModal;
