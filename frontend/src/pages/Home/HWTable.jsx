import React, { useState, useEffect } from 'react';
import { Button, FormControl, InputLabel, TextField, Typography, Select } from '@mui/material';
import { StyledTableCell, StyledTableRow } from './Home';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import Paper from '@mui/material/Paper';

const HWTableRow = ({ row, onCheckIn, onCheckOut }) => {
    const [inputAmount, setInputAmount] = useState('');

    const handleInputChange = (e) => {
        setInputAmount(e.target.value);
    };

    // Handle check in event
    const handleCheckIn = (e) => {
        e.preventDefault();
        const amount = parseInt(inputAmount);
        if (!isNaN(amount) && amount > 0) {
            onCheckIn(row.name, amount);
            setInputAmount('');
        }
    };

    // Handle check out event
    const handleCheckOut = (e) => {
        e.preventDefault();
        const amount = parseInt(inputAmount);
        if (!isNaN(amount) && amount > 0 && amount <= row.available) {
            onCheckOut(row.name, amount);
            setInputAmount('');
        }   
    }

    const selectProject = (e) => {

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
                    <Select>

                    </Select>
                </FormControl>
            </StyledTableCell>
            <StyledTableCell align="center">
                <Button 
                    variant="contained" 
                    color="primary"
                    size="small"
                    onClick={handleCheckOut}
                    disabled={!inputAmount || inputAmount <= 0 || inputAmount > row.available}
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
                    disabled={!inputAmount || inputAmount <= 0 || row.available + parseInt(inputAmount) > row.capacity}
                >
                    Check In
                </Button>
            </StyledTableCell>
        </StyledTableRow>
    );
}

function HWTable() { 
    const [hardwareSets, setHardwareSets] = useState(null);
    // Retrieve the token from local storage or AuthContext if available

    useEffect(() => {
        fetch('http://localhost:5000/hardware', {
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

    const handleCheckIn = (name, amount) => {
        fetch('http://localhost:5000/hardware/checkin', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, amount }),
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
            console.log(data);
          })
          .catch((error) => console.error('Check-in error:', error));
      };

    const handleCheckOut = (name, amount) => {
        fetch('http://localhost:5000/hardware/checkout', {
          method: 'POST',
          headers: { 
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, amount }),
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
          })
          .catch((error) => console.error('Check-out error:', error));
      };

    const handleProjectSelect = (hwId, projectId) => {
        
    }

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
