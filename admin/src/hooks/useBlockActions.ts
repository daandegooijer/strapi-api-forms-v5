import { Block, Field } from '../context/FormContext';

interface Layouts {
  [breakpoint: string]: Block[];
}

export const useBlockOperations = (
  layouts: Layouts, // All layouts for all breakpoints
  updateLayouts: (newLayouts: Layouts) => void, // Function to update all layouts
  currentBreakpoint: string // The active breakpoint
) => {
  // Adjust layout positions after operations
  const adjustLayout = (layout: Block[]): Block[] => {
    let rowCount = 0;
    let rowWidth = 0;

    return layout.map((block) => {
      if (rowWidth + block.w > 12) {
        rowCount += 1;
        rowWidth = 0;
      }
      block.x = rowWidth;
      block.y = rowCount;
      rowWidth += block.w;
      return block;
    });
  };

  // Add a new block to all breakpoints
  const addBlock = (newBlockId?: string, field?: Field) => {
    const updatedLayouts = Object.fromEntries(
      Object.entries(layouts).map(([breakpoint, layout]) => {
        const newBlock: Block = {
          i: newBlockId || `block-${Date.now()}`,
          x: 0,
          y: layout.length, // Add to the next row
          w: 12,
          h: 1,
          minW: 4,
          maxW: 12,
          field: field ?? [],
        };

        return [breakpoint, adjustLayout([...layout, newBlock])];
      })
    );

    updateLayouts(updatedLayouts);
  };

  // Resize a block for the current breakpoint only
  const resizeBlock = (blockId: string) => {
    const updatedLayout = layouts[currentBreakpoint]?.map((block) => {
      if (block.i === blockId) {
        const gridWidths = [4, 6, 8, 12];
        const nextWidth = gridWidths[(gridWidths.indexOf(block.w) + 1) % gridWidths.length];
        return { ...block, w: nextWidth };
      }
      return block;
    });

    updateLayouts({
      ...layouts,
      [currentBreakpoint]: adjustLayout(updatedLayout), // Ensure adjustLayout is applied
    });
  };

  // Move a block for all breakpoints
  const moveBlock = (blockId: string, direction: 'next' | 'prev') => {
    const updatedLayouts = Object.fromEntries(
      Object.entries(layouts).map(([breakpoint, layout]) => {
        const sortedLayout = [...layout].sort((a, b) => (a.y === b.y ? a.x - b.x : a.y - b.y));
        const idx = sortedLayout.findIndex((block) => block.i === blockId);

        if (direction === 'next' && idx < sortedLayout.length - 1) {
          const temp = sortedLayout[idx];
          sortedLayout[idx] = sortedLayout[idx + 1];
          sortedLayout[idx + 1] = temp;
        } else if (direction === 'prev' && idx > 0) {
          const temp = sortedLayout[idx];
          sortedLayout[idx] = sortedLayout[idx - 1];
          sortedLayout[idx - 1] = temp;
        }

        return [breakpoint, adjustLayout(sortedLayout)];
      })
    );

    updateLayouts(updatedLayouts);
  };

  // Remove a block from all breakpoints
  const removeBlock = (blockId: string) => {
    const updatedLayouts = Object.fromEntries(
      Object.entries(layouts).map(([breakpoint, layout]) => [
        breakpoint,
        adjustLayout(layout.filter((block) => block.i !== blockId)),
      ])
    );

    updateLayouts(updatedLayouts);
  };

  // Add a field to a block for all breakpoints
  const addFieldToBlock = (blockId: string, field: Field) => {
    const updatedLayouts = Object.fromEntries(
      Object.entries(layouts).map(([breakpoint, layout]) => [
        breakpoint,
        layout.map((block) => (block.i === blockId ? { ...block, field: field } : block)),
      ])
    );

    updateLayouts(updatedLayouts);
  };

  // Remove a field from a block for all breakpoints
  const removeFieldFromBlock = (blockId: string, fieldId: string) => {
    const updatedLayouts = Object.fromEntries(
      Object.entries(layouts).map(([breakpoint, layout]) => [
        breakpoint,
        layout.map((block) => (block.i === blockId ? { ...block, field: {} } : block)),
      ])
    );

    //@ts-ignore
    updateLayouts(updatedLayouts);
  };

  return {
    addBlock,
    resizeBlock,
    moveBlock,
    removeBlock,
    addFieldToBlock,
    removeFieldFromBlock,
  };
};
