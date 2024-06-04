import React, { useState } from 'react';

type SubtitleProps = {
    currentSubtitle: string;
    alignment: string;
    linePosition: number;
};

const Subtitle: React.FC<SubtitleProps> = ({ currentSubtitle, alignment, linePosition }) => {

    return (
        <div style={{display: "flex", width: "95%", top:"0", paddingLeft: "10px", paddingRight: "10px", position: "absolute", zIndex:"999999", justifyContent: `${alignment}`, marginTop: `${linePosition}px`}}>
            {currentSubtitle !== "" ? <p style={{color:"#ffffff", marginTop: "0", backgroundColor: "#000000", padding:"2px"}}>{currentSubtitle}</p> : <p></p>}
        </div>
    );
};

export default Subtitle;
