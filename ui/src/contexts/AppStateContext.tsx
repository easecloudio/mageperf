'use client';

import { createContext, useContext, ReactNode, useReducer, useEffect } from 'react';

interface AnalysisState {
  url?: string;
  step?: 'initial' | 'validating' | 'onboarding' | 'analyzing' | 'completed';
  taskId?: string;
  error?: string;
}

interface AppState {
  analysis: AnalysisState;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_ANALYSIS_URL'; payload: string }
  | { type: 'SET_ANALYSIS_STEP'; payload: AnalysisState['step'] }
  | { type: 'SET_TASK_ID'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RESET_ANALYSIS' }
  | { type: 'HYDRATE_FROM_STORAGE'; payload: Partial<AppState> };

const initialState: AppState = {
  analysis: {},
  loading: false,
};

function appStateReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_ANALYSIS_URL':
      return {
        ...state,
        analysis: {
          ...state.analysis,
          url: action.payload,
        },
      };

    case 'SET_ANALYSIS_STEP':
      return {
        ...state,
        analysis: {
          ...state.analysis,
          step: action.payload,
        },
      };

    case 'SET_TASK_ID':
      return {
        ...state,
        analysis: {
          ...state.analysis,
          taskId: action.payload,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        analysis: {
          ...state.analysis,
          error: action.payload,
        },
        loading: false,
      };

    case 'CLEAR_ERROR':
      return {
        ...state,
        analysis: {
          ...state.analysis,
          error: undefined,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'RESET_ANALYSIS':
      return {
        ...state,
        analysis: {},
        loading: false,
      };

    case 'HYDRATE_FROM_STORAGE':
      return {
        ...state,
        ...action.payload,
      };

    default:
      return state;
  }
}

const AppStateContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appStateReducer, initialState);

  // Hydrate state from localStorage on mount (for persistence)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('magento-app-state');
        if (stored) {
          const parsed = JSON.parse(stored);
          // Clear loading state on initial hydration to prevent auto-validation
          dispatch({ type: 'HYDRATE_FROM_STORAGE', payload: { ...parsed, loading: false } });
        }
      } catch (error) {
        console.warn('Failed to hydrate state from localStorage:', error);
      }
    }
  }, []);

  // Persist state changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('magento-app-state', JSON.stringify(state));
      } catch (error) {
        console.warn('Failed to persist state to localStorage:', error);
      }
    }
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
}

// Convenience hooks for specific actions
export function useAnalysisFlow() {
  const { state, dispatch } = useAppState();

  const startAnalysis = (url: string) => {
    dispatch({ type: 'SET_ANALYSIS_URL', payload: url });
    dispatch({ type: 'SET_ANALYSIS_STEP', payload: 'validating' });
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setStep = (step: AnalysisState['step']) => {
    dispatch({ type: 'SET_ANALYSIS_STEP', payload: step });
  };

  const setTaskId = (taskId: string) => {
    dispatch({ type: 'SET_TASK_ID', payload: taskId });
    dispatch({ type: 'SET_ANALYSIS_STEP', payload: 'completed' });
  };

  const setError = (error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const reset = () => {
    dispatch({ type: 'RESET_ANALYSIS' });
  };

  return {
    analysis: state.analysis,
    loading: state.loading,
    startAnalysis,
    setStep,
    setTaskId,
    setError,
    setLoading,
    reset,
  };
}