import { createContext, useReducer } from "react";
import { BasicProfile } from "../types/general";

type ProfileProviderProps = { children: React.ReactNode };

const defaultProfile: BasicProfile = {
  name: "",
  avatar: null,
  image: null,
  description: "",
  emoji: null,
  background: null,
  birthDate: null,
  url: "",
  gender: "",
  homeLocation: "",
  residenceCountry: "",
  nationalities: [],
};

export const ProfileContext = createContext(null);

function reducer(state, action) {
  switch (action?.type) {
    case "set":
      return action.payload;
    default:
      return state;
  }
}

export default function ProfileContextProvider({
  children,
}: ProfileProviderProps): JSX.Element {
  const [profile, dispatchProfile] = useReducer(reducer, defaultProfile);

  return (
    <ProfileContext.Provider value={{ profile, dispatchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}
