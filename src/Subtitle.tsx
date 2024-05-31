import React, { useState } from 'react';

type SubtitleProps = {
    currentSubtitle: string;
};

const Subtitle: React.FC<SubtitleProps> = ({ currentSubtitle }) => {

    return (
        <div style={{width:"100%", display:"flex", justifyContent:"center"}}>
            <p>{currentSubtitle}</p>
        </div>
    );
};

export default Subtitle;
