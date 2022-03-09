import React from "react";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import AutoAuth from "../components/AutoAuth";
import LoadingOverlay from "../components/LoadingOverlay";

import AuthContextProvider from "../context/AuthContext";
import ProfileContextProvider from "../context/ProfileContext";
import LoadingContextProvider from "../context/LoadingContext";

const App = ({ Component, pageProps }: AppProps) => {
  const SafeHydrate = dynamic(() => import("../components/SafeHydrate"), {
    ssr: false,
  });

  return (
    <AuthContextProvider>
      <ProfileContextProvider>
        <LoadingContextProvider>
          <SafeHydrate>
            <AutoAuth>
              <LoadingOverlay>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </LoadingOverlay>
            </AutoAuth>
          </SafeHydrate>
        </LoadingContextProvider>
      </ProfileContextProvider>
    </AuthContextProvider>
  );
};

export default App;
