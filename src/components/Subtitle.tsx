import React, { useState } from 'react';
import '../styles/Main.css';
import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow} from '@xzdarcy/react-timeline-editor';


interface CustomTimelineAction extends TimelineAction {
    data: {
      src: string;
      name: string;
      subtitleNumber: number;
      alignment: string;
      direction: string;
      lineAlign: string;
      linePosition: string;
      size: number;
      textPosition: string;
      toEdit: boolean;
    };
  }

type SubtitleProps = {
    currentSubtitle: CustomTimelineAction;
    alignment: string;
    linePosition: number;
};

const Subtitle: React.FC<SubtitleProps> = ({ currentSubtitle, alignment, linePosition }) => {

    return (
        <div id={"subtitle"} style={{display: "flex", width: "95%", top:"0", paddingLeft: "10px", paddingRight: "10px", position: "absolute", zIndex:"1", justifyContent: `${alignment}`, marginTop: `${linePosition}px`}}>
            {currentSubtitle.data.name !== "" ? <p style={{color:"#ffffff", marginTop: "0", backgroundColor: "#000000", padding:"2px"}}>{currentSubtitle.data.name}</p> : <p></p>}
        </div>
    );
};

export default Subtitle;
