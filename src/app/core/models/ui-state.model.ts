export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

export interface AppState {
  loading: LoadingState;
  error: ErrorState;
  theme: 'light' | 'dark';
}

export type LoadingStateUpdate = Partial<LoadingState>;
export type ErrorStateUpdate = Partial<ErrorState>;
export type AppStateUpdate = Partial<Pick<AppState, 'theme'>>;

export function isLoadingState(obj: unknown): obj is LoadingState {
  return (
    typeof obj === 'object' && obj !== null && typeof (obj as LoadingState).isLoading === 'boolean'
  );
}

export function isErrorState(obj: unknown): obj is ErrorState {
  return (
    typeof obj === 'object' && obj !== null && typeof (obj as ErrorState).hasError === 'boolean'
  );
}
