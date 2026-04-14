import { Box, Button, TextInput, UnstyledButton } from '@mantine/core';
import { useClickOutside } from '@mantine/hooks';
import { ChevronUp, Plus, Search, Video } from 'lucide-react';
import type { CSSProperties, RefObject } from 'react';
import React, { useCallback, useState } from 'react';
import { meansStreamSelectorStyles } from './MeansStreamSelector.css';
import MeansStreamListScroll from './MeansStreamListScroll/MeansStreamListScroll';
import type { Camera } from '@src/types';
import type { MeansStreamSelectorProps } from './MeansStreamSelector.types';

const ADD_BUTTON_TEXT = 'בחירת אמצעי לצפייה';
const SELECT_PLACEHOLDER = 'בחירה...';
const SEARCH_PLACEHOLDER = 'חיפוש לפי שם אמצעי';
const EMPTY_RESULTS_TEXT = 'לא נמצאו תוצאות...';

export const filterCamerasBySearch = (
  cameras: Camera[],
  search: string,
): Camera[] => {
  const query = search.trim().toLowerCase();
  return cameras.filter((camera) => camera.name.toLowerCase().includes(query));
};

type AddStreamColumnProps = {
  onOpen: () => void;
};

const AddStreamColumn = ({ onOpen }: AddStreamColumnProps) => {
  return (
    <Box className={meansStreamSelectorStyles.controlColumn}>
      <Button
        fullWidth
        classNames={{
          root: meansStreamSelectorStyles.addButton,
          label: meansStreamSelectorStyles.addButtonLabel,
        }}
        leftSection={<Plus size={14} strokeWidth={2} />}
        onClick={onOpen}
      >
        {ADD_BUTTON_TEXT}
      </Button>
    </Box>
  );
};

type StreamSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

const searchInputMantineVars = {
  '--input-height': '24px',
  '--input-size': '24px',
  '--input-line-height': '22px',
  '--input-fz': '11px',
} as CSSProperties;

const StreamSearchField = ({ value, onChange }: StreamSearchFieldProps) => {
  return (
    <Box className={meansStreamSelectorStyles.customSearchContainer}>
      <TextInput
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={SEARCH_PLACEHOLDER}
        leftSection={<Search size={10} strokeWidth={2} />}
        leftSectionWidth={16}
        leftSectionProps={{
          className: meansStreamSelectorStyles.customSearchLeftSection,
        }}
        classNames={{
          input: meansStreamSelectorStyles.customSearchInput,
        }}
        styles={{ wrapper: searchInputMantineVars }}
      />
    </Box>
  );
};

type StreamOptionsListProps = {
  options: Camera[];
  onPick: (id: string) => void;
};

const StreamOptionsList = ({ options, onPick }: StreamOptionsListProps) => {
  if (options.length === 0) {
    return (
      <Box className={meansStreamSelectorStyles.customEmpty}>
        {EMPTY_RESULTS_TEXT}
      </Box>
    );
  }

  return (
    <>
      {options.map((item, index) => {
        const isDisconnected = item.availability === 'UNAVAILABLE';
        return (
          <UnstyledButton
            key={`${item.id}-${index}`}
            className={meansStreamSelectorStyles.customOption}
            onClick={isDisconnected ? undefined : () => onPick(item.id)}
            style={{
              opacity: isDisconnected ? 0.5 : 1,
              pointerEvents: isDisconnected ? 'none' : 'auto',
              cursor: isDisconnected ? 'not-allowed' : 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              className={meansStreamSelectorStyles.customOptionLabel}
              title={item.name}
            >
              {item.name}
            </span>
            {isDisconnected && (
              <span
                style={{
                  fontSize: '9px',
                  color: 'red',
                  fontWeight: 'bold',
                  marginRight: '8px',
                }}
              >
                מנותק
              </span>
            )}
          </UnstyledButton>
        );
      })}
    </>
  );
};

export type StreamPickerDropdownProps = {
  search: string;
  onSearchChange: (value: string) => void;
  options: Camera[];
  onPick: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

export const StreamPickerDropdown = ({
  search,
  onSearchChange,
  options,
  onPick,
  className,
  style,
}: StreamPickerDropdownProps) => {
  return (
    <Box
      className={className ?? meansStreamSelectorStyles.customDropdown}
      style={style}
    >
      <StreamSearchField value={search} onChange={onSearchChange} />
      <MeansStreamListScroll>
        <Box className={meansStreamSelectorStyles.customOptionsContainer}>
          <StreamOptionsList options={options} onPick={onPick} />
        </Box>
      </MeansStreamListScroll>
    </Box>
  );
};

type StreamPickerProps = {
  containerRef: RefObject<HTMLDivElement>;
  filteredCameras: Camera[];
  search: string;
  isDropdownOpen: boolean;
  onSearchChange: (value: string) => void;
  onToggleDropdown: () => void;
  onPick: (id: string) => void;
};

const StreamPicker = ({
  containerRef,
  filteredCameras,
  search,
  isDropdownOpen,
  onSearchChange,
  onToggleDropdown,
  onPick,
}: StreamPickerProps) => {
  const triggerLabel = SELECT_PLACEHOLDER;

  return (
    <Box
      ref={containerRef}
      className={meansStreamSelectorStyles.customSelectContainer}
    >
      <UnstyledButton
        dir="rtl"
        className={meansStreamSelectorStyles.customSelectButton}
        onClick={onToggleDropdown}
      >
        <span
          className={meansStreamSelectorStyles.customSelectValue}
          title={triggerLabel}
        >
          {triggerLabel}
        </span>
        <span
          className={meansStreamSelectorStyles.customSelectChevron}
          aria-hidden
        >
          <ChevronUp size={12} strokeWidth={2} />
        </span>
      </UnstyledButton>

      {isDropdownOpen && (
        <StreamPickerDropdown
          search={search}
          onSearchChange={onSearchChange}
          options={filteredCameras}
          onPick={onPick}
        />
      )}
    </Box>
  );
};

const MeansStreamSelector = ({
  cameras,
  onSelect,
}: MeansStreamSelectorProps) => {
  const [search, setSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const closePicker = useCallback(() => {
    setIsEditing(false);
    setIsDropdownOpen(false);
  }, []);

  const containerRef = useClickOutside(closePicker);

  const safeCameras = cameras ?? [];
  const filteredCameras = filterCamerasBySearch(safeCameras, search);

  const openPicker = () => {
    setIsEditing(true);
    setIsDropdownOpen(true);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((open) => !open);
  };

  const pickCamera = (id: string) => {
    setIsEditing(false);
    setIsDropdownOpen(false);
    setSearch('');
    const index = safeCameras.findIndex((c) => c.id === id);
    if (index !== -1) onSelect(index);
  };

  return (
    <Box className={meansStreamSelectorStyles.container}>
      <Video className={meansStreamSelectorStyles.videoIcon} />

      {!isEditing ? (
        <AddStreamColumn onOpen={openPicker} />
      ) : (
        <StreamPicker
          containerRef={containerRef}
          filteredCameras={filteredCameras}
          search={search}
          isDropdownOpen={isDropdownOpen}
          onSearchChange={setSearch}
          onToggleDropdown={toggleDropdown}
          onPick={pickCamera}
        />
      )}
    </Box>
  );
};

export default MeansStreamSelector;
