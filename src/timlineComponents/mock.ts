import { TimelineAction, TimelineEffect, TimelineRow } from '@xzdarcy/react-timeline-editor';
import audioControl from './audioControl';
import lottieControl from './lottieControl';

export const scaleWidth = 160;
export const scale = 5;
export const startLeft = 20;

export interface CustomTimelineAction extends TimelineAction {
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

export interface CusTomTimelineRow extends TimelineRow {
  actions: CustomTimelineAction[];
}

export const mockEffect: Record<string, TimelineEffect> = {
  effect1: {
    id: 'effect1',
    name: 'effect1',
    source: {
    },
  },
};

export const mockData: CusTomTimelineRow[] = [
  {
    id: '0',
    actions: [
      {
        id: 'action3',
        start: 0,
        end: 20,
        effectId: 'effect0',
        data: {
          src: '/lottie/lottie1/data.json',
          name: 'Hello',
          subtitleNumber: 1,
          alignment: "",
          direction: "",
          lineAlign: "",
          linePosition: "",
          size: 100,
          textPosition: "",
          toEdit: false,
          backgroundColor: "#E5E5E5",
        },
      },
      {
        id: 'action4',
        start: 22,
        end: 24,
        effectId: 'effect1',
        data: {
          src: '/lottie/lottie1/data.json',
          name: 'World',
          subtitleNumber: 2,
          alignment: "",
          direction: "",
          lineAlign: "",
          linePosition: "",
          size: 100,
          textPosition: "",
          toEdit: false,
          backgroundColor: "#E5E5E5",
        },
      },
    ],
  },
];