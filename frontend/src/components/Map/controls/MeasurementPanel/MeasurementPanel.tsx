import { Divider, Input } from '@mantine/core';
import { Undo2, X } from 'lucide-react';
import { useMeasurementStore } from '@src/stores/useMeasurementStore';
import { formatMeasurementPreview } from '@src/utils/measurement';
import { measurementPanelStyles as styles } from './MeasurementPanel.css';
import { MeasurementPanelButton } from './MeasurementPanelButton';
import { MeasurementMapLayer } from './MeasurementMapLayer';
import { colors } from '@theme/tokens.css';

export const MeasurementPanel: React.FC = () => {
  const isActive = useMeasurementStore((s) => s.isActive);
  const measurementValue = useMeasurementStore((s) => s.measurementMeters);
  const hasPoints = useMeasurementStore((s) => s.points.length > 0);
  const completedMeasurementsCount = useMeasurementStore(
    (s) => s.completedMeasurementsCount,
  );
  const undoLastPoint = useMeasurementStore((s) => s.undoLastPoint);
  const clearAllMeasurements = useMeasurementStore(
    (s) => s.clearAllMeasurements,
  );

  const disableWhileNotDrawing = !hasPoints;
  const disableClear = !hasPoints && completedMeasurementsCount === 0;

  if (!isActive) return null;

  return (
    <>
      <div className={styles.panel}>
        <Input
          classNames={{ input: styles.input, wrapper: styles.inputWrapper }}
          placeholder="לחיצה להתחלת מדידה"
          readOnly
          value={hasPoints ? formatMeasurementPreview(measurementValue) : ''}
        />
        <MeasurementPanelButton
          icon={Undo2}
          color={colors.neutral5}
          disabled={disableWhileNotDrawing}
          onClick={undoLastPoint}
        />
        <Divider orientation="vertical" className={styles.divider} />
        <MeasurementPanelButton
          icon={X}
          color={colors.red6}
          disabled={disableClear}
          onClick={clearAllMeasurements}
        />
      </div>
      {isActive && <MeasurementMapLayer />}
    </>
  );
};
