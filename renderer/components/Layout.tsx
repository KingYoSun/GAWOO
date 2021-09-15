import React, { ReactNode } from 'react'
import CssBaseline from '@material-ui/core/CssBaseline';
import Head from 'next/head';

import AppBarWithSidebar from './MainLayout';
import { ArticlesContextProvider } from '../context/ArticlesContext';
import { ThemeProvider } from '../context/ThemeContext';

type Props = {
  children: ReactNode
  title?: string
}

const Layout = ({ children, title = 'This is the default title' }: Props) => (
  <div>
    <Head>
      <title>{title}</title>
      <meta charSet="utf-8" />
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
    <ThemeProvider>
      <ArticlesContextProvider>
        {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
        <CssBaseline />
        <AppBarWithSidebar>
          {children}
        </AppBarWithSidebar>
      </ArticlesContextProvider>
    </ThemeProvider>
  </div>
)

export default Layout;