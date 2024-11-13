import React, { useState, useEffect, useCallback } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import { StyledTableCell, StyledTableRow } from './Home';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';

const ProjectRow = React.memo(({ row }) => {
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
        </StyledTableRow>
    );
});

const ProjectTable = ({ user, projects, updateProjects }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDescription, setNewProjectDescription] = useState("")
    const [projectErrorMessage, setProjectErrorMessage] = useState("");

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
                    description: newProjectDescription})
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
                </StyledTableRow>
            </TableHead>
            <TableBody>
                {projects && projects.length > 0 ? (
                    projects.map((row) => (
                    <ProjectRow 
                        key={row.id}
                        row={row}
                    />
                ))) : (
                    <StyledTableRow>
                        <StyledTableCell colspan={5} align="center" >
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
                    <StyledTableCell colspan={2}>
                        <TextField 
                        label="Project Description" 
                        variant="outlined" 
                        value={newProjectDescription || ''}
                        onChange={(e) => setNewProjectDescription(e.target.value)} />
                    </StyledTableCell>
                    <StyledTableCell>
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
}

export default ProjectTable;