import React, { useEffect, useState } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Button, Menu, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import "./Logs.css";

const Logs = () => {
    const defaultService = 'SELECT_SERVICE';
    const [logs, setLogs] = useState([]);
    const [startDate, setStartDate] = useState(() => {
        const saved = sessionStorage.getItem('logsStartDate');
        return saved ? dayjs(saved) : null;
    });
    const [endDate, setEndDate] = useState(() => {
        const saved = sessionStorage.getItem('logsEndDate');
        return saved ? dayjs(saved) : null;
    });
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(() => {
        return sessionStorage.getItem('logsSelectedService') || defaultService;
    });
    const [anchorEl, setAnchorEl] = useState(null);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            const data = await response.json();
            setServices(data.services);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchLogs = async () => {
        try {
            console.log("fetching logs");
            const formattedStart = startDate ? startDate.format('YYYY-MM-DDTHH:mm:ss') : "";
            const formattedEnd = endDate ? endDate.format('YYYY-MM-DDTHH:mm:ss') : "";
            const service = selectedService !== defaultService ? selectedService : '';
            const response = await fetch(`/api/logs?service=${service}&start=${formattedStart}&end=${formattedEnd}`);
            const data = await response.json();
            setLogs(data.results);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    const handleStartDateChange = (newValue) => {
        setStartDate(newValue);
        sessionStorage.setItem('logsStartDate', newValue ? newValue.toISOString() : '');
    };

    const handleEndDateChange = (newValue) => {
        setEndDate(newValue);
        sessionStorage.setItem('logsEndDate', newValue ? newValue.toISOString() : '');
    };

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleServiceSelect = (service) => {
        setSelectedService(service);
        sessionStorage.setItem('logsSelectedService', service);
        handleMenuClose();
    };

    useEffect(() => {
        if (startDate || endDate || selectedService !== defaultService) {
            fetchLogs();
        }
    }, [startDate, endDate, selectedService]);

    return (
        <div className="logs-container">
            <div className="logs-filter">
                <h2>Logs Filters</h2>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                        <Button 
                            variant="contained" 
                            onClick={handleMenuClick}
                            style={{ textTransform: 'none' }}
                        >
                            {selectedService || 'Select Service'}
                        </Button>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                        >
                            {services.map((service) => (
                                <MenuItem 
                                    key={service} 
                                    onClick={() => handleServiceSelect(service)}
                                    selected={service === selectedService}
                                >
                                    {service}
                                </MenuItem>
                            ))}
                        </Menu>
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
                {logs && logs.length > 0 ? (
                    logs.map((log, index) => (
                        <div key={index} className="log-entry">
                            {log}
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