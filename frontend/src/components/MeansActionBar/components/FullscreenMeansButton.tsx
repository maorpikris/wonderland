import { Fullscreen } from 'lucide-react';
import MeansActionButton from './MeansActionButton';

type FullscreenMeansButtonProps = {
  toggleFullscreen: () => void;
};

const FullscreenMeansButton = ({
  toggleFullscreen,
}: FullscreenMeansButtonProps) => {
  return (
    <MeansActionButton onClick={toggleFullscreen}>
      <Fullscreen size={15} />
    </MeansActionButton>
  );
};

export default FullscreenMeansButton;
