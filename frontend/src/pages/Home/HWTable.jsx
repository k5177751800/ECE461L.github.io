import React, { useState, useEffect } from 'react';
import { Button, FormControl, InputLabel, TextField, Typography, Select, MenuItem } from '@mui/material';
import { StyledTableCell, StyledTableRow } from './Home';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

const HWTableRow = ({ row, onCheckIn, onCheckOut, projects }) => {
    const [inputAmount, setInputAmount] = useState('');
    const [selectedProject, setSelectedProject] = useState('');

    const handleInputChange = (e) => {
        setInputAmount(e.target.value);
    };

    const extractProjectId = (selectedProject) => {
        const parts = selectedProject.split(':');
        return parts[parts.length - 1].trim();
    };

    // Handle check in event
    const handleCheckIn = (e) => {
        e.preventDefault();
        const amount = parseInt(inputAmount);
        const projectId = extractProjectId(selectedProject);
        if (!isNaN(amount) && projectId && amount > 0) {
            onCheckIn(row.name, amount, projectId);
            setInputAmount('');
            setSelectedProject('');
        }
    };

    // Handle check out event
    const handleCheckOut = (e) => {
        e.preventDefault();
        const amount = parseInt(inputAmount);
        const projectId = extractProjectId(selectedProject);
        if (!isNaN(amount) && projectId && amount > 0 && amount <= row.available) {
            onCheckOut(row.name, amount, projectId);
            setInputAmount('');
            setSelectedProject('');
        }   
    }

    const handleProjectChange = (e) => {
        setSelectedProject(e.target.value);
    }

    return (
        <StyledTableRow>
            <StyledTableCell component="th" scope="row">
                {row.name}
            </StyledTableCell>
            <StyledTableCell align="right">
                {row.available}/{row.capacity}
            </StyledTableCell>
            <StyledTableCell align="right">
                <TextField 
                    label="Quantity" 
                    variant="outlined" 
                    type="number"
                    size="small"
                    value={inputAmount}
                    onChange={handleInputChange}
                />
            </StyledTableCell>
            <StyledTableCell>
                <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <InputLabel>Select Project</InputLabel>
                    <Select
                        value={selectedProject}
                        onChange={handleProjectChange}
                    >
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>{project.name}: {project.id}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </StyledTableCell>
            <StyledTableCell align="center">
                <Button 
                    variant="contained" 
                    color="primary"
                    size="small"
                    onClick={handleCheckOut}
                    disabled={!inputAmount || !selectedProject || inputAmount <= 0 || inputAmount > row.available}
                    sx={{ mr: 1 }}
                >
                    Check Out
                </Button>
            </StyledTableCell>
            <StyledTableCell>
                <Button 
                    variant="outlined" 
                    color="secondary"
                    size="small"
                    onClick={handleCheckIn}
                    disabled={!inputAmount || !selectedProject || inputAmount <= 0 || row.available + parseInt(inputAmount) > row.capacity}
                >
                    Check In
                </Button>
            </StyledTableCell>
        </StyledTableRow>
    );
}

function HWTable({ projects, user, setProjects }) { 
    const [hardwareSets, setHardwareSets] = useState(null);
    
    useEffect(() => {
        fetch('http://127.0.0.1:5000/hardware', {
            headers: {
                'Content-Type': 'application/json',
            },
        })
          .then((response) => {
            if (!response.ok) throw new Error('Network response was not OK');
            return response.json();
          })
          .then((data) => setHardwareSets(data.hardwareSets))
          .catch((error) => console.error('Error fetching hardware sets:', error));
    }, []);

    const handleCheckIn = (name, amount, projectId) => {
        fetch('http://127.0.0.1:5000/hardware/checkin', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, amount, projectId }),
        })
          .then((response) => {
            if (!response.ok) {
                throw new Error('Check-in failed');
            }
            return response.json();
          })
          .then((data) => {
            setHardwareSets((prevSets) =>
              prevSets.map((set) =>
                set.name === name ? { ...set, available: data.available } : set
              )
            );
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                project.id === projectId ? {...project, hardware: {
                    ...project.hardware,
                    [name]: Math.max((project.hardware[name] || 0) - amount)
                }} : project
            ));
          })
          .catch((error) => console.error('Check-in error:', error));
      };

    const handleCheckOut = (name, amount, projectId) => {
        fetch('http://127.0.0.1:5000/hardware/checkout', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, amount, projectId }),
        })
          .then((response) => {
            if (!response.ok) {
                throw new Error('Check-in failed');
            }
            return response.json();
          })
          .then((data) => {
            setHardwareSets((prevSets) =>
              prevSets.map((set) =>
                set.name === name ? { ...set, available: data.available } : set
              ));
            setProjects((prevProjects) =>
                prevProjects.map((project) =>
                project.id === projectId ? {...project, hardware: {
                    ...project.hardware,
                    [name]: data.checked_out
                }} : project
                ));
          })
          .catch((error) => console.error('Check-out error:', error));
      };

    return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableBody>
                {hardwareSets && hardwareSets.length > 0 ? (
                    hardwareSets.map((row) => (
                    <HWTableRow 
                        key={row.name}
                        row={row}
                        onCheckOut={handleCheckOut}
                        onCheckIn={handleCheckIn}
                        projects={projects}
                    />
                ))) : (
                    <Typography>No hardware sets available</Typography>
                )}
            </TableBody>
          </Table>
        </TableContainer>
    );
};

export default HWTable;
