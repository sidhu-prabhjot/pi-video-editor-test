import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow} from '@xzdarcy/react-timeline-editor';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useRef, useState, useEffect } from 'react';
import { CustomRender0, CustomRender1 } from './custom';
import SortableList from './Sortable';
import './index.less';
import TimelinePlayer from './player';
import audioControl from './audioControl';
import lottieControl from './lottieControl';


/////////////////////////////////////////////////////////////////////////////data control

const scaleWidth = 160;
const scale = 5;
const startLeft = 20;


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

const mockEffect: Record<string, TimelineEffect> = {
  effect0: {
    id: 'effect0',
    name: 'effect0',
    source: {
      start: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time });
          console.log("data: ", (action as CustomTimelineAction));
        }
      },
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time });
        }
      },
      leave: ({ action, engine }) => {
        const src = (action as CustomTimelineAction).data.src;
        audioControl.stop({ id: src, engine });
      },
      stop: ({ action, engine }) => {
        const src = (action as CustomTimelineAction).data.src;
        audioControl.stop({ id: src, engine });
      },
    },
  },
  effect1: {
    id: 'effect1',
    name: 'effect1',
    source: {
      enter: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        lottieControl.enter({ id: src, src, startTime: action.start, endTime: action.end, time });
        console.log("data: ", (action as CustomTimelineAction));
      },
      update: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        lottieControl.update({ id: src, src, startTime: action.start, endTime: action.end, time });
      },
      leave: ({ action, time }) => {
        const src = (action as CustomTimelineAction).data.src;
        lottieControl.leave({ id: src, startTime: action.start, endTime: action.end, time });
      },
    },
  },
};

const mockData: CusTomTimelineRow[] = [
  {
    id: '0',
    actions: [
      {
        id: 'action3',
        start: 0,
        end: 20,
        effectId: 'effect0',
        data: {
          src: '/lottie/lottie1/data.json',
          name: 'Hello',
          subtitleNumber: 1,
          metaData: "",
        },
      },
      {
        id: 'action4',
        start: 22,
        end: 24,
        effectId: 'effect1',
        data: {
          src: '/lottie/lottie1/data.json',
          name: 'World',
          subtitleNumber: 2,
          metaData: "",
        },
      },
    ],
  },
];  

/////////////////////////////////////////////////////////////////////////////////////////

const defaultEditorData = cloneDeep(mockData);

const App = () => {

  const [data, setData] = useState(defaultEditorData);
  const timelineState = useRef<TimelineState>();
  const playerPanel = useRef<HTMLDivElement>(null);
  const autoScrollWhenPlay = useRef<boolean>(true);


  const addSubtitle = () => {
    const subtitleObject = {
      id: 'action5',
      start: 27,
      end: 31,
      effectId: 'effect1',
      data: {
        src: '/lottie/lottie1/data.json',
        name: 'My Name is Prabhjot',
        subtitleNumber: 3,
        metaData: "",
      }
    };
    const tempData = cloneDeep(defaultEditorData);
    tempData[0].actions.push(subtitleObject);
    setData(tempData);
  }

  console.log(timelineState);

  return (
    <div className="main-container" style={{height:"100vh",  display:"flex", flexDirection:"column"}}>
      <div className="main-row-1" style={{height:"70vh", display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div className="scroll-container" style={{height:"100%", flex:"1",  display:"flex", flexDirection:"column", backgroundColor:"#8A9A5B"}}>
          <p>Scroll Container</p>
          <SortableList data={data} />
        </div>
        <div className="video-container" style={{height:"100%", flex:"1",  display:"flex", flexDirection:"column", backgroundColor:"#7393B3"}}>
          <p>Video Container</p>
        </div>
      </div>
      <div className="timeline-editor-engine main-row-2" style={{height:"30vh", backgroundColor:"#808080", display:"flex", flexDirection:"column"}}>
        <div>
          <button onClick={() => addSubtitle()}>
            Click To Add Subtitle: "New Subtitle"
          </button>
        </div>
        <div className="player-config">
          <Switch
            checkedChildren="开启运行时自动滚动"
            unCheckedChildren="禁用运行时自动滚动"
            defaultChecked={autoScrollWhenPlay.current}
            onChange={(e) => (autoScrollWhenPlay.current = e)}
            style={{ marginBottom: 20 }}
          />
        </div>
        <div className="player-panel" id="player-ground-1" ref={playerPanel}></div>
        <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay={autoScrollWhenPlay} />
        <Timeline
          style={{width:"100%", height: "100px"}}
          scale={scale}
          scaleWidth={scaleWidth}
          startLeft={startLeft}
          autoScroll={true}
          ref={timelineState}
          editorData={data}
          effects={mockEffect}
          onChange={(data) => {
            console.log("data changed: ", data);
            setData(data as CusTomTimelineRow[]);
          }}
          getActionRender={(action, row) => {
            if (action.effectId === 'effect0') {
              return <CustomRender0 action={action as CustomTimelineAction} row={row as CusTomTimelineRow} />;
            } else if (action.effectId === 'effect1') {
              return <CustomRender1 action={action as CustomTimelineAction} row={row as CusTomTimelineRow} />;
            }
          }}
          autoReRender={true}
        />
      </div>
    </div>
  );
};

export default App;
