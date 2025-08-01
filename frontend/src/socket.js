import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';
import { useSearchParams } from 'react-router-dom'; 

export default function useSecureSocket() {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);
   const [searchParams] = useSearchParams(); 

  useEffect(() => {
    const connect = async () => {
      // 👇 Use the correct JWT template name
      const token = await getToken({ template: 'Aditya' });
      console.log('🎟️ JWT Token:', token);
      if (!token) return;

            const projectId = searchParams.get('id');
      const projectName = searchParams.get('projectName');

      const s = io('http://localhost:8000', {
        auth: { token , projectId , projectName },
        transports: ['websocket'],
      });

      s.on('connect_error', (err) => {
        console.error('❌ Socket connect error:', err.message);
      });

      s.on('connect', () => {
        console.log('✅ Socket connected');
      });

      setSocket(s);
    };

    connect();
  }, []);

  return socket;
}
