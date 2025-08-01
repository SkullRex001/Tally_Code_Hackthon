import '../App.css';
import Terminal from '../components/Terminal';
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools";
import { useEffect, useState } from 'react';
import Folder from '../components/Folder';
import { useUser, useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import useSecureSocket from '../socket';
import { useSearchParams } from "react-router-dom";

function CodeEditor() {
  // ✅ Always declare all hooks unconditionally
  const { isLoaded, isSignedIn, user } = useUser();
  console.log(user)
  const { getToken } = useAuth();
  const socket = useSecureSocket();

  const [output, setOutput] = useState('');
  const [token, setToken] = useState('');
  const [file, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState('');
  const [code, setCode] = useState('');
  const [selectedFileContent, setSelectedFileContent] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [searchParams] = useSearchParams();



  const handleFileSelect = (path) => {
    setSelectedFile(JSON.stringify(path));
  };

  const fetchToken = async () => {
    const token = await getToken({ template: "Aditya", skipCache: true });
    console.log(token)
    return token;
  };

  const getFileTree = async () => {
    try {
      const token = await fetchToken();
      console.log("My token ", token);
      setToken(token);
      const projectName = searchParams.get("projectName");
      const projectId = searchParams.get("id");
      console.log(projectId)
      console.log(projectName)
      const response = await fetch("http://localhost:8000/files", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectId,
          projectName
        })
      });


      const result = await response.json();
      console.log(result)
      setFileTree(result.tree);

    } catch (error) {
      console.log("BAD RESPONSE");
    }

  };

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        const cleanedPath = selectedFile.replace(/["']/g, '');
        socket?.emit("file:change", {
          path: cleanedPath,
          content: code,
        });
        setIsSaved(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [code, selectedFile, isSaved, socket]);

  useEffect(() => {
    getFileTree();
  }, []);

  useEffect(() => {
    socket?.on("file:refresh", getFileTree);
    return () => socket?.off("file:refresh", getFileTree);
  }, [socket]);

  useEffect(() => {
    const getFileContent = async () => {
      if (!selectedFile) return;
      try {

        const projectName = searchParams.get("projectName");
        const projectId = searchParams.get("id");
         const url = `http://localhost:8000/files/content?path=${encodeURIComponent(selectedFile)}&projectName=${encodeURIComponent(projectName)}&projectId=${encodeURIComponent(projectId)}`;

        const response = await fetch(url, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        const result = await response.json();
        setSelectedFileContent(result.content);
      } catch (err) {
        console.log(err);
      }
    };
    getFileContent();
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFile && selectedFileContent) {
      setCode(selectedFileContent);
    }
  }, [selectedFileContent]);

  useEffect(() => {
    setIsSaved(code === selectedFileContent);
  }, [code, selectedFileContent]);

  useEffect(() => {
    setCode('');
  }, [selectedFile]);

  const runCodeFunction = async () => {
            const projectName = searchParams.get("projectName");
        const projectId = searchParams.get("id");
      const url = `http://localhost:8000/run?path=${encodeURIComponent(selectedFile)}&projectName=${encodeURIComponent(projectName)}&projectId=${encodeURIComponent(projectId)}`;
    const response = await fetch(url, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    const data = await response.json();
    setOutput(data.data);
  };

  // ✅ Handle early exits AFTER all hooks
  if (!isLoaded) return <div>Loading...</div>;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return (
    <div>
      <div className='editor'>
        <div className='fileStructure'>
          <Folder explorer={file} onSelect={handleFileSelect} path="" />
        </div>

        <div className='aceEditor'>
          {selectedFile ? (
            <>
              <div className='filePath'>
                {selectedFile.replaceAll("/", " > ")} 📂 {isSaved ? "Saved" : "Unsaved"}
              </div>
              <div className='editors'>
                <AceEditor
                  placeholder="//Write Your Code Here"
                  mode="javascript"
                  theme="monokai"
                  name="editor"
                  fontSize={14}
                  lineHeight={19}
                  showPrintMargin={true}
                  showGutter={true}
                  highlightActiveLine={true}
                  width='50vw'
                  height='70vh'
                  setOptions={{
                    enableBasicAutocompletion: true,
                    enableLiveAutocompletion: true,
                    enableSnippets: true,
                    showLineNumbers: true,
                    tabSize: 2,
                  }}
                  value={code}
                  onChange={setCode}
                />

                <div className='outputClass'>
                  <div className='output'>
                    <button className='button-31' onClick={runCodeFunction}>RUN</button>
                    <AceEditor height='70vh' value={output || ""} theme='twilight' />
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className='welcome'>
              Welcome to Spider_Editor 🕷️ <br /><br />
              Please Select a file to continue
            </div>
          )}
        </div>
      </div>

      <div className='terminal-container'>
        <Terminal />
      </div>
    </div>
  );
}

export default CodeEditor;
