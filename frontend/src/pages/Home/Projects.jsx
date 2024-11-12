import React, { useState, useEffect } from 'react';
import { Button, TextField, Typography, Stack, StepButton } from '@mui/material';
import { StyledTableCell, StyledTableRow } from './Home';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import Paper from '@mui/material/Paper';

const MemberButton = ({ projectId }) => {
    const [isMember, setIsMember] = useState(false);

    const handleMemberToggle= () => {
        setIsMember(!isMember);
    };

    return (
        <Button
            onClick={handleMemberToggle}
            variant={isMember ? "outlined" : "contained"}
            color={isMember ? "secondary" : "primary"}>
            {isMember ? "Leave Project" : "Join Project"}
        </Button>
    );
};

const ProjectRow = ({ row }) => {
    return (
        <StyledTableRow>
            <StyledTableCell component="th" scope="row">
                {row.name || 'N/A'}
            </StyledTableCell>
            <StyledTableCell align="right">
                {row.id || 'N/A'}
            </StyledTableCell>
            <StyledTableCell align="right">
                {row.hardware && Object.entries(row.hardware).map(([set, amount]) => (
                    <div key={set}>{set}: {amount}</div>
                ))}
            </StyledTableCell>
            <StyledTableCell>
                {row.description || 'N/A'}
            </StyledTableCell>
            <StyledTableCell align="center">
                <MemberButton projectId={row.id}/>
            </StyledTableCell>
        </StyledTableRow>
    );
};

const ProjectTable = ({ user }) => {
    const [projects, setProjects] = useState([]);
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
                    setProjects(data.projects);
                } else {
                    throw new Error("Error fetching projects");
                }
            } catch (error) {
                console.error('Error fetching projects:', error);
            setProjectErrorMessage("Error fetching projects");
            setProjects([]);
            }
        };

        if (user) {
            fetchProjects();
        }
    }, [user]);

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
            setProjects(data.projects);
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
                    <StyledTableCell>Actions</StyledTableCell>
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
                    <StyledTableRow colSpan={5}>
                        <Typography>No projects available</Typography>
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