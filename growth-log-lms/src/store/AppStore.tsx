import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import {
  ADVICE,
  DEFAULT_PRIVACY,
  GOALS,
  RECORDS,
  SELF_REVIEWS,
  USER,
} from '@/data/mock';
import type {
  Advice,
  AdviceFeedback,
  Goal,
  GoalStatus,
  LearningRecord,
  PrivacySettings,
  ReflectionAnswers,
  SelfReview,
  Visibility,
} from '@/data/types';

interface AppState {
  records: LearningRecord[];
  goals: Goal[];
  reviews: SelfReview[];
  advice: Advice[];
  adviceFeedback: Record<string, AdviceFeedback>;
  privacy: PrivacySettings;
}

type Action =
  | { type: 'addRecord'; record: LearningRecord }
  | { type: 'updateRecord'; id: string; patch: Partial<LearningRecord> }
  | { type: 'deleteRecord'; id: string }
  | { type: 'addLaterNote'; id: string; text: string; date: string }
  | { type: 'addGoal'; goal: Goal }
  | { type: 'setGoalStatus'; id: string; status: GoalStatus }
  | { type: 'addGoalUpdate'; id: string; note: string; date: string }
  | { type: 'addReview'; review: SelfReview }
  | { type: 'setAdviceFeedback'; id: string; feedback: AdviceFeedback }
  | { type: 'setPrivacy'; patch: Partial<PrivacySettings> };

const initialState: AppState = {
  records: RECORDS,
  goals: GOALS,
  reviews: SELF_REVIEWS,
  advice: ADVICE,
  adviceFeedback: {},
  privacy: DEFAULT_PRIVACY,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'addRecord':
      return {
        ...state,
        records: [action.record, ...state.records].sort((a, b) =>
          a.date < b.date ? 1 : -1,
        ),
      };
    case 'updateRecord':
      return {
        ...state,
        records: state.records.map((r) =>
          r.id === action.id ? { ...r, ...action.patch } : r,
        ),
      };
    case 'deleteRecord':
      return {
        ...state,
        records: state.records.filter((r) => r.id !== action.id),
        goals: state.goals.filter((g) => g.recordId !== action.id),
      };
    case 'addLaterNote':
      return {
        ...state,
        records: state.records.map((r) =>
          r.id === action.id
            ? {
                ...r,
                laterNotes: [...r.laterNotes, { date: action.date, text: action.text }],
              }
            : r,
        ),
      };
    case 'addGoal':
      return { ...state, goals: [action.goal, ...state.goals] };
    case 'setGoalStatus':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.id ? { ...g, status: action.status } : g,
        ),
      };
    case 'addGoalUpdate':
      return {
        ...state,
        goals: state.goals.map((g) =>
          g.id === action.id
            ? { ...g, updates: [...g.updates, { date: action.date, note: action.note }] }
            : g,
        ),
      };
    case 'addReview':
      return { ...state, reviews: [action.review, ...state.reviews] };
    case 'setAdviceFeedback':
      return {
        ...state,
        adviceFeedback: { ...state.adviceFeedback, [action.id]: action.feedback },
      };
    case 'setPrivacy':
      return { ...state, privacy: { ...state.privacy, ...action.patch } };
  }
}

interface AppContextValue extends AppState {
  user: typeof USER;
  getRecord: (id: string | undefined) => LearningRecord | undefined;
  goalsOfRecord: (recordId: string) => Goal[];
  /** 振り返りがまだの記録。新しい順。 */
  awaitingRecords: LearningRecord[];
  /** 振り返り済みの記録。新しい順。 */
  doneRecords: LearningRecord[];
  saveReflection: (
    recordId: string,
    input: {
      answers: ReflectionAnswers;
      tags: string[];
      durationSec: number;
      done: boolean;
      transcript?: LearningRecord['transcript'];
      reflectedOn: string;
    },
  ) => void;
  setVisibility: (recordId: string, visibility: Visibility) => void;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getRecord = useCallback(
    (id: string | undefined) => state.records.find((r) => r.id === id),
    [state.records],
  );

  const goalsOfRecord = useCallback(
    (recordId: string) => state.goals.filter((g) => g.recordId === recordId),
    [state.goals],
  );

  const saveReflection = useCallback<AppContextValue['saveReflection']>(
    (recordId, input) => {
      dispatch({
        type: 'updateRecord',
        id: recordId,
        patch: {
          answers: input.answers,
          tags: input.tags,
          durationSec: input.durationSec,
          status: input.done ? 'done' : 'draft',
          transcript: input.transcript,
          reflectedOn: input.reflectedOn,
        },
      });
    },
    [],
  );

  const setVisibility = useCallback((recordId: string, visibility: Visibility) => {
    dispatch({ type: 'updateRecord', id: recordId, patch: { visibility } });
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      user: USER,
      getRecord,
      goalsOfRecord,
      awaitingRecords: state.records.filter((r) => r.status !== 'done'),
      doneRecords: state.records.filter((r) => r.status === 'done'),
      saveReflection,
      setVisibility,
      dispatch,
    }),
    [state, getRecord, goalsOfRecord, saveReflection, setVisibility],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp は AppProvider の中で使ってください');
  return ctx;
}
