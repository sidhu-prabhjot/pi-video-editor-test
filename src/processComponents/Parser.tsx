import {WebVTTParser} from 'webvtt-parser';
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
    };
}

//the data structure for an entire row in the timeline
interface CusTomTimelineRow extends TimelineRow {
    actions: CustomTimelineAction[];
}

//all the data that exists in a SINGLE timeline row
const mockData: CusTomTimelineRow[] = [
    {
        id: '0',
        actions: [],
    },
];  

const parser = new WebVTTParser();

export const parseVTTFile = (fileData, idMap) => {
    mockData[0].actions = [];

    let subtitleNumber = 0;

    let file = `${fileData}`;

    const tree = parser.parse(file, '');

    console.log("parsed data: ", tree.cues);

    tree.cues.forEach((data) => {
        if(data.alignment === "end") {
            data.alignment = "right";
        } else if (data.alignment === "start") {
            data.alignment = "left";
        } else if (data.alignment === "middle") {
            data.alignment = "center";
        }

        let newAction = {
            id: `action${idRef}`,
            start: data.startTime,
            end: data.endTime,
            effectId: 'effect1',
            data: {
                src: '/audio/audio.mp3',
                name: `${data.text}`,
                subtitleNumber: subtitleNumber,
                alignment: data.alignment,
                direction: data.direction,
                lineAlign: data.lineAlign,
                linePosition: data.linePosition,
                size: data.size,
                textPosition: data.textPosition,
                toEdit: false,
                backgroundColor: "#E5E5E5",
            },
        }
        idMap[subtitleNumber] = "";
        subtitleNumber++;
        idRef++;
        mockData[0].actions.push(newAction);
    });

    return mockData;

}

export const generateVtt = (mockData:CusTomTimelineRow[]) => {
    const vtt = new Vtt();
    const actions = mockData[0].actions;

    actions.forEach(subtitle => {
        console.log("line position: ", subtitle.data.linePosition);
        vtt.add(subtitle.start, subtitle.end, subtitle.data.name, `align:${subtitle.data.alignment} line:${subtitle.data.linePosition === "auto" ? "auto" : `${subtitle.data.linePosition}%`}`);
    });

    console.log("generated vtt string:\n", vtt.toString());

    return vtt.toString();

}

function formatTime(seconds) {
    // Get the hours, minutes, and seconds
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);
    let ms = Math.round((seconds % 1) * 1000); // Convert the fractional part to milliseconds

    // Pad the values with leading zeros if necessary
    let hrsStr = String(hrs).padStart(2, '0');
    let minsStr = String(mins).padStart(2, '0');
    let secsStr = String(secs).padStart(2, '0');
    let msStr = String(ms).padStart(3, '0');

    // Return the formatted string
    return `${hrsStr}:${minsStr}:${secsStr},${msStr}`;
}


export const generateSrt = (mockData:CusTomTimelineRow[]) => {
    let formattedSubtitles = [];

    mockData[0].actions.forEach((action) => {

        let formattedAction = {
            start: formatTime(action.start),
            end: formatTime(action.end),
            content: action.data.name,
        }

        formattedSubtitles.push(formattedAction);

    });

    const subtitleText = generateSRT(formattedSubtitles, 'timestamp');

    return subtitleText;
}