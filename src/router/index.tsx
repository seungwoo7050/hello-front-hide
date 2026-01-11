import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { PublicRoute } from '../components/PublicRoute';
import { Home } from '../pages/Home';
import { Playground } from '../pages/Playground';
import { About } from '../pages/About';
import { FormDemo } from '../pages/FormDemo';
import { Notes } from '../pages/Notes';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
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
        path: 'notes',
        element: (
          <ProtectedRoute>
            <Notes />
          </ProtectedRoute>
        ),
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'form-demo',
        element: <FormDemo />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
