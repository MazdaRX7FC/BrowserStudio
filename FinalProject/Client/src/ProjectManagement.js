import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

const ProjectManagement = () => {
  const [projects, setProjects] = useState({});
  const navigate = useNavigate();

  // Load projects from localStorage on mount
  useEffect(() => {
    const storedProjects = JSON.parse(localStorage.getItem("projects") || "{}");
    setProjects(storedProjects);
  }, []);

  const loadProject = (name) => {
    localStorage.setItem("currentProject", JSON.stringify(projects[name]));
    navigate("/browser-studio");
  };

  const deleteProject = (name) => {
    const updated = { ...projects };
    delete updated[name];
    localStorage.setItem("projects", JSON.stringify(updated));
    setProjects(updated);
  };

  return (
    <div className="container">
      <h2>Browser Studio - Projects</h2>
      <ul id="projectList">
        {Object.keys(projects).length === 0 && <li>No saved projects</li>}
        {Object.keys(projects).map((name) => (
          <li key={name}>
            <strong>{name}</strong>
            <button onClick={() => loadProject(name)}>Load</button>
            <button onClick={() => deleteProject(name)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagement;