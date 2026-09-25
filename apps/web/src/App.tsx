import { BrowserRouter, Route, Routes } from 'react-router';
import { ThemeProvider } from './theme/ThemeProvider.js';
import { Layout } from './routes/Layout.js';
import { CreatePage } from './features/create/CreatePage.js';
import { PollPage } from './features/poll/PollPage.js';
import { KitchenSinkPage } from './routes/KitchenSinkPage.js';
import { NotFound } from './routes/NotFound.js';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<CreatePage />} />
            <Route path="/p/:slug" element={<PollPage />} />
            <Route path="/p/:slug/admin/:adminToken" element={<PollPage />} />
            <Route path="/kitchen-sink" element={<KitchenSinkPage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
