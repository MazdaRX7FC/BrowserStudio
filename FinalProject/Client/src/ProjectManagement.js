import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./styles.css";

const ProjectManagement = () => {
  const [projects, setProjects] = useState({});
  const navigate = useNavigate();

  // Load projects from localStorage on mount
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user || !user.username) {
    alert("Please log in first.");
    navigate("/login");
    return;
  }

  const key = `projects_${user.username}`;
  const storedProjects = JSON.parse(localStorage.getItem(key) || "{}");
  setProjects(storedProjects);
}, []);

  const loadProject = (name) => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const key = `projects_${user.username}`;
  const projectData = projects[name];

  // Store project data along with its name
  localStorage.setItem("currentProject", JSON.stringify({ ...projectData, name }));

  navigate("/browserstudio");
};

const deleteProject = (name) => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const key = `projects_${user.username}`;
  const updated = { ...projects };
  delete updated[name];
  localStorage.setItem(key, JSON.stringify(updated));
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
            <button id="load" onClick={() => loadProject(name)}>Load</button>
            <button id="delete" onClick={() => deleteProject(name)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProjectManagement;