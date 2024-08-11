import { useState } from "react";
import './Style.css';

function Folder({ explorer, onSelect, path = '' }) {
  const [expand, setExpand] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    if (!explorer.isFolder) {
      onSelect(path);
    }
  };

  if (explorer.isFolder) {
    return (
      <div style={{ marginTop: 5 }} onClick={handleClick}>
        <div className="folder" onClick={() => setExpand(!expand)}>
          <span>📁 {explorer.name}</span>
        </div>
        <div style={{ display: expand ? "block" : "none", paddingLeft: 15 }}>
          {explorer.items.map((exp) => {
            const newPath = `${path}/${exp.name}`;
            return <Folder key={exp.name} explorer={exp} onSelect={onSelect} path={newPath} />;
          })}
        </div>
      </div>
    );
  } else {
    return (
      <div onClick={handleClick} style={{ marginTop: 5 }}>
        <span className="file">
          📄 {explorer.name}
        </span>
      </div>
    );
  }
}

export default Folder;
