/* eslint-disable */
import React from 'react';
import styled from 'styled-components';
import PropTypes from "prop-types";

import Back from '../../common/Back';
import ToggleButton from './ToggleButton';
import PageHeader from './PageHeader';
import instanceTypes from "../../../utils/instanceTypes";

const Flex = styled.div`
  display: flex;
`;
const Icon = styled.i`
  margin-right: 4px;
  line-height: 1.6;
`;
const DetailsContainer = Flex.extend`
  margin-top: 25px;
  @media (max-width: 1160px) {
    flex-flow: column nowrap;
  }
`;
const DetailsDataContainer = Flex.extend` 
  padding-right: 15px;
  &:not(:last-child) {
    border-right: 1px solid #bbb;
    @media (max-width: 1160px) {
      border-right: none; 
      border-bottom: 1px solid #bbb;
      padding: 5px 0;
      }
   }
   &:not(:first-child) {
     padding: 0 15px;
     @media (max-width: 1160px) {
        padding: 0;
     }
   }
  .header{
    font-weight: 600;
    margin-right: 5px;
  }
  .data {
    font-style: italic;
  }
`;
const TableContainer = Flex.extend`
  flex-flow: column nowrap;
  width: 15%;
  h5{
    margin: 10px 0 0 0;
  }
`;
// Styles
const Container = styled.div`
    margin: 20px 40px;
`;

const InstanceDetailsUI = ({ instance, timestamp, onToggleInstance, onToggleConfirmationModal, openLogsPopup }) => {
  let tagsFormat = {'key': 'Key', 'value': 'Value'};
  if (instance.lifeCycle === 'spot') {
    tagsFormat['key'] = 'tagKey';
    tagsFormat['value'] = 'tagValue';
  }
  return (
    <div>
      <Back/>
      <Container>
        <PageHeader
          instance={instance}/>
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
        <DetailsContainer>
          <DetailsDataContainer><Icon className="fa fa-hashtag"/>
            <div className="header">Instance ID:{" "}</div>
            {instance.id}</DetailsDataContainer>
          <DetailsDataContainer><Icon className="fa fa-server"/>
            <div className="header">Instance Type:{" "}</div>
            {instance.amazonType}</DetailsDataContainer>
          <DetailsDataContainer><Icon className="fa fa-globe"/>
            <div className="header">Instance Region:{" "}</div>
            {instance.zone}</DetailsDataContainer>
          <DetailsDataContainer><Icon className="fa fa-microchip"/>
            <div className="header">vCPUs:{" "}</div>
            {instanceTypes[instance.amazonType] || ""}</DetailsDataContainer>
          <DetailsDataContainer><Icon className="fa fa-clock-o"/>
            <div className="header">Last Update:{" "}</div>
            {timestamp}</DetailsDataContainer>
        </DetailsContainer>
        <TableContainer>
          <h5>Tags:</h5>
          <table>
            <thead>
            <tr>
              <th>Key</th>
              <th>Value</th>
            </tr>
            </thead>
            <tbody>
            {instance.tags.map(data => (
              <tr key={data.Key}>
                <td>{data[tagsFormat['key']]}</td>
                <td>{data[tagsFormat['value']]}</td>
              </tr>
            ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
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