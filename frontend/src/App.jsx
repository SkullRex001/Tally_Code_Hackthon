import './App.css'
import Terminal from './components/Terminal'
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/theme-twilight";
import "ace-builds/src-noconflict/ext-language_tools";
import { useCallback, useEffect, useState } from 'react';
import Folder from './components/Folder';
import socket from './socket';


function App() {

  const [output , setOutput] = useState('');

  const [file, setFileTress] = useState({});
  const [selectedFile, setSelectedFile] = useState('')
  const [code, setCode] = useState('')
  const [selectedFileContent, setSelectedFileContent] = useState("")

  const handleFileSelect = (path) => {
    console.log('Selected file path:', path)
    setSelectedFile(JSON.stringify(path))

  };


  const getFileTree = async () => {
    const response = await fetch("http://localhost:8000/files")
    const result = await response.json();
    console.log(result)
    setFileTress(result.tree)
  }


  const isSaved = selectedFileContent === code


  //   const getFileContent = useCallback( async ()=>{


  //     if(!selectedFile) return;

  //     console.log("SELECTED FILE" + selectedFile)

  //     const response = await fetch(`http://localhost:8000/files/content?path=${selectedFile}`);

  //     const result = await response.json();
  //     console.log(selectedFile + "Hii")

  //     console.log(result);

  //     setSelectedFileContent(result.content);


  //   }
  // , [selectedFile])

  useEffect(() => {
    getFileTree()
  }, [])

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree)
    }
  }, [])

  //sending code to backend it user does not type for 2 seconds

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        const cleanedPath = selectedFile.replace(/["']/g, '');
        console.log("Save code", code)
        socket.emit("file:change", {
          path: cleanedPath,
          content: code
        })
      }, 5 * 1000);
      return () => {
        clearTimeout(timer)
      }
    }
  }, [code, selectedFile, isSaved])

  useEffect(() => {
    // if(selectedFile) getFileContent();

    const getFileContent = async () => {

      try {
        if (!selectedFile) return;

        console.log("SELECTED FILE" + selectedFile)


        const response = await fetch(`http://localhost:8000/files/content?path=${encodeURIComponent(selectedFile)}`);

        const result = await response.json();
        console.log(selectedFile + "Hii")

        console.log(result);

        setSelectedFileContent(result.content);

      }

      catch (err) {
        console.log(err)
      }





    }

    getFileContent()



  }, [selectedFile])


  useEffect(() => {
    if (selectedFile && selectedFileContent) {
      setCode(selectedFileContent)
    }
  }, [selectedFile, selectedFileContent])

  useEffect(() => {
    setCode("");
  }, [selectedFile]);

  const runCodeFunction = async ()=>{
    const response = await fetch(`http://localhost:8000/run?path=.${selectedFile}`);
    console.log(selectedFile);
    const data = await response.json();

    setOutput(data.data)

  }


  return (
    <div>

      <div className='editor'>

        <div className='fileStructure'>

          <Folder explorer={file} onSelect={handleFileSelect} path="" />
        </div>

        <div className='aceEditor'>
          {
            selectedFile ? (
              <>

                <div className='filePath'>
                  {selectedFile && selectedFile.replaceAll("/", " > ")} 📂 {
                    isSaved ? "Saved" : "Unsaved"
                  }
                </div>
                <div className='editors'>
                <AceEditor
                  placeholder="//Write Your Code Here"
                  mode="javascript"
                  theme="monokai"
                  name="blah2"
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
                  onChange={e => {
                    setCode(e)
                    console.log(e)
                  }}

                /> 

                <div className='outputClass'>

                <div className='output'>
                  <button className='button-31' onClick={runCodeFunction}>RUN</button>

                <AceEditor height='70vh' value={output ? output: ""} theme='twilight'/>
                </div>

                </div>
                </div>
                
                </>) : <div className='welcome'>
              Welcome to Spider_Editor 🕷️ <br /> <br />
              Please Select a file to continue
            </div>
          }









        </div>

      </div>


      <div className='terminal-container'>
        <Terminal />
      </div>


    </div>
  )
}

export default App
