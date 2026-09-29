import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './app/layout/AppLayout';
import { ROUTES } from './app/routes';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <BrowserRouter>
        <ModalsProvider modalProps={{ radius: 'xl', centered: true, overlayProps: { blur: 3 } }}>
          <Notifications position="bottom-center" />
          <Routes>
            <Route element={<AppLayout />}>
              {ROUTES.map(({ path, page: Page }) => (
                <Route key={path} path={path} element={<Page />} />
              ))}
              <Route path="*" element={<Navigate to="/pos" replace />} />
            </Route>
          </Routes>
        </ModalsProvider>
      </BrowserRouter>
    </MantineProvider>
  );
}
