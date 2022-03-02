import React from "react";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import AutoAuth from "../components/AutoAuth";

import AuthContextProvider from "../context/AuthContext";
import ProfileContextProvider from "../context/ProfileContext";

const App = ({ Component, pageProps }: AppProps) => {
  const SafeHydrate = dynamic(() => import("../components/SafeHydrate"), {
    ssr: false,
  });

  return (
    <AuthContextProvider>
      <ProfileContextProvider>
        <SafeHydrate>
          <AutoAuth>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </AutoAuth>
        </SafeHydrate>
      </ProfileContextProvider>
    </AuthContextProvider>
  );
};

export default App;
