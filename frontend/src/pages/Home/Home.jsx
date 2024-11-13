import { useCallback, useEffect, useState, React } from 'react';
import { useAuth } from '../../AuthContext';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { styled } from '@mui/material/styles';
import { Stack, Select, MenuItem, Button, Modal, Box, Typography } from '@mui/material';
import HWTable from './HWTable';
import ProjectTable from './Projects';
import { useNavigate } from 'react-router-dom'; 

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
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

function Home() {
    const { auth, setAuth } = useAuth();
    const [userInfo, setUserInfo] = useState(null);
    const [projects, setProjects] = useState([]);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const navigate = useNavigate();

    const updateProjects = useCallback((newProjects) => {
        setProjects(newProjects);
    }, []);

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

    const handleLogout = () => {
        setAuth(null);
        localStorage.removeItem('token');
        navigate('/'); 
    };

    if (!auth) {
        return <div>
            <Box style={{ position: 'absolute', top: 16, right: 16, color: 'white' }}>
            <Button variant="contained" color="error" onClick={handleLogout} >Log in</Button>
            </Box>
            Please log in to use this page.
            </div>
    }

    return (
        <div>
            <h2>Welcome, {auth?.username}!</h2>
            <p>You have successfully logged in.</p>
            <Button
                variant="contained"
                color="error"
                style={{ position: 'absolute', top: 16, right: 16, color: 'white' }}
                onClick={() => setShowLogoutModal(true)}
            >
                Logout
            </Button>
            <Modal
                open={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                aria-labelledby="logout-modal-title"
                aria-describedby="logout-modal-description"
            >
                <Box sx={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    width: 300, 
                    bgcolor: 'background.paper', 
                    boxShadow: 24, 
                    p: 4, 
                    borderRadius: 2 
                }}>
                    <Typography id="logout-modal-title" variant="h6" component="h2">
                        Are you sure you want to logout?
                    </Typography>
                    <Stack direction="row" spacing={2} mt={2}>
                        <Button variant="contained" color="error" onClick={handleLogout}>
                            Yes
                        </Button>
                        <Button variant="outlined" onClick={() => setShowLogoutModal(false)}>
                            No
                        </Button>
                    </Stack>
                </Box>
            </Modal>
            <Stack spacing={2} direction="row" useFlexGap>
                <ProjectTable user={auth?.username} projects={projects} updateProjects={updateProjects} />
                <HWTable user={auth?.username} projects={projects} setProjects={setProjects} />
            </Stack>
        </div>
    );
}

export default Home;
