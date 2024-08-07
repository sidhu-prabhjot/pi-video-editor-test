import {TimelineAction, TimelineRow} from '@xzdarcy/react-timeline-editor';
import {useState, useEffect} from 'react';


//custom components
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';

import {parseVTTFile} from './processComponents/Parser';

//styles
import './timelineStyles/index.less';
import './styles/List.css';
import './styles/Main.css';
import './styles/Subtitle.css';


///////////////////////////////////////////////////////////////////////////// data control

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
interface SubtitleData extends TimelineRow {
  actions: SubtitleObject[];
}

/////////////////////////////////////////////////////////////////////////////////////////// initialization

//temporary data
const mockData: SubtitleData[] = parseVTTFile("", {});

const App = () => {

  /*data that is shared between components including the main editor component. Critical
  to the functionality of the editor*/
  const [data, setData] = useState(mockData);
  const [videoLink, setVideoLink] = useState("");
  const [idMap, setIdMap] = useState({});

  //video link input field changes
  const onVideoLinkChange = (event: any) => {
    setVideoLink(event.target.value);
  }
  
  //video link input is submitted
  const onVideoLinkSubmit = () => {
    setVideoLink(videoLink);
  }

  //idMap is generated **IdMap should be generated here
  const onCreationOfIdMap = (idMap: object) => {
    setIdMap(idMap);
  }

  //update the shared data
  const onUpdateData = (uploadedData: SubtitleData[]) => {
    setData([...uploadedData]);
  }

  //display a prompt confirming reload
  useEffect(() => {
      // Prompt confirmation when reload page is triggered
      window.onbeforeunload = () => { return "" };
          
      // Unmount the window.onbeforeunload event
      return () => { window.onbeforeunload = null };
  }, []);


  return (
    <div style={{height: "100vh"}}>
      <div style={{width: "100%"}}>
        <Toolbar
        handleVideoLinkSubmit={onVideoLinkSubmit}
        handleUpdateIdMap={onCreationOfIdMap}
        handleUpdateSharedData={onUpdateData}
        handleVideoLinkChange={onVideoLinkChange}
        editedData={data}
        videoLink={videoLink}
        />
      </div>
      <div style={{height: "100%"}}>
        <Editor
        sharedData={data}
        sharedIdMap={idMap} 
        uploadedVideoLink={videoLink}
        handleUpdateSharedData={onUpdateData}
        toolbarMode={true}
        />
      </div>
    </div>
  );
};

export default App;
