import { createContext, useReducer } from "react";

type NoticeCountProviderProps = { children: React.ReactNode };

export const NoticeCountContext = createContext(null);

function reducer(state: Array<String>, action) {
  switch (action?.type) {
    case "set":
      return action.payload;
    default:
      return state;
  }
}

export default function IndexIdContextProvider({
  children,
}: NoticeCountProviderProps): JSX.Element {
  const initialState = 0;

  const [noticeCount, dispatchNoticeCount] = useReducer(reducer, initialState);

  return (
    <NoticeCountContext.Provider value={{ noticeCount, dispatchNoticeCount }}>
      {children}
    </NoticeCountContext.Provider>
  );
}
