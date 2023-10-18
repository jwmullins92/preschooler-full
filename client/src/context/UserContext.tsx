import { createContext, useEffect, useState } from 'react';
import {userId} from "../App";
import {ParentWithId, UserWithId} from "../../../hello-cdk/lib/types/types";
import {apiGet} from "../utils/functions";

export const UserContext = createContext<ParentWithId | UserWithId>(undefined);

export function UserContextProvider({ children }) {
    const [data, setData] = useState<ParentWithId>();

    useEffect(() => {
        apiGet(`/user/${userId}`)
            .then(data => setData(data))
            .catch(error => {
                console.error('API call failed:', error);
            });
    }, []);

    return (
        <UserContext.Provider value={data}>
            {children}
        </UserContext.Provider>
    );
}