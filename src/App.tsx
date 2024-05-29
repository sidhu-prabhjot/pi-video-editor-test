import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow, TimelineEngine } from '@xzdarcy/react-timeline-editor';
import { Switch, Slider } from 'antd';
import { CaretRightOutlined , PauseOutlined } from '@ant-design/icons' ;      
import { cloneDeep } from 'lodash';
import _remove from 'lodash/remove';
import { useRef, useState, useEffect } from 'react';
import { CustomRender0, CustomRender1, CustomRender2 } from './custom';
import './index.less';
import TimelinePlayer from './player';
import audioControl from './audioControl';
import lottieControl from './lottieControl';
import {parseVTTFile, generateVtt} from './Parser';
import Modal from 'react-modal';

//Modal styling
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};



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
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time });
        }
        console.log("data: ", (action as CustomTimelineAction));
      },
    },
  },
  effect1: {
    id: 'effect1',
    name: 'effect1',
    source: {
      enter: ({ action, engine, isPlaying, time }) => {
        if (isPlaying) {
          const src = (action as CustomTimelineAction).data.src;
          audioControl.start({ id: src, src, startTime: action.start, engine, time });
        }
        console.log("data: ", (action as CustomTimelineAction));
      },
    },
  },
};

//all the data that exists in a SINGLE timeline row
const mockData: CusTomTimelineRow[] = parseVTTFile();

//////////////////////////////////////////////////////////////////////////////////////////////////

const defaultEditorData = cloneDeep(mockData);

