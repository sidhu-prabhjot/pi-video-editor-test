import React, { useState, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";
import {TimelineRow, TimelineAction} from '@xzdarcy/react-timeline-editor';


interface CustomTimelineAction extends TimelineAction {
    data: {
      src: string;
      name: string;
      subtitleNumber: number;
      metaData: string;
    };
  }

interface CusTomTimelineRow extends TimelineRow {
    actions: CustomTimelineAction[];
  }

interface Item {
    id: number;
    name: string;
}

interface Props {
    data: CusTomTimelineRow[];
}

const SortableList: React.FC<Props> = ({ data }) => {
    const [state, setState] = useState<CusTomTimelineRow[]>([...data]);

    useEffect(() => {
        console.log("SortableList received new data:", data[0]);
        setState([...data]);
    }, [data]);

    const handleSort = (newState: CusTomTimelineRow[]) => {
        setState(newState);
    };

    console.log("SortableList state:", state);

    return (
        <ReactSortable list={state} setList={handleSort}>
            {state[0].actions.map((item) => (
                <div key={item.id}>{item.data.name}</div>
            ))}
        </ReactSortable>
    );
};

export default SortableList;
