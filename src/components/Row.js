import React from 'react';

const Row = ({list, index, key, style }) => {
    return (
        <div key={key} style={style} className="row">
        <div className="content">
            <div>{list[index].data.name}</div>
            <div>{list[index].start}</div>
        </div>
        </div>
    );

}

export default Row;