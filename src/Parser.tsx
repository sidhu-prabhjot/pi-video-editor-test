import {WebVTTParser} from 'webvtt-parser';
import {TimelineAction, TimelineRow} from '@xzdarcy/react-timeline-editor';

let idRef = 0;

//defines the properties of a subtitle object in the timeline
interface CustomTimelineAction extends TimelineAction {
    data: {
        src: string;
        name: string;
        subtitleNumber: number;
        metaData: string;
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

const file = `
WEBVTT
00:00:00.500 --> 00:00:02.000
The Web is always changing

00:00:02.500 --> 00:00:04.300
and the way we access it is changing
`;

export const parseVTTFile = () => {

    const tree = parser.parse(file, '');

    tree.cues.forEach((data) => {
        let newAction = {
            id: `action${idRef}`,
            start: data.startTime,
            end: data.endTime,
            effectId: 'effect1',
            data: {
                src: '/lottie/lottie1/data.json',
                name: `${data.text}`,
                subtitleNumber: idRef,
                metaData: "",
            },
        }
        idRef++;
        mockData[0].actions.push(newAction);
    });

    return mockData;

}