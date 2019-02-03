// @flow

import React from 'react';

import styled from '@emotion/styled';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import type {DynamicEntity} from 'game/types';

const BallContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: absolute;
  left: ${({entity}) => entity.pos.x - entity.size}px;
  top: ${({entity}) => entity.pos.y - entity.size}px;
  transform: rotate(${({entity}) => entity.dir}rad);
  width: ${({entity}) => entity.size * 2}px;
  height: ${({entity}) => entity.size * 2}px;
  background-color: ${({color}) => color};
  border-radius: ${({entity}) => entity.size}px;
  z-index: ${({entity}) => entity.size};
`;

type Props = {
  entity: DynamicEntity
};

const Ball = (props: Props) => (
  <BallContainer {...props}>
    <ChevronRightIcon />
  </BallContainer>
);

export default Ball;
