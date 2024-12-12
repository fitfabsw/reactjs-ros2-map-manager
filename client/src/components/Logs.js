import React, { useEffect, useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import "./Logs.css";

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    useEffect(() => {
        const fetchLogs = async (start, end) => {
            try {
                console.log("fetching logs");
                const response = await fetch(`/api/logs?start=${start}&end=${end}`);
                const data = await response.json();
                setLogs(data.results);
            } catch (error) {
                console.error('Error fetching logs:', error);
            }
        };

        // Fetch logs when startDate or endDate changes
        if (startDate && endDate) {
            fetchLogs(startDate.format('YYYY-MM-DDTHH:mm:ss'), endDate.format('YYYY-MM-DDTHH:mm:ss'));
        }
    }, [startDate, endDate]);

    const handleStartDateChange = (newValue) => {
        setStartDate(newValue);
    };

    const handleEndDateChange = (newValue) => {
        setEndDate(newValue);
    };

    return (
        <div className="logs-container">
            <div className="logs-filter">
                <h2>Logs Filters</h2>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                        <DateTimePicker
                            label="Start Date"
                            value={startDate}
                            onChange={handleStartDateChange}
                        />
                        <DateTimePicker
                            label="End Date"
                            value={endDate}
                            onChange={handleEndDateChange}
                        />
                    </div>
                </LocalizationProvider>
            </div>
            <div className="logs-column">
                {logs.length > 0 ? (
                    logs.map((log, index) => (
                        <div key={index} className="log-entry">
                            {log} {/* Adjust according to your log structure */}
                        </div>
                    ))
                ) : (
                    <p>No logs available.</p>
                )}
            </div>
        </div>
    );
};

export default Logs;