// @flow

import React from 'react';

import styled from '@emotion/styled';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import settings from 'game/settings';
import type {DynamicEntity} from 'game/types';

const SIZE = settings.playerSize;
const HALF = SIZE / 2;

const BallContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: absolute;
  left: ${({entity}) => entity.pos.x - HALF}px;
  top: ${({entity}) => entity.pos.y - HALF}px;
  transform: rotate(${({entity}) => entity.dir.angle()}rad);
  width: ${SIZE}px;
  height: ${SIZE}px;
  background-color: ${({color}) => color};
  border-radius: ${SIZE / 2}px;
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
