import { createContext, useReducer } from "react";

type SetupProviderProps = { children: React.ReactNode };

export const SetupContext = createContext(null);

function reducer(state, action) {
  switch (action?.type) {
    case "ipfs":
      return { ...state, ipfs: action.payload };
    case "waku":
      return { ...state, waku: action.payload };
    default:
      return state;
  }
}

export default function SetupContextProvider({
  children,
}: SetupProviderProps): JSX.Element {
  const initialState = {
    ipfs: false,
    waku: false,
  };

  const [setup, dispatchSetup] = useReducer(reducer, initialState);

  return (
    <SetupContext.Provider value={{ setup, dispatchSetup }}>
      {children}
    </SetupContext.Provider>
  );
}
