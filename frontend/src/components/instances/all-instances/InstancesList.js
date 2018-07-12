import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

import { blinker } from "../../../utils/animations";

const colors = { green: "#56ee56", red: "#ee0005", orange: "#ffb510" };
const lifecycleToColor = { ec2: "#249fff", spot: "#ff8800", fleet: "#03cf03" };

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
    color: ${props => lifecycleToColor[props.lifecycle]}
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
  cursor: pointer;
  div{
    display: flex;
    align-items: center;
    &>div{
      margin-left: 5px;
      flex: 1;
    }
  }
`;
const SortUp = styled.i`
  left: 3px;
  display: inline-block;
  width: 0;
  height: 0;
  border: solid 5px transparent;
  margin: 4px 4px 0 3px;
  background: transparent;
  border-bottom: solid 7px #000;
  border-top-width: 0;
`;
const SortDown = styled.i` 
  left: 3px;
  display: inline-block;
  width: 0;
  height: 0;
  border: solid 5px transparent;
  margin: 4px 4px 0 3px;
  background: transparent;
  border-top: solid 7px #000;
  border-bottom-width: 0;
`;


const InstancesList = ({ instances, match, listType, sortFunc, alreadySorted }) => {
  const instanceObj = data => (
    <Link to={`${match.path}/instances/${data.id}`} key={data.id}
          style={{ textDecoration: 'none' }}>
      <Card color={data.statusColor} lifecycle={data.lifeCycle}>
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
        <Link to={`${match.path}/instances/${data.id}`} style={{ color: lifecycleToColor[data.lifeCycle] }}>
          {data.name}
        </Link>
      </td>
      <td>{data.ip}</td>
      <td>{data.type}</td>
      <td style={{ color: colors[data.statusColor] }}>{data.status}</td>
      <td>{data.id}</td>
      <td>{data.lifeCycle}</td>
      <td>{data.amazonType}</td>
      <td>{data.client}</td>
      <td>{data.zone}</td>
    </tr>
  );
  const headers = [
    {
      lName: 'name',
      uName: 'Name',
      faIcon: 'rocket'
    }, {
      lName: 'ip',
      uName: 'IP',
      faIcon: 'terminal'
    }, {
      lName: 'type',
      uName: 'Type',
      faIcon: 'flag'
    }, {
      lName: 'status',
      uName: 'Status',
      faIcon: 'heartbeat'
    }, {
      lName: 'id',
      uName: 'ID',
      faIcon: 'hashtag'
    }, {
      lName: 'lifeCycle',
      uName: 'Life Cycle',
      faIcon: 'amazon'
    }, {
      lName: 'amazonType',
      uName: 'Instance Type',
      faIcon: 'server'
    }, {
      lName: 'client',
      uName: 'Client',
      faIcon: 'user'
    }, {
      lName: 'zone',
      uName: 'Region',
      faIcon: 'globe'
    }
  ];
  const views = {
    'boxes': <Grid>
      {instances.map(data => instanceObj(data))}
    </Grid>,
    'table': (
      <Container>
        <table style={{ flex: 1 }}>
          <thead>
          <tr>
            {headers.map(header => (
              <Th key={header.lName} id={header.lName} onClick={sortFunc}>
                <div>
                  <i className={`fa fa-${header.faIcon}`} aria-hidden="true"/>
                  <div className="name">{header.uName}</div>
                  {alreadySorted.field === header.lName && (alreadySorted.dir === 'asc' ? <SortUp/> : <SortDown/>)}
                </div>
              </Th>
            ))}
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