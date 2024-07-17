import { TimelineAction, TimelineRow} from '@xzdarcy/react-timeline-editor';
import {useState, useEffect} from 'react';


//material UI Components
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';

//fontawesome
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines} from '@fortawesome/free-solid-svg-icons';

//custom components
import DragDrop from '../components/DragDrop';
import TextSubmit from '../components/TextSubmit';
import EditJsonModal from '../components/EditJsonModal';
import InfoModal from '../components/InfoModal';
import ResponseAlert from '../components/ResponseAlert';

//data/functions to fetch data for the info modals
import {metaDataInfoData} from '../DataExports/InfoModalData'

import {parseVTTFile, parseSRTFile, parseJSONFile, generateVtt, generateSrt} from '../processComponents/Parser';

//styles
import '../timelineStyles/index.less';
import '../styles/List.css';
import '../styles/Main.css';
import '../styles/Main_dark.css';
import '../styles/Subtitle.css';


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

const Toolbar = ({
    handleVideoLinkSubmit,
    handleIdMapCreation,
    handleUpdateSharedData,
    handleVideoLinkChange,
    editedData,
    videoLink,
}) => {

  //REFS:
  
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

  const [editJsonModalIsOpen, setEditJsonModalIsOpen] = useState(false); 
  const [jsonMetadataModalIsOpen, setJsonMetadataModalIsOpen] = useState(false);



  ////////////////////////////////////////////////////////////////////// exporting subtitles

  //call verifier and then generate vtt to export
  const generateVTT = () => {
    let generatedString = generateVtt(editedData);
    downloadVTTFile(generatedString);
  }

  const generateSRT = () => {
    let generatedString = generateSrt(editedData);
    downloadSRTFile(generatedString);
  }

  const generateJSON = (lastUpdatedByInput) => {

    if(lastUpdatedByInput == null) {
      throw new Error("'last upated by' field is required!")
    }

    console.log("before generated: lastUpdateBy = ", lastUpdatedBy, " | note = ", note);
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
    exportObject.data = editedData;
    downloadJSONFile(JSON.stringify(exportObject));
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

          noFileTypeFilename = fileObject.name.replace('.json', '');
          setFilename(noFileTypeFilename);

        }

        if (result === undefined) {
          throw new Error("Parsing result is undefined.");
        }

        handleIdMapCreation({ ...tempIdMap });
        console.log("Parsing result:", result);
        handleUpdateSharedData([...result]);

      } catch (error) {
        console.error("Error while handling file content:", error.message);
      }
    };

    // Read the file as text
    reader.readAsText(fileObject, 'UTF-8');
  };

  const openJsonMetadataModal = () => {
    setJsonMetadataModalIsOpen(true);
  }

  const closeJsonMetadataModal = () => {
    setJsonMetadataModalIsOpen(false);
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

  ////////////////////////////////////////////////////////////////////handle screen clicks and actions

  const onFilenameInputChange = (event) => {
    setFilename(event.target.value);
  }

  //////////////////////////////////////////////////////// component prop functions

  //handling input change on json metadata export update
  const onLastUpdatedByChange = (event) => {
    console.log("last update by set");
    setLastUpdatedBy(event.target.value);
  }

  const onNoteChange = (event) => {
    console.log("note set");
    setNote(event.target.value);
  }


  ///////////////////////////////////////////////////////////////// modal functions


  const openEditJsonModal = () => {
    setEditJsonModalIsOpen(true);
  }

  const closeEditJsonModal = () => {
    setEditJsonModalIsOpen(false);
  }

  //////////////////////////////////////////////////////////////////////////// React hooks utilization

  useEffect(() => {
    //once metadata is extracted, set the filename (without file type ending)
    console.log("meta filename changed to: ", metaFilename);
    setFilename(metaFilename);
  }, [metaFilename])


  return (
      <div className={"toolbar-container"}>
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
                isOpen={jsonMetadataModalIsOpen}
                onCloseModal={closeJsonMetadataModal}
                info={metaDataInfoData(metaVideoSrc, metaFilename, metaImportFileType, metaCreatedAt, metaUpdatedAt, metaLastUpdatedBy, metaNote)}
                header={"JSON Metadata"}
            />
        </div>
        <div className={"file-handling-container"}>
          <div className={"drag-drop-container"}>
            <DragDrop handleShowResponseAlert={() => {}} handleVideoUpload={onSubtitleFileUpload} />
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
            {getJSONMetadataButton()}
          </div>
        </div>
        <TextSubmit handleInputChange={(event) => handleVideoLinkChange(event)} handleSubmit={handleVideoLinkSubmit} submitButtonText={"Insert"} label={"Video Link"} displaySubmitButton={true} value={videoLink}/>
      </div>
  );
};

export default Toolbar;