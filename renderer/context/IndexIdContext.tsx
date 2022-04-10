import { createContext, useReducer } from "react";

type IndexIdProviderProps = { children: React.ReactNode };

export const IndexIdContext = createContext(null);

function reducer(state: Array<String>, action) {
  switch (action?.type) {
    case "set":
      return action.payload;
    case "reset":
      return null;
    default:
      return state;
  }
}

export default function IndexIdContextProvider({
  children,
}: IndexIdProviderProps): JSX.Element {
  const initialState = null;

  const [indexId, dispatchIndexId] = useReducer(reducer, initialState);

  return (
    <IndexIdContext.Provider value={{ indexId, dispatchIndexId }}>
      {children}
    </IndexIdContext.Provider>
  );
}
