import {WebVTTParser} from 'webvtt-parser';
import SrtParser from '@qgustavor/srt-parser'
import {TimelineAction, TimelineRow} from '@xzdarcy/react-timeline-editor';
import Vtt from 'vtt-creator';
import { generateSRT } from 'subtitle-generator';

let idRef = 0;

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
        backgroundColor: string;
        advancedEdit: boolean,
    };
}

//the data structure for an entire row in the timeline
interface SubtitleObjects extends TimelineRow {
    actions: CustomTimelineAction[];
}

//a collection of subtitle objects parsed from subtitle file (vtt, srt, or json)
const parsedData: SubtitleObjects[] = [
    {
        id: '0',
        actions: [],
    },
];  

export const parseVTTFile = (fileData, idMap) => {

    //instatiate vtt file parser using webvtt-parser module
    const vttParser = new WebVTTParser();
    
    parsedData[0].actions = [];
    let subtitleNumber = 0;
    idRef = 0;

    let file = `${fileData}`;

    //parse vtt file using the webvtt-parser module
    const tree = vttParser.parse(file, '');
    if(tree.cues.length === 0 && fileData) {
        throw new Error("unable to parse vtt file");
    }

    //for each subtitle entry parsed from the vtt file, create a subtitle object and push to subtitle data set
    tree.cues.forEach((subtitleEntry) => {

        //setting horizontal alignment
        if(subtitleEntry.alignment === "end") {
            subtitleEntry.alignment = "right";
        } else if (subtitleEntry.alignment === "start") {
            subtitleEntry.alignment = "left";
        } else if (subtitleEntry.alignment === "middle") {
            subtitleEntry.alignment = "center";
        }

        //default line position
        if(subtitleEntry.linePosition === "auto") {
            subtitleEntry.linePosition = 85;
        }

        //check for negative numbers in linePosition (negative means percentage from bottom)
        if(subtitleEntry.linePosition < 0) {
            //convert to positive line position
            let tempLine = 100 - (subtitleEntry.linePosition * -1);
            subtitleEntry.linePosition = tempLine;
        }

        if(subtitleEntry.startTime === undefined || subtitleEntry.endTime === undefined) {
            throw new Error("invalid duration");
        }

        let newSubtitleObject = {
            id: `action${idRef}`,
            start: subtitleEntry.startTime,
            end: subtitleEntry.endTime,
            effectId: 'effect1',
            
            data: {
                src: '/audio/audio.mp3',
                name: `${subtitleEntry.text}`,
                subtitleNumber: subtitleNumber,
                alignment: subtitleEntry.alignment,
                direction: subtitleEntry.direction,
                lineAlign: subtitleEntry.lineAlign,
                linePosition: subtitleEntry.linePosition,
                size: subtitleEntry.size,
                textPosition: subtitleEntry.textPosition,
                toEdit: false,
                backgroundColor: "#E5E5E5",
                advancedEdit: false,
            },
        }
        //record subtitle object id
        idMap[subtitleNumber] = "";
        subtitleNumber++;
        idRef++;
        parsedData[0].actions.push(newSubtitleObject);
    });

    return parsedData;

}

export const parseSRTFile = (fileData, idMap) => {

    //instantiating the srt-parser module
    const srtParser = new SrtParser()

    parsedData[0].actions = [];
    let subtitleNumber = 0;
    idRef = 0;

    //convert srt file into array of data objects representing each subtitle entry
    const parsed = srtParser.fromSrt(fileData);

    if(parsed.length === 0 && fileData) {
        throw new Error("unable to parse srt file");
    }

    //loop through each subtitle entry from the srt file and create a subtitle object for the subtitle data set
    parsed.forEach((subtitleEntry) => {

        if(subtitleEntry.startTime === undefined || subtitleEntry.endTime === undefined) {
            throw new Error("invalid duration");
        }

        //convert start and end time to seconds in decimal form
        let newStartTime = String(subtitleEntry.startTime).replace(/,/g, ".");
        let startTimeArray = newStartTime.split(':'); // split it at the colons
        let startTime = (+startTimeArray[0]) * 60 * 60 + (+startTimeArray[1]) * 60 + (+startTimeArray[2]); 

        let newEndTime = String(subtitleEntry.endTime).replace(/,/g, ".");
        let endTimeArray = newEndTime.split(':');
        let endTime = (+endTimeArray[0]) * 60 * 60 + (+endTimeArray[1]) * 60 + (+endTimeArray[2]); 

        let newSubtitleObject = {
            id: `action${idRef}`,
            start: startTime,
            end: endTime,
            effectId: 'effect1',
            data: {
                src: '/audio/audio.mp3',
                name: `${subtitleEntry.text}`,
                subtitleNumber: subtitleNumber,
                alignment: "center",
                direction: "",
                lineAlign: "",
                linePosition: "85",
                size: 100,
                textPosition: "",
                toEdit: false,
                backgroundColor: "#E5E5E5",
                advancedEdit: false,
            },
        }

        //record subtitle id
        idMap[subtitleNumber] = "";
        subtitleNumber++;
        idRef++;
        parsedData[0].actions.push(newSubtitleObject);
    });

    return parsedData;

}

