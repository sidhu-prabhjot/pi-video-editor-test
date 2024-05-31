import React, { FC } from 'react';
import { CustomTimelineAction, CusTomTimelineRow } from './mock';

interface CustomRenderProps {
  action: CustomTimelineAction;
  row: CusTomTimelineRow;
  onActionClick: (action: CustomTimelineAction) => void;
}

export const CustomRender0: FC<CustomRenderProps> = ({ action, row}) => {
  return (
    <div className={'effect0'}>
      <div className={`effect0-text`}>{`${action.data.name}`}</div>
    </div>
  );
};

export const CustomRender1: FC<CustomRenderProps> = ({ action, row, onActionClick }) => {
  return (
    <div className={'effect1'} onClick={() => onActionClick(action)}>
      <div className={`effect1-text`}>{`${action.data.name}`}</div>
    </div>
  );
};