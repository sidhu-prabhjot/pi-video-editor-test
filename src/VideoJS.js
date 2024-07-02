import {useEffect, useRef} from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import './styles/Subtitle.css';
import './styles/Main.css';

export const VideoJS = ({options, onReady, currentSubtitle, alignment, linePosition}) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {

    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode. 
      const videoElement = document.createElement("video-js");

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current.appendChild(videoElement);

      const player = playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
        onReady && onReady(player);
      });

    // You could update an existing player in the `else` block here
    // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay);
      player.src(options.sources);
    }
  }, [videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div className={"video-js-container"} style={{margin: "4px"}}>
      <div className={"video-container"} style={{overflow:"hidden"}} ref={videoRef}>
      <div id={"subtitle"} className={"video-js-subtitle"} style={{justifyContent: `${alignment}`}}>
            <div style={{backgroundColor: "transparent", padding: "4px 16px 4px 16px"}}>
              {currentSubtitle.data.name !== "" ? <p style={{color:"#ffffff",margin:"0px", padding:"2px", backgroundColor: "#000000", top: `${linePosition}%`, position:"relative"}}>{currentSubtitle.data.name}</p> : <p></p>}
            </div>
      </div>
      </div>
    </div>
  );
}

export default VideoJS;