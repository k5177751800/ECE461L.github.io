import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
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
            variant={isMember ? "outilned" : "contained"}
            color={isMember ? "secondary" : "primary"}>
            {isMember ? "Leave Project" : "Join Project"}
        </Button>
    );
};

const ProjectRow = ({ row }) => {
    return (
        <StyledTableRow>
            <StyledTableCell component="th" scope="row">
                {row.name}
            </StyledTableCell>
            <StyledTableCell align="right">
                {row.id}
            </StyledTableCell>
            <StyledTableCell align="right">
                {row.description}
            </StyledTableCell>
            <StyledTableCell>
                {row.users}
            </StyledTableCell>
            <StyledTableCell>
                <MemberButton projectId={row.id}/>
            </StyledTableCell>
        </StyledTableRow>
    );
};

const ProjectTable = ({projects, onAddProject}) => {
    return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="project table">
            <TableHead>
                <StyledTableRow>
                    <StyledTableCell>Project Name</StyledTableCell>
                    <StyledTableCell>Project ID</StyledTableCell>
                    <StyledTableCell>Description</StyledTableCell>
                    <StyledTableCell>Project Users</StyledTableCell>
                    <StyledTableCell>Actions</StyledTableCell>
                </StyledTableRow>
            </TableHead>
            <TableBody>
                {projects.map((row) => (
                    <ProjectRow 
                        key={row.name}
                        row={row}
                    />
                ))}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            color="primary"
            onClick={onAddProject}
            sx={{ mt: 2, ml: 2 }}>
                Create New Project
          </Button>
        </TableContainer>
    );
}

export default ProjectTable;