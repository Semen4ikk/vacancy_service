import {useAuth} from "./token";
import {useEffect} from "react";
import axios from "axios";

const { refreshAccessToken } = useAuth();

useEffect(() => {
    const fetchData = async () => {
        try {
            await axios.get('/api/protected-route');
        } catch (error) {
            if (error.response?.status === 401) {
                await refreshAccessToken();
            }
        }
    };

    fetchData();
}, [refreshAccessToken]);
