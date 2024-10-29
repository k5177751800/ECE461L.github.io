import React, { useState, useEffect } from 'react';
import { Button, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

// Styled table code taken from https://mui.com/material-ui/react-table/

const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
'&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
},
// hide last border
'&:last-child td, &:last-child th': {
    border: 0,
},
}));

function createData(name, available, capacity) {
    return { name, available, capacity };
}

const rows = [
    createData('HWSet1', 100, 100),
    createData('HWSet2', 100, 100),
    createData('HWSet3', 100, 100)
];

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
        if (!isNaN(amount) && amount > 0) {
            onCheckOut(row.name, amount);
            setInputAmount('');
        }
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
            <StyledTableCell align="right">
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
                <Button 
                    variant="outlined" 
                    color="secondary"
                    size="small"
                    onClick={handleCheckIn}
                >
                    Check In
                </Button>
            </StyledTableCell>
        </StyledTableRow>
    );
}

function HWTable() { 
    const [hardwareSets, setHardwareSets] = useState(rows);
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
          .then((response) => response.json())
          .then((data) => {
            setHardwareSets((prevSets) =>
              prevSets.map((set) =>
                set.name === name ? { ...set, available: data.available } : set
              )
            );
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
          .then((response) => response.json())
          .then((data) => {
            setHardwareSets((prevSets) =>
              prevSets.map((set) =>
                set.name === name ? { ...set, available: data.available } : set
              )
            );
          })
          .catch((error) => console.error('Check-out error:', error));
      };

    return (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableBody>
                {hardwareSets.map((row) => (
                    <HWTableRow 
                        key={row.name}
                        row={row}
                        onCheckOut={handleCheckOut}
                        onCheckIn={handleCheckIn}
                    />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
    );
};

export default HWTable;
