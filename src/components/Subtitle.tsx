import React from 'react';
import {TimelineAction} from '@xzdarcy/react-timeline-editor';

import '../styles/Main.css';
import '../styles/Subtitle.css';


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

    console.log("current subtitle in subtitle component:", currentSubtitle.data.name);

    return (
        <div id={"subtitle"} style={{justifyContent: `${alignment}`, marginTop: `${linePosition}px`}}>
            {currentSubtitle.data.name !== "" ? <p style={{color:"#ffffff", marginTop: "0", backgroundColor: "#000000", padding:"2px"}}>{currentSubtitle.data.name}</p> : <p></p>}
        </div>
    );
};

export default Subtitle;
