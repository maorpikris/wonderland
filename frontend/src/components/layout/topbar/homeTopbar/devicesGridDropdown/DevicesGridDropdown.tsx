import { useState } from 'react';
import { Popover, Radio, Tooltip, UnstyledButton } from '@mantine/core';
import { ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import * as styles from './DevicesGridDropdown.css';
import {
  useMainPageLayoutStore,
  type DevicesAmount,
} from '../../../../../stores/useMainPageLayout';

type GridOptionProps = {
  label: string;
  value: DevicesAmount;
  checked: boolean;
  onChange: (value: DevicesAmount) => void;
};

export function GridOption({
  label,
  value,
  checked,
  onChange,
}: GridOptionProps) {
  return (
    <div className={styles.optionRoot}>
      <Radio
        value={String(value)}
        checked={checked}
        onChange={() => onChange(value)}
        classNames={{
          root: styles.radioRoot,
          radio: styles.radio,
          icon: styles.radioIcon,
        }}
      />
      <span className={styles.optionLabel}>{label}</span>
    </div>
  );
}

const items: { value: DevicesAmount; label: string }[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
];

type DevicesGridDropdownProps = {
  disabled?: boolean;
};

export const DevicesGridDropdown = ({ disabled }: DevicesGridDropdownProps) => {
  const [opened, setOpened] = useState(false);

  const devicesAmount = useMainPageLayoutStore((s) => s.devicesAmount);
  const setDevicesAmount = useMainPageLayoutStore((s) => s.setDevicesAmount);

  const handleSelect = (nextValue: DevicesAmount) => {
    setDevicesAmount(nextValue);
    setOpened(false);
  };

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      withinPortal={false}
      position="bottom-start"
      offset={{ mainAxis: -2, crossAxis: -10 }}
      withArrow={false}
      shadow="none"
      styles={{
        dropdown: {
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
        },
      }}
    >
      <Popover.Target>
        <Tooltip
          label="לא זמין במצב צפייה במפה בלבד"
          disabled={!disabled}
          withArrow
          multiline
          classNames={{
            tooltip: styles.tooltip,
          }}
          styles={{ tooltip: { fontSize: '12px' } }}
        >
          <span>
            <UnstyledButton
              type="button"
              className={styles.trigger}
              disabled={disabled}
              onClick={() => {
                if (disabled) return;
                setOpened((prev) => !prev);
              }}
            >
              <ChevronDown
                size={16}
                className={clsx(styles.chevron, opened && styles.chevronOpen)}
              />
              <span className={styles.triggerText}>{devicesAmount} אמצעים</span>
            </UnstyledButton>
          </span>
        </Tooltip>
      </Popover.Target>

      <Popover.Dropdown>
        <div className={styles.dropdown}>
          <span className={styles.dropdownHeader}>גריד אמצעים</span>

          <div className={styles.optionsList}>
            {items.map((item) => (
              <GridOption
                key={item.value}
                value={item.value}
                label={item.label}
                checked={devicesAmount === item.value}
                onChange={handleSelect}
              />
            ))}
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};
