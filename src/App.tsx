import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow, TimelineEngine} from '@xzdarcy/react-timeline-editor';
import { Switch } from 'antd';
import { cloneDeep } from 'lodash';
import _remove from 'lodash/remove';
import { useRef, useState, useEffect } from 'react';
import { CustomRender0, CustomRender1} from './custom';
import './index.less';
import TimelinePlayer from './player';
import lottieControl from './lottieControl';
import {parseVTTFile, generateVtt} from './Parser';
import Modal from 'react-modal';
import VideoJS from './VideoJS';
import videojs from 'video.js';
import Subtitle from './Subtitle';
import SingleInputForm from './SingleInputForm';
import DragDrop from './DragDrop';
import TimeInput from './TimeInput';
import EndInput from './EndInput';
import SideListSearch from './SideListSearch';

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
    alignment: string;
    direction: string;
    lineAlign: string;
    positionAlign: string;
    size: number;
    textPosition: string;
  };
}

//the data structure for an entire row in the timeline
interface CusTomTimelineRow extends TimelineRow {
  actions: CustomTimelineAction[];
}

//all the data that exists in a SINGLE timeline row (moved outside component to prevent multiple calls)
const mockData: CusTomTimelineRow[] = parseVTTFile("", {});

//////////////////////////////////////////////////////////////////////////////////////////////////

const App = () => {

    const [currentSubtitle, setCurrentSubtitle] = useState("");

    const mockEffect: Record<string, TimelineEffect> = {
      effect1: {
        id: 'effect1',
        name: 'effect1',
        source: {
          enter: ({ action, time }) => {
            const src = (action as CustomTimelineAction).data.src;
            lottieControl.update({ id: src, src, startTime: action.start, endTime: action.end, time });
            setCurrentSubtitle((action as CustomTimelineAction).data.name);
    
            let listElement = document.getElementById(`${(action as CustomTimelineAction).id}`);
            if (listElement) {
              listElement.style.backgroundColor = "#ffffff";
              listElement.scrollIntoView();
            } else {
              console.error(`Element with id ${action.id} not found`);
            }
          },
          leave: ({ action }) => {
            let listElement = document.getElementById(`${(action as CustomTimelineAction).id}`);
            if (listElement) {
              listElement.style.backgroundColor = "transparent";
            } else {
              console.error(`Element with id ${action.id} not found`);
            }
          },
        },
      },
    };    

  const [data, setData] = useState(mockData);
  const [list, setList] = useState([]);
  const [overlaps, setOverlaps] = useState([]);

  //modal variables
  let subtitle;
  const [modalIsOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [endTime, setEndTime] = useState(0);

  //the current state of the timeline and its operations (can be manipulated)
  const timelineState = useRef<TimelineState>();
  const playerPanel = useRef<HTMLDivElement>(null);
  const autoScrollWhenPlay = useRef<boolean>(true);
  const [idMap, setIdMap] = useState({});

  //handling link inserts for the video
  const [linkInputValue, setLinkInputValue] = useState("");

  //search bar related states
  const [actionData, setActionData] = useState([]);

  ///////////////////////////////////////////////////////// videojs player

  const handleOnVideoUpload = (fileObject) => {
    // Initialize a FileReader
    const reader = new FileReader();

    let tempIdMap = {};
    
    // Define what happens when the file is read successfully
    reader.onload = (event) => {
      let result = parseVTTFile(reader.result, tempIdMap);
      setData([...result]);
      console.log("tempIdMap: ", tempIdMap);
    };
    
    // Read the file as text
    reader.readAsText(fileObject, 'UTF-8');
  };
  

  const playerRef = useRef(null);

  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    console.log(playerRef.current);

    player.on('pause', () => {
      timelineState.current.pause();
    })

    player.on('play', () => {
      timelineState.current.play({});
      timelineState.current.setTime(player.currentTime());
    })

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
      timelineState.current.play({});
    });

    player.on('dispose', () => {
      videojs.log('player will dispose');
    });
  };

  //////////////////////////////////////////////////////// managing sidelist

  //deleting from the entire dataset
  const deleteSubtitle = (id: String) => {

    const tempArray = data[0].actions;

    let results = _remove(tempArray, (subtitle) => {
      return subtitle.id != id;
    });

    data[0].actions = [...results];

    setData([...data]);
    verifySubtitles();

  }

  const generateVTT = () => {
    if(verifySubtitles()) {
      generateVtt(data);
    }
  }

  const verifySubtitles = () => {

    let tempOverlapsArray = [];
    let validExport = true;
    let tempData = cloneDeep(data);
    let actions = tempData[0].actions;
  
    // Function to sort actions by their start time
    const sortActions = () => {
      actions.sort((a, b) => a.start - b.start);
    };
  
    // Sort actions initially
    sortActions();
  
    for (let i = 0; i < actions.length - 1; i++) {
      let current = actions[i];
      let next = actions[i + 1];
  
      let currentElement = document.getElementById(`${(current as CustomTimelineAction).id}`);
      let nextElement = document.getElementById(`${(next as CustomTimelineAction).id}`);
  
      if (current.end > next.start) {
        validExport = false;
        console.log("overlap at: ", current.end, " and ", next.start);
  
        currentElement.style.backgroundColor = "#BF0000";
        nextElement.style.backgroundColor = "#FF4040";
        tempOverlapsArray.push([next.start, current.end]);
  
        // Adjust next.start to resolve overlap
        next.start = current.end; // or any other appropriate adjustment
        sortActions(); // Re-sort actions after adjustment
        i = -1; // Restart loop to re-check all actions
      } else {
        nextElement.style.backgroundColor = "transparent";
      }
    }
  
    if (validExport) {
      return true;
    } else {
      console.log("invalid vtt, found overlapping subtitles");
      setOverlaps([...tempOverlapsArray]);
      tempData[0].actions = [...actions];
      setData([...tempData]);
    }
  
    return false;
  };
  

  //for inserting a subtitle through the side subtitle list
  const insertSubtitle = (previousEndTime: number, content: string) => {

    closeModal();

    if(content === "") {
      content = "no text";
    }

    let idRef = data[0].actions.length;
    let inMap = true;
    while(inMap) {

      if(idMap[idRef]) {
        idRef = idRef + 1;
      } else {
        console.log(idRef);
        inMap = false;
      }

    }

    setData (() => {  
      const newAction : CustomTimelineAction = {   
        id : `action${idRef}` , 
        start : previousEndTime,
        end : previousEndTime + 1 , 
        effectId : "effect1",
        data: {
          src: "/audio/bg.mp3",
          name: content,
          subtitleNumber: 0,
          alignment: "",
          direction: "",
          lineAlign: "",
          positionAlign: "",
          size: 100,
          textPosition: "",
        } 
      }
      let tempArray = cloneDeep(data);
      for (let i = 0; i < tempArray[0].actions.length; i++) {
          if (newAction.start < tempArray[0].actions[i].start) {
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

  const onHandleChange = (newInput, subtitleObject) => {
    subtitleObject.data.name = newInput;
  }

  const onHandleStartTimeChange = (newInput, subtitleObject) => {
    subtitleObject.start = Number(newInput);
  }

  const onHandleEndTimeChange = (newInput, subtitleObject) => {
    subtitleObject.end = Number(newInput);
  }

  const onSetParentData = () => {
    setData([...data]);
    verifySubtitles();
  }

  const handleListClick = (subtitleObject) => {
    timelineState.current.setTime(subtitleObject.start);
    playerRef.current.currentTime(timelineState.current.getTime());
  }

  const buildList = () => {
    setList(data[0].actions.map((subtitleObject) => (
      <li key={subtitleObject.id}>
        <div id={`${subtitleObject.id}`} className={"list-title-container"} style={{ backgroundColor: "transparent" }}>
          <div onClick={() => deleteSubtitle(subtitleObject.id)}>
            (-)
          </div>
          <div>
            <TimeInput 
              placeholder={subtitleObject.start}
              handleTimeChange={onHandleStartTimeChange}
              subtitleObject={subtitleObject}
              setParentData={onSetParentData}
            />
          </div>
          <div onClick={() => handleListClick(subtitleObject)}>
            <SingleInputForm
              placeholder={subtitleObject.data.name}
              handleChange={onHandleChange}
              subtitleObject={subtitleObject}
              setParentData={onSetParentData}
            />
          </div>
          <div>
            <EndInput 
                placeholder={subtitleObject.end}
                handleTimeChange={onHandleEndTimeChange}
                subtitleObject={subtitleObject}
                setParentData={onSetParentData}
              />
          </div>
          <div onClick={() => openModal(subtitleObject.end)}>
            (+)
          </div>
        </div>
      </li>
    )));
  };

  ///////////////////////////////////////////////////////////////// modal functions
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

  //////////////////////////////////////////////////////////////////////////// handle clicking on subtitle in timeline

  //handles the scenario when a subtitle in the timeline is clicked
  const handleActionClick = (action: CustomTimelineAction) => {
    const listElement = document.getElementById(`${action.id}`);
    const allListElements = document.getElementsByClassName("list-title-container") as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < allListElements.length; i++) {
      allListElements[i].style.backgroundColor = "transparent";
    }
    
    if (listElement) {
      listElement.style.backgroundColor = "#f0f0f0"; // Change the color of the selected element
      listElement.scrollIntoView();
    }

    timelineState.current.setTime(action.start);
    if(playerRef.current) {
      playerRef.current.currentTime(timelineState.current.getTime());
    }
  }

  ////////////////////////////////////////////////////////////////////////////// handle submitting a link

  const [videoSrc, setVideoSrc] = useState("");

  const handleLinkSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission
    if (playerRef.current) {
      console.log("Updating video source to:", linkInputValue);
      playerRef.current.src({ src: linkInputValue, type: 'video/mp4' });
      playerRef.current.load(); // Ensure the player reloads the new source
      setVideoSrc(linkInputValue); // Update the state
    } else {
      console.error("Player reference is not set");
    }
  };

  const handleLinkInputChange = (event) => {
    setLinkInputValue(event.target.value);
  }

  ////////////////////////////////////////////////////////////////////////////////// handling the search bar

  const [searchResults, setSearchResults] = useState([]);

  const handleSearchChange = (term, hits) => {
    console.log("term: ", term, " hits: ", hits);
    if(term.length > 1) {
      setSearchResults(hits);
    } else {
      setSearchResults([]);
    }
  }

  const handleSearchClick = () => {
    console.log("search clicked");
  }

  //get starttime from the result that was clicked
  const handleResultClick = (startTime) => {
    timelineState.current.setTime(startTime);
    playerRef.current.currentTime(timelineState.current.getTime());
  }

  ////////////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    let tempActionData = [];
    data[0].actions.forEach(action => {
      let searchObject = {
        startTime: action.start,
        endTime: action.end,
        actionId: action.id,
        content: action.data.name,
        subtitleNumber: action.data.subtitleNumber,
      }
      tempActionData.push(searchObject);
    })
    setActionData([...tempActionData]);
    console.log("current dataset: ", data);
    if(timelineState.current && playerRef.current) {

      playerRef.current.currentTime(timelineState.current.getTime());

    } 
    buildList();
  }, [data])

  useEffect(() => {
    if(timelineState.current && playerRef.current) {

      let difference = timelineState.current.getTime() - playerRef.current.currentTime();

      if(difference > 0.1 || difference < -0.1) {
        timelineState.current.setTime(playerRef.current.currentTime());
      }

    } 
  })

  return (
    <div className="main-container" style={{height:"100vh",  display:"flex", flexDirection:"column"}}>
      <div className="main-row-1" style={{height:"70vh", display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div className="scroll-container" style={{height:"100%", flex:"1",  display:"flex", flexDirection:"column", backgroundColor:"#8A9A5B"}}>
        <div style={{zIndex: 5}}>
          <SideListSearch dataObjects={actionData} onSearchChange={handleSearchChange} onSearchClick={handleSearchClick} />
          <ul>
            {searchResults.slice(0, 5).map(result => (
              <li key={result.id} style={{backgroundColor: "#B2BEB5"}} onClick={() => handleResultClick(result.startTime)}>
                <p>{result.content} | start: {result.startTime} | end: {result.endTime}</p>
              </li>
            ))}
          </ul>
        </div>
          <p>Scroll Container</p>
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
          <div style={{ overflowY: "scroll"}}>
            <ul>
              {list}
            </ul>
          </div>
        </div>
        <div className="video-container" style={{height:"100%", flex:"1",  display:"flex", flexDirection:"column", backgroundColor:"#7393B3", overflowY: "scroll"}}>
          <DragDrop onVideoUpload={handleOnVideoUpload} />
          <form id={'video-link-form'} onSubmit={handleLinkSubmit}>
            <input 
            type="text" 
            id={'video-link-input'}
            value={linkInputValue}
            onChange={handleLinkInputChange}
            placeholder={"insert link here"}>
            </input>
            <button type="submit">find video</button>
          </form>
          <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
          <div className="subtitle" style={{display: "flex", flex: "1"}}>
            <Subtitle currentSubtitle={currentSubtitle} />
          </div>
        </div>
      </div>
      <div className="timeline-editor-engine main-row-2" style={{height:"30vh", backgroundColor:"#808080", display:"flex", flexDirection:"column"}}>
        <div>
          <button onClick={() => generateVTT()}>Export To VTT</button>
        </div>
        <div className="player-config">
          <Switch
            checkedChildren="Turn Off Autoscroll"
            unCheckedChildren="Turn On Autoscroll"
            defaultChecked={autoScrollWhenPlay.current}
            onChange={(e) => (autoScrollWhenPlay.current = e)}
            style={{ marginBottom: 20 }}
          />
        </div>
        <div className="player-panel" id="player-ground-1" ref={playerPanel}></div>
        <div style={{display:"none"}}>
          <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay={autoScrollWhenPlay} />
        </div>
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
            verifySubtitles();
            buildList();
          }}
          getActionRender={(action, row) => {
            if (action.effectId === 'effect0') {
              return <CustomRender0 onActionClick={handleActionClick} action={action as CustomTimelineAction} row={row as CusTomTimelineRow} />;
            } else if (action.effectId === 'effect1') {
              return <CustomRender1 onActionClick={handleActionClick} action={action as CustomTimelineAction} row={row as CusTomTimelineRow} />;
            }
          }}
          autoReRender={true}
        />
      </div>
    </div>
  );
};

export default App;
