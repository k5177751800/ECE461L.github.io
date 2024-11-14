import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { StyledTableCell, StyledTableRow } from './Home';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';

// renders each row of the project table
const ProjectRow = React.memo(({ row, user, toggleProject }) => {
    // Helper function to check if all hardware quantities are zero
    const isAllHardwareZero = (hardware) => {
        return Object.values(hardware).every(amount => amount === 0);
    };

    return (
        <StyledTableRow>
            <StyledTableCell component="th" scope="row">
                {row.name || 'N/A'}
            </StyledTableCell>
            <StyledTableCell>
                {row.id || 'N/A'}
            </StyledTableCell>
            <StyledTableCell>
                {row.hardware && Object.keys(row.hardware).length > 0 && !isAllHardwareZero(row.hardware) ? 
                (Object.entries(row.hardware).filter(([_, amount]) => amount > 0)
                .map(([set, amount]) => (
                    <div key={set}>{set}: {amount}</div>
                ))) : (
                    'No hardware assigned'
                )}
            </StyledTableCell>
            <StyledTableCell>
                {row.description || 'N/A'}
            </StyledTableCell>
            <StyledTableCell>
                {Array.isArray(row.users) ? row.users.join(', ') : row.users || 'N/A'}
            </StyledTableCell>
            <StyledTableCell>
                {/* Button to join or leave the project */}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => toggleProject(row.id)}
                >
                    {row.users && row.users.includes(user) ? "Leave Project" : "Join Project"}
                </Button>
            </StyledTableCell>
        </StyledTableRow>
    );
});

// Main ProjectTable component displays all projects and allows joining/leaving and creating new projects
const ProjectTable = ({ user, projects, updateProjects }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("");
    const [projectErrorMessage, setProjectErrorMessage] = useState("");

    // Fetch the list of projects on component mount
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch(`http://localhost:5000/projects/${user}`);
                if (!response.ok) throw new Error('Network response was not OK');
                const data = await response.json();
                if (Array.isArray(data.projects)) {
                    updateProjects(data.projects);
                } else {
                    throw new Error("Error fetching projects");
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjectErrorMessage("Error fetching projects");
                updateProjects([]);
            }
        };

        if (user) {
            fetchProjects();
        }

    }, [user, updateProjects]);

    // to add a new project to the user's account
    const onAddProject = async () => {
        try {
            const response = await fetch(`http://localhost:5000/projects/addproject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: newProjectName, 
                    user: user,
                    description: newProjectDescription
                })
            });
            if (!response.ok) throw new Error('Network response was not OK');
            const data = await response.json();
            updateProjects(data.projects);
            setProjectErrorMessage("Project added successfully");
            setNewProjectName("");
            setNewProjectDescription("");
        } catch (error) {
            console.error('Error adding project:', error);
            setProjectErrorMessage('Unable to add project');
        }
    };

    // to toggle join/leave status for a project
    const toggleProject = async (projectId) => {
        try {
            const response = await fetch(`http://localhost:5000/projects/toggleproject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ projectid: projectId, user })
            });

            const data = await response.json();

            if (response.ok) {
                setProjectErrorMessage(data.message); // Display success or leave message to user
                // Update the projects list with the response
                updateProjects(data.projects);
            } else {
                setProjectErrorMessage(data.error || "Unable to toggle project status");
            }
        } catch (error) {
            console.error('Error toggling project status:', error);
            setProjectErrorMessage("Error toggling project status");
        }
    };

    return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="project table">
            <TableHead>
                <StyledTableRow>
                    <StyledTableCell>Project Name</StyledTableCell>
                    <StyledTableCell>Project ID</StyledTableCell>
                    <StyledTableCell>Hardware</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>Authorized Users</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                </StyledTableRow>
            </TableHead>
            <TableBody>
                {projects && projects.length > 0 ? (
                    projects.map((row) => (
                    <ProjectRow 
                        key={row.id}
                        row={row}
                        user={user}
                        toggleProject={toggleProject}
                    />
                ))) : (
                    <StyledTableRow>
                        <StyledTableCell colSpan={6} align="center" >
                            <Typography>No projects available</Typography>
                        </StyledTableCell>
                    </StyledTableRow>
                )}
                <StyledTableRow>
                    <StyledTableCell colSpan={2}>
                        <TextField
                        label="Project Name"
                        variant="outlined"
                        value={newProjectName || ''}
                        onChange={(e) => setNewProjectName(e.target.value)} />
                    </StyledTableCell>
                    <StyledTableCell colSpan={2}>
                        <TextField 
                        label="Project Description" 
                        variant="outlined" 
                        value={newProjectDescription || ''}
                        onChange={(e) => setNewProjectDescription(e.target.value)} />
                    </StyledTableCell>
                    <StyledTableCell colSpan={2}>
                        <Button
                            sx={{ mt: 3 }}
                            variant="contained"
                            onClick={onAddProject}>
                            Create New Project
                        </Button>
                    </StyledTableCell>
                </StyledTableRow>
            </TableBody>
          </Table>
          <Typography component="h2" variant="body2">
            {projectErrorMessage}
          </Typography>
        </TableContainer>
    );
};

export default ProjectTable;