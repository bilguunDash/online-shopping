import axios from 'axios';

const noAuthApi = axios.create({
    baseURL: 'http://localhost:8083',
    headers: { 'Content-Type': 'application/json' }
});

export default noAuthApi;