import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';


import {slideInDown} from "../../utils/animations";

const ModalOuter = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    z-index: 1;
    display: ${props => props.open ? 'block' : 'none'};
`;

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,${props => props.overlay ? '0.5' : '0'});
`;

const ModalBody = styled.div`
    position: relative;
    width: 500px;
    padding: 20px;
    box-sizing: border-box;
    background-color: #fff;
    margin: 40px auto;
    border-radius: 3px;
    z-index: 2;
    text-align: left;
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.2);
    animation: ${slideInDown} .5s;
    animation-fill-mode: both;
`;

const Modal = ({isModalOpen, toggleModal, overlay, children}) => (
    <ModalOuter open={isModalOpen}>
        <ModalOverlay onClick={toggleModal} overlay={overlay}/>
        {/*<div onClick={this.props.closeModal}/>*/}
        <ModalBody>
            {children}
        </ModalBody>
    </ModalOuter>
);

Modal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    toggleModal: PropTypes.func.isRequired,
    overlay: PropTypes.bool,
};

Modal.defaultProps = {
    overlay: true
};

export default Modal;