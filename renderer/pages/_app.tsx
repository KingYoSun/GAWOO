import React from "react";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import AuthContextProvider from "../context/AuthContext";

const App = ({ Component, pageProps }: AppProps) => {
  const SafeHydrate = dynamic(() => import("../components/SafeHydrate"), {
    ssr: false,
  });

  return (
    <AuthContextProvider>
      <SafeHydrate>
        <Component {...pageProps} />
      </SafeHydrate>
    </AuthContextProvider>
  );
};

export default App;
