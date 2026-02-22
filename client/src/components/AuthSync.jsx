import React, { useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import api from '../services/api';

const AuthSync = ({ children }) => {
    const { user, isLoaded, isSignedIn } = useUser();
    const syncedRef = useRef(false);

    useEffect(() => {
        const syncUser = async () => {
            if (isLoaded && isSignedIn && user && !syncedRef.current) {
                try {
                    await api.post('/auth/sync', {
                        email: user.primaryEmailAddress?.emailAddress,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        imageUrl: user.imageUrl,
                    });
                    syncedRef.current = true;
                    console.log("User synced successfully with backend");
                } catch (error) {
                    console.error("Failed to sync user with backend:", error);
                }
            }
        };

        syncUser();
    }, [isLoaded, isSignedIn, user]);

    return <>{children}</>;
};

export default AuthSync;
