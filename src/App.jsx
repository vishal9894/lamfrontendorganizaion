import { Routes, Route } from "react-router-dom";
import ProtectRoutes from "./auth/ProtectRoutes";
import Homelayout from "./layout/Homelayout";
import {
  publicRoutes,
  protectedRoutes,
  defaultRoute,
  catchAllRoute
} from "./routes/routeConfig.jsx";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      {publicRoutes.map((route, index) => (
        <Route key={index} path={route.path} element={route.element} />
      ))}

      {/* Default redirect */}
      <Route {...defaultRoute} />

      {/* Protected routes with layout */}
      <Route element={<ProtectRoutes />}>
        <Route element={<Homelayout />}>
          {protectedRoutes.map((route, index) => (
            <Route key={index} path={route.path} element={route.element} />
          ))}
        </Route>
      </Route>

      {/* Catch-all route */}
      <Route {...catchAllRoute} />
    </Routes>
  );
}

export default App;
