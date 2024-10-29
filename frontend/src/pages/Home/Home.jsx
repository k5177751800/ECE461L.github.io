import { useEffect, useState } from 'react';
import { useAuth } from '../../AuthContext';
import HWTable from './HWTable';

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