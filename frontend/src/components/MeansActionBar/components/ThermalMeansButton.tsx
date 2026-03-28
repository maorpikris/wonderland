import { Sun, Moon } from 'lucide-react';
import { useVideoGridSelectionStore } from '@stores/useVideoGridSelection';
import MeansActionButton from './MeansActionButton';

type ThermalMeansButtonProps = {
  slotIndex: number;
};

const ThermalMeansButton = ({ slotIndex }: ThermalMeansButtonProps) => {
  const isThermal = useVideoGridSelectionStore(
    (s) => s.isThermalBySlot[slotIndex] || false,
  );
  const toggleThermal = useVideoGridSelectionStore((s) => s.toggleThermal);

  return (
    <MeansActionButton onClick={() => toggleThermal(slotIndex)}>
      {isThermal ? <Moon size={15} /> : <Sun size={15} />}
    </MeansActionButton>
  );
};

export default ThermalMeansButton;
