import { RouterProvider } from 'react-router';
import { AppProvider } from './context/AppContext';
import { router } from './routes';

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-screen">
        <RouterProvider router={router} />
      </div>
    </AppProvider>
  );
}
