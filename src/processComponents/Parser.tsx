import {WebVTTParser} from 'webvtt-parser';
import {TimelineAction, TimelineRow} from '@xzdarcy/react-timeline-editor';
import Vtt from 'vtt-creator';

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
            },
        }
        subtitleNumber++;
        idMap[idRef] = "";
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