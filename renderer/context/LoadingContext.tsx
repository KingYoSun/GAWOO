import { createContext, useReducer } from "react";

type LoadingProviderProps = { children: React.ReactNode };

export const LoadingContext = createContext(null);

function reducer(state: Array<String>, action) {
  switch (action?.type) {
    case "add":
      return [...state, action.payload];
    case "remove":
      return [...state.filter((msg) => msg !== action.payload)];
    default:
      return state;
  }
}

export default function LoadingContextProvider({
  children,
}: LoadingProviderProps): JSX.Element {
  const initialState = [];

  const [loading, dispatchLoading] = useReducer(reducer, initialState);

  return (
    <LoadingContext.Provider value={{ loading, dispatchLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}
