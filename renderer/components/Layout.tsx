/* eslint no-unused-vars:0 */

import React, { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Head from "next/head";

import AppBarWithSidebar from "../../../gawoo/renderer/components/MainLayout";
import { ThemeContextProvider } from "../context/ThemeContext";

type Props = {
  children: ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <ThemeContextProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <AppBarWithSidebar>{children}</AppBarWithSidebar>
      </ThemeContextProvider>
    </div>
  );
};

export default Layout;
