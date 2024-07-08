import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow} from '@xzdarcy/react-timeline-editor';
import { cloneDeep} from 'lodash';
import { useRef, useState, useEffect} from 'react';
import { CustomRender0, CustomRender1} from './timlineComponents/custom';
import TimelinePlayer from './timlineComponents/player';

import VideoJS from './VideoJS';
import videojs from 'video.js';

import {List, AutoSizer, CellMeasurer, CellMeasurerCache} from 'react-virtualized';

//videojs

//fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowLeft, faCircleArrowRight, faCircleInfo, faFile, faFileLines} from '@fortawesome/free-solid-svg-icons';

//material UI Components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';

//custom components
import DragDrop from './components/DragDrop';
import SideListSearch from './components/SideListSearch';
import ListItem from './components/ListItem';
import TextSubmit from './components/TextSubmit';
import TextInput from './components/TextInput';
import EditAllModal from './components/EditAllModal';
import AddSubtitleModal from './components/AddSubtitleModal';
import EditJsonModal from './components/EditJsonModal';
import ResponseAlert from './components/ResponseAlert';
import InfoModal from './components/InfoModal';
import JsonMetadataModal from './components/JsonMetadataModal';

import {parseVTTFile, parseSRTFile, parseJSONFile, generateVtt, generateSrt} from './processComponents/Parser';

//styles
import './timelineStyles/index.less';
import './styles/List.css';
import './styles/Main.css';
import './styles/Subtitle.css';


///////////////////////////////////////////////////////////////////////////// data control

//defines the properties of a subtitle object in the timeline
interface SubtitleData extends TimelineAction {
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
    backgroundColor: string;
    advancedEdit: boolean;
  };
}

//the data structure for an entire row in the timeline
interface CustomTimelineRow extends TimelineRow {
  actions: SubtitleData[];
}

/////////////////////////////////////////////////////////////////////////////////////////// initialization

//all the data that exists in a SINGLE timeline row (moved outside component to prevent multiple calls)
const mockData: CustomTimelineRow[] = parseVTTFile("", {});

const App = () => {

  //REFS:
  //the current state of the timeline and its operations (can be manipulated)
  const timelineState = useRef<TimelineState>();
  const playerPanel = useRef<HTMLDivElement>(null);
  const autoScrollWhenPlay = useRef<boolean>(true);

  //video player ref
  const playerRef = useRef(null);

  //side subtitle list ref
  const subtitleListRef = useRef(null);

  

  //STATE MANAGEMENT:
  const [currentSubtitle, setCurrentSubtitle] = useState({data: {
    name: "",
  }} as SubtitleData);
  const [data, setData] = useState(mockData);
  const [overlaps, setOverlaps] = useState([]);
  
  const [filename, setFilename] = useState("export file");
  const [fileType, setFileType] = useState("");

  //json metadata
  const [metaVideoSrc, setMetaVideoSrc] = useState("");
  const [metaCreatedAt, setMetaCreatedAt] = useState("");
  const [metaUpdatedAt, setMetaUpdatedAt] = useState(null);
  const [metaLastUpdatedBy, setMetaLastUpdatedBy] = useState("");
  const [metaNote, setMetaNote] = useState("");
  const [metaFilename, setMetaFilename] = useState("");
  const [metaImportFileType, setMetaImportFileType] = useState("");

  //track subtitle IDs
  const [idMap, setIdMap] = useState({});

  //handling link inserts for the video
  const [videoLink, setVideoLink] = useState("");

  //the positioning edit values entered
  const [alignmentEdit, setAlignmentEdit] = useState(null);
  const [lineEdit, setLineEdit] = useState(-1);

  //modal opening and closing 
  const [modalIsOpen, setIsOpen] = useState(false);
  const [editAllModelIsOpen, setEditAllModelIsOpen] = useState(false);
  const [editJsonModalIsOpen, setEditJsonModalIsOpen] = useState(false);
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
  const [jsonMetadataModalIsOpen, setJsonMetadataModalIsOpen] = useState(false);

  //state management for adding subtitle modal
  const [inputValue, setInputValue] = useState("");
  const [startTimeInputValue, setStartTimeInputValue] = useState("");
  const [endTimeInputValue, setEndTimeInputValue] = useState("");
  const [lastUpdatedByInput, setLastUpdatedByInput] = useState("");
  const [noteInput, setNoteInput] = useState("");

  const [switchState, setSwitchState] = useState(true);

  const [displaySelectAll, setDisplaySelectAll] = useState(true);

  //loaders
  const [displayListLoader, setDisplayListLoader] = useState(false);
  const [listDisabledClass, setListDisabledClass] = useState("");

  //response alert state management
  const [displayResponseAlert, setDisplayResponseAlert] = useState(0);
  const [responseAlertText, setResponseAlertText] = useState("this is some placeholder text");
  const [responseAlertSeverity, setResponseAlertSeverity] = useState("success");

  ///////////////////////////////////////////////////////////////////////////////////////// component setup

  //TIMELINE
  //timeline behaviour editing
  const mockEffect: Record<string, TimelineEffect> = {
    effect1: {
      id: 'effect1',
      name: 'effect1',
      source: {
        enter: ({ action }) => {

          // update((action as CustomTimelineAction));
          subtitleListRef.current.scrollToRow((action as SubtitleData).data.subtitleNumber);

          (action as SubtitleData).data.backgroundColor = "#FCA311";

          setCurrentSubtitle((action as SubtitleData));

          let currentSubtitleElement = document.getElementById("subtitle");
          if(currentSubtitleElement) {
            currentSubtitleElement.style.opacity = "100";
          }

            //resync timeline and player if it gets out of hand
            if(timelineState.current.getTime() - playerRef.current.currentTime() > 0.1 || timelineState.current.getTime() - playerRef.current.currentTime() < -0.1) {
              timelineState.current.setTime(playerRef.current.currentTime());
            }

        },
        leave: ({ action }) => {
          (action as SubtitleData).data.backgroundColor = "#E5E5E5";
          
          let currentSubtitleElement = document.getElementById("subtitle");
          if(currentSubtitleElement) {
            currentSubtitleElement.style.opacity = "0";
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
      timelineState.current.setTime(player.currentTime());
      timelineState.current.play({});
    })

    // You can handle player events here, for example:
    player.on('waiting', () => {
      videojs.log('player is waiting');
      timelineState.current.pause();
      playerRef.current.currentTime(timelineState.current.getTime());
      timelineState.current.setTime(playerRef.current.currentTime());
      playerRef.current.currentTime(timelineState.current.getTime());
    });

    player.on('playing', () => {
      if(timelineState.current.isPaused) {
        timelineState.current.play({});
      }
    })

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

  const generateUniqueIdNumber = () => {
    //generating a unique id means new subtitle so clear all previous highligh colors
    data[0].actions.forEach(action => {
      action.data.backgroundColor = "#E5E5E5";
    })

    //ADD LOADING FUNCTIONALITY AFTER

    let tempIdMap = {...idMap};
    console.log("generating unique id using: ", tempIdMap);
    let subtitleNumber = data[0].actions.length + 1;
    while(tempIdMap[subtitleNumber] === "") {
      subtitleNumber++;
    }
    tempIdMap[subtitleNumber] = "";
    setIdMap({...tempIdMap});
    return subtitleNumber + 1;
  }

  //for inserting a subtitle to the dataset
  const insertSubtitle = async (startTime, endTime, content, currentSubtitle) => {

    setListDisabledClass("subtitle-list-container-disabled");

    console.log("start time for insertion: ", startTime);
    console.log("end time for insertion: ", endTime);

    if(content === "") {
      content = "no text";
    }

    //error handling
    if(startTime < currentSubtitle.end) {
      throw new Error("insertion will cause overlapping subtitles!");
    }
    
    if(data[0].actions[currentSubtitle.data.subtitleNumber + 1] && endTime > data[0].actions[currentSubtitle.data.subtitleNumber + 1].start) {
      throw new Error("insertion will cause overlapping subtitles!");
    }

    if(endTime == startTime) {
      throw new Error("subtitle has no duration!");
    }


    const newAction : SubtitleData = {   
      id : `action${generateUniqueIdNumber()}` , 
      start : startTime,
      end : endTime, 
      effectId : "effect1",
      data: {
        src: "/audio/bg.mp3",
        name: content,
        subtitleNumber: currentSubtitle.data.subtitleNumber + 1,
        alignment: "center",
        direction: "",
        lineAlign: "",
        linePosition: "auto",
        size: 100,
        textPosition: "",
        toEdit: false,
        backgroundColor: "#E5E5E5",
        advancedEdit: false,
      } 
    }

    let tempArray = data;

    const updateArray = async () => {
      tempArray[0].actions.splice(currentSubtitle.data.subtitleNumber + 1, 0, newAction);
    }

    await updateArray();

    await reassignSubtitleNumbers(tempArray);
    console.log("temp array before setting data: ", tempArray);
    setData([...tempArray]);
    await update(currentSubtitle, 5);

    closeModal();

    await setTime(currentSubtitle);

    showResponseAlert("successfully inserted", "success");

  }

  const updateData = async (tempArray) => {
    setData([...tempArray]);
    verifySubtitles();
  }

  //deleting from the entire dataset
  const deleteSubtitle = async (action) => {

    setListDisabledClass("subtitle-list-container-disabled");

    console.log("deleting: ", action);

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

      const updateArray = async () => {
        tempArray[0].actions.splice(action.data.subtitleNumber, 1);
      }

      await updateArray();

      console.log("fallback action: ", fallbackAction);
      
      await reassignSubtitleNumbers(tempArray);
      setData([...tempArray]);
      await update(fallbackAction, 5);
      await setTime(fallbackAction);

      closeModal();

      showResponseAlert("successfully deleted", "success");
    }

  }

  //merge two subtitles together
  const mergeSubtitle = async (subtitleObject) => {

    setListDisabledClass("subtitle-list-container-disabled");

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

        let combinedContent = `${subtitleObject.data.name}${actions[i + 1].data.name}`;
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

    //merge the leftover element
    if(i < length) {
      mergedActions.push(actions[i]);
    }
    console.log("actions after merge: ", mergedActions);

    // Clone the existing data array
    let tempData = data;

    const updateArray = async () => {
      let tempData = data;
      tempData[0].actions = [...mergedActions];
    }

    await updateArray();

    await reassignSubtitleNumbers(tempData);
    console.log("data prior to updating after merge: ", tempData);
    await updateData(tempData);
    await update(subtitleObject, 5);
    await setTime(subtitleObject);

  }

  const splitSubtitle = async (currentSubtitleObject) => {

    setListDisabledClass("subtitle-list-container-disabled");

    console.log("splitting: ", currentSubtitleObject);
  
    // Create a new subtitle object based on the current subtitle
    const newAction = {
      id: `action${generateUniqueIdNumber()}`,
      start: Math.round(((currentSubtitleObject.end + currentSubtitleObject.start) / 2) * 100) / 100,
      end: currentSubtitleObject.end,
      effectId: "effect1",
      data: {
        src: "/audio/bg.mp3",
        name: currentSubtitleObject.data.name,
        subtitleNumber: currentSubtitleObject.data.subtitleNumber + 1,
        alignment: currentSubtitleObject.data.alignment,
        direction: "",
        lineAlign: "",
        linePosition: currentSubtitleObject.data.linePosition,
        size: 100,
        textPosition: "",
        toEdit: false,
        backgroundColor: "#E5E5E5",
        advancedEdit: false,
      }
    };

    // Clone the existing data array
    let tempArray = data;
  
    const updateArray = async () => {

      tempArray[0].actions[currentSubtitleObject.data.subtitleNumber].end = (currentSubtitleObject.end + currentSubtitleObject.start) / 2;
      // Insert the new subtitle object into the array at the correct position
      tempArray[0].actions.splice(newAction.data.subtitleNumber, 0, newAction);
    }

    await updateArray();
  
    // Reassign subtitle numbers
    await reassignSubtitleNumbers(tempArray);
    setData([...tempArray]);
    await update(currentSubtitleObject, 5);

    await setTime(currentSubtitle);

    showResponseAlert("successfully split", "success");
  };

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
      actions[i].data.backgroundColor = "#E5E5E5";
    }

  
    for (let i = 0; i < actions.length - 1; i++) {
      tempData[0].actions[i].data.subtitleNumber = i;
      let current = actions[i];
      let next = actions[i + 1];
  

      let currentElement = document.getElementById(`${(current as SubtitleData).data.subtitleNumber}-list-item-container`);
      let nextElement = document.getElementById(`${(next as SubtitleData).data.subtitleNumber}-list-item-container`);
  
      if (current.end > next.start) {
        validExport = false;
        console.log("overlap at: ", current.end, " and ", next.start);

        if(currentElement && nextElement) {
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

  const handleAlignmentChange = async (subtitleObject, alignment) => {
    subtitleObject.data.alignment = alignment;
    setData([...data]);
    await setTime(subtitleObject);

    console.log("alignment change: ", alignment);
  }

  const onHandleLinePositionChange = async (newInput, subtitleObject) => {
    if(newInput === "auto") {
      subtitleObject.data.linePosition = 100;
    } else if (!Number.isNaN(newInput)) {
      subtitleObject.data.linePosition = Number(newInput);
    }
    await setTime(subtitleObject);
  }

  //for the edit all/all selected functionality
  const handleYAlignChange = (newLine) => {
    setLineEdit(newLine);
  }

  const handleEditAllAlignmentChange = (alignment) => {
    setAlignmentEdit(alignment);

    console.log("alignment change: ", alignment);
  }

  const editAllSelected = async (removeAll=false) => {
    let tempData = data;
    let tempActions = tempData[0].actions;
    tempActions.forEach(action => {

      if(action.data.toEdit) {
        if(alignmentEdit != null) {
          action.data.alignment = alignmentEdit;
        }
  
        if(lineEdit != -1) {
          action.data.linePosition = lineEdit.toString();
        }

        if(removeAll) {
          action.data.toEdit = false;
        }
      }

    })

    setData([...tempData]);
    setDisplaySelectAll(true);
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
  
      let currentElement = document.getElementById(`${(current as SubtitleData).data.subtitleNumber}-list-item-container`);
      let nextElement = document.getElementById(`${(next as SubtitleData).data.subtitleNumber}-list-item-container`);
  
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

  const getCurrentDate = () => {
    let newUpdatedDate = new Date();
    setMetaUpdatedAt(newUpdatedDate);
    return newUpdatedDate;
  }

  const generateJSON = () => {
    console.log("before generated: lastUpdateBy = ", lastUpdatedByInput, " | note = ", noteInput);
    if(verifySubtitlesForExport()) {
      let exportObject = {
        metaData: {},
        data: [],
      };
      let metaDataObject = {
        videoSrc: videoLink,
        filename: filename,
        importFileType: fileType,
        createdAt: metaCreatedAt ? metaCreatedAt : new Date(),
        updatedAt: {getCurrentDate},
        lastUpdatedBy: lastUpdatedByInput ? lastUpdatedByInput : metaLastUpdatedBy,
        note: noteInput ? noteInput : "",
      };
      exportObject.metaData = metaDataObject;
      exportObject.data = data;
      downloadJSONFile(JSON.stringify(exportObject));
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

  const downloadJSONFile = (generatedString) => {
    const element = document.createElement("a");
    const file = new Blob([generatedString], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.json`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  ////////////////////////////////////////////////////////////////////handle screen clicks and actions

  //move to the clicked subtitle on both the side list
  const handleListClick = async (subtitleObject) => {

    currentSubtitle.data.backgroundColor = "#E5E5E5";

    console.log("clicked subtitle: ", subtitleObject.data.subtitleNumber);
    playerRef.current.currentTime(subtitleObject.start);

    reassignSubtitleNumbers(data);
    await setTime(subtitleObject);
    await update(subtitleObject, 5);

  }

  //handles the scenario when a subtitle in the timeline is clicked
  const handleActionClick = async (action: SubtitleData) => {
    currentSubtitle.data.backgroundColor = "#E5E5E5";

    playerRef.current.currentTime(action.start);
    reassignSubtitleNumbers(data);
    await setTime(action);
    await update(action, 5);
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
      console.log("Updating video source to:", videoLink);
      playerRef.current.src({ src: videoLink, type: 'video/mp4' });
      playerRef.current.load(); // Ensure the player reloads the new source
    } else {
      console.error("Player reference is not set");
    }
  };

  const handleVideoLinkChange = (event) => {
    setVideoLink(event.target.value);
  }

  const handleOnVideoUpload = (fileObject) => {
    // Initialize a FileReader
    const reader = new FileReader();
  
    let tempIdMap = {};
  
    // Define what happens when the file is read successfully
    reader.onload = (event) => {
      try {
        console.log("video load log: ", fileObject);
  
        let result;
  
        if (fileObject.name.includes(".vtt")) {
          result = parseVTTFile(reader.result, tempIdMap);
          setFileType("vtt");
        } else if (fileObject.name.includes(".srt")) {
          result = parseSRTFile(reader.result, tempIdMap);
          setFileType("srt");
        } else if (fileObject.name.includes(".json")) {
          let initialResult = parseJSONFile(reader.result);
          result = initialResult.data;
          setMetaFilename(initialResult.metaData.filename);
          setMetaVideoSrc(initialResult.metaData.videosrc);
          setMetaCreatedAt(initialResult.metaData.createdAt);
          setMetaUpdatedAt(initialResult.metaData.updatedAt);
          setMetaLastUpdatedBy(initialResult.metaData.lastUpdatedBy);
          setMetaNote(initialResult.metaData.note);
          setMetaImportFileType(initialResult.metaData.importFileType);
          setFileType("json");
        }
  
        if (result === undefined) {
          throw new Error("Parsing result is undefined.");
        }
  
        setIdMap({ ...tempIdMap });
        console.log("parsing result: ", result);
        setData([...result]);
  
      } catch (error) {
        console.log("Error while handling file content:", error.message);
        showResponseAlert("Unable to load file content", "error");
      }
    };
  
    // Read the file as text
    reader.readAsText(fileObject, 'UTF-8');
  };
  

  //get starttime from the result that was clicked
  const handleResultClick = async (action) => {
    await setTime(action);
    await update(action);
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

  const handleStartTimeInputChange = (event) => {
    setStartTimeInputValue(event.target.value);
  }

  const handleEndTimeInputChange = (event) => {
    setEndTimeInputValue(event.target.value);
  }

  const handleDisplayListLoader = (valueToSet) => {
    setDisplayListLoader(valueToSet);
  }

  //these will only be updated on confirm, so don't need event, but instead final value
  const handleLastUpdatedByChange = (event) => {
    console.log("last update by set");
    setLastUpdatedByInput(event.target.value);
  }

  const handleNoteChange = (event) => {
    console.log("note set");
    setNoteInput(event.target.value);
  }

  const forceUpdate = async (subtitleObject) => {
    await setTime(subtitleObject);
    await update(subtitleObject, 10);
  }


  ///////////////////////////////////////////////////////////////// modal functions

  const openEditAllModal = () => {
    setEditAllModelIsOpen(true);
  }

  const closeEditAllModal = () => {
    setEditAllModelIsOpen(false);
  }

  //add subtitle modal functions
  const openModal = async (end:number) => {
    await updateData([...data]);
    setIsOpen(true);
    // setEndTime(end);
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  const openEditJsonModal = () => {
    setEditJsonModalIsOpen(true);
  }

  const closeEditJsonModal = () => {
    setEditJsonModalIsOpen(false);
  }

  const openInfoModal = () => {
    setInfoModalIsOpen(true);
  }

  const closeInfoModal = () => {
    setInfoModalIsOpen(false);
  }

  const openJsonMetadataModal = () => {
    setJsonMetadataModalIsOpen(true);
  }

  const closeJsonMetadataModal = () => {
    setJsonMetadataModalIsOpen(false);
  }

  ////////////////////////////////////////////////////////////////////////////////// other helper functions

  const createTempActions = () => {
      let tempActionsArray = []
      for(let i = 0; i <= 10; i++) {
        let newAction = {
          id: `action_temp${i}`,
          start: 100000+i,
          end: 100001+i,
          effectId: 'effect1',
          
          data: {
              src: '/audio/audio.mp3',
              name: "",
              subtitleNumber: data[0].actions.length + i + 1,
              alignment: "",
              direction: "",
              lineAlign: "",
              linePosition: "",
              size: 0,
              textPosition: "",
              toEdit: false,
              backgroundColor: "transparent",
              advancedEdit: false,
          },
      }
      tempActionsArray.push(newAction as SubtitleData);
    }
    return tempActionsArray;
  }

  const update = async (action, shift=5) => {
    if(data[0].actions.length < 10) {
      //if there is not room to shift, then force an update
      console.log("forcing an update");
      console.log("working with data: ", data);
      let tempData = cloneDeep(data);
      let extendedData = data;
      extendedData[0].actions.push(...createTempActions());
      const updateThings = async () => {
        await setData([...extendedData]);
        if(shift + action.data.subtitleNumber < data[0].actions.length) {
          await subtitleListRef.current.scrollToRow(action.data.subtitleNumber + shift);
        } else {
          await subtitleListRef.current.scrollToRow(action.data.subtitleNumber - shift);
        }
        await subtitleListRef.current.scrollToRow(action.data.subtitleNumber);
      }
      await updateThings();
      setData([...tempData]);
    } else {
      if(shift + action.data.subtitleNumber < data[0].actions.length) {
        await subtitleListRef.current.scrollToRow(action.data.subtitleNumber + shift);
      } else {
        await subtitleListRef.current.scrollToRow(action.data.subtitleNumber - shift);
      }
      await subtitleListRef.current.scrollToRow(action.data.subtitleNumber);
    }
  }
  

  //resyncs the player and timeline at a specifc subtitle
  const setTime = async (action) => {
    if(timelineState.current && playerRef.current) {
      await playerRef.current.currentTime(action.start);
      timelineState.current.setTime(playerRef.current.currentTime());
    }
  }

  const getLinePositionValue = (action) => {
    if(action.data.linePosition === "auto") {
      return 100;
    } else {
      return Number(action.data.linePosition);
    }
  }

  const getDisplayListLoader = () => {
    if(displayListLoader) {
      return <div className={"list-loading-spinner-container"} style={{display: `flex`, top: 200, left: 200}}>
        <CircularProgress />
      </div>;
    } else {
      return <div className={"list-loading-spinner-container"} style={{display: `none`, top: 200, left: 200}}>
        <CircularProgress />
      </div>;
    }
  }

  const reassignSubtitleNumbers = async (data) => {
    for(let i = 0; i < data[0].actions.length; i++) {
      data[0].actions[i].id = `action${i}`;
      data[0].actions[i].data.subtitleNumber = i;
    }
  }

  const selectAllForEdit = async () => {
    let tempData = data;
    tempData[0].actions.forEach(action => {
      action.data.toEdit = true;
    }) 
    setDisplaySelectAll(false);
    setData([...tempData]);
    await update(currentSubtitle);
  }

  const unselectAllForEdit = async () => {
    let tempData = data;
    tempData[0].actions.forEach(action => {
      action.data.toEdit = false;
    }) 
    setDisplaySelectAll(true);
    setData([...tempData]);
    await update(currentSubtitle);
  }

  const getSelectAllButton = () => {
    if(displaySelectAll) {
      return <Button size={"small"} className={"edit-all-button"} variant={"contained"} onClick={async () => await selectAllForEdit()}>Select All</Button>;
    } else {
      return <Button size={"small"} className={"edit-all-button"} variant={"contained"} onClick={async () => await unselectAllForEdit()}>Unselect All</Button>
    }
  }

  const handleSelectedLeftClick = async () => {
    let i = currentSubtitle.data.subtitleNumber - 1;

    while(i > 0 && data[0].actions[i].data.toEdit == false) {
      i--;
    }

    console.log("closest subtitle on edit list above current: ", data[0].actions[i]);

    //verify subtitle exists, and that it has been selected to edit
    if(data[0].actions[i] && data[0].actions[i].data.toEdit == true) {
      await setTime(data[0].actions[i]);
      await update(data[0].actions[i], 5);
    }

  }

  const handleSelectedRightClick = async () => {
    let i = currentSubtitle.data.subtitleNumber + 1;

    while(i < data[0].actions.length && data[0].actions[i].data.toEdit == false) {
      i++;
    }

    //verify subtitle exists, and that it has been selected to edit
    if(data[0].actions[i] && data[0].actions[i].data.toEdit == true) {
      await setTime(data[0].actions[i]);
      await update(data[0].actions[i], 5);
    }

  }
  
  const showResponseAlert = async (responseText, severity) => {
      setResponseAlertText(responseText);
      setResponseAlertSeverity(severity);
      setDisplayResponseAlert(100);
      await sleep(3000);
      setDisplayResponseAlert(0);
  }

  const getJSONMetadataButton = () => {
    if(fileType === "json") {
      return <FontAwesomeIcon onClick={() => openJsonMetadataModal()} className={"info-modal-button clickable-icon"} icon={faFileLines} />

    }

    return null;
  }

  const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  //////////////////////////////////////////////////////////////////////////// React hooks utilization

  useEffect(() => {
    console.log("current dataset: ", data);
    setListDisabledClass("");
    setDisplayListLoader(false);
  }, [data])

  useEffect(() => {
    if(switchState) {
      autoScrollWhenPlay.current = true;
    } else {
      autoScrollWhenPlay.current = false;
    }

  }, [switchState])

  useEffect(() => {
      // Prompt confirmation when reload page is triggered
      window.onbeforeunload = () => { return "" };
          
      // Unmount the window.onbeforeunload event
      return () => { window.onbeforeunload = null };
  }, []);

  ///////////////////////////////////////////////////////////////// rendering functions

  const cache = new CellMeasurerCache({
    defaultHeight:170,
    fixedWidth: true
  });

  function rowRenderer({
    key, // Unique key within array of rows
    index, // Index of row within collection
    style, // Style object to be applied to row (to position it)
    parent,
  }) {
    return (
      <CellMeasurer
        cache={cache}
        columnIndex={0}
        key={key}
        parent={parent}
        rowIndex={index}
      >
        {({measure, registerChild}) => (
          <div ref={registerChild} style={style}>
            <ListItem 
              measure={measure}
              subtitleObject={data[0].actions[index]} 
              currentSubtitle={currentSubtitle}
              onHandleChange={handleChange}
              onHandleEndTimeChange={handleEndTimeChange}
              onHandleStartTimeChange={handleStartTimeChange}
              onHandleLinePositionChange={onHandleLinePositionChange}
              onSetParentData={onSetParentData}
              deleteSubtitle={deleteSubtitle}
              handleListClick={handleListClick}
              openModal={openModal}
              handleAlignmentChange={handleAlignmentChange}
              onHandleMerge={mergeSubtitle}
              onHandleSplit={splitSubtitle}
              onHandleDisplayListLoader={handleDisplayListLoader}
              forceUpdate={forceUpdate}
              handleShowResponseAlert={showResponseAlert}
            />
          </div>
        )}
      </CellMeasurer>
    );
  }

  return (
    <div className="main-container" style={{height:"100vh",  display:"flex", flexDirection:"column"}}>
      <EditAllModal
        isOpen={editAllModelIsOpen}
        onCloseModal={closeEditAllModal}
        handleEditAllAlignmentChange={handleEditAllAlignmentChange}
        editAllSelected={editAllSelected}
        handleYAlignChange={handleYAlignChange}
        setParentData={onSetParentData}
      />
      <div style={{zIndex: "9999"}}>
        <AddSubtitleModal
          isOpen={modalIsOpen}
          onCloseModal={closeModal}
          onHandleInsert={insertSubtitle}
          subtitleObject={currentSubtitle}
          onHandleInputChange={handleInputChange}
          inputValue={inputValue}
          onHandleEndInputChange={handleEndTimeInputChange}
          onHandleStartInputChange={handleStartTimeInputChange}
          startTime={startTimeInputValue}
          endTime={endTimeInputValue} 
          data={data}
          onHandleDisplayListLoader={handleDisplayListLoader}
        />
      </div>
      <div style={{zIndex: "9999"}}>
        <EditJsonModal
          isOpen={editJsonModalIsOpen}
          onCloseModal={closeEditJsonModal}
          lastUpdatedBy={metaLastUpdatedBy}
          note={metaNote}
          onHandleLastUpdatedByChange={handleLastUpdatedByChange}
          onHandleNoteChange={handleNoteChange}
          onHandleConfirm={generateJSON}
          editedByValue={lastUpdatedByInput}
        />
      </div>
      <div style={{zIndex: "9999"}}>
        <InfoModal
          isOpen={infoModalIsOpen}
          onCloseModal={closeInfoModal}
        />
      </div>
      <div style={{zIndex: "9999"}}>
        <JsonMetadataModal
          isOpen={jsonMetadataModalIsOpen}
          onCloseModal={closeJsonMetadataModal}
          videoSrc={metaVideoSrc}
          filename={metaFilename}
          importFileType={metaImportFileType}
          createdAt={metaCreatedAt}
          updatedAt={metaUpdatedAt}
          lastUpdatedBy={metaLastUpdatedBy}
          note={metaNote}
        />
      </div>
      <div className="main-row-1" style={{height:"70vh", display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div className="scroll-container">
        <div>
          <div className={"search-bar-container"}>
            <SideListSearch searchBarWidth={200} onHandleResultClick={handleResultClick} dataObjects={data ? data[0].actions : []} />
            <div className={"alert-info-container"}>
              <div className={"response-alert-container"} style={{opacity: displayResponseAlert}}>
                <ResponseAlert responseText={responseAlertText} severity={responseAlertSeverity} />
              </div>
              {getJSONMetadataButton()}
              <FontAwesomeIcon onClick={() => openInfoModal()} className={"info-modal-button clickable-icon"} icon={faCircleInfo} />
            </div>
          </div>
        </div>
          <div id={"subtitle-list-container-id"} className={"subtitle-list-container " + listDisabledClass}>
            {getDisplayListLoader()}
            <AutoSizer defaultHeight={100} defaultWidth={100}>
              {(size) => {
                const {width, height} = size; 
                return (
                <List
                  scrollToAlignment='center'
                  className={"list-render-container"}
                  ref={subtitleListRef}
                  width={width}
                  height={height}
                  rowCount={data[0].actions.length}
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
                  overscanRowCount={4}
                  deferredMeasurementCache={cache}
                  rowHeight={cache.rowHeight}
                  {...data}
                />
              )
              }}
            </AutoSizer>
          </div>
        </div>
        <div className={"video-container"}>
          <div className={"toolbar-container"}>
            <TextSubmit handleInputChange={handleVideoLinkChange} handleSubmit={handleLinkSubmit} submitButtonText={"Insert"} label={"Video Link"}/>
            <div className={"drag-drop-container"}>
              <DragDrop handleShowResponseAlert={showResponseAlert} onVideoUpload={handleOnVideoUpload} />
            </div>
          </div>        
          <div className={"video-player-container"}>
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} currentSubtitle={currentSubtitle} alignment={currentSubtitle.data.alignment} linePosition={getLinePositionValue(currentSubtitle)} />
          </div>
        </div>
      </div>
      <div className="player-config-row timeline-editor-engine main-row-2">
        <div className="player-config">
          <div className={"list-edit-config-container"}>
            {getSelectAllButton()}
            <Button size={"small"} className={"edit-all-button"} variant={"contained"} onClick={() => openEditAllModal()}>Edit Selected</Button>
            <div>
              <FontAwesomeIcon onClick={async () => await handleSelectedLeftClick()} className={"selected-left-click selected-traverse-button clickable-icon"} icon={faCircleArrowLeft} />
              <FontAwesomeIcon onClick={async () => await handleSelectedRightClick()} className={"selected-right-click selected-traverse-button clickable-icon"} icon={faCircleArrowRight} />
            </div>
            {/* <p className="autoscroll-switch-text">Autoscroll:</p>
            <Switch className={"switch autoscroll-switch"} checked={switchState} onChange={toggleAutoScroll}/> */}
          </div>
          <div className={"autoscroll-switch-container"}>
            <div>
              <TextInput handleInputChange={handleFilenameInputChange} label={"File Name"}/>
            </div>
            <div>
              <Button size={"small"} className={"button export-button"} variant={"contained"} onClick={() => generateVTT()}>Export VTT</Button>
              <Button size={"small"} className={"button export-button"} variant={"contained"} onClick={() => generateSRT()}>Export SRT</Button>
              <Button size={"small"} className={"button export-button"} variant={"contained"} onClick={() => openEditJsonModal()}>Export JSON</Button>
            </div>
          </div>
        </div>
        <div className="player-panel" id="player-ground-1" ref={playerPanel}></div>
        <div style={{display:"none"}}>
          <TimelinePlayer timelineState={timelineState} autoScrollWhenPlay={autoScrollWhenPlay} />
        </div>
        <Timeline
          style={{width:"100%", backgroundColor: "#222222", color:"#00000"}}
          scale={5}
          scaleSplitCount={6}
          scaleWidth={160}
          startLeft={20}
          autoScroll={true}
          ref={timelineState}
          editorData={data}
          effects={mockEffect}
          onChange={(data) => {
            setData([...data as CustomTimelineRow[]]);
            verifySubtitles();
            update(currentSubtitle, 5);
          }}
          onActionMoveEnd={(action) => {
            let usableAction = action.action;
            verifySubtitles();
          }}
          onActionResizeEnd={(action) => {
            let usableAction = action.action;
            verifySubtitles();
          }}
          getActionRender={(action, row) => {
            if (action.effectId === 'effect0') {
              return <CustomRender0 onActionClick={handleActionClick} action={action as SubtitleData} currentSubtitle={currentSubtitle} row={row as CustomTimelineRow} />;
            } else if (action.effectId === 'effect1') {
              return <CustomRender1 onActionClick={handleActionClick} action={action as SubtitleData} currentSubtitle={currentSubtitle} row={row as CustomTimelineRow} />;
            }
          }}
          autoReRender={true}
        />
      </div>
    </div>
  );
};

export default App;
