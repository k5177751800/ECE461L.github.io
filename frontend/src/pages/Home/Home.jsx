import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import { Stack } from '@mui/material';
import HWTable from './HWTable';
import ProjectTable from './Projects';

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
    const { auth, setAuth } = useAuth();
    const [userInfo, setUserInfo] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/home/user', {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        setAuth(null);
                        localStorage.removeItem('token');
                        throw new Error('Session expired. Please log in again');
                    }
                    throw new Error('Failed to fetch user info');
                }
                const data = await response.json();
                setUserInfo(data);
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        };

        if (auth) {
            fetchUserInfo();
        }

    }, [auth, setAuth]);

    if (!auth) {
        return <div>Please log in to use this page.</div>
    }

    return (
        <div>
            <h2>Welcome, {auth?.username}!</h2>
            <p> You have successfully logged in.</p>
            <Stack spacing={2} direction="row">
                <ProjectTable user={auth?.username}/>
                <HWTable />
            </Stack>
        </div>
    );
}

export default Home;