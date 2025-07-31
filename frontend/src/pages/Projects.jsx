import React, { useState } from 'react';
import './Home.css';
import {useUser}from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';

const Projects = () => {
  
  const { isLoaded, isSignedIn, user } = useUser();
  const [projects, setProjects] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateBlank = () => {
    setShowMenu(false);
    setShowModal(true);
  };

  const createProject = () => {
    if (newProjectName.trim()) {
      setProjects([...projects, { name: newProjectName.trim(), id: Date.now() }]);
      setNewProjectName('');
      setShowModal(false);
    }
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/" replace />;
  }


  return (
    <div className="home-container">
      <header>
        <h1>My IDE Projects</h1>
      </header>

      <div className="project-list">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            {project.name}
          </div>
        ))}

        <div className="create-project-wrapper">
          <div className="create-project" onClick={() => setShowMenu(!showMenu)}>+</div>

          {showMenu && (
            <div className="dropdown-menu">
              <div onClick={handleCreateBlank}>📝 Create Blank Project</div>
              <div onClick={() => alert("File import not implemented yet.")}>📁 Import from File</div>
              <div onClick={() => {
                const repo = prompt("Enter GitHub repo URL:");
                if (repo) {
                  setProjects([...projects, { name: `Cloned: ${repo}`, id: Date.now() }]);
                }
                setShowMenu(false);
              }}>🌐 Clone from GitHub</div>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Create New Project</h2>
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Enter project name"
            />
            <div className="modal-buttons">
              <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="create" onClick={createProject}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
