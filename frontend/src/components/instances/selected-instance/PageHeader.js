import React from 'react';
import styled from 'styled-components';
import PropTypes from "prop-types";

import { blinker } from "../../../utils/animations";
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

const PageHeader = ({ instance, colors }) => {
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
    </PageHeaderDiv>
  );
};

PageHeader.propTypes = {
  instance: PropTypes.object.isRequired,
  colors: PropTypes.object
};

PageHeader.defaultProps = {
  colors: { green: "#56ee56", red: "#ee0005", orange: "#ffb510" }
};

export default PageHeader;