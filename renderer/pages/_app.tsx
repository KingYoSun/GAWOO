import React from "react";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";

const App = ({ Component, pageProps }: AppProps) => {
  const AuthContextProvider = dynamic(() => import("../context/AuthContext"), {
    ssr: false,
  });

  return (
    <AuthContextProvider>
      <Component {...pageProps} />
    </AuthContextProvider>
  );
};

export default App;