export const parseJSONFile = (fileData) => {

    let parsedData = JSON.parse(fileData);

    if(parsedData.data[0].actions.length === 0 && fileData) {
        throw new Error("unable to parse json file");
    }

    //check each subtitle object parsed from json file for invalid values
    parsedData.data[0].actions.forEach(action => {
        if(action.start === undefined || action.end === undefined) {
            throw new Error("invalid duration");
        }
    })
        
    return parsedData;
}

//convert subtitle data set to vtt file format
export const generateVtt = (data:SubtitleObjects[]) => {
    const vtt = new Vtt();
    const actions = data[0].actions;

    //use the vtt-converter module to convert each subtitle in data set to vtt entry
    actions.forEach(subtitle => {
        console.log("line position: ", subtitle.data.linePosition);
        vtt.add(subtitle.start, subtitle.end, subtitle.data.name, `align:${subtitle.data.alignment} line:${subtitle.data.linePosition === "auto" ? "auto" : `${subtitle.data.linePosition}%`}`);
    });

    //convrt all created vtt entries to combined string
    return vtt.toString();

}

//convert the subtitle data set to SRT file format
export const generateSrt = (data:SubtitleObjects[]) => {
    let formattedSubtitleData = [];

    //loop through each to retreive start time, end time, content
    data[0].actions.forEach((subtitleObject) => {

        let formattedSubtitle = {
            start: formatTime(subtitleObject.start, ","),
            end: formatTime(subtitleObject.end, ","),
            content: subtitleObject.data.name,
        }

        formattedSubtitleData.push(formattedSubtitle);

    });

    //this generateSRT function is from the subtitle-generator module, and NOT the exported function
    const subtitleText = generateSRT(formattedSubtitleData, 'timestamp');

    return subtitleText;
}

//convert the subtitle data set to JSON file format
export const generateJson = (
    data:SubtitleObjects[],
    videoLink,
    filename,
    fileType,
    metaCreatedAt,
    lastUpdatedBy,
    metaLastUpdatedBy,
    note,
    metaNote,
) => {
  
      //create a new updatedAtDate for the metadata
      let newUpdatedAtDate = new Date();

      let exportObject = {
          metaData: {},
          data: [],
      };
      let metaDataObject = {
          videoSrc: videoLink,
          filename: filename,
          importFileType: fileType,
          createdAt: metaCreatedAt ? metaCreatedAt : new Date(),
          updatedAt: newUpdatedAtDate,
          lastUpdatedBy: lastUpdatedBy ? lastUpdatedBy : metaLastUpdatedBy,
          note: note ? note : metaNote,
      };

      //combine data and metadata object into one and return
      exportObject.metaData = metaDataObject;
      exportObject.data = data;

      return exportObject;
}

//to convert time values to SRT (, separated) or VTT (. formatted) format
function formatTime(seconds, separator) {
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);

    // Convert the fractional part to milliseconds
    let ms = Math.round((seconds % 1) * 1000);

    // Pad the values with leading zeros if necessary
    let hrsStr = String(hrs).padStart(2, '0');
    let minsStr = String(mins).padStart(2, '0');
    let secsStr = String(secs).padStart(2, '0');
    let msStr = String(ms).padStart(3, '0');


    return `${hrsStr}:${minsStr}:${secsStr}${separator}${msStr}`;
}