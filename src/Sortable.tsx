import React, { useState, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";
import { TimelineRow, TimelineAction } from "@xzdarcy/react-timeline-editor";

interface CustomTimelineAction extends TimelineAction {
  data: {
    src: string;
    name: string;
    subtitleNumber: number;
    metaData: string;
  };
}

interface CustomTimelineRow extends TimelineRow {
  actions: CustomTimelineAction[];
}

interface ActionItem {
  data: {
    metaData: string;
    name: string;
    src: string;
    subtitleNumber: number;
  };
  effectId: string;
  end: number;
  id: string;
  start: number;
}

interface Item {
  actions: Array<ActionItem>;
  id: string;
}

interface Props {
  data: CustomTimelineRow[];
}

const SortableList: React.FC<Props> = ({ data }) => {
  const [state, setState] = useState<CustomTimelineAction[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      console.log("SortableList received new data:", data[0]);
      setState([...data[0].actions]);
    }
  }, [data]);

  const handleSort = (newState: CustomTimelineAction[]) => {
    setState(newState);
  };

  console.log("SortableList state:", state);

  return (
    <ReactSortable list={state} setList={handleSort}>
      {state.map((item) => (
        <div key={item.id}>{item.data.name}</div>
      ))}
    </ReactSortable>
  );
};

export default SortableList;
