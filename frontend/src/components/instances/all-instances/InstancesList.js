import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { blinker } from "../../../utils/animations";

const colors = { green: "#56ee56", red: "#ee0005", orange: "#ffb510" };

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
`;
const Container = styled.div`
  margin: 30px;
  display: flex;
  justify-content: center
`;
const Th = styled.th`

`;

const InstancesList = ({ instances, match, listType }) => {
  const instanceObj = data => (
    <Link to={`${match.path}/instances/${data.id}`} key={data.id}
          style={{ textDecoration: 'none' }}>
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
  const instanceRow = data => (
    <tr key={data.id}>
      <td>
        <SmallCircle
          color={data.statusColor}
          className={`fa fa-circle`}>&nbsp;</SmallCircle>
        <Link to={`${match.path}/instances/${data.id}`}>
          {data.name}
        </Link>
      </td>
      <td>{data.ip}</td>
      <td>{data.type}</td>
      <td style={{ color: colors[data.statusColor] }}>{data.status}</td>
      <td>{data.id}</td>
      <td>{data.amazonType}</td>
      <td>{data.client}</td>
      <td>{data.zone}</td>
    </tr>
  );

  const views = {
    'boxes': <Grid>
      {instances.map(data => instanceObj(data))}
    </Grid>,
    'table': (
      <Container>
        <table style={{ flex: 1 }}>
          <thead>
          <tr>
            <Th id='name'>
              <i className="fa fa-rocket" aria-hidden="true"/>
              {" "}Name
            </Th>
            <Th id='ip'>
              <i className="fa fa-terminal" aria-hidden="true"/>
              {" "}IP
            </Th>
            <Th id='type'>
              <i className="fa fa-flag-checkered" aria-hidden="true"/>
              {" "}Type
            </Th>
            <Th id='status'>
              <i className="fa fa-heartbeat" aria-hidden="true"/>
              {" "}Status
            </Th>
            <Th id='id'>
              <i className="fa fa-hashtag" aria-hidden="true"/>
              {" "}ID
            </Th>
            <Th id='amazonType'>
              <i className="fa fa-server" aria-hidden="true"/>
              {" "}Instance Type
            </Th>
            <Th id='client'>
              <i className="fa fa-user" aria-hidden="true"/>
              {" "}Client
            </Th>
            <Th id='zone'>
              <i className="fa fa-globe" aria-hidden="true"/>
              {" "}Region
            </Th>
          </tr>
          </thead>
          <tbody>
          {instances.map(data => instanceRow(data))}
          </tbody>
        </table>
      </Container>
    )
  };
  return views[listType];
};

export default InstancesList;
