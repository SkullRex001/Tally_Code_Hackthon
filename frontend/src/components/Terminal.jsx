import { Terminal as XTerminal } from '@xterm/xterm';
import { useEffect, useRef } from 'react';
import '@xterm/xterm/css/xterm.css';
import useSecureSocket from '../socket';

const Terminal = () => {
  const socket = useSecureSocket();
  const terminalRef = useRef(null);
  const termRef = useRef(null);

  useEffect(() => {
    if (!socket || !terminalRef.current) return;

    const term = new XTerminal({
      rows: 20,
      cursorBlink: true,
      theme: {
        background: '#1e1e1e',
        foreground: '#ffffff',
      },
    });

    termRef.current = term;
    term.open(terminalRef.current);
    term.focus();

    term.onData(data => {
      socket.emit('terminal:write', data);
    });

    const handleServerData = data => {
      term.write(data);
    };

    socket.on('terminal:data', handleServerData);

    return () => {
      term.dispose();
      socket.off('terminal:data', handleServerData);
    };
  }, [socket]);

  return (
    <div
      ref={terminalRef}
      id="terminal"
      style={{
        height: '400px',
        backgroundColor: '#1e1e1e',
        overflow: 'hidden',
      }}
    />
  );
};

export default Terminal;
