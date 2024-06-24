import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow} from '@xzdarcy/react-timeline-editor';
import { cloneDeep } from 'lodash';
import { useRef, useState, useEffect, useMemo } from 'react';
import { CustomRender0, CustomRender1} from './timlineComponents/custom';
import './timelineStyles/index.less';
import TimelinePlayer from './timlineComponents/player';
import lottieControl from './timlineComponents/lottieControl';
import {parseVTTFile, generateVtt, generateSrt} from './processComponents/Parser';
import VideoJS from './VideoJS';
import videojs from 'video.js';
import Subtitle from './components/Subtitle';
import DragDrop from './components/DragDrop';
import SideListSearch from './components/SideListSearch';
import ListItem from './components/ListItem';
import TextSubmit from './components/TextSubmit';
import TextInput from './components/TextInput';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import EditAllModal from './components/EditAllModal';
import AddSubtitleModal from './components/AddSubtitleModal';
import {List, AutoSizer} from 'react-virtualized';
import './styles/List.css';
import './styles/Main.css';

///////////////////////////////////////////////////////////////////////////// data control

//the data structure for an entire row in the timeline
interface CusTomTimelineRow extends TimelineRow {
  actions: CustomTimelineAction[];
}

//defines the properties of a subtitle object in the timeline
interface CustomTimelineAction extends TimelineAction {
  data: {
    src: string;
    name: string;
    subtitleNumber: number;
    alignment: string;
    direction: string;
    lineAlign: string;
    linePosition: string;
    size: number;
    textPosition: string;
    toEdit: boolean;
  };
}

/////////////////////////////////////////////////////////////////////////////////////////// initialization

//all the data that exists in a SINGLE timeline row (moved outside component to prevent multiple calls)
const mockData: CusTomTimelineRow[] = parseVTTFile("", {});

