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
    const [devices, setDevices] = useState([]);
    const [selectedDevice, setSelectedDevice] = useState(() => {
        return sessionStorage.getItem('logsSelectedDevice') || '';
    });
    const [deviceAnchorEl, setDeviceAnchorEl] = useState(null);

    const fetchServices = async () => {
        try {
            const response = await fetch('/api/services');
            const data = await response.json();
            setServices(data.services);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchDevices = async () => {
        try {
            const response = await fetch('/api/devices');
            const data = await response.json();
            setDevices(data.devices);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    useEffect(() => {
        fetchServices();
        fetchDevices();
    }, []);

    const fetchLogs = async () => {
        try {
            console.log("fetching logs");
            const formattedStart = startDate ? startDate.format('YYYY-MM-DDTHH:mm:ss') : "";
            const formattedEnd = endDate ? endDate.format('YYYY-MM-DDTHH:mm:ss') : "";
            const service = selectedService !== defaultService ? selectedService : '';
            const ip = (selectedDevice === "central" || selectedDevice === undefined) ? '' : selectedDevice;
            const response = await fetch(`/api/logs?ip=${ip}&service=${service}&start=${formattedStart}&end=${formattedEnd}`);
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

    const handleDeviceMenuClick = (event) => {
        setDeviceAnchorEl(event.currentTarget);
    };

    const handleDeviceMenuClose = () => {
        setDeviceAnchorEl(null);
    };

    const handleDeviceSelect = (device) => {
        setSelectedDevice(device);
        sessionStorage.setItem('logsSelectedDevice', device);
        handleDeviceMenuClose();
    };

    useEffect(() => {
        if (startDate || endDate || selectedService !== defaultService || selectedDevice) {
            fetchLogs();
        }
    }, [startDate, endDate, selectedService, selectedDevice]);

    return (
        <div className="logs-container">
            <div className="logs-filter">
                <h2>Logs Filters</h2>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px' }}>
                        <Button 
                            variant="contained" 
                            onClick={handleDeviceMenuClick}
                            style={{ textTransform: 'none' }}
                        >
                            {selectedDevice || 'Select Device'}
                        </Button>
                        <Menu
                            anchorEl={deviceAnchorEl}
                            open={Boolean(deviceAnchorEl)}
                            onClose={handleDeviceMenuClose}
                        >
                            {devices.map((device) => (
                                <MenuItem 
                                    key={device} 
                                    onClick={() => handleDeviceSelect(device)}
                                    selected={device === selectedDevice}
                                >
                                    {device}
                                </MenuItem>
                            ))}
                        </Menu>
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