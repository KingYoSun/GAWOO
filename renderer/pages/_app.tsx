import React, { useEffect } from "react";
import { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Layout from "../components/Layout";
import AutoAuth from "../components/AutoAuth";
import LoadingOverlay from "../components/LoadingOverlay";
import Subscribe from "../components/Subscribe";

import AuthContextProvider from "../context/AuthContext";
import ProfileContextProvider from "../context/ProfileContext";
import LoadingContextProvider from "../context/LoadingContext";
import SetupContextProvider from "../context/SetupContext";
import ErrorDialogContextProvider from "../context/ErrorDialogContext";

const App = ({ Component, pageProps }: AppProps) => {
  const SafeHydrate = dynamic(() => import("../components/SafeHydrate"), {
    ssr: false,
  });

  useEffect(() => {
    document.ondragover = document.ondrop = (e) => {
      e.preventDefault();
    };
  }, []);

  return (
    <SetupContextProvider>
      <AuthContextProvider>
        <ProfileContextProvider>
          <LoadingContextProvider>
            <ErrorDialogContextProvider>
              <SafeHydrate>
                <AutoAuth>
                  <Subscribe>
                    <LoadingOverlay>
                      <Layout>
                        <Component {...pageProps} />
                      </Layout>
                    </LoadingOverlay>
                  </Subscribe>
                </AutoAuth>
              </SafeHydrate>
            </ErrorDialogContextProvider>
          </LoadingContextProvider>
        </ProfileContextProvider>
      </AuthContextProvider>
    </SetupContextProvider>
  );
};

export default App;
