import React, { useState } from 'react';
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

    const handleCheckIn = (name, amount) => {
        setHardwareSets(prevSets => prevSets.map(set => 
            set.name === name ? 
            {...set, available: Math.min(set.capacity, set.available + amount)} : set
        ));
    };

    const handleCheckOut = (name, amount) => {
        setHardwareSets(prevSets => prevSets.map(set => 
            set.name === name ? 
            {...set, available: Math.max(0, set.available - amount)} : set
        ));
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