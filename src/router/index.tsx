import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { Home } from '../pages/Home';
import { Playground } from '../pages/Playground';
import { About } from '../pages/About';
import { NotFound } from '../pages/NotFound';

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'playground',
        element: <Playground />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
