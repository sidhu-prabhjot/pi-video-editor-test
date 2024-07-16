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
import { faCircleArrowLeft, faCircleArrowRight, faCircleInfo, faFile, faFileLines, faClone} from '@fortawesome/free-solid-svg-icons';


//material UI Components
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Switch from '@mui/material/Switch';

//custom components
import DragDrop from './components/DragDrop';
import SideListSearch from './components/SideListSearch';
import ListItem from './components/ListItem';
import TextSubmit from './components/TextSubmit';
import EditAllModal from './components/EditAllModal';
import AddSubtitleModal from './components/AddSubtitleModal';
import EditJsonModal from './components/EditJsonModal';
import ResponseAlert from './components/ResponseAlert';
import InfoModal from './components/InfoModal';

import {parseVTTFile, parseSRTFile, parseJSONFile, generateVtt, generateSrt} from './processComponents/Parser';

//data/functions to fetch data for the info modals
import {metaDataInfoData, usageInfoData} from './DataExports/InfoModalData'

//styles
import './timelineStyles/index.less';
import './styles/List.css';
import './styles/Main.css';
import './styles/Main_dark.css';
import './styles/Subtitle.css';
import { StarTwoTone } from '@ant-design/icons';


///////////////////////////////////////////////////////////////////////////// data control

const MaterialUISwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
    borderRadius: 20 / 2,
  },
}));

//defines the properties of a subtitle object in the timeline
interface SubtitleObject extends TimelineAction {
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
  actions: SubtitleObject[];
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
  const [darkModeClassAppend, setDarkModeClassAppend] = useState(""); //will be appended to class to change it

  const [currentSubtitle, setCurrentSubtitle] = useState({data: {
    name: "",
  }} as SubtitleObject);
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

  const [lastUpdatedBy, setLastUpdatedBy] = useState("");
  const [note, setNote] = useState("");

  //track subtitle IDs
  const [idMap, setIdMap] = useState({});

  //handling link inserts for the video
  const [videoLink, setVideoLink] = useState("");

  //the positioning edit values entered
  const [alignmentEdit, setAlignmentEdit] = useState(null);
  const [lineEdit, setLineEdit] = useState(-1);

  //modal opening and closing 
  const [addSubtitleModalIsOpen, setAddSubtitleModalIsOpen] = useState(false);
  const [editAllModelIsOpen, setEditAllModelIsOpen] = useState(false);
  const [editJsonModalIsOpen, setEditJsonModalIsOpen] = useState(false);
  const [infoModalIsOpen, setInfoModalIsOpen] = useState(false);
  const [jsonMetadataModalIsOpen, setJsonMetadataModalIsOpen] = useState(false);

  //state management for adding subtitle modal
  const [addSubtitleContent, setAddSubtitleContent] = useState("");
  const [addSubtitleStartTime, setAddSubtitleStartTime] = useState("");
  const [addSubtitleEndTime, setAddSubtitleEndTime] = useState("");

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

          let subtitleObject = action as SubtitleObject;
          subtitleListRef.current.scrollToRow(subtitleObject.data.subtitleNumber);

          subtitleObject.data.backgroundColor = "#FCA311";

          setCurrentSubtitle((action as SubtitleObject));

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
          let subtitleObject = action as SubtitleObject;

          subtitleObject.data.backgroundColor = "#E5E5E5";
          
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

    //while buffering/loading
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
    // Initialize a temporary ID map and log it
    let tempIdMap = { ...idMap };
    console.log("Generating unique ID using: ", tempIdMap);
  
    // Find a unique subtitle number
    let subtitleNumber = data[0].actions.length + 1;
    while (tempIdMap.hasOwnProperty(subtitleNumber)) {
      subtitleNumber++;
    }
  
    // Update the ID map
    tempIdMap[subtitleNumber] = "";
    setIdMap(tempIdMap);
  
    return subtitleNumber;
  };
  
  
  // Function for inserting a subtitle into the dataset
  const insertSubtitle = async (startTime, endTime, content, currentSubtitle) => {
    setListDisabledClass("subtitle-list-container-disabled");

    console.log("Start time for insertion: ", startTime);
    console.log("End time for insertion: ", endTime);

    if (content === "") {
      content = "no text";
    }

    if(endTime < 0 || startTime < 0) {
      throw new Error("cannot have negative time!")
    }

    if(endTime < startTime) {
      throw new Error("start time cannot occur after end time!")
    }

    // Error handling for overlapping subtitles and zero duration
    if (startTime < currentSubtitle.end) {
      throw new Error("Insertion will cause overlapping subtitles!");
    }

    const nextSubtitle = data[0].actions[currentSubtitle.data.subtitleNumber + 1];
    if (nextSubtitle && endTime > nextSubtitle.start) {
      throw new Error("Insertion will cause overlapping subtitles!");
    }

    if (endTime === startTime) {
      throw new Error("Subtitle has no duration!");
    }

    // Creating a new subtitle object
    const newSubtitle = {
      id: `action${generateUniqueIdNumber()}`,
      start: startTime,
      end: endTime,
      effectId: "effect1",
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
      },
    };

    // Inserting the new subtitle into the dataset
    let tempArray = data;  // Clone the data to avoid direct mutations
    tempArray[0].actions.splice(currentSubtitle.data.subtitleNumber + 1, 0, newSubtitle);

    // Reassign subtitle numbers and update the state
    await reassignSubtitleNumbers(tempArray);
    console.log("Temp array before setting data: ", tempArray);
    setData([...tempArray]);
    await update(currentSubtitle, 5);
    await setTime(currentSubtitle);

    showResponseAlert("Successfully inserted", "success");
  };


  const updateData = async (tempArray) => {
    setData([...tempArray]);
    verifySubtitles();
  }

  const deleteSubtitle = async (subtitleObject) => {
    playerRef.current.pause();
    timelineState.current.pause();
    setDisplayListLoader(true);
    setListDisabledClass("subtitle-list-container-disabled");
  
    console.log("Deleting: ", subtitleObject);
  
    let fallbackSubtitleObject;
    const subtitleIndex = subtitleObject.data.subtitleNumber;
    const actions = data[0].actions;
  
    // Determine the fallback subtitle for updating
    if (subtitleIndex - 1 >= 0) {
      fallbackSubtitleObject = actions[subtitleIndex - 1];
    } else if (subtitleIndex + 1 < actions.length) {
      fallbackSubtitleObject = actions[subtitleIndex + 1];
    }
  
    if (actions.length > 1) {
      // Directly splice the actions array
      actions.splice(subtitleIndex, 1);
  
      console.log("Fallback subtitle: ", fallbackSubtitleObject);
  
      // Reassign subtitle numbers and update state
      await reassignSubtitleNumbers(data);
      setData([...data]);
      update(fallbackSubtitleObject);
      await setTime(fallbackSubtitleObject);

      showResponseAlert("Successfully deleted!", "success");
    } else {
      showResponseAlert("Cannot delete the subtitle!", "error");
    }
  };
  

  const mergeSubtitle = async (subtitleObject) => {
    setListDisabledClass("subtitle-list-container-disabled");
  
    let actions = [...data[0].actions];
    let mergedSubtitles = [];
  
    // Iterate through actions and merge when the target subtitleObject is found
    for (let i = 0; i < actions.length; i++) {
      if (actions[i] === subtitleObject && i < actions.length - 1) {
        let combinedContent = `${subtitleObject.data.name}${actions[i + 1].data.name}`;
        let mergedSubtitle = {
          ...subtitleObject,
          data: { ...subtitleObject.data, name: combinedContent },
          end: actions[i + 1].end,
        };
        mergedSubtitles.push(mergedSubtitle);
        i++; // Skip the next subtitle as it has been merged
      } else {
        mergedSubtitles.push(actions[i]);
      }
    }
  
    // Clone the existing data array and update with merged subtitles
    let tempData = [...data];
    tempData[0].actions = mergedSubtitles;
  
    await reassignSubtitleNumbers(tempData);
    setData(tempData);
  
    // Update the necessary subtitleObject and timings
    await update(subtitleObject);
    await setTime(subtitleObject);
  };
  
  const splitSubtitle = async (subtitleObject) => {
    setListDisabledClass("subtitle-list-container-disabled");
  
    console.log("Splitting: ", subtitleObject);
  
    // Calculate the midpoint of the current subtitle's duration
    const midpoint = Math.round(((subtitleObject.end + subtitleObject.start) / 2) * 100) / 100;
  
    // Create a new subtitle object based on the current subtitle
    const newSubtitle = {
      id: `action${generateUniqueIdNumber()}`,
      start: midpoint,
      end: subtitleObject.end,
      effectId: "effect1",
      data: {
        ...subtitleObject.data,
        subtitleNumber: subtitleObject.data.subtitleNumber + 1,
        backgroundColor: "#E5E5E5",
        toEdit: false,
        advancedEdit: false,
      }
    };
  
    // Clone the existing data array
    let tempData = data;
    let actions = [...tempData[0].actions];
  
    // Update the end time of the current subtitle to the midpoint
    actions[subtitleObject.data.subtitleNumber].end = midpoint;
    
    // Insert the new subtitle object into the array at the correct position
    actions.splice(subtitleObject.data.subtitleNumber + 1, 0, newSubtitle);
    
    // Update the data array with the new actions
    tempData[0].actions = actions;
  
    // Reassign subtitle numbers
    await reassignSubtitleNumbers(tempData);
    
    // Update state and other necessary operations
    setData([...tempData]);
    await update(subtitleObject, 5);
    await setTime(subtitleObject);
  
    showResponseAlert("Successfully split", "success");
  };  

  // Function to sort actions by their start time
  const sortSubtitleObjects = (subtitleObjectsArray) => {
    subtitleObjectsArray.sort((a, b) => a.start - b.start);
  };

  const verifySubtitles = () => {
    let overlapsArray = [];
    let isValidSubtitles = true;
    let clonedData = cloneDeep(data);
    let subtitleObjectsArray = clonedData[0].actions;
  
    // Sort actions initially
    sortSubtitleObjects(subtitleObjectsArray);
  
    // Initialize subtitle numbers and background colors
    subtitleObjectsArray.forEach((subtitleObject, index) => {
      subtitleObject.data.subtitleNumber = index;
      subtitleObject.data.backgroundColor = "#E5E5E5";
    });
  
    for (let i = 0; i < subtitleObjectsArray.length - 1; i++) {
      let current = subtitleObjectsArray[i];
      let next = subtitleObjectsArray[i + 1];
  
      let currentElement = document.getElementById(`${current.data.subtitleNumber}-list-item-container`);
      let nextElement = document.getElementById(`${next.data.subtitleNumber}-list-item-container`);
  
      if (current.end > next.start) {
        isValidSubtitles = false;
        console.log("Overlap at: ", current.end, " and ", next.start);
  
        if (currentElement && nextElement) {
          currentElement.style.backgroundColor = "#BF0000";
          nextElement.style.backgroundColor = "#FF4040";
        }
        overlapsArray.push([next.start, current.end]);
  
        // Adjust next.start to resolve overlap
        next.start = current.end;
        
        // Reinitialize loop from the adjusted subtitle
        i = Math.max(i - 2, -1); // Ensure i does not go below -1 to avoid infinite loop
      } else if (nextElement) {
        nextElement.style.backgroundColor = "#E5E5E5";
      }
    }
  
    subtitleObjectsArray[subtitleObjectsArray.length - 1].data.subtitleNumber = subtitleObjectsArray.length - 1;
  
    if (isValidSubtitles) {
      console.log("Sorted actions: ", subtitleObjectsArray);
      clonedData[0].actions = subtitleObjectsArray;
      setData(clonedData);
      return true;
    } else {
      console.log("Invalid VTT, found overlapping subtitles");
      console.log("Sorted actions: ", subtitleObjectsArray);
      setOverlaps(overlapsArray);
      clonedData[0].actions = subtitleObjectsArray;
      setData(clonedData);
      return false;
    }
  };
  

  //////////////////////////////////////////////////////////////////////// editing a specific subtitle

  //set new horizontal alignment of subtitle
  const onAlignmentChange = async (subtitleObject, newAlignment) => {
    subtitleObject.data.alignment = newAlignment;
    setData([...data]);
    await setTime(subtitleObject);
  };
  
  //set new vertical alignment of subtitle
  const onLinePositionChange = async (newLinePosition, subtitleObject) => {
    if (newLinePosition === "auto") {
      subtitleObject.data.linePosition = 100;
    } else if (!Number.isNaN(newLinePosition)) {
      subtitleObject.data.linePosition = Number(newLinePosition);
    }
  
    await setTime(subtitleObject);
  };  

  //set horizontal alignment for edit all functionality
  const onEditAllAlignmentChange = (newAlignment) => {
    setAlignmentEdit(newAlignment);

    console.log("alignment change: ", newAlignment);
  };

  //set vertical alignment for edit all functionality
  const onEditAllLinePositionChange = (newLinePosition) => {
    setLineEdit(newLinePosition);
  };

  // Function to apply edits to all selected subtitles
  const editAllSelected = async (removeAll = false) => {
    let tempData = [...data]; // Clone the data array
    let tempSubtitleObjects = tempData[0].actions;

    tempSubtitleObjects.forEach(subtitleObject => {
      if (subtitleObject.data.toEdit) {
        if (alignmentEdit !== null) {
          subtitleObject.data.alignment = alignmentEdit;
        } else {
          throw new Error("invalid horizontal positioning!")
        }

        //the received line position must be a positive number between 0 and 100, or it must be the string "auto" 
        if ((Number(lineEdit) && Number(lineEdit) > 0 && Number(lineEdit) < 101) || (typeof lineEdit === "string" && lineEdit === "auto")) {
          if (typeof lineEdit === "string" && lineEdit === "auto") {
            setLineEdit(100);
          }
          subtitleObject.data.linePosition = lineEdit.toString();
        } else {
          throw new Error("invalid vertical positioning!")
        }

        //if removeAll is true, then remove each subtitle from edit list
        if (removeAll) {
          subtitleObject.data.toEdit = false;
        }
      }
    });

    setData([...tempData]);
    if(removeAll) setDisplaySelectAll(true); //change the unselectall button to select all
  };

  ////////////////////////////////////////////////////////////////////// exporting subtitles

  //TO DO: merge this with original verifySubtitles function
  const verifySubtitlesForExport = () => {

    let tempOverlapsArray = [];
    let validExport = true;
    let tempData = cloneDeep(data);
    let actions = tempData[0].actions;
  
    for (let i = 0; i < actions.length - 1; i++) {
      let current = actions[i];
      let next = actions[i + 1];
  
      let currentElement = document.getElementById(`${(current as SubtitleObject).data.subtitleNumber}-list-item-container`);
      let nextElement = document.getElementById(`${(next as SubtitleObject).data.subtitleNumber}-list-item-container`);
  
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

  const generateJSON = (lastUpdatedByInput) => {

    if(lastUpdatedByInput == null) {
      throw new Error("'last upated by' field is required!")
    }

    console.log("before generated: lastUpdateBy = ", lastUpdatedBy, " | note = ", note);
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
        updatedAt: getNewUpdatedDate(),
        lastUpdatedBy: lastUpdatedBy ? lastUpdatedBy : metaLastUpdatedBy,
        note: note ? note : metaNote,
      };
      exportObject.metaData = metaDataObject;
      exportObject.data = data;
      downloadJSONFile(JSON.stringify(exportObject));
    }
  }

  //TODO: merge these download functions into one
  //download the vtt file
  const downloadVTTFile = (generatedString) => {
    const element = document.createElement("a");
    const file = new Blob([generatedString], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${filename}.vtt`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  //download the srt file
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

  const getNewUpdatedDate = () => {
    let newUpdatedDate = new Date();
    setMetaUpdatedAt(newUpdatedDate);
    return newUpdatedDate;
  }

  ////////////////////////////////////////////////////////////////////handle screen clicks and actions

  //move to the clicked subtitle on the side list
  const onSubtitleListClick = async (subtitleObject) => {

    currentSubtitle.data.backgroundColor = darkModeClassAppend ? "#003D5C" : "#E5E5E5";

    console.log("clicked subtitle: ", subtitleObject.data.subtitleNumber);
    playerRef.current.currentTime(subtitleObject.start);

    reassignSubtitleNumbers(data);
    await setTime(subtitleObject);
    await update(subtitleObject, 5);

  }

  //handles the scenario when a subtitle in the timeline is clicked
  const onTimelineSubtitleClick = async (subtitleObject: SubtitleObject) => {
    currentSubtitle.data.backgroundColor = darkModeClassAppend ? "#003D5C" : "#E5E5E5";

    playerRef.current.currentTime(subtitleObject.start);
    reassignSubtitleNumbers(data);
    await setTime(subtitleObject);
    await update(subtitleObject, 5);
  }

  // Function to handle submission of video link
  const onVideoLinkSubmit = (event) => {
    event.preventDefault(); // Prevent the default form submission

    if (playerRef.current) {
      console.log("Updating video source to:", videoLink);
      playerRef.current.src({ src: videoLink, type: 'video/mp4' });
      playerRef.current.load(); // Ensure the player reloads the new source
    } else {
      console.error("Player reference is not set");
    }
  };

  //video link input field changes
  const onVideoLinkChange = (event) => {
    setVideoLink(event.target.value);
  }

  // Function to handle a subtitle file drop in file drag-drop
  const onSubtitleFileUpload = (fileObject) => {
    // Initialize a FileReader
    const reader = new FileReader();
    let tempIdMap = {};

    // Define what happens when the file is read successfully
    reader.onload = (event) => {
      try {
        console.log("File load log:", fileObject);

        let result;
        let noFileTypeFilename;

        if (fileObject.name.includes(".vtt")) {
          result = parseVTTFile(reader.result, tempIdMap);
          setFileType("vtt");
          //remove file type ending and store file name 
          noFileTypeFilename = fileObject.name.replace('.vtt', '');
          setFilename(noFileTypeFilename);
        } else if (fileObject.name.includes(".srt")) {
          result = parseSRTFile(reader.result, tempIdMap);
          setFileType("srt");
          //remove file type ending and store file name 
          noFileTypeFilename = fileObject.name.replace('.srt', '');
          setFilename(noFileTypeFilename);
        } else if (fileObject.name.includes(".json")) {
          let initialResult = parseJSONFile(reader.result);
          result = initialResult.data;
          // Set meta data
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
        console.log("Parsing result:", result);
        setData([...result]);

      } catch (error) {
        console.error("Error while handling file content:", error.message);
        showResponseAlert("Unable to load file content", "error");
      }
    };

    // Read the file as text
    reader.readAsText(fileObject, 'UTF-8');
  };

  //handle a search result click
  const onResultClick = async (action) => {
    await setTime(action);
    await update(action);
  }

  const onFilenameInputChange = (event) => {
    setFilename(event.target.value);
  }

  //////////////////////////////////////////////////////// component prop functions

  //handle subtitle content input change
  const onSubtitleContentChange = (newContent, subtitleObject) => {
    subtitleObject.data.name = newContent;
  }

  //handle start time input change
  const onStartTimeChange = (newStartTime, subtitleObject) => {
    if(newStartTime) {
      subtitleObject.start = Number(newStartTime);
    }
  }

  //handle end time input change
  const onEndTimeChange = (newEndTime, subtitleObject) => {
    if(newEndTime) {
      subtitleObject.end = Number(newEndTime);
    }
  }

  const onSetParentData = () => {
    setData([...data]);
    verifySubtitles();
  }

  //MODAL
  //handle content change for adding subtitle modal
  const onAddSubtitleContentChange = (event) => {
    setAddSubtitleContent(event.target.value);
  }

  const onAddSubtitleStartTimeChange = (event) => {
    setAddSubtitleStartTime(event.target.value);
  }

  const onAddSubtitleEndTimeChange = (event) => {
    setAddSubtitleEndTime(event.target.value);
  }

  const onDisplayListLoader = (displayLoader) => {
    setDisplayListLoader(displayLoader);
  }

  //handling input change on json metadata export update
  const onLastUpdatedByChange = (event) => {
    console.log("last update by set");
    setLastUpdatedBy(event.target.value);
  }

  const onNoteChange = (event) => {
    console.log("note set");
    setNote(event.target.value);
  }

  //LIKELY REMOVE
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
  const openAddSubtitleModal = async (end:number) => {
    await updateData([...data]);
    setAddSubtitleModalIsOpen(true);
  }

  const closeAddSubtitleModal = () => {
    setAddSubtitleModalIsOpen(false);
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
      tempActionsArray.push(newAction as SubtitleObject);
    }
    return tempActionsArray;
  }

  const update = async (subtitleObject, shift=5) => {
    if(data[0].actions.length < 10) {
      //if there is not room to shift, then force an update
      console.log("forcing an update");
      console.log("working with data: ", data);
      let tempData = data;
      let extendedData = cloneDeep(data);
      let keptSubtitleNumber = subtitleObject.data.subtitleNumber;
      extendedData[0].actions.push(...createTempActions());
      const updateThings = async () => {
        setData([...extendedData]);
        if(shift + subtitleObject.data.subtitleNumber < data[0].actions.length) {
          await subtitleListRef.current.scrollToRow(subtitleObject.data.subtitleNumber + shift);
          await subtitleListRef.current.scrollToRow(keptSubtitleNumber);
        } else {
          await subtitleListRef.current.scrollToRow(subtitleObject.data.subtitleNumber - shift);
          await subtitleListRef.current.scrollToRow(keptSubtitleNumber);
        }
        setData([...tempData]);
      }
      await updateThings();
      await subtitleListRef.current.scrollToRow(keptSubtitleNumber);

    } else {
      if(shift + subtitleObject.data.subtitleNumber < data[0].actions.length) {
        await subtitleListRef.current.scrollToRow(subtitleObject.data.subtitleNumber + shift);
      } else {
        await subtitleListRef.current.scrollToRow(subtitleObject.data.subtitleNumber - shift);
      }
      await subtitleListRef.current.scrollToRow(subtitleObject.data.subtitleNumber);
    }
  }
  

  //resyncs the player and timeline at a specifc subtitle
  const setTime = async (subtitleObject) => {
    if(timelineState.current && playerRef.current) {
      await playerRef.current.currentTime(subtitleObject.start);
      timelineState.current.setTime(playerRef.current.currentTime());
    }
  }

  //get the vertical positioning value of the subtitle
  const getLinePositionValue = (subtitleObject) => {
    if(subtitleObject.data.linePosition === "auto") {
      return 100;
    } else {
      return Number(subtitleObject.data.linePosition);
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

  // Put all subtitle numbers in order
  const reassignSubtitleNumbers = async (data) => {
    const actions = data[0].actions;

    // Using a single loop for efficient processing
    await Promise.all(
      actions.map((action, index) => {
        action.id = `action${index}`;
        action.data.subtitleNumber = index;
        return action; // Return action to ensure Promise.all works correctly
      })
    );
  };


  const selectAllForEdit = async () => {
    let tempData = data;
    //set toEdit to true for all subtitles
    tempData[0].actions.forEach(subtitleObject => {
      subtitleObject.data.toEdit = true;
    }) 
    //convert the select all button to an unselect all button
    setDisplaySelectAll(false);
    setData([...tempData]);
    await update(currentSubtitle);
  }

  const unselectAllForEdit = async () => {
    let tempData = data;
    //set toEdit to false for all subtitles
    tempData[0].actions.forEach(subtitleObject => {
      subtitleObject.data.toEdit = false;
    }) 
    //revert unselect all button to select all
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

  //traverse up/backward in the subtitle list to find the previous selected-for-edit subtitle
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

  //traverse down/forward in the subtitle list to find next selected-for-edit subtitle
  const handleSelectedRightClick = async () => {
    let i = currentSubtitle.data.subtitleNumber + 1;

    //loop down/forward in the subtitle list until the next selected-for-edit subtitle is found
    while(i < data[0].actions.length && data[0].actions[i].data.toEdit == false) {
      i++;
    }

    //verify subtitle exists, and that it has been selected to edit, then set it as current subtitle
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

  //display file data if filetype is JSON
  const getJSONMetadataButton = () => {
    if(fileType === "json") {
      return <FontAwesomeIcon onClick={() => openJsonMetadataModal()} className={"info-modal-button clickable-icon"} icon={faFileLines} />
    }
    return null;
  }

  const sleep = async (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const toggleDarkMode = () => {
    if(darkModeClassAppend === "-dark") {
      setDarkModeClassAppend("");
    } else {
      setDarkModeClassAppend("-dark");
    }
  }

  //when verifying time, need both start and end to make sure they do not overlap each other
  const verifyTimeInputs = (startTime, endTime) => {

    //it is possible that these values could be a string, so conversion to integer is necessary
    startTime = Number(startTime);
    endTime = Number(endTime);

    console.log("startTime: ", startTime, " | endTime: ", endTime);

    if(endTime < 0 || startTime < 0) {
      throw new Error("cannot have negative time!")
    }

    if(endTime < startTime) {
      throw new Error("start time cannot occur after end time!")
    }

    //check for a next subtitle and then check for overlap with it
    const nextSubtitle = data[0].actions[currentSubtitle.data.subtitleNumber + 1];
    if (nextSubtitle && endTime > nextSubtitle.start) {
      throw new Error("action will cause overlapping subtitles!");
    }

    if (endTime === startTime) {
      throw new Error("Subtitle has no duration!");
    }
  }

  //////////////////////////////////////////////////////////////////////////// React hooks utilization

  useEffect(() => {
    console.log("current dataset: ", data);
    setListDisabledClass("");
    setDisplayListLoader(false);
  }, [data]);

  useEffect(() => {
    //once metadata is extracted, set the filename (without file type ending)
    console.log("meta filename changed to: ", metaFilename);
    setFilename(metaFilename);
  }, [metaFilename])

  //display a prompt confirming reload
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
              darkMode={darkModeClassAppend}
              handleMeasure={measure}
              subtitleObject={data[0].actions[index]} 
              currentSubtitle={currentSubtitle}
              handleContentInputChange={onSubtitleContentChange}
              handleEndTimeChange={onEndTimeChange}
              handleStartTimeChange={onStartTimeChange}
              handleSetParentData={onSetParentData}
              handleDeleteSubtitle={deleteSubtitle}
              handleListClick={onSubtitleListClick}
              handleOpenModal={openAddSubtitleModal}
              handleAlignmentChange={onAlignmentChange}
              handleLinePositionChange={onLinePositionChange}
              handleMerge={mergeSubtitle}
              handleSplit={splitSubtitle}
              handleDisplayListLoader={onDisplayListLoader}
              forceUpdate={forceUpdate}
              handleTimeVerification={verifyTimeInputs}
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
        handleCloseModal={closeEditAllModal}
        handleEditAllAlignmentChange={onEditAllAlignmentChange}
        handleEditAllSelected={editAllSelected}
        handleEditAllLinePositionChange={onEditAllLinePositionChange}
        setParentData={onSetParentData}
      />
      <div style={{zIndex: "9999"}}>
        <AddSubtitleModal
          isOpen={addSubtitleModalIsOpen}
          subtitleObject={currentSubtitle}
          contentInput={addSubtitleContent}
          startTimeInput={addSubtitleStartTime}
          endTimeInput={addSubtitleEndTime} 
          data={data}
          handleCloseModal={closeAddSubtitleModal}
          handleInsert={insertSubtitle}
          handleContentInputChange={onAddSubtitleContentChange}
          handleEndTimeChange={onAddSubtitleEndTimeChange}
          handleStartTimeChange={onAddSubtitleStartTimeChange}
          handleDisplayListLoader={onDisplayListLoader}
        />
      </div>
      <div style={{zIndex: "9999"}}>
        <EditJsonModal
          isOpen={editJsonModalIsOpen}
          lastUpdatedBy={metaLastUpdatedBy}
          lastUpdatedByInput={lastUpdatedBy}
          note={metaNote}
          noteInput={note}
          handleCloseModal={closeEditJsonModal}
          handleLastUpdatedByChange={onLastUpdatedByChange}
          handleNoteChange={onNoteChange}
          handleConfirm={generateJSON}
        />
      </div>
      <div style={{zIndex: "9999"}}>
        <InfoModal
          isOpen={infoModalIsOpen}
          onCloseModal={closeInfoModal}
          info={usageInfoData}
          header={"Usage"}
        />
      </div>
      <div style={{zIndex: "9999"}}>
        <InfoModal
            isOpen={jsonMetadataModalIsOpen}
            onCloseModal={closeJsonMetadataModal}
            info={metaDataInfoData(metaVideoSrc, metaFilename, metaImportFileType, metaCreatedAt, metaUpdatedAt, metaLastUpdatedBy, metaNote)}
            header={"JSON Metadata"}
          />
      </div>
      <div className="main-row-1" style={{height:"70vh", display:"flex", flexDirection:"row", justifyContent:"space-evenly"}}>
        <div className={`scroll-container${darkModeClassAppend}`}>
        <div>
          <div className={`search-bar-container${darkModeClassAppend}`}>
            <SideListSearch searchBarWidth={200} handleResultClick={onResultClick} dataObjects={data ? data[0].actions : []} />
            <div className={"alert-info-container"}>
              <div className={"response-alert-container"} style={{opacity: displayResponseAlert}}>
                <ResponseAlert responseText={responseAlertText} severity={responseAlertSeverity} />
              </div>
              {getJSONMetadataButton()}
              <FontAwesomeIcon onClick={() => openInfoModal()} className={"info-modal-button clickable-icon"} icon={faCircleInfo} />
              <MaterialUISwitch sx={{ m: 1 }} defaultChecked onChange={() => toggleDarkMode()}/>
            </div>
          </div>
        </div>
          <div id={"subtitle-list-container-id"} className={`subtitle-list-container ` + listDisabledClass}>
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
        <div className={`video-container${darkModeClassAppend}`}>
          <div className={"toolbar-container"}>
            <TextSubmit handleInputChange={onVideoLinkChange} handleSubmit={onVideoLinkSubmit} submitButtonText={"Insert"} label={"Video Link"} displaySubmitButton={true} value={videoLink}/>
            <div className={"drag-drop-container"}>
              <DragDrop handleShowResponseAlert={showResponseAlert} handleVideoUpload={onSubtitleFileUpload} />
            </div>
          </div>        
          <div className={"video-player-container"}>
            <VideoJS options={videoJsOptions} onReady={handlePlayerReady} currentSubtitle={currentSubtitle} alignment={currentSubtitle.data.alignment} linePosition={getLinePositionValue(currentSubtitle)} />
          </div>
        </div>
      </div>
      <div className={`player-config-row${darkModeClassAppend} timeline-editor-engine main-row-2`}>
        <div className="player-config">
          <div className={"list-edit-config-container"}>
            {getSelectAllButton()}
            <Button size={"small"} className={"edit-all-button"} variant={"contained"} onClick={() => openEditAllModal()}>Edit Selected</Button>
            <div>
              <FontAwesomeIcon onClick={async () => await handleSelectedLeftClick()} className={"selected-left-click selected-traverse-button clickable-icon"} icon={faCircleArrowLeft} />
              <FontAwesomeIcon onClick={async () => await handleSelectedRightClick()} className={"selected-right-click selected-traverse-button clickable-icon"} icon={faCircleArrowRight} />
            </div>
          </div>
          <div className={"autoscroll-switch-container"}>
            <div>
              <TextSubmit handleInputChange={onFilenameInputChange} handleSubmit={() => {}} submitButtonText={""} label={"File Name"} displaySubmitButton={false} value={filename}/>
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
          //can pull out subtitleObject
          onActionMoveEnd={() => {
            verifySubtitles();
          }}
          //can pull out subtitleObject
          onActionResizeEnd={() => {
            verifySubtitles();
          }}
          getActionRender={(action, row) => {
            let subtitleObject = action as SubtitleObject;
            if (subtitleObject.effectId === 'effect0') {
              return <CustomRender0 onActionClick={onTimelineSubtitleClick} action={subtitleObject} currentSubtitle={currentSubtitle} row={row as CustomTimelineRow} />;
            } else if (action.effectId === 'effect1') {
              return <CustomRender1 onActionClick={onTimelineSubtitleClick} action={subtitleObject} currentSubtitle={currentSubtitle} row={row as CustomTimelineRow} />;
            }
          }}
          autoReRender={true}
        />
      </div>
    </div>
  );
};

export default App;
