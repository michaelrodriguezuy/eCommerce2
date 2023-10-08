import { Route, Routes } from "react-router-dom";
import Navbar from "../components/layout/navbar/Navbar";
import { routes } from "./routes";
import Login from "../components/pages/login/Login";
import Register from "../components/pages/register/Register";
import ForgotPassword from "../components/pages/forgotPassword/ForgotPassword";
import Dashboard from "../components/pages/dashboard/Dashboard";
import ProtectedAdmin from "./ProtectedAdmin";
import ProtectedUsers from "./ProtectedUsers";
import Orders from "../components/pages/orders/Orders";
import Footer from "../components/layout/footer/Footer";

const AppRouter = () => {
  return (
    <Routes>
      {/* Users logueados*/}
      <Route element={<ProtectedUsers />}>
        <Route element={<Navbar />}>
          {routes.map(({ id, path, Element }) => (
            <Route key={id} path={path} element={<Element />} />
          ))}
        </Route>
      </Route>
      {/* <Footer /> */}

      {/* Admin logueados*/}
      <Route element={<ProtectedAdmin />}>
        <Route element={<Navbar />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/dashboard/orders" element={<Orders />} />
        </Route>
      </Route>
      {/* <Footer /> */}

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* register  */}
      <Route path="/register" element={<Register />} />

      {/* forgot password  */}
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="*" element={<h1>Not found</h1>} />
    </Routes>
  );
};

export default AppRouter;
