import { useState, useRef, useEffect } from 'react';
import ReactGridLayout from 'react-grid-layout';

import { Button, Flex, Box } from '@strapi/design-system';
import { Plus } from '@strapi/icons';

import { Field, useFormContext } from '../context/FormContext';
import FieldCard from './Fields/FieldCard';
import FieldModal from './Modals/FieldModal';
import { FieldActionsEnum } from '../utils/enums';

import DesktopIcon from './Icons/Desktop';
import TabletIcon from './Icons/Tablet';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const margin = 8;

export const FormBuilder = () => {
  const { currentLayouts, currentBreakpoint, setCurrentBreakpoint, updateLayouts } =
    useFormContext();
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentField, setCurrentField] = useState(null);
  const [gridWidth, setGridWidth] = useState(1200); // Initial grid width
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Update grid width dynamically when the container resizes
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setGridWidth(containerRef.current.offsetWidth);
      }
    };

    // Add resize observer or fallback to window resize
    const resizeObserver = new ResizeObserver(() => updateWidth());
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    // Fallback for older browsers
    window.addEventListener('resize', updateWidth);

    // Initial calculation
    updateWidth();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const handleAddField = () => {
    setCurrentField(null); // Clear current field for new addition
    setModalVisible(true);
  };

  const handleEditField = (block: any) => {
    const field = block.field ? { ...block.field, blockId: block.i } : {}; // Prepare field data
    setCurrentField(field);
    setModalVisible(true);
  };

  const handleBreakpoint = (breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  };

  useEffect(() => {
    const updateHeightsAndPositions = () => {
      const rows: Record<number, HTMLElement[]> = {};
      const rowHeights: Record<number, number> = {};
      const rowTransforms: Record<number, number> = {};

      // Step 1: Reset all heights and transforms
      currentLayouts[currentBreakpoint].forEach((block) => {
        const cardElement = document.getElementById(`card-${block.i}`);
        if (!cardElement) return;

        cardElement.style.height = 'auto'; // Reset height
        cardElement.style.transform = 'none'; // Reset transform

        if (!rows[block.y]) {
          rows[block.y] = [];
        }

        rows[block.y].push(cardElement);
      });

      // Step 2: Calculate maximum height for each row
      Object.keys(rows).forEach((row) => {
        const rowIndex = parseInt(row, 10);
        rowHeights[rowIndex] = Math.max(...rows[rowIndex].map((el) => el.offsetHeight));
      });

      // Step 3: Calculate cumulative vertical transforms for rows
      let cumulativeHeight = 0;
      Object.keys(rowHeights)
        .sort((a, b) => parseInt(a, 10) - parseInt(b, 10)) // Sort rows by row index
        .forEach((row) => {
          const rowIndex = parseInt(row, 10);
          rowTransforms[rowIndex] = cumulativeHeight; // Store vertical transform for the row
          cumulativeHeight += rowHeights[rowIndex] + margin; // Add padding between rows
        });

      // Step 4: Apply transforms and update heights dynamically
      currentLayouts[currentBreakpoint].map((block) => {
        const cardElement = document.getElementById(`card-${block.i}`);
        if (!cardElement) return block;

        const rowIndex = block.y;
        const rowHeight = rowHeights[rowIndex] || 0;
        const transformY = rowTransforms[rowIndex] || 0;

        // Calculate `x` transform for horizontal alignment within the row
        const xOffset = block.x * (gridWidth / 12); // Assuming 12 columns

        // Set styles dynamically
        cardElement.style.height = `${rowHeight}px`;
        cardElement.style.transform = `translate(${xOffset}px, ${transformY}px)`;

        return {
          ...block,
          h: Math.ceil(rowHeight / rowHeight), // Convert height to grid rows
        };
      });
    };

    updateHeightsAndPositions();
  }, [currentLayouts, currentBreakpoint, gridWidth]);

  return (
    <>
      <Box background="white" padding={4} hasRadius marginBottom={4} shadow="filterShadow">
        <Flex direction="row" gap={3} style={{ width: '100%' }} alignItems="flex-start">
          <Button onClick={handleAddField} startIcon={<Plus />}>
            Add Field
          </Button>
          <Button
            variant={currentBreakpoint === 'lg' ? 'primary' : 'secondary'}
            onClick={() => handleBreakpoint('lg')}
            style={{ paddingTop: '4px' }}
          >
            <DesktopIcon width={20} height={20} />
          </Button>
          <Button
            variant={currentBreakpoint === 'md' ? 'primary' : 'secondary'}
            onClick={() => handleBreakpoint('md')}
            style={{ paddingTop: '4px' }}
          >
            <TabletIcon width={20} height={20} />
          </Button>
          <Button
            variant={currentBreakpoint === 'sm' ? 'primary' : 'secondary'}
            onClick={() => handleBreakpoint('sm')}
            style={{ paddingTop: '4px' }}
          >
            <TabletIcon width={20} height={20} style={{ rotate: '90deg' }} />
          </Button>
        </Flex>
      </Box>
      <Box background="white" padding={4} hasRadius shadow="filterShadow">
        <div id="grid-container" ref={containerRef}>
          <ReactGridLayout
            className="layout"
            layout={currentLayouts[currentBreakpoint]}
            width={gridWidth}
            compactType={null}
            preventCollision={true}
            isResizable={false}
            isDraggable={false}
            containerPadding={[0, 0]}
          >
            {currentLayouts[currentBreakpoint].map((block, index) => {
              const field: Field | [] = block.field ?? {};

              return (
                <div
                  key={block.i}
                  className="grid-item"
                  id={`card-${block.i}`} // Assign ID for height calculations
                >
                  <FieldCard
                    handleEditField={handleEditField}
                    block={block}
                    field={field as Field}
                    index={index}
                  />
                </div>
              );
            })}
          </ReactGridLayout>
        </div>
      </Box>

      {isModalVisible && (
        <FieldModal
          action={currentField ? FieldActionsEnum.Edit : FieldActionsEnum.Add}
          isVisible={isModalVisible}
          setIsVisible={setModalVisible}
          currentField={currentField}
          setCurrentField={setCurrentField}
        />
      )}
    </>
  );
};
