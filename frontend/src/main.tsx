import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import { DirectionProvider, MantineProvider } from '@mantine/core';
import { queryClient } from './lib/query-client';
import { theme } from './theme/theme';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <DirectionProvider initialDirection='rtl'>
      <MantineProvider defaultColorScheme="dark" theme={theme}>
        <App />
      </MantineProvider>
     </DirectionProvider>
     </QueryClientProvider>
  </React.StrictMode>,
);