const App = () => {

  let subtitle;

  //REFS:
  //the current state of the timeline and its operations (can be manipulated)
  const timelineState = useRef<TimelineState>();
  const playerPanel = useRef<HTMLDivElement>(null);
  const autoScrollWhenPlay = useRef<boolean>(true);
  const playerRef = useRef(null);
  const listRef = useRef(null);

  

  //STATE MANAGEMENT:
  const [currentSubtitle, setCurrentSubtitle] = useState({data: {
    name: "placeholder",
  }} as CustomTimelineAction);
  const [data, setData] = useState(mockData);
  const [overlaps, setOverlaps] = useState([]);
  
  const [filename, setFilename] = useState("export file");

  //track IDs
  const [idMap, setIdMap] = useState({});

  //handling link inserts for the video
  const [linkInputValue, setLinkInputValue] = useState("");

  //search bar related states
  const [actionData, setActionData] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  //timeline customization
  const [zoom, setZoom] = useState(5);
  const [timelineWidth, setTimelineWidth] = useState(160);
  const [scaleSplit, setScaleSplit] = useState(6);

  //list of actions that need to be edited
  const [editList, setEditList] = useState({});
  const [alignmentEdit, setAlignmentEdit] = useState(null);
  const [lineEdit, setLineEdit] = useState(-1);

  //modal state management, primarily for opening and closing
  const [modalIsOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [endTime, setEndTime] = useState(0);
  const [editAllModelIsOpen, setEditAllModelIsOpen] = useState(false);

  //button and switch toggling states
  const [switchState, setSwitchState] = useState(true);

  //window dimensions
  const [width, setWidth] = useState(window.innerWidth);

  //responsive design states
  const [searchBarWidth, setSearchBarWidth] = useState(200);
  const [listRowHeight, setListRowHeight] = useState(220);

  //loading states
  const [scrollListLoading, setScrollListLoading] = useState(false);

  ///////////////////////////////////////////////////////////////////////////////////////// component setup

  //TIMELINE
  //timeline behaviour editing
  const mockEffect: Record<string, TimelineEffect> = {
    effect1: {
      id: 'effect1',
      name: 'effect1',
      source: {
        enter: ({ action, time }) => {

          // const src = (action as CustomTimelineAction).data.src;

          let listElement = document.getElementById(`${(action as CustomTimelineAction).data.subtitleNumber}-list-item-container`);
          let subtitleElement = document.getElementById("subtitle");

          //color update
          if (listElement) {
            listElement.style.backgroundColor = "#FCA311";
          }

          //update timeline and current subtitle
          // lottieControl.update({ id: src, src, startTime: action.start, endTime: action.end, time });
          listRef.current.scrollToRow((action as CustomTimelineAction).data.subtitleNumber);

          setCurrentSubtitle((action as CustomTimelineAction));
        },
        leave: ({ action }) => {
          let listElement = document.getElementById(`${(action as CustomTimelineAction).data.subtitleNumber}-list-item-container`);
          let subtitleElement = document.getElementById("subtitle");
          
          //change color
          if (listElement) {
            listElement.style.backgroundColor = "#E5E5E5";
          }
        },
      },
    },
  };    

  //VIDEOJS
  //defining video player responses to events
  const handlePlayerReady = (player) => {
    playerRef.current = player;

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

  //defining video player features
  const videoJsOptions = {
    autoplay: false,
    controls: true,
    responsive: true,
    fluid: true,
  };

  ///////////////////////////////////////////////////////////////////// subtitle dataset manipulation

  //for inserting a subtitle to the dataset
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
          subtitleNumber: data[0].actions.length - 1,
          alignment: "center",
          direction: "",
          lineAlign: "",
          linePosition: "auto",
          size: 100,
          textPosition: "",
          toEdit: false,
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

  const updateData = async (tempArray) => {
    setData([...tempArray]);
    verifySubtitles();
  }

  //deleting from the entire dataset
  const deleteSubtitle = async (action) => {

    let fallbackAction;

    //verify if there are other subtitles before deciding where to updating
    if(action.data.subtitleNumber - 1 >= 0) { //if there are subtitles before, update to the previous one
      fallbackAction = data[0].actions[action.data.subtitleNumber - 1]
    } else if(action.data.subtitleNumber + 1 < data[0].actions.length) {
      fallbackAction = data[0].actions[action.data.subtitleNumber + 1];
    }

    //if the current subtitle is the one being deleted, then hide it from the screen
    if(currentSubtitle.data.subtitleNumber === action.data.subtitleNumber) {
      let currentSubtitleElement = document.getElementById("subtitle");
      if(currentSubtitleElement) {
        currentSubtitleElement.style.opacity = "0";
      }
    }

    if(data[0].actions.length > 1) {
      const tempArray = data;

      tempArray[0].actions.splice(action.data.subtitleNumber, 1);

      console.log("fallback action: ", fallbackAction);
      
      await update(fallbackAction);
      await updateData(tempArray);
    }

  }

  //merge two subtitles together
  const onHandleMerge = (subtitleObject) => {

    let mergedActions = [];
    let i = 0;

    //iterete through data until object is found
    let length = data[0].actions.length;
    let actions = [...data[0].actions];
    for(i; i < length - 1; i++) {

      if(actions[i] == subtitleObject) {

        console.log("current action: ", actions[i]);
        console.log("current subtitle object: ", subtitleObject);
        console.log("---------------------------------------------");

        let combinedContent = `${subtitleObject.data.name} ${actions[i + 1].data.name}`;
        let startTime = subtitleObject.start;
        let endTime = actions[i + 1].end;

        let tempObject = {...subtitleObject}
        tempObject.data.name = combinedContent;
        tempObject.start = startTime;
        tempObject.end = endTime;

        mergedActions.push(tempObject);
        i++;

      } else {
        mergedActions.push(actions[i]);
      }

    }

    update(subtitleObject);

    //merge the leftover element
    if(i < length) {
      mergedActions.push(actions[i]);
    }

    console.log("actions after merge: ", mergedActions);

    let tempData = data;
    tempData[0].actions = [...mergedActions];
    setData([...tempData]);

    update(subtitleObject);

  }

  // Function to sort actions by their start time
  const sortActions = (actions) => {
    actions.sort((a, b) => a.start - b.start);
  };

  const verifySubtitles = () => {
    let tempOverlapsArray = [];
    let validExport = true;
    let tempData = cloneDeep(data);
    let actions = tempData[0].actions;
  
    // Sort actions initially
    sortActions(actions);

    for (let i = 0; i < actions.length; i++) {
      actions[i].data.subtitleNumber = i;
    }

  
    for (let i = 0; i < actions.length - 1; i++) {
      tempData[0].actions[i].data.subtitleNumber = i;
      let current = actions[i];
      let next = actions[i + 1];
  

      let currentElement = document.getElementById(`${(current as CustomTimelineAction).data.subtitleNumber}-list-item-container`);
      let nextElement = document.getElementById(`${(next as CustomTimelineAction).data.subtitleNumber}-list-item-container`);
  
      if (current.end > next.start) {
        validExport = false;
        console.log("overlap at: ", current.end, " and ", next.start);

        if(currentElement) {
          currentElement.style.backgroundColor = "#BF0000";
          nextElement.style.backgroundColor = "#FF4040";
        }
        tempOverlapsArray.push([next.start, current.end]);
  
        // Adjust next.start to resolve overlap
        next.start = current.end; // or any other appropriate adjustment
        sortActions(actions); // Re-sort actions after adjustment
        i = -1; // Restart loop to re-check all actions
      } else {
        if(nextElement) {
          nextElement.style.backgroundColor = "#E5E5E5";
        }
      }
    }

    tempData[0].actions[actions.length - 1].data.subtitleNumber = actions.length - 1; 
  
    if (validExport) {
      console.log("sorted actions: ", actions);
      tempData[0].actions = [...actions];
      setData([...tempData]);
      return true;
    } else {
      console.log("invalid vtt, found overlapping subtitles");
      console.log("sorted actions: ", actions);
      setOverlaps([...tempOverlapsArray]);
      tempData[0].actions = [...actions];
      setData([...tempData]);
    }

    return false;
  };

  //////////////////////////////////////////////////////////////////////// editing a specific subtitle

  const addToEditList = (subtitleObject) => {
    let tempEditList = editList;
    tempEditList[subtitleObject.data.subtitleNumber] = subtitleObject.data;
    console.log("edit list: ", tempEditList);
    setEditList({...tempEditList});
  }

  const handleAlignmentChange = (subtitleObject, alignment) => {
    subtitleObject.data.alignment = alignment;
    setData([...data]);

    console.log("alignment change: ", alignment);
  }

  const onHandleLinePositionChange = (newInput, subtitleObject) => {
    if(newInput === "auto") {
      subtitleObject.data.linePosition = 100;
    } else if (!Number.isNaN(newInput)) {
      subtitleObject.data.linePosition = Number(newInput);
    }
  }

  //for the edit all/all selected functionality
  const handleYAlignChange = (newLine) => {
    setLineEdit(newLine);
  }

  const handleEditAllAlignmentChange = (alignment) => {
    setAlignmentEdit(alignment);

    console.log("alignment change: ", alignment);
  }

  const editAllSelected = () => {
    let tempData = cloneDeep(data);
    let tempActions = tempData[0].actions;
    tempActions.forEach(action => {

      if(editList[action.data.subtitleNumber]) {
        console.log("found: ", editList[action.data.subtitleNumber]);
        if(alignmentEdit != null) {
          console.log("editing: alignment");
          action.data.alignment = alignmentEdit;
        }
  
        if(lineEdit != -1) {
          console.log("editing: line position");
          action.data.linePosition = lineEdit.toString();
        }
      }

    })

    setData([...tempData]);

  }

  const removeFromEditList = (id) => {

    let tempEditList = editList;
    delete tempEditList[`${id}`];
    setEditList({...tempEditList});

  }

  ////////////////////////////////////////////////////////////////////// exporting subtitles

  const verifySubtitlesForExport = () => {

    let tempOverlapsArray = [];
    let validExport = true;
    let tempData = cloneDeep(data);
    let actions = tempData[0].actions;
  
    for (let i = 0; i < actions.length - 1; i++) {
      let current = actions[i];
      let next = actions[i + 1];
  
      let currentElement = document.getElementById(`${(current as CustomTimelineAction).data.subtitleNumber}-list-item-container`);
      let nextElement = document.getElementById(`${(next as CustomTimelineAction).data.subtitleNumber}-list-item-container`);
  
      if (current.end > next.start) {
        validExport = false;
  
        if(currentElement) {
          currentElement.style.backgroundColor = "#BF0000";
        }

        if(nextElement) {
          nextElement.style.backgroundColor = "#FF4040";
        }
        tempOverlapsArray.push([next.start, current.end]);
      } else {
        if(nextElement) {
          nextElement.style.backgroundColor = "#E5E5E5";
        }
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

  //call verifier and then generate vtt to export
  const generateVTT = () => {
    if(verifySubtitlesForExport()) {
      let generatedString = generateVtt(data);
      downloadVTTFile(generatedString);
    }
  }

  const generateSRT = () => {
    if(verifySubtitlesForExport()) {
      let generatedString = generateSrt(data);
      downloadSRTFile(generatedString);
    }
  }

  //download the vtt file
  const downloadVTTFile = (generatedString) => {
    const element = document.createElement("a");
    const file = new Blob([generatedString], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.vtt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  //download the vtt file
  const downloadSRTFile = (generatedString) => {
    const element = document.createElement("a");
    const file = new Blob([generatedString], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.srt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  ////////////////////////////////////////////////////////////////////handle screen clicks and actions

  //move to the clicked subtitle on both the side list
  const handleListClick = async (subtitleObject) => {

    console.log("clicked subtitle: ", subtitleObject.data.subtitleNumber);

    const currentListElement = document.getElementById(`${currentSubtitle.data.subtitleNumber}-list-item-container`);
    if (currentListElement) {
      currentListElement.style.backgroundColor = "#E5E5E5";
    }

    setTime(subtitleObject);
    update(subtitleObject);

    const listElement = document.getElementById(`${subtitleObject.data.subtitleNumber}-list-item-container`);
    if (listElement) {
      listRef.current.scrollToRow(subtitleObject.data.subtitleNumber);
      listElement.style.backgroundColor = "#FCA311";
    }
  }

  //handles the scenario when a subtitle in the timeline is clicked
  const handleActionClick = async (action: CustomTimelineAction) => {

    timelineState.current.setTime(action.start);
    if(playerRef.current) {
      playerRef.current.currentTime(timelineState.current.getTime());
    }

    const currentListElement = document.getElementById(`${currentSubtitle.data.subtitleNumber}-list-item-container`);
    if (currentListElement) {
      currentListElement.style.backgroundColor = "#E5E5E5";
    }

    await update(action, 5);

    const listElement = document.getElementById(`${action.data.subtitleNumber}-list-item-container`);
    if(listElement) {
      listElement.style.backgroundColor = "#FCA311";
    }


  }

  const toggleAutoScroll = () => {
    if(switchState) {
      setSwitchState(false);
    } else {
      setSwitchState(true);
    }
  }

  const handleLinkSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission
    if (playerRef.current) {
      console.log("Updating video source to:", linkInputValue);
      playerRef.current.src({ src: linkInputValue, type: 'video/mp4' });
      playerRef.current.load(); // Ensure the player reloads the new source
    } else {
      console.error("Player reference is not set");
    }
  };

  const handleLinkInputChange = (event) => {
    setLinkInputValue(event.target.value);
  }

  const handleOnVideoUpload = (fileObject) => {

    // Initialize a FileReader
    const reader = new FileReader();

    let tempIdMap = {};
    
    // Define what happens when the file is read successfully
    reader.onload = (event) => {
      let result = parseVTTFile(reader.result, tempIdMap);
      console.log("parsing result: ", result);
      setData([...result]);
    };
    
    // Read the file as text
    reader.readAsText(fileObject, 'UTF-8');
  };

  //get starttime from the result that was clicked
  const handleResultClick = (startTime) => {
    timelineState.current.setTime(startTime);
    playerRef.current.currentTime(timelineState.current.getTime());
  }

  const handleFilenameInputChange = (event) => {
    setFilename(event.target.value);
  }


  //////////////////////////////////////////////////////// component prop functions

  const handleChange = (newInput, subtitleObject) => {
    subtitleObject.data.name = newInput;
  }

  const handleStartTimeChange = (newInput, subtitleObject) => {
    if(newInput) {
      subtitleObject.start = Number(newInput);
    }
  }

  const handleEndTimeChange = (newInput, subtitleObject) => {
    if(newInput) {
      subtitleObject.end = Number(newInput);
    }
  }

  const onSetParentData = () => {
    setData([...data]);
    verifySubtitles();
  }

  //MODAL
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  }


  ///////////////////////////////////////////////////////////////// modal functions

  const openEditAllModal = () => {
    setEditAllModelIsOpen(true);
  }

  const closeEditAllModal = () => {
    setEditAllModelIsOpen(false);
  }

  //add subtitle modal functions
  const openModal = (end:number) => {
    setIsOpen(true);
    setEndTime(end);
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  ////////////////////////////////////////////////////////////////////////////////// other helper functions

  const update = async (action, shift=2) => {
    const listElement = document.getElementById(`${action.data.subtitleNumber}-list-item-container`);

    if(action.data.subtitleNumber + shift < data[0].actions.length) {
      await listRef.current.scrollToRow(action.data.subtitleNumber + shift);
    } else {
      await listRef.current.scrollToRow(action.data.subtitleNumber - shift);
    }

    if(action && action.data) {
      await listRef.current.scrollToRow(action.data.subtitleNumber);
    }

    if(listElement && listElement.style) {
      listElement.style.backgroundColor = "#FCA311";
    }
  }

  //resyncs the player and timeline at a specifc subtitle
  const setTime = async (action) => {
    if(timelineState.current && playerRef.current) {
      playerRef.current.currentTime(action.start);
      timelineState.current.setTime(playerRef.current.currentTime());
    }
  }

  const resyncTime = () => {
    if(timelineState.current && playerRef.current) {
      timelineState.current.setTime(playerRef.current.currentTime());
    }
  }

  const getLinePositionValue = (action) => {
    if(action.data.linePosition === "auto") {
      return 400;
    } else {
      return Number(action.data.linePosition) * 4;
    }
  }


  //////////////////////////////////////////////////////////////////////////// React hooks utilization

  useEffect(() => {
    console.log("current dataset: ", data);
    setActionData([...data[0].actions]);
    if(timelineState.current && playerRef.current) {

      playerRef.current.currentTime(timelineState.current.getTime());

    }
  }, [data])

  useEffect(() => {
    if(switchState) {
      autoScrollWhenPlay.current = true;
    } else {
      autoScrollWhenPlay.current = false;
    }

  }, [switchState])

  useEffect(() => {
    resyncTime();
  }, []);

  ///////////////////////////////////////////////////////////////// rendering functions

  function rowRenderer({
    key, // Unique key within array of rows
    index, // Index of row within collection
    style, // Style object to be applied to row (to position it)
  }) {
    return (
      <div key={key} style={style}>
        <ListItem 
          subtitleObject={data[0].actions[index]} 
          onHandleChange={handleChange}
          onHandleEndTimeChange={handleEndTimeChange}
          onHandleStartTimeChange={handleStartTimeChange}
          onHandleLinePositionChange={onHandleLinePositionChange}
          onSetParentData={onSetParentData}
          addToEditList={addToEditList}
          removeFromEditList={removeFromEditList}
          deleteSubtitle={deleteSubtitle}
          handleListClick={handleListClick}
          openModal={openModal}
          handleAlignmentChange={handleAlignmentChange}
          onHandleMerge={onHandleMerge}
        />
      </div>
    );
  }

  return (
    <div className="main-container" style={{height:"100vh",  display:"flex", flexDirection:"column"}}>
      <EditAllModal isOpen={editAllModelIsOpen} onCloseModal={closeEditAllModal} handleEditAllAlignmentChange={handleEditAllAlignmentChange} editAllSelected={editAllSelected} handleYAlignChange={handleYAlignChange} setParentData={onSetParentData}/>
      <div style={{zIndex: "9999"}}>
        <AddSubtitleModal isOpen={modalIsOpen} onCloseModal={closeModal} onHandleInsert={insertSubtitle} endTime={endTime} subtitle={subtitle} onHandleInputChange={handleInputChange} inputValue={inputValue}/>
      </div>
      <div className="main-row-1" style={{height:"70vh", display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div className="scroll-container">
        <div>
          <div className={"search-bar-container"}>
            <SideListSearch searchBarWidth={searchBarWidth} onHandleResultClick={handleResultClick} dataObjects={actionData} />
            <Button size={"small"} className={"edit-all-button export-button"} variant={"contained"} onClick={() => openEditAllModal()}>Edit Selected</Button>
            <div className={"drag-drop-container"}>
              <DragDrop onVideoUpload={handleOnVideoUpload} />
            </div>
          </div>
        </div>
          <div id={"subtitle-list-container-id"} className="subtitle-list-container">
            <AutoSizer defaultHeight={100} defaultWidth={100}>
              {(size) => {
                const {width, height} = size; 
                return (
                <List
                  scrollToAlignment='end'
                  className={"list-render-container"}
                  ref={listRef}
                  width={width}
                  height={height}
                  rowCount={data[0].actions.length}
                  rowHeight={listRowHeight}
                  rowRenderer={rowRenderer}
                  noRowsRenderer={() => {
                    if(data[0].actions.length === 0) {
                      return (
                        <p>upload a vtt file to get started.</p>
                      )
                    } else {
                      return (
                        <Box sx={{ display: 'flex' }}>
                          <CircularProgress />
                        </Box>
                      )
                    }
                  }}
                  overscanRowCount={5}
                  {...data}
                />
              )
              }}
            </AutoSizer>
          </div>
        </div>
        <div className={"video-container"}>
          <div className={"toolbar-container"}>
            <TextSubmit handleInputChange={handleLinkInputChange} handleSubmit={handleLinkSubmit} submitButtonText={"Insert"} label={"Video Link"}/>
            <TextInput handleInputChange={handleFilenameInputChange} label={"File Name"}/>
            <Button className={"button export-button"} variant={"contained"} onClick={() => generateVTT()}>Export VTT</Button>
            <Button className={"button export-button"} variant={"contained"} onClick={() => generateSRT()}>Export SRT</Button>
          </div>        
          <div className={"video-player-container"}>
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} />
            <Subtitle currentSubtitle={currentSubtitle} alignment={currentSubtitle.data.alignment} linePosition={getLinePositionValue(currentSubtitle)} />
          </div>
        </div>
      </div>
      <div className="player-config-row timeline-editor-engine main-row-2">
        <div className="player-config">
          <p className="autoscroll-switch-text">Autoscroll:</p>
          <Switch className={"switch autoscroll-switch"} checked={switchState} onChange={toggleAutoScroll}/>
        </div>
        <div className="player-panel" id="player-ground-1" ref={playerPanel}></div>
        <div style={{display:"none"}}>
          <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay={autoScrollWhenPlay} />
        </div>
        <Timeline
          style={{width:"100%", backgroundColor: "#222222", color:"#00000"}}
          scale={zoom}
          scaleSplitCount={scaleSplit}
          scaleWidth={timelineWidth}
          startLeft={20}
          autoScroll={true}
          ref={timelineState}
          editorData={data}
          effects={mockEffect}
          onChange={(data) => {
            setData([...data as CusTomTimelineRow[]]);
            verifySubtitles();
          }}
          onActionMoveEnd={(action) => {
            let usableAction = action.action;
            timelineState.current.setTime(action.start);
            if(playerRef.current) {
              playerRef.current.currentTime(timelineState.current.getTime());
            }
            verifySubtitles();
            update(usableAction);
          }}
          onActionResizeEnd={(action) => {
            let usableAction = action.action;
            update(usableAction);
            timelineState.current.setTime(action.start);
            if(playerRef.current) {
              playerRef.current.currentTime(timelineState.current.getTime());
            }
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