const App = () => {

    ////////////////////////////////////////////////////////////////////////////////// data

    const [data, setData] = useState(defaultEditorData);
    const [list, setList] = useState([]);
  
    //modal variables
    let subtitle;
    const [modalIsOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const [endTime, setEndTime] = useState(0);
  
    //edit modal variables
    const [editModalIsOpen, setEditModalOpen] = useState(false);
    const [editInputValue, setEditInputValue] = useState("");
    const [subtitleObject, setSubtitleObject] = useState({})
  
    //the current state of the timeline and its operations (can be manipulated)
    const timelineState = useRef<TimelineState>();
    const playerPanel = useRef<HTMLDivElement>(null);
    const autoScrollWhenPlay = useRef<boolean>(true);
    const idRef = useRef(data[0].actions.length);

  /////////////////////////////////////////////////////////////////////////////player functionality

  const [ isPlaying , setIsPlaying ] = useState ( false ) ;   
  const [ duration , setDuration ] = useState ( 0 ) ;   
  const [ time , setTime ] = useState ( 0 ) ;   
  const timelineEngine = useRef < TimelineEngine > ( ) ; 
  const playerPanelVideo = useRef < HTMLDivElement > ( ) ; 

  useEffect ( ( ) => {  
    const engine = new TimelineEngine ( ) ;  
    timelineEngine . current = engine ; 
    timelineEngine . current . effects = mockEffect ; 
    timelineEngine . current . data = mockData ; 
    timelineEngine . current . on ( 'play' , ( ) => setIsPlaying ( true ) ) ;   
    timelineEngine . current . on ( 'paused' , ( ) => setIsPlaying ( false ) ) ;   
    timelineEngine . current . on ( 'afterSetTime' , ( { time } ) => setTime ( time ) ) ;   
    timelineEngine . current . on ( 'setTimeByTick' , ( { time } ) => setTime ( time ) ) ;   
    
    let dur = 0 ; 
    mockData . forEach ( row => { 
      row . actions . forEach ( action => dur = Math . max ( dur , action . end ) ) ; 
    } )
    setDuration ( dur ) ;

    return ( ) => {   
      if ( ! timelineEngine . current ) return ;  
      timelineEngine . current . pause ( ) ;
      timelineEngine . current . offAll ( ) ;
      lottieControl . destroy ( ) ;
    } ;
  } , [ ] ) ; 

  // Start or pause
  const handlePlayOrPause = ( ) => {     
    if ( ! timelineEngine . current ) return ;  
    if ( timelineEngine . current . isPlaying ) {  
      timelineEngine . current . pause ( ) ;
    } else {  
      timelineEngine . current . play ( { autoEnd : true } ) ;  
    }
  } ;

  const handleSetTime = ( value : number ) => {      
    timelineEngine . current . setTime ( timelineState.current.getTime() ) ;
    timelineEngine . current . reRender ( ) ;
  }

  // Time display
  const timeRender = ( time : number ) => {      
    const float = ( parseInt ( ( time % 1 ) * 100 + '' ) + '' ) . padStart ( 2 , '0' ) ;         
    const min = ( parseInt ( time / 60 + '' ) + '' ) . padStart ( 2 , '0' ) ;       
    const second = ( parseInt ( ( time % 60 ) + '' ) + '' ) . padStart ( 2 , '0' ) ;       
    return < > { ` ${ min } : ${ second } . ${ float } ` } </ > ; 
  } ;

  //////////////////////////////////////////////////////// managing sidelist

  //deleting from the entire dataset
  const deleteSubtitle = (id: String) => {

    const tempArray = data[0].actions;

    let results = _remove(tempArray, (subtitle) => {
      return subtitle.id != id;
    });

    data[0].actions = [...results];

    setData([...data]);

  }

  //for eliminating overlaps that occur in the timeline  
  const resolveOverlaps = () => {

    let tempData = cloneDeep(data);
    let actions = tempData[0].actions;

    for(let i = 0; i < actions.length - 1; i++) {
      let current = actions[i];
      let next = actions[i+1];

      console.log("current.end: ", current.end);
      console.log("next.start: ", next.start);

      if(current.end >= next.start) {
        let difference = next.end - next.start;
        next.start = current.end + 0.1;
        next.end = next.start + difference;
        console.log("tended to overlap");
      } else {
        console.log("no overlap");
      }

    }

    tempData[0].actions = [...actions];
    setData([...tempData]);

  }

    //for eliminating overlaps that occur in the timeline  
    const flagOverlaps = () => {

      let tempData = cloneDeep(data);
      let actions = tempData[0].actions;
  
      for(let i = 0; i < actions.length - 1; i++) {
        let current = actions[i];
        let next = actions[i+1];
  
        console.log("current.end: ", current.end);
        console.log("next.start: ", next.start);
  
        if(current.end >= next.start) {
          let difference = next.end - next.start;
          next.start = current.end + 0.1;
          next.end = next.start + difference;
          console.log("tended to overlap");
        } else {
          console.log("no overlap");
        }
  
      }
  
      tempData[0].actions = [...actions];
      setData([...tempData]);
  
    }

  //for inserting a subtitle through the side subtitle list
  const insertSubtitle = (previousEndTime: number, content: string) => {

    closeModal();

    if(content === "") {
      content = "no text";
    }
    
    setData (() => {  
      const newAction : CustomTimelineAction = {   
        id : `action${idRef.current++}` , 
        start : previousEndTime + 0.5,
        end : previousEndTime + 1.5 , 
        effectId : "effect1",
        data: {
          src: "/audio/bg.mp3",
          name: content,
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


  //for editing a subtitle AFTER creation
  const editSubtitle = (subtitleObject, content:string) => {

    closeEditModal();

    if(content !== "") {
      subtitleObject.data.name = content;
    }

    //only here to force a re-render that updates the list
    setData([...data]);

  }

  //building list to view
  const buildList = () => {

    console.log("data to list: ", data[0].actions);
  
    setList(data[0].actions.map((subtitleObject) => {
      let listItem = <li key={subtitleObject.id}>
        <div onClick={() => deleteSubtitle(subtitleObject.id)}>
          (-)
        </div>
        <div>
          {subtitleObject.data.name}
          <div onClick={() => openEditModal(subtitleObject)}>(edit)</div>
        </div>
        <div onClick={() => openModal(subtitleObject.end)}>
          (+)
        </div>
      </li>
      return listItem;
    }));
  
  }

  ///////////////////////////////////////////////////////////////// modal functions

  const closeAllModals = () => {
    setEditModalOpen(false);
    setIsOpen(false);
  }

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }

  const afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    subtitle.style.color = '#f00';
  }

  //add subtitle modal functions

  const openModal = (end:number) => {
    setIsOpen(true);
    setEndTime(end);
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  //modal functions for edit modal
  const openEditModal = (subtitleObject) => {
    setEditModalOpen(true);
    setSubtitleObject(subtitleObject);
  }

  const closeEditModal = () => {
    setEditModalOpen(false);
  }
  

  ////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    console.log("current dataset: ", data);
    buildList();
    console.log(timelineState.current.getTime());
  }, [data])



  return (
    <div className="main-container" style={{height:"100vh",  display:"flex", flexDirection:"column"}}>
      <div className="main-row-1" style={{height:"70vh", display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div className="scroll-container" style={{height:"100%", flex:"1",  display:"flex", flexDirection:"column", backgroundColor:"#8A9A5B", overflowY: "scroll"}}>
          <p>Scroll Container</p>
          <button onClick={() => openModal(0)}>Open Modal</button>
          <Modal
              isOpen={modalIsOpen}
              onAfterOpen={afterOpenModal}
              onRequestClose={closeModal}
              style={customStyles}
              contentLabel="Example Modal"
              ariaHideApp={false}
          >
            <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
            <button onClick={closeModal}>close</button>
            <div>I am a modal (END TIME: {endTime})</div>
            <form>
              <input type="text" value={inputValue} onChange={handleInputChange} />
              <button onClick={() => insertSubtitle(endTime, inputValue)}>add</button>
            </form>
          </Modal>
          <Modal
              isOpen={editModalIsOpen}
              onAfterOpen={afterOpenModal}
              onRequestClose={closeEditModal}
              style={customStyles}
              contentLabel="Edit Modal"
              ariaHideApp={false}
          >
            <h2 ref={(_subtitle) => (subtitle = _subtitle)}>Hello</h2>
            <button onClick={closeEditModal}>close</button>
            <div>Edit Subtitle (current subtitle: {endTime}))</div>
            <form>
              <input type="text" value={inputValue} onChange={handleInputChange} />
              <button onClick={() => editSubtitle(subtitleObject, inputValue)}>add</button>
            </form>
          </Modal>
          <ul>
            {list}
          </ul>
        </div>
        <div className="video-container" style={{height:"100%", flex:"1",  display:"flex", flexDirection:"column", backgroundColor:"#7393B3"}}>
          <p>Video Container</p>
          < div className = " timeline-editor-engine " > 
            < div className = " player-panel " id = " player-ground-2 " ref = { playerPanelVideo } > </ div >   
            < div className = " timeline-player " > 
              < div className = " play-control " onClick = { handlePlayOrPause } >  
                { isPlaying ? < PauseOutlined /> : < CaretRightOutlined /> }     
              </ div >
              < div className = " play-time " > 
                < div className = " play-time-current " > { timeRender ( time ) } </ div > 
                < Slider onChange = { handleSetTime } className = " play-time-slider " step = { 0.01 } min = { 0 } max = { duration } value = { time } />       
                < div className = " play-time-duration " > { timeRender ( duration ) } </ div > 
              </ div >
            </ div >
          </ div >
        </div>
      </div>
      <div className="timeline-editor-engine main-row-2" style={{height:"30vh", backgroundColor:"#808080", display:"flex", flexDirection:"column"}}>
        <div>
          <button onClick={() => resolveOverlaps()}>Resolve Overlaps</button>
          <button onClick={() => generateVtt(data)}>Export To VTT</button>
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
                  src: '"/audio/bg.mp3"',
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
