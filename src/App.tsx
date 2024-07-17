import { Timeline, TimelineState, TimelineAction, TimelineEffect, TimelineRow} from '@xzdarcy/react-timeline-editor';
import {useState, useEffect} from 'react';


//custom components
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';

import {parseVTTFile} from './processComponents/Parser';

//styles
import './timelineStyles/index.less';
import './styles/List.css';
import './styles/Main.css';
import './styles/Main_dark.css';
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
interface CustomTimelineRow extends TimelineRow {
  actions: SubtitleObject[];
}

/////////////////////////////////////////////////////////////////////////////////////////// initialization

//all the data that exists in a SINGLE timeline row (moved outside component to prevent multiple calls)
const mockData: CustomTimelineRow[] = parseVTTFile("", {});

const App = () => {

  const [data, setData] = useState(mockData);
  //handling link inserts for the video
  const [videoLink, setVideoLink] = useState("");

  const [idMap, setIdMap] = useState({});


  //video link input field changes
  const onVideoLinkChange = (event) => {
    setVideoLink(event.target.value);
  }
  

  //video link input field changes
  const onVideoLinkSubmit = () => {
    setVideoLink(videoLink);
    console.log("(App.tsx) uploaded video link: ", videoLink);
  }

  const onCreationOfIdMap = (idMap) => {
    console.log("(App.tsx) created idMap: ", idMap);
    setIdMap(idMap);
  }

  const updateData = (uploadedData) => {
    console.log("(App.tsx) parsed data: ", uploadedData);
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
    <div>
      <Toolbar
        handleVideoLinkSubmit={onVideoLinkSubmit}
        handleIdMapCreation={onCreationOfIdMap}
        handleUpdateSharedData={updateData}
        handleVideoLinkChange={onVideoLinkChange}
        editedData={data}
        videoLink={videoLink}
      />
      <div>
        <Editor
        uploadedData={data}
        generatedIdMap={idMap} 
        uploadedVideoLink={videoLink}
        handleUpdateSharedData={updateData}/>
      </div>
    </div>
  );
};

export default App;
