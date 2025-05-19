import { Navigate } from "react-router-dom";
import { getToken } from "./services/auth"; // Remember we created auth.js before

interface PrivateRouteProps {
  children: JSX.Element;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = getToken();
  return token ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
