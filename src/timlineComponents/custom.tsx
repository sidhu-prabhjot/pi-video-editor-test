import React, { FC } from 'react';
import { CustomTimelineAction, CusTomTimelineRow } from './mock';
import '../timelineStyles/Timeline.css';

interface CustomRenderProps {
  action: CustomTimelineAction;
  currentSubtitle: CustomTimelineAction;
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

export const CustomRender1: FC<CustomRenderProps> = ({ action, currentSubtitle, onActionClick }) => {
  return (
    <div className={'effect1 action-container'} onClick={async () => {
      const removeHighlight = async () => {
        currentSubtitle.data.backgroundColor = "#E5E5E5";
      }
      await removeHighlight();
      onActionClick(action)
      }}>
      <div className={`effect1-text action-content`}>{`${action.data.name}`}</div>
    </div>
  );
};