import React from 'react';
import {Link} from 'react-router-dom';
import styled from 'styled-components';

import {blinker} from "../../../utils/animations";

const colors = {green: "#56ee56", red: "#ee0005", orange: "#ffb510"};

const Card = styled.div`
  margin: 15px;
  box-shadow: 0 0 0 1px #d4d4d5, 0 2.5px 0 0 ${props => colors[props.color]}, 0 1px 3px 0 #d4d4d5;
  border-radius: 5px;
  background-color: #fff;
  width: 190px;
  transition: transform .1s ease,box-shadow .1s ease;
 
  &:hover{
  transform: translateY(-3px);
  box-shadow: 0 1px 3px 0 #bcbdbd, 0 2.5px 0 0 ${props => colors[props.color]}, 0 0 0 1px #d4d4d5;
  }
  
  a {
    text-decoration: none;
  }
  
  .header{
    font-weight: 600;
    padding: 10px;
    word-wrap: break-word;
  }
  .status {
    padding: 10px;
    border-top: 1px solid #c3c3c3;
  }
`;

const SmallCircle = styled.i`
  color: ${props => colors[props.color]};
  ${props => props.color !== 'red' ? `animation: ${blinker} 1.0s cubic-bezier(.5, 0, 1, 1) infinite alternate;` : ''}
`;

const Grid = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  margin: 1rem;

`;

const InstancesList = ({instances, match}) => {
    const instanceObj = (data) => (
        <Link to={`${match.path}/instances/${data.id}`} key={data.id} style={{textDecoration: 'none'}}>
            <Card color={data.statusColor}>
                <div className="header">
                    {data.name}
                    <div className="sub-header">{data.ip}</div>
                </div>
                <div className="status">
                    <SmallCircle
                        color={data.statusColor}
                        className={`fa fa-circle`}>&nbsp;</SmallCircle>
                    {data.status}
                </div>
            </Card>
        </Link>
    );
    return (
        <Grid>
            {instances.map(data => instanceObj(data))}
        </Grid>
    );
};

export default InstancesList;
