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
WEBVTT FILE

﻿1
00:00:00.000 --> 00:00:07.090
[ INTENSE MUSIC ]

2
00:00:07.090 --> 00:00:11.386
-We have lock, and are good to send that command.
We have thirty-one minutes and thirty-two

3
00:00:11.386 --> 00:00:15.432
seconds for our support.

4
00:00:15.432 --> 00:00:18.601
Go for status buffer dump.

5
00:00:18.601 --> 00:00:22.605
-What you're looking at with a telescope, of
course, is the light from billions of light-years

6
00:00:22.605 --> 00:00:27.152
away. So the further you look, the more
you're going back towards the Big Bang and

7
00:00:27.152 --> 00:00:30.905
understanding how the universe was formed.

8
00:00:30.905 --> 00:00:36.327
-The Webb telescope will be groundbreaking
because it has capabilities that are different

9
00:00:36.327 --> 00:00:39.080
than the Hubble Space Telescope.

10
00:00:39.080 --> 00:00:43.710
-We have equipment that is so much more powerful
than anything we've ever had before, that

11
00:00:43.710 --> 00:00:47.797
it's almost impossible to tell
what we will discover.

12
00:00:47.797 --> 00:00:52.969
Hubble Eye In The Sky

13
00:00:52.969 --> 00:00:59.100
Episode 3: Time Machines

14
00:00:59.100 --> 00:01:01.895
-Hubble's accomplishments include something

15
00:01:01.895 --> 00:01:03.938
called the deep fields.

16
00:01:03.938 --> 00:01:09.903
Looking out into space and collecting
light, sometimes for many days,

17
00:01:09.903 --> 00:01:12.489
these deep fields have revealed visually to us,

18
00:01:12.489 --> 00:01:18.661
a universe absolutely teaming with galaxies,
hundreds of billions of galaxies.

19
00:01:22.165 --> 00:01:24.626
-One of the neat things about the Ultra Deep Field,

20
00:01:24.626 --> 00:01:26.544
and one of the things that made it so unique,

21
00:01:26.544 --> 00:01:28.254
was how long it took us

22
00:01:28.254 --> 00:01:31.382
to take that image.
There's an exposure time that's expressed,

23
00:01:31.382 --> 00:01:36.346
I think it's 11.2 days. It’s a very, very
long exposure time, but probably what's more

24
00:01:36.346 --> 00:01:42.936
important is how many orbits it took us to
do that. 400 orbits of Hubble data to take

25
00:01:42.936 --> 00:01:47.232
that image. You only get
15 orbits a day. To take 400

26
00:01:47.232 --> 00:01:53.363
orbits and say we're going to observe this
one spot in the sky for 400 orbits, and the

27
00:01:53.363 --> 00:01:58.952
really unique thing about that was they picked
a spot where there wasn't anything. They looked

28
00:01:58.952 --> 00:02:03.873
and they said there's absolutely nothing here.
And they said, you want to spend 400 Hubble

29
00:02:03.873 --> 00:02:08.711
orbits looking at nothing? And they said yes,
because we want to see what it can see. And

30
00:02:08.711 --> 00:02:18.721
I think the results from the science, I mean
it was amazing. What they saw was spectacular.

31
00:02:18.721 --> 00:02:21.516
-Hubble had spent two weeks taking pictures of empty places

32
00:02:21.516 --> 00:02:23.893
in the sky. And they saw they weren't empty at all

33
00:02:23.893 --> 00:02:26.271
there were thousands and thousands of galaxies.

34
00:02:28.606 --> 00:02:31.818
-We were amazed how many galaxies we found,

35
00:02:31.818 --> 00:02:33.653
and we continued to go back to that

36
00:02:33.653 --> 00:02:40.410
portion of the sky to increase that visibility.

37
00:02:40.410 --> 00:02:47.292
-The Hubble Space Telescope is an outstanding
time machine.

38
00:02:47.292 --> 00:02:51.713
It's incredibly important for our studies
with the Hubble Space Telescope to realize

39
00:02:51.713 --> 00:02:58.261
that when we're looking at a galaxy, we're
seeing it as it was millions of years ago,

40
00:02:58.261 --> 00:03:03.266
sometimes billions of years ago. It's taken that
long for the light to get to us.

41
00:03:03.266 --> 00:03:05.268
-What you're looking at with a telescope, of course,

42
00:03:05.268 --> 00:03:08.229
is the light from billions of light-years away.

43
00:03:08.229 --> 00:03:10.815
So the further you look, the more you're going back towards

44
00:03:10.815 --> 00:03:16.196
the Big Bang and understanding how the universe was formed.

45
00:03:16.196 --> 00:03:21.659
-What Hubble has revealed is that the universe
has in fact changed over these billions of

46
00:03:21.659 --> 00:03:28.791
years of time. The early galaxies, the very
distant ones as we see them, are simple. Sometimes

47
00:03:28.791 --> 00:03:33.504
they're messy looking, they're small. They
haven't had time yet to form that grand

48
00:03:33.504 --> 00:03:38.218
spiral structure.
Over time, we see galaxies actually merging

49
00:03:38.218 --> 00:03:43.181
with other galaxies and growing bigger and
bigger, and those mergers can look like train

50
00:03:43.181 --> 00:03:44.807
wrecks in our Hubble images.

51
00:03:51.731 --> 00:03:55.485
-These very, very deep exposures that Hubble
has been able to take, we have seen right to

52
00:03:55.485 --> 00:04:01.199
the edge of the universe, thirteen and a half billion years.

53
00:04:01.199 --> 00:04:04.702
When Hubble was first designed and envisioned,
it was never thought it could actually see

54
00:04:04.702 --> 00:04:09.415
that far out. But because of the advances
in the instruments that we've been able to

55
00:04:09.415 --> 00:04:13.711
put up on the telescope, and also the cleverness
of the scientists, they've come up with very

56
00:04:13.711 --> 00:04:18.007
interesting observing scenarios, doing these
really deep exposures, where we just sit there

57
00:04:18.007 --> 00:04:22.929
for orbit after orbit, after orbit gathering
the photons, we’ve been able to push Hubble

58
00:04:22.929 --> 00:04:26.933
out very, very far.

59
00:04:26.933 --> 00:04:33.606
-As Hubble looks out into these fields of galaxies,
we sometimes see clusters of galaxies. These

60
00:04:33.606 --> 00:04:38.945
are galaxies that are held nearby each other
by their mutual gravity.

61
00:04:38.945 --> 00:04:46.869
These clusters are massive conglomerations.
There's so much mass that they have an actual

62
00:04:46.869 --> 00:04:54.919
observable impact on space-time itself.
Einstein predicted that mass distorts space,

63
00:04:54.919 --> 00:04:59.215
but we didn't realize we could actually see
the effects of that. But with Hubble, we have

64
00:04:59.215 --> 00:05:05.513
been able to see distortions in space around
clusters of galaxies. The way we see that

65
00:05:05.513 --> 00:05:11.769
is when light from a background galaxy travels
through that cluster of galaxies, or around

66
00:05:11.769 --> 00:05:17.400
it, due to this gravitational lensing effect.
The lensing also magnifies that background

67
00:05:17.400 --> 00:05:22.947
galaxy, so if we look in some of these distorted
arcs, we can see more detail than we would

68
00:05:22.947 --> 00:05:28.453
ever have been able to see without gravitational
lensing, nature’s boost.

69
00:05:32.290 --> 00:05:36.377
-There are observations where we're explicitly
looking for the lensing and

70
00:05:36.377 --> 00:05:39.547
we're getting science out of that just otherwise

71
00:05:39.547 --> 00:05:43.718
would just not be doable. Hubble has really taken that

72
00:05:43.718 --> 00:05:47.096
to a next level. It's doing large amounts

73
00:05:47.096 --> 00:05:50.433
of astrophysics that it's just never been able to do before.

74
00:05:55.313 --> 00:06:01.069
-Some of what we're doing with Hubble is to
prepare for the new James Webb telescope,

75
00:06:01.069 --> 00:06:07.075
which we anticipate launching in 2021, which
will be able to see farther into the infrared

76
00:06:07.075 --> 00:06:14.207
part of the electromagnetic spectrum. That
enables us to see some galaxies that are difficult

77
00:06:14.207 --> 00:06:20.797
for Hubble to see because they're so far away
that their light is traveling through us through

78
00:06:20.797 --> 00:06:26.803
expanding space and gets stretched out into
redder wavelengths, often far into the infrared

79
00:06:26.803 --> 00:06:32.308
part of the spectrum. Even sometimes beyond
what Hubble is able to detect well. The Webb

80
00:06:32.308 --> 00:06:38.064
telescope will give us more information about
some of those very distant galaxies.

81
00:06:38.064 --> 00:06:43.444
-The James Webb Space Telescope is the follow-on
telescope after the great Hubble telescope.

82
00:06:43.444 --> 00:06:47.532
It extends the discoveries of Hubble into
the infrared spectrum region.

83
00:06:49.450 --> 00:06:53.371
We think that the first objects that grew
out of the Big Bang material probably happened

84
00:06:53.371 --> 00:06:58.960
in about a hundred million years after the
start. And we think the Webb telescope can

85
00:06:58.960 --> 00:07:04.173
pick them up. They're rare, they're hard to
find, but they should be there.

86
00:07:04.173 --> 00:07:08.678
The farthest we've been able to see with
the Hubble telescope goes back about 600 - 800

87
00:07:08.678 --> 00:07:13.891
million years after the expansion began, so
we think we get much, much closer to the

88
00:07:13.891 --> 00:07:18.187
first objects with the Webb telescope.

89
00:07:18.187 --> 00:07:20.982
-Hubble gives information that the Webb telescope
cannot give about

90
00:07:20.982 --> 00:07:24.861
visible and ultraviolet emission from things in the universe,

91
00:07:24.861 --> 00:07:26.821
and when we have all of that information coming in

92
00:07:26.821 --> 00:07:32.577
at the same time, it's like a banquet
of scientific return.

93
00:07:32.577 --> 00:07:37.165
-Now when we get the complete picture of every
wavelength you can possibly see from ultraviolet

94
00:07:37.165 --> 00:07:40.168
to infrared, we hope to have
the story of the growth

95
00:07:40.168 --> 00:07:42.795
of the first galaxies from the primordial material.

96
00:07:42.795 --> 00:07:46.632
So that will be a huge accomplishment
that depends on both pieces

97
00:07:46.632 --> 00:07:51.971
of equipment, the Hubble telescope and the
James Webb telescope working together.

98
00:07:51.971 --> 00:07:56.058
-So, astronomers are very excited about this
probability that we'll have both the Hubble

99
00:07:56.058 --> 00:08:01.022
Space Telescope and the Webb telescope operating
at the same time for quite a few years. That

100
00:08:01.022 --> 00:08:04.901
will give us an abundance of new understanding
about the universe.

101
00:08:04.901 --> 00:08:11.449
And already right now with Hubble, we're doing
preparatory observations for the Webb telescope.

102
00:08:11.449 --> 00:08:16.329
We're using Hubble to do things, for example,
like surveying distant galaxies to find out

103
00:08:16.329 --> 00:08:20.958
which ones would be prime targets for the
Webb telescope.

104
00:08:20.958 --> 00:08:27.590
In fact, scientists around the world are proposing
observations with Hubble right now specifically

105
00:08:27.590 --> 00:08:32.553
to help us learn information that will be
useful for making the best use of the Webb

106
00:08:32.553 --> 00:08:39.435
telescope as soon as it's launched and gets
going in its science observations.

107
00:08:39.435 --> 00:08:43.231
-I think the Hubble telescope has been the
most productive science instrument ever built.

108
00:08:43.272 --> 00:08:47.193
In astronomy, there's what we knew before
Hubble, and now, there's what we know after

109
00:08:47.193 --> 00:08:48.486
Hubble. They're so different.

110
00:08:48.486 --> 00:08:52.698
Of course, Hubble has now had a life of 30
years, so it's had a long time to make this

111
00:08:52.698 --> 00:08:57.912
revolution happen. So it's not all at once.
It's a gradual revolution, but it's still

112
00:08:57.912 --> 00:09:00.915
a huge revolution.

113
00:09:00.915 --> 00:09:05.461
Knowledge has changed dramatically over the
30 years of life of the Hubble telescope.

114
00:09:05.461 --> 00:09:09.549
so you couldn't even have imagined when the
Hubble was launched that we would have the

115
00:09:09.549 --> 00:09:13.135
wonderful cameras and spectrometers that we
fly today.

116
00:09:13.135 --> 00:09:17.306
We figured out how to send astronauts, we
trained the astronauts, we figured out what

117
00:09:17.306 --> 00:09:20.893
instruments could be put in. We figured out
how to repair everything that went wrong on

118
00:09:20.893 --> 00:09:25.189
the Hubble, and it's still alive today, 30
years after launch.

119
00:09:25.189 --> 00:09:30.027
I am so thrilled to say that our people were
able to do that.

120
00:09:30.027 --> 00:09:34.115
That's the operations team that makes this
possible. It's a miracle as far as I'm concerned,

121
00:09:34.115 --> 00:09:36.784
because it didn't have to be that way, but
they made it happen.

122
00:09:36.784 --> 00:09:44.208
Hubble Eye In The Sky


123
00:09:44.208 --> 00:09:51.173
[ INTENSE MUSIC ]
`;

export const parseVTTFile = () => {

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
                subtitleNumber: Number(data.id),
                metaData: "",
            },
        }
        idRef++;
        mockData[0].actions.push(newAction);
    });

    return mockData;

}

export const generateVtt = (mockData:CusTomTimelineRow[]) => {

    const vtt = new Vtt();
    const actions = mockData[0].actions;

    actions.forEach(subtitle => {
        vtt.add(subtitle.start, subtitle.end, subtitle.data.name);
    });

    console.log("generated vtt string:\n", vtt.toString());

}