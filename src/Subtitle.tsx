import React, { useState } from 'react';

type SubtitleProps = {
    currentSubtitle: string;
};

const Subtitle: React.FC<SubtitleProps> = ({ currentSubtitle }) => {

    return (
        <div style={{backgroundColor: "#C1BDB3"}}>
            <p>{currentSubtitle}</p>
        </div>
    );
};

export default Subtitle;
