import React from 'react';
import styled from 'styled-components';
import PropTypes from "prop-types";
import pick from 'lodash/pick';

import instanceTypes from "../../../utils/instanceTypes";
import {blinker} from "../../../utils/animations";

const Flex = styled.div`
  display: flex;
`;
const PageHeaderDiv = Flex.extend`
  justify-content: space-between;
`;
const InstanceName = styled.h2`
  margin-bottom: 0;
`;
const InstanceIP = styled.h5`
  margin-top: -12px;
  color: #a4a4a4;
`;
const InstanceStatus = styled.span`
  color: ${props => props.color};
  font-size: .65em;
  font-weight: normal;
  ${props => props.blink ? `animation: ${blinker} 1.0s cubic-bezier(.5, 0, 1, 1) infinite alternate;` : ''}
`;
const DetailsContainer = Flex.extend`
  height: 100%;
  flex-flow: row wrap;
  @media (max-width: 1160px) {
      border-right: none;
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
  
  .header{
    font-weight: 600;
  }
  .data {
    font-style: italic;
  }
`;
const DetailsDataIcon = styled.div`
  align-self: center;
  padding: 5px 10px 5px 10px;   
`;
const newKeyNames = {
    'type': {newName: 'Type', icon: 'flag-checkered'},
    'amazonType': {newName: 'Instance Type', icon: 'server'},
    'client': {newName: 'Client', icon: 'user'},
    'zone': {newName: 'Region', icon: 'globe'},
    'cpu': {newName: 'CPU', icon: 'microchip'},
    'timestamp': {newName: 'Last Update', icon: 'clock-o'}
};

const PageHeader = ({instance, colors, timestamp}) => {
    const instData = pick(instance, ['type', 'client', 'amazonType', 'zone']);
    instData.cpu = instanceTypes[instData.amazonType];
    instData.timestamp = timestamp;
    return (
        <PageHeaderDiv>
            <div>
                <InstanceName>
                    {instance.name + " "}
                    <InstanceStatus color={colors[instance.statusColor]}
                                    blink={instance.statusColor !== 'red'}>
                        ({instance.status})
                    </InstanceStatus>

                </InstanceName>
                <InstanceIP>{instance.ip}</InstanceIP>
            </div>
            <DetailsContainer>
                {Object.keys(instData).map(data => (
                    <DetailsDataContainer key={data}>
                        <DetailsDataIcon>
                            <i className={"fa fa-" + newKeyNames[data].icon}/>
                        </DetailsDataIcon>
                        <div>
                            <div className="header">{newKeyNames[data].newName}</div>
                            <div className="data">{instData[data]}</div>
                        </div>
                    </DetailsDataContainer>
                ))}
            </DetailsContainer>
        </PageHeaderDiv>
    );
};

PageHeader.propTypes = {
    instance: PropTypes.object.isRequired,
    colors: PropTypes.object,
    timestamp: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
        PropTypes.instanceOf(Date)
    ]),
};

PageHeader.defaultProps = {
    colors: {green: "#56ee56", red: "#ee0005", orange: "#ffb510"}
};

export default PageHeader;