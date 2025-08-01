import React, { useEffect, useState } from 'react';
import './Home.css';
import { useUser } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { hashProjectId } from '../utils/getRandomId';
import { useAuth } from '@clerk/clerk-react';


const Projects = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [projects, setProjects] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();



  const fetchToken = async () => {
    const token = await getToken({ template: "Aditya", skipCache: true });
    console.log(token)
    return token;
  };


  const handleCreateBlank = () => {
    setShowMenu(false);
    setShowModal(true);
  };


  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id) return;

      const token = await fetchToken();

      try {
        const res = await fetch(`http://localhost:8000/projects?user_id=${user.id}`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
          setProjects(data); // expected: [{ projectName, projectId }]
        } else {
          console.error("Failed to fetch projects:", data.error);
        }
      } catch (err) {
        console.error("❌ Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, [user?.id]);



  const createProject = async () => {
    if (newProjectName.trim()) {
      const id = await hashProjectId(newProjectName);
      const user_id = user.id;
      const token = await fetchToken();


      const response = await fetch("http://localhost:8000/projects", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id,
          newProjectName,
          newProjectId: id
        })
      });

      const newProject = await response.json();
      console.log(newProject);

      setProjects(prev => [...prev, {
        projectName: newProject.projectName,
        projectId: newProject.projectId,
      }]);
      setNewProjectName('');
      setShowModal(false);
    }

    console.log(projects);
  };

  const handleDelete = async (id) => {

    try {
      const user_id = user.id;
      const token = await fetchToken();
      const response = await fetch("http://localhost:8000/projects", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          user_id,
          deleteProjectId: id,
        })
      });

      const res = await response.json();
      console.log(res);

      setProjects(projects.filter(p => p.projectId !== id));
      setActiveProjectId(null);

    } catch (error) {

      console.log(error);
      return;

    }

  };

  const handleCode = (project) => {
    const query = new URLSearchParams({
      projectName: project.projectName,
      id: project.projectId
    }).toString();

    navigate(`/code?${query}`);
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
        {projects?.map((project, index) => (
          <div
            key={index}
            className="project-card"
            onClick={() => setActiveProjectId(project.projectId)}
          >
            {project.projectName}

            {activeProjectId === project.projectId && (
              <div className="project-options">
                <div onClick={() => handleCode(project)}>🧑‍💻 Code</div>
                <div onClick={() => handleDelete(project.projectId)}>🗑️ Delete</div>
              </div>
            )}
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
