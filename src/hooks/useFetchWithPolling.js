import { useState, useEffect, useRef, useCallback } from 'react';
import { getAuthHeader } from '../utils/auth';

const useFetchWithPolling = (url, interval = 30000, dependencies = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    const fetchData = useCallback(async (isPolling = false) => {
        try {
            const headers = getAuthHeader();
            if (!headers.Authorization) {
                if (mountedRef.current) {
                    setLoading(false);
                    setError({ status: 401, message: 'No authentication token found' });
                }
                return;
            }

            if (!isPolling) setLoading(true);

            const response = await fetch(url, { headers });

            if (!mountedRef.current) return;

            if (response.ok) {
                const jsonData = await response.json();
                if (mountedRef.current) {
                    setData(prevData => {
                        // Simple deep comparison to avoid unnecessary re-renders
                        if (JSON.stringify(prevData) === JSON.stringify(jsonData)) {
                            return prevData;
                        }
                        return jsonData;
                    });
                    setError(null);
                }
            } else {
                const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
                if (mountedRef.current) {
                    setError({ status: response.status, data: errorData });
                    // Handle auth errors specifically if needed, causing a re-login/logout
                    if (response.status === 401 || response.status === 403) {
                        console.error('Authentication error:', response.status, errorData);
                        // Optionally clear local storage or redirect here, 
                        // but usually better to let the component decide or use a global context
                    }
                }
            }
        } catch (err) {
            if (mountedRef.current) {
                console.error('Error fetching data:', err);
                setError({ message: err.message });
            }
        } finally {
            if (mountedRef.current && !isPolling) {
                setLoading(false);
            }
        }
    }, [url]);

    useEffect(() => {
        mountedRef.current = true;
        fetchData();

        const intervalId = setInterval(() => {
            fetchData(true);
        }, interval);

        return () => {
            mountedRef.current = false;
            clearInterval(intervalId);
        };
    }, [fetchData, interval, ...dependencies]);

    const refresh = () => fetchData(false);

    return { data, loading, error, refresh };
};

export default useFetchWithPolling;
