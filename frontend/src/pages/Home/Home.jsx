import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import HWTable from './HWTable';

// Styled table code taken from https://mui.com/material-ui/react-table/

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: 14,
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
'&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
},
// hide last border
'&:last-child td, &:last-child th': {
    border: 0,
},
}));

function Home() {
    const { auth } = useAuth();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            const token = localStorage.getItem('username');
            const response = await fetch('http://localhost:5000/home/user', {
                headers: { 'Authorization': 'Bearer ${token}' },
            });
            const data = await response.json();
            setUserInfo(data);
        };

        if (auth) {
            fetchUserInfo();
        }

    }, [auth]);

    return (
        <div>
            <h2>Welcome, {auth?.username}!</h2>
            <p> You have successfully logged in.</p>
            <HWTable />
        </div>
    );
}

export default Home;