import { useFullscreen } from '@mantine/hooks';
import { useState, type ReactNode } from 'react';
import clsx from 'clsx';
import {
  videoTileVideo,
  videoTile,
  videoTileBar,
  videoTileBarAlways,
  videoTileBarBottom,
  videoTileBarHover,
  videoTileBarTop,
} from './VideoTile.css';
import WebRtcVideo from '../WebRtcVideo/WebRtcVideo';
import ReplayVideo from '../ReplayVideo/ReplayVideo';

type VideoTileProps = {
  streamUrl: string;
  cameraId: string;
  replayTime?: string | null;
  onReplayTimeChange?: (time: string) => void;
  topBarContent?: ReactNode;
  bottomBarContent?:
    | ReactNode
    | ((props: {
        toggleFullscreen: () => void;
        onPopOverToggle: (opened: boolean) => void;
      }) => ReactNode);
};

const VideoTile = ({
  streamUrl,
  cameraId,
  replayTime,
  onReplayTimeChange,
  topBarContent,
  bottomBarContent,
}: VideoTileProps) => {
  const { ref, toggle, fullscreen } = useFullscreen();
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);

  return (
    <div
      ref={ref}
      className={clsx(
        videoTile,
        isPopOverOpen && 'is-popover-open',
        fullscreen && 'is-fullscreen',
      )}
    >
      {replayTime ? (
        <ReplayVideo
          cameraId={cameraId}
          startTime={replayTime}
          className={videoTileVideo}
          onTimeUpdate={onReplayTimeChange}
        />
      ) : (
        <WebRtcVideo className={videoTileVideo} streamUrl={streamUrl} />
      )}

      {topBarContent ? (
        <div
          className={`${videoTileBar} ${videoTileBarTop} ${videoTileBarAlways}`}
        >
          {topBarContent}
        </div>
      ) : null}

      {bottomBarContent ? (
        <div
          className={`${videoTileBar} ${videoTileBarBottom} ${videoTileBarHover}`}
        >
          {typeof bottomBarContent === 'function'
            ? bottomBarContent({
                toggleFullscreen: toggle,
                onPopOverToggle: setIsPopOverOpen,
              })
            : bottomBarContent}
        </div>
      ) : null}
    </div>
  );
};

export default VideoTile;
