import React from 'react';
import styled from 'styled-components';

import {rotate, rotateRev, pulse} from "../../utils/animations";

const Container = styled.div`
    background-color: rgba(248, 248, 248, 0.7);
    height: 100vw;
    width: 100vw;
    z-index: 111;
    position: fixed;
`;
const Circle = styled.div`
    width: 180px;
    height: 180px;
    border: 10px inset rgb(133,224,242);
    display: block;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -100px;
    margin-top: -100px;
    border-radius: 200px;
    animation: ${rotate} 5s infinite linear;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
`;
const CircleSmall = styled.div`
    width: 150px;
    height: 150px;
    border: 6px outset rgb(133,224,242);
    display: block;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -81px;
    margin-top: -81px;
    border-radius: 156px;
    animation: ${rotateRev} 3s infinite linear;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
`;
const CircleBig = styled.div`
    width: 210px;
    height: 210px;
    border: 4px dotted rgb(133,224,242);
    display: block;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -109px;
    margin-top: -109px;
    border-radius: 214px;
    animation: ${rotateRev} 10s infinite linear;
`;
const CircleInner = styled.div`
    width: 80px;
    height: 80px;
    background-color: rgb(133,224,242);
    display: block;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -40px;
    margin-top: -40px;
    border-radius: 80px;
    animation: ${pulse} 1.5s infinite ease-in;
    opacity: 1;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
`;
const CircleInnerInner = styled.div`
    width: 100px;
    height: 100px;
    background-color: rgb(74,124,134);
    display: block;
    position: fixed;
    top: 50%;
    left: 50%;
    margin-left: -50px;
    margin-top: -50px;
    border-radius: 100px;
    animation: ${pulse} 1.5s infinite ease-in;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
`;

const Loader = () => {
    return (
        <Container>
            <Circle />
            <CircleSmall />
            <CircleBig />
            <CircleInner />
            <CircleInnerInner />
        </Container>
    );
};

export default Loader;