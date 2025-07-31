import { useUser, useAuth } from '@clerk/clerk-react';

export const useToken = async () => {
    const { getToken } = useAuth();
    const token = await getToken();
    return token;
}