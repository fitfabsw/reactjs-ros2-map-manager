const API_URL = "/api"; // API 基本路徑

// General CRUD
export const fetchTable = async (url) => {
  try {
    const response = await fetch(`${API_URL}/${url}s`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching table:", error);
    return []; // 返回空陣列以避免崩潰
  }
};

// Map CRUD
export const fetchMaps = async () => {
  const response = await fetch(`${API_URL}/maps`);
  return response.json();
};

export const fetchMapById = async (id) => {
  const response = await fetch(`${API_URL}/maps/${id}`);
  return response.json();
};

export const createMap = async (mapData) => {
  const response = await fetch(`${API_URL}/maps`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapData),
  });
  return response.json();
};

export const updateMap = async (id, mapData) => {
  const response = await fetch(`${API_URL}/maps/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(mapData),
  });
  return response.json();
};

export const deleteMap = async (id) => {
  await fetch(`${API_URL}/maps/${id}`, {
    method: "DELETE",
  });
};

// Robottype CRUD
export const fetchRobotTypes = async () => {
  const response = await fetch(`${API_URL}/robottypes`);
  return response.json();
};

export const fetchRobotTypeById = async (id) => {
  const response = await fetch(`${API_URL}/robottypes/${id}`);
  return response.json();
};

export const createRobotType = async (robotTypeData) => {
  const response = await fetch(`${API_URL}/robottypes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(robotTypeData),
  });
  return response.json();
};

export const updateRobotType = async (id, robotTypeData) => {
  const response = await fetch(`${API_URL}/robottypes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(robotTypeData),
  });
  return response.json();
};

export const deleteRobotType = async (id) => {
  await fetch(`${API_URL}/robottypes/${id}`, {
    method: "DELETE",
  });
};

// Robot CRUD
export const fetchRobots = async () => {
  const response = await fetch(`${API_URL}/robots`);
  return response.json();
};

export const fetchRobotById = async (id) => {
  const response = await fetch(`${API_URL}/robots/${id}`);
  return response.json();
};

export const createRobot = async (robotData) => {
  const response = await fetch(`${API_URL}/robots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(robotData),
  });
  return response.json();
};

export const updateRobot = async (id, robotData) => {
  const response = await fetch(`${API_URL}/robots/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(robotData),
  });
  return response.json();
};

export const deleteRobot = async (id) => {
  await fetch(`${API_URL}/robots/${id}`, {
    method: "DELETE",
  });
};

// Station CRUD
export const fetchStations = async () => {
  const response = await fetch(`${API_URL}/stations`);
  return response.json();
};

export const fetchStationById = async (id) => {
  const response = await fetch(`${API_URL}/stations/${id}`);
  return response.json();
};

export const createStation = async (stationData) => {
  const response = await fetch(`${API_URL}/stations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stationData),
  });
  return response.json();
};

export const updateStation = async (id, stationData) => {
  const response = await fetch(`${API_URL}/stations/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stationData),
  });
  return response.json();
};

export const deleteStation = async (id) => {
  await fetch(`${API_URL}/stations/${id}`, {
    method: "DELETE",
  });
};

// StationList CRUD
export const fetchStationLists = async () => {
  const response = await fetch(`${API_URL}/stationlists`);
  return response.json();
};

export const fetchStationListById = async (id) => {
  const response = await fetch(`${API_URL}/stationlists/${id}`);
  return response.json();
};

export const createStationList = async (stationListData) => {
  const response = await fetch(`${API_URL}/stationlists`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stationListData),
  });
  return response.json();
};

export const updateStationList = async (id, stationListData) => {
  const response = await fetch(`${API_URL}/stationlists/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stationListData),
  });
  return response.json();
};

export const deleteStationList = async (id) => {
  await fetch(`${API_URL}/stationlists/${id}`, {
    method: "DELETE",
  });
};

// Mask CRUD
export const fetchMasks = async () => {
  const response = await fetch(`${API_URL}/masks`);
  return response.json();
};

export const fetchMaskById = async (id) => {
  const response = await fetch(`${API_URL}/masks/${id}`);
  return response.json();
};

export const createMask = async (maskData) => {
  const response = await fetch(`${API_URL}/masks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(maskData),
  });
  return response.json();
};

export const updateMask = async (id, maskData) => {
  const response = await fetch(`${API_URL}/masks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(maskData),
  });
  return response.json();
};

export const deleteMask = async (id) => {
  await fetch(`${API_URL}/masks/${id}`, {
    method: "DELETE",
  });
};

export const fetchTableSchema = async (tableName) => {
  const response = await fetch(`${API_URL}/tables/${tableName}/schema`);
  return response.json();
};

export const uploadFile = async (table, id, column, file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("column", column);

  const response = await fetch(`${API_URL}/${table}s/${id}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
