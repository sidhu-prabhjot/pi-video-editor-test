import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow} from '@xzdarcy/react-timeline-editor';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import _remove from 'lodash/remove';
import React, { useRef, useState, useEffect } from 'react';
import { CustomRender0, CustomRender1, CustomRender2 } from './custom';
import SortableList from './Sortable';
import './index.less';
import TimelinePlayer from './player';
import audioControl from './audioControl';
import lottieControl from './lottieControl';


/////////////////////////////////////////////////////////////////////////////data control

const scaleWidth = 160;
const scale = 5;
const startLeft = 20;

//defines the properties of a subtitle object in the timeline
interface CustomTimelineAction extends TimelineAction {
  data: {
    src: string;
    name: string;
    subtitleNumber: number;
    metaData: string;
  };
}

//the data structure for an entire row in the timeline
interface CusTomTimelineRow extends TimelineRow {
  actions: CustomTimelineAction[];
}

//defines the properties of the timeline and how it will operate. Need a definition for each effect id
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

//all the data that exists in a SINGLE timeline row
const mockData: CusTomTimelineRow[] = [
  {
    id: '0',
    actions: [
      {
        id: 'action0',
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
        id: 'action1',
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



//////////////////////////////////////////////////////////////////////////////////////////////////

const defaultEditorData = cloneDeep(mockData);

const App = () => {

  const [data, setData] = useState(defaultEditorData);
  const [list, setList] = useState([]);

  //the current state of the timeline and its operations (can be manipulated)
  const timelineState = useRef<TimelineState>();
  const playerPanel = useRef<HTMLDivElement>(null);
  const autoScrollWhenPlay = useRef<boolean>(true);
  const idRef = useRef(data[0].actions.length);

  //////////////////////////////////////////////////////// managing sidelist

  //deleting from list
  const deleteSubtitle = (id: String) => {

    const tempArray = data[0].actions;

    let results = _remove(tempArray, (subtitle) => {
      return subtitle.id != id;
    });

    data[0].actions = [...results];

    setData([...data]);

  }

  const insertSubtitle = (previousEndTime: number) => {

    setData (() => {  
      const newAction : CustomTimelineAction = {   
        id : `action${idRef.current++}` , 
        start : previousEndTime + 0.5,
        end : previousEndTime + 1.5 , 
        effectId : "effect1",
        data: {
          src: '/lottie/lottie1/data.json',
          name: 'New Subtitle',
          subtitleNumber: 0,
          metaData: '',
        } 
      }
      let tempArray = cloneDeep(data);
      for (let i = 0; i < tempArray[0].actions.length; i++) {
          if (newAction.start <= tempArray[0].actions[i].start) {
              tempArray[0].actions.splice(i, 0, newAction);
              break;
          }
      }
      if (tempArray[0].actions.length === 0 || newAction.start > tempArray[0].actions[tempArray[0].actions.length - 1].start) {
          tempArray[0].actions.push(newAction); 
      }
      return [...tempArray];              
    });

  }

  //building list to view
  const buildList = () => {

    console.log("data to list: ", data[0].actions);
  
    setList(data[0].actions.map((subtitleObject) => {
      let listItem = <li key={subtitleObject.id}><div onClick={() => deleteSubtitle(subtitleObject.id)}>(-)</div>{subtitleObject.data.name}<div onClick={() => insertSubtitle(subtitleObject.end)}>(+)</div></li>
      return listItem;
    }));
  
  }

  /////////////////////////////////////////////////////////////////

  useEffect(() => {
    console.log("current dataset: ", data);
    buildList();
  }, [data])


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

  return (
    <div className="main-container" style={{height:"100vh",  display:"flex", flexDirection:"column"}}>
      <div className="main-row-1" style={{height:"70vh", display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div className="scroll-container" style={{height:"100%", flex:"1",  display:"flex", flexDirection:"column", backgroundColor:"#8A9A5B"}}>
          <p>Scroll Container</p>
          <ul>
            {list}
          </ul>
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
            } else if (action.effectId === 'effect2') {
              return <CustomRender2 action={action as CustomTimelineAction} row={row as CusTomTimelineRow} />;
            }
          }}
          onDoubleClickRow = { ( e , { row , time } ) => {   
            setData (( pre ) => {  
              const rowIndex = pre.findIndex ( item => item.id === row.id ) ; 
              const newAction : CustomTimelineAction = {   
                id : `action${idRef.current++}` , 
                start : time ,
                end : time + 0.5 , 
                effectId : "effect1",
                data: {
                  src: '/lottie/lottie1/data.json',
                  name: 'New Subtitle',
                  subtitleNumber: 0,
                  metaData: '',
                } 
              }
              let tempArray = cloneDeep(data);
              for (let i = 0; i < tempArray[0].actions.length; i++) {
                  if (newAction.start <= tempArray[0].actions[i].start) {
                      tempArray[0].actions.splice(i, 0, newAction);
                      break;
                  }
              }
              if (tempArray[0].actions.length === 0 || newAction.start > tempArray[0].actions[tempArray[0].actions.length - 1].start) {
                  tempArray[0].actions.push(newAction); 
              }
              return [...tempArray];              
            });
          }}
          autoReRender={true}
        />
      </div>
    </div>
  );
};

export default App;
