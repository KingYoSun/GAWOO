import AccountUtils from "../utils/identity/account-utils";
import { createContext, useReducer } from "react";
// import { parseCookies } from "nookies";

type AuthProviderProps = { children: React.ReactNode };

export const AuthContext = createContext(null);

function reducer(state, action) {
  switch (action?.type) {
    case "set":
      return action.payload;
    default:
      return state;
  }
}

export default function AuthContextProvider({
  children,
}: AuthProviderProps): JSX.Element {
  const initialState = new AccountUtils();

  const [account, dispatchAccount] = useReducer(reducer, initialState);

  return (
    <AuthContext.Provider value={{ account, dispatchAccount }}>
      {children}
    </AuthContext.Provider>
  );
}
