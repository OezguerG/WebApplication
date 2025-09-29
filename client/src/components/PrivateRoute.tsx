import { Navigate } from "react-router-dom";
import { useLoginContext } from "../LoginContext";
import { ReactNode } from "react";

type PrivateRouteProps = {
    children: ReactNode;
};

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { isLoggedIn } = useLoginContext();

    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}