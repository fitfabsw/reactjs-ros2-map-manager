import React, { useEffect, useState, useRef, useCallback } from 'react';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Button, Menu, MenuItem, Fab, Tooltip, Checkbox, FormControlLabel, Radio, RadioGroup, FormControl, FormLabel, TextField } from '@mui/material';
import dayjs from 'dayjs';
import "./Logs.css";
import ReplayIcon from '@mui/icons-material/Replay';
import DownloadIcon from '@mui/icons-material/CloudDownload';

// Move debounce function outside component to prevent recreation
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const Logs = () => {
    const defaultService = 'Select Service';
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
    const [autoScroll, setAutoScroll] = useState(() => {
        return sessionStorage.getItem('logsAutoScroll') === 'true';
    });
    const [lineCount, setLineCount] = useState(() => {
        return sessionStorage.getItem('logsLineCount') || '1000';
    });
    const logsColumnRef = useRef(null);
    const [searchKey, setSearchKey] = useState('');

    // Create debounced fetch using useCallback
    const debouncedFetchLogs = useCallback(
        debounce((value) => {
            // setSearchKey(value);
            fetchLogs(value);
        }, 500),
        []  // Empty dependency array
    );

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
            setDevices(data);
        } catch (error) {
            console.error('Error fetching devices:', error);
        }
    };

    useEffect(() => {
        fetchServices();
        fetchDevices();
    }, []);

    const fetchLogs = async (k) => {
        try {
            const formattedStart = startDate ? startDate.format('YYYY-MM-DDTHH:mm:ss') : "";
            const formattedEnd = endDate ? endDate.format('YYYY-MM-DDTHH:mm:ss') : "";
            const service = selectedService !== defaultService ? selectedService : '';
            const robotInfo = (selectedDevice === "central" || selectedDevice === undefined) ? '' : selectedDevice;
            const response = await fetch(
                `/api/logs?robot_info=${robotInfo}&service=${service}&start=${formattedStart}&end=${formattedEnd}&lines=${lineCount}&search=${k}`
            );
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

    const handleReset = () => {
        setStartDate(null);
        setEndDate(null);
        setSelectedService(defaultService);
        setSelectedDevice('');
        setLineCount('1000');
        setSearchKey('');
        
        sessionStorage.removeItem('logsStartDate');
        sessionStorage.removeItem('logsEndDate');
        sessionStorage.removeItem('logsSelectedService');
        sessionStorage.removeItem('logsSelectedDevice');
        sessionStorage.removeItem('logsLineCount');
        fetchLogs();
    };

    useEffect(() => {
        if (startDate || endDate || selectedService !== defaultService || selectedDevice || lineCount) {
            fetchLogs();
        }
    }, [startDate, endDate, selectedService, selectedDevice, lineCount]);

    const handleDownload = () => {
        const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
        const content = logs.join('\n');
        
        // Create blob and download
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${timestamp}.log`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const scrollToBottom = () => {
        if (logsColumnRef.current) {
            logsColumnRef.current.scrollTo({
                top: logsColumnRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    const scrollToTop = () => {
        if (logsColumnRef.current) {
            logsColumnRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [logs]);

    const handleAutoScrollChange = (event) => {
        setAutoScroll(event.target.checked);
        sessionStorage.setItem('logsAutoScroll', event.target.checked);
        if (event.target.checked) {
            scrollToBottom();
        } else {
            scrollToTop();
        }
    };

    const handleLineCountChange = (event) => {
        const newValue = event.target.value;
        setLineCount(newValue);
        sessionStorage.setItem('logsLineCount', newValue);
    };

    const handleSearch = (event) => {
        const newValue = event.target.value;
        setSearchKey(newValue);
        debouncedFetchLogs(newValue);
    };

    return (
        <div className="logs-container">
            <div className="logs-filter">
                <div className="logs-filter-header">
                    <h2>Logs Filters</h2>
                    <Button
                        startIcon={<ReplayIcon />}
                        onClick={handleReset}
                        size="small"
                    >
                        Reset
                    </Button>
                </div>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <div className="logs-filter-content">
                        <Button 
                            variant="contained" 
                            onClick={handleDeviceMenuClick}
                            className="menu-button"
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
                            className="menu-button"
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
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Lines</FormLabel>
                            <RadioGroup
                                row
                                name="lines"
                                value={lineCount}
                                onChange={handleLineCountChange}
                            >
                                <FormControlLabel value="500" control={<Radio size="small" />} label="500" />
                                <FormControlLabel value="1000" control={<Radio size="small" />} label="1000" />
                                <FormControlLabel value="5000" control={<Radio size="small" />} label="5000" />
                            </RadioGroup>
                        </FormControl>
                    </div>
                </LocalizationProvider>
            </div>
            <div className="logs-right-panel">
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search logs..."
                    value={searchKey}
                    onChange={handleSearch}
                    size="small"
                    className="logs-search"
                />
                <div className="logs-column">
                    <div className="logs-auto-scroll">
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={autoScroll}
                                    onChange={handleAutoScrollChange}
                                    size="small"
                                />
                            }
                            label="Scroll to Bottom"
                        />
                    </div>
                    <div className="logs-content" ref={logsColumnRef}>
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
                    <Tooltip title="Save logs">
                        <Fab 
                            color="primary"
                            className="download-fab"
                            onClick={handleDownload}
                        >
                            <DownloadIcon />
                        </Fab>
                    </Tooltip>
                </div>
            </div>
        </div>
    );
};

export default Logs;