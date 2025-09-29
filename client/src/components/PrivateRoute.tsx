import { Navigate } from "react-router-dom";
import { useLoginContext } from "../LoginContext";
import { ReactNode } from "react";
import { LoadingIndicator } from "./LoadingIndicator";

type PrivateRouteProps = {
    children: ReactNode;
};

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
    const { login} = useLoginContext();

    if (login === undefined) {
        return <LoadingIndicator />;
    }

    if (login === false) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}