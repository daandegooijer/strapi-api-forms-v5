//@ts-nocheck
import React, {
  createContext,
  useContext,
  ReactNode,
  useReducer,
  useEffect,
  useState,
} from 'react';
import { useBlockOperations } from '../hooks/useBlockActions';

// Typings for Fields, Blocks, and Steps
export interface Field {
  i: string;
  label: string;
  name: string;
  placeholder: string;
  type: string;
  config?: {
    required?: boolean;
  };
}

export interface Block {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  field: Field | [];
}

export interface Layouts {
  [breakpoint: string]: Block[]; // Layouts for each breakpoint
}

interface Step {
  id: number;
  layouts: Layouts;
}

interface State {
  id?: number;
  title?: string;
  steps: Step[];
  currentStep: number;
  successMessage: string;
  errorMessage: string;
  active: boolean;
  dateFrom: string;
  dateTill: string;
}

interface Action {
  type: string;
  payload: any;
}

const reducer = (state: State, action: Action): State => {
  const fieldIdentifier = `field-${Date.now()}`;

  switch (action.type) {
    case 'EDIT_FORM':
      return {
        ...state,
        ...action.payload,
      };
    case 'ADD_STEP':
      return {
        ...state,
        steps: [...state.steps, { id: state.steps.length + 1, layouts: {} }],
      };
    case 'UPDATE_LAYOUT':
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.id === action.payload.currentStep
            ? { ...step, layouts: action.payload.newLayouts }
            : step
        ),
      };
    case 'ADD_FIELD':
      return {
        ...state,
        steps: state.steps.map((step) =>
          step.id === action.payload.currentStep
            ? {
                ...step,
                layouts: Object.keys(step.layouts).reduce((acc, breakpoint) => {
                  const layout = step.layouts[breakpoint] || [];
                  const totalColumns = 12; // Assuming a 12-column grid
                  let newX = 0;
                  let newY = 0;

                  // Find the first available position
                  for (let y = 0; ; y++) {
                    const rowItems = layout.filter((block) => block.y === y);
                    const rowWidth = rowItems.reduce((sum, block) => sum + block.w, 0);

                    if (rowWidth + 12 <= totalColumns) {
                      newX = rowWidth;
                      newY = y;
                      break;
                    }
                  }

                  acc[breakpoint] = [
                    ...layout,
                    {
                      i: fieldIdentifier,
                      field: action.payload.field,
                      w: 12,
                      h: 1,
                      minW: 3,
                      maxW: 12,
                      x: newX,
                      y: newY, // Correctly place in the same row if space is available
                    },
                  ];
                  return acc;
                }, {} as Layouts),
              }
            : step
        ),
      };

    case 'EDIT_FIELD':
      return {
        ...state,
        steps: state.steps.map((step) => {
          if (step.id !== action.payload.currentStep) {
            return step;
          }

          // Update the field in all breakpoints
          const updatedLayouts = Object.keys(step.layouts).reduce((acc, breakpoint) => {
            acc[breakpoint] =
              step.layouts[breakpoint]?.map((block) => {
                // Check if the block contains the field to be edited
                return block.i === action.payload.field.i
                  ? {
                      ...block,
                      field: action.payload.field, // Update the field
                    }
                  : block;
              }) || [];
            return acc;
          }, {} as Layouts);

          return {
            ...step,
            layouts: updatedLayouts,
          };
        }),
      };
    default:
      return state;
  }
};

// Initial state
//@ts-ignore
const initialState: State = {
  steps: [{ id: 1, layouts: { lg: [], md: [], sm: [] } }],
  currentStep: 1,
  active: true,
};

// Context Typing
const FormContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  removeState: () => State;
  steps: Step[];
  currentStep: number;
  currentLayouts: Layouts;
  currentBreakpoint: string;
  setCurrentBreakpoint: (breakpoint: string) => void;
  setCurrentStep: (step: number) => void;
  addStep: () => void;
  addBlock: (blockId?: string, field?: Field) => void;
  removeBlock: (blockId: string) => void;
  resizeBlock: (blockId: string) => void;
  moveBlock: (blockId: string, direction: 'prev' | 'next') => void;
  updateLayouts: (newLayouts: Layouts) => void;
}>({
  state: initialState,
  dispatch: () => {},
  removeState: () => {},
  steps: [],
  currentStep: 1,
  setCurrentStep: () => {},
  addStep: () => {},
  addBlock: () => {},
  removeBlock: () => {},
  resizeBlock: () => {},
  moveBlock: () => {},
  currentLayouts: { lg: [], md: [], sm: [] },
  updateLayouts: () => {},
  currentBreakpoint: 'lg',
  setCurrentBreakpoint: () => {},
});

const loadState = (): State => {
  const savedState = localStorage.getItem('formState');
  return savedState ? JSON.parse(savedState) : initialState;
};

const removeState = (): State => {
  localStorage.removeItem('formState');

  return initialState;
};

// Provider Component
export const FormProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, loadState());
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');

  const currentStep = state.steps.find((step) => step.id === state.currentStep) || {
    layouts: {},
  };
  const currentLayouts = currentStep.layouts;

  const setCurrentStep = (step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  };

  const updateLayouts = (newLayouts: Layouts) => {
    dispatch({
      type: 'UPDATE_LAYOUT',
      payload: {
        currentStep: state.currentStep,
        newLayouts,
      },
    });
  };

  // Add a new step
  const addStep = () => {
    dispatch({
      type: 'ADD_STEP',
      payload: { id: state.steps.length + 1, layouts: {} },
    });
  };

  // Block operations
  const blockOperations = useBlockOperations(currentLayouts, updateLayouts, currentBreakpoint);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('formState', JSON.stringify(state));
  }, [state]);

  return (
    <FormContext.Provider
      value={{
        state,
        dispatch,
        removeState,
        steps: state.steps,
        currentStep: state.currentStep,
        currentLayouts,
        updateLayouts,
        setCurrentStep,
        addStep,
        currentBreakpoint,
        setCurrentBreakpoint,
        ...blockOperations,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};

// Custom Hook for Context Access
export const useFormContext = () => {
  const context = useContext(FormContext);

  if (!context) {
    throw new Error('useFormContext must be used within a FormProvider');
  }

  return context;
};
