import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@clerk/clerk-react';

export default function useSecureSocket() {
  const { getToken } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const connect = async () => {
      // 👇 Use the correct JWT template name
      const token = await getToken({ template: 'Aditya' });
      console.log('🎟️ JWT Token:', token);
      if (!token) return;

      const s = io('http://localhost:8000', {
        auth: { token },
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
