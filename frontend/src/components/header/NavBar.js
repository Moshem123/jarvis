import React from 'react';
import styled from 'styled-components';
import {Link} from 'react-router-dom';
import PropTypes from "prop-types";

import icon from '../../scss/icon.png';

const Flex = styled.div`
  display: flex;
  height: 100%;
`;

const Container = Flex.extend`
    background-color: #2e3440;
    color: #ffffff;
    padding: 10px;
    height: 30px;
`;

const Header = styled.h3`
  font-size: ${props => props.sub ? '16px' : '23px'};
  margin: 0 10px 0 0;
  color: #fff;
  font-weight: bold;
  letter-spacing: 1.4px;
  transition: all 200ms ease-in-out;
  ${props => props.link && '&:hover{color: #dcdcdc;}'}
`;

const RightAligned = Flex.extend`
  margin-left: auto;
`;

const Image = styled.img`
  max-height:100%;
  transition: all 200ms ease-in-out;
  &:hover{
    transform: scale(1.40) rotate(-4.5deg);
  }
`;

const NavBar = ({name, handleLogOut}) => {
    return (
        <Container>
            <Link to="/" style={{textDecoration: 'none'}}>
                <Flex>
                    <Image src={icon}/>
                    <Header link>{" Jarvis"}</Header>
                </Flex>
            </Link>

            <RightAligned>
                <Header sub>Hello {name}  (<a onClick={handleLogOut}>log out</a>)</Header>
            </RightAligned>
        </Container>
    );
};

NavBar.propTypes = {
    name: PropTypes.string,
    handleLogOut: PropTypes.func.isRequired
};

export default NavBar;
