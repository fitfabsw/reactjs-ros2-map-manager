import React, { useState, useEffect } from "react";
import "./StationManager.css";
import StationCard from "./StationCard";

function StationManagerLeftNormal({
  maps,
  selectedMap,
  stationLists,
  setStationLists,
  onChangeMap,
  stationDetails,
  fetchStationDetails,
  // mode,
  // setmode,
  editMode,
  setEditMode,
  createStation,
  modifyStation,
  deleteStation,
  setStationPoints,
  setWaitingForLocation,
  selectedStationId,
  setSelectedStationId,
  setStationDetails,
}) {
  const [newStationListName, setNewStationListName] = useState("");
  const [isReordering, setIsReordering] = useState(false);
  const [draggedStation, setDraggedStation] = useState(null);
  const [dragOverStation, setDragOverStation] = useState(null);
  const [pendingOrderUpdates, setPendingOrderUpdates] = useState([]);

  const createStationList = async () => {
    if (!newStationListName || !selectedMap) return;

    try {
      const response = await fetch("/api/stationlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stl_name: newStationListName,
          mid: selectedMap,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setStationLists([...stationLists, data]);
        setNewStationListName("");
      } else {
        console.error("Error creating station list:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating station list:", error);
    }
  };

  const handleBackToNormal = async () => {
    setSelectedStationId(null);
    setEditMode(false);
    setStationPoints(null);
    // 重新載入當前地圖的站點列表
    if (selectedMap) {
      try {
        const response = await fetch(`/api/maps/${selectedMap}/stationlists`);
        const data = await response.json();
        if (response.ok) {
          setStationLists(data);
        } else {
          console.error("重新載入站點列表失敗:", data.error);
        }
      } catch (error) {
        console.error("重新載入站點列表時發生錯誤:", error);
      }
    }
  };

  const handleCreateNewStation = () => {
    const newStation = {
      st_name: "New Station",
      x: 0,
      y: 0,
      stl_id: stationDetails.id,
      type: "station",
      order: stationDetails.Stations.length + 1,
    };

    fetch("/api/stations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newStation),
    })
      .then((response) => response.json())
      .then((createdStation) => {
        createStation(createdStation);
      })
      .catch((error) => {
        console.error("創建站點失敗:", error);
      });
  };

  // 修改鍵盤事件處理部分
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!editMode || !stationDetails?.Stations.length) return;

      // 先按 order 排序站點
      const sortedStations = [...stationDetails.Stations].sort(
        (a, b) => a.order - b.order,
      );

      // 找到當前選中站點的索引
      const currentIndex = sortedStations.findIndex(
        (s) => s.id === selectedStationId,
      );

      if (currentIndex === -1) {
        // 如果沒有選中的站點，選擇第一個
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          setSelectedStationId(sortedStations[0].id);
        }
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          if (currentIndex > 0) {
            // 選擇上一個站點（order 值較小的）
            setSelectedStationId(sortedStations[currentIndex - 1].id);
            // 確保新選中的卡片可見
            const prevCard = document.querySelector(
              `[data-station-id="${sortedStations[currentIndex - 1].id}"]`,
            );
            prevCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          if (currentIndex < sortedStations.length - 1) {
            // 選擇下一個站點（order 值較大的）
            setSelectedStationId(sortedStations[currentIndex + 1].id);
            // 確保新選中的卡片可見
            const nextCard = document.querySelector(
              `[data-station-id="${sortedStations[currentIndex + 1].id}"]`,
            );
            nextCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [editMode, selectedStationId, stationDetails, setSelectedStationId]);

  // 修改站點列表名稱
  const handleEditStationList = async (e, list) => {
    e.stopPropagation(); // 防止觸發卡片的點擊事件
    const newName = prompt("請輸入新的站點列表名稱", list.stl_name);
    if (!newName || newName === list.stl_name) return;

    try {
      const response = await fetch(`/api/stationlists/${list.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stl_name: newName,
          mid: selectedMap,
        }),
      });

      if (response.ok) {
        const updatedList = await response.json();
        setStationLists((lists) =>
          lists.map((l) => (l.id === list.id ? updatedList : l)),
        );
      } else {
        console.error("更新站點列表失敗");
      }
    } catch (error) {
      console.error("更新站點列表時發生錯誤:", error);
    }
  };

  // 刪除站點列表
  const handleDeleteStationList = async (e, list) => {
    e.stopPropagation(); // 防止觸發卡片的點擊事件
    if (
      !window.confirm(
        `確定要刪除站點列表 "${list.stl_name}" 嗎？\n此操作將同時刪除列表中的所有站點。`,
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/stationlists/${list.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setStationLists((lists) => lists.filter((l) => l.id !== list.id));
      } else {
        console.error("刪除站點列表失敗");
      }
    } catch (error) {
      console.error("刪除站點列表時發生錯誤:", error);
    }
  };

  const handleDragStart = (e, station) => {
    if (!isReordering) return;
    setDraggedStation(station);
    e.currentTarget.classList.add("dragging");
  };

  const handleDragEnd = async (e) => {
    if (!isReordering) return;
    e.currentTarget.classList.remove("dragging");

    if (
      draggedStation &&
      dragOverStation &&
      draggedStation.id !== dragOverStation.id
    ) {
      const newStations = [...stationDetails.Stations];
      const draggedIndex = newStations.findIndex(
        (s) => s.id === draggedStation.id,
      );
      const dropIndex = newStations.findIndex(
        (s) => s.id === dragOverStation.id,
      );

      // 更新順序
      const updatedStations = newStations.map((station) => {
        if (draggedIndex < dropIndex) {
          if (
            station.order > draggedStation.order &&
            station.order <= dragOverStation.order
          ) {
            return { ...station, order: station.order - 1 };
          }
          if (station.id === draggedStation.id) {
            return { ...station, order: dragOverStation.order };
          }
        } else {
          if (
            station.order >= dragOverStation.order &&
            station.order < draggedStation.order
          ) {
            return { ...station, order: station.order + 1 };
          }
          if (station.id === draggedStation.id) {
            return { ...station, order: dragOverStation.order };
          }
        }
        return station;
      });

      // 收集需要更新的站點
      const updates = updatedStations
        .filter(
          (s) => s.order !== newStations.find((ns) => ns.id === s.id).order,
        )
        .map((s) => ({
          id: s.id,
          order: s.order,
        }));

      // 將更新添加到待更新列表
      setPendingOrderUpdates((prev) => [...prev, ...updates]);

      // 更新本地狀態
      const sortedStations = [...updatedStations].sort(
        (a, b) => a.order - b.order,
      );
      setStationDetails((prev) => ({ ...prev, Stations: sortedStations }));
    }

    setDraggedStation(null);
    setDragOverStation(null);
  };

  const handleDragOver = (e, station) => {
    if (!isReordering) return;
    e.preventDefault();
    if (station.id !== draggedStation?.id) {
      setDragOverStation(station);
    }
  };

  const handleFinishReordering = async () => {
    if (pendingOrderUpdates.length > 0) {
      try {
        // 批量更新所有待更新的站點順序
        const updatePromises = pendingOrderUpdates.map((update) =>
          fetch(`/api/stations/${update.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ order: update.order }),
          }),
        );

        await Promise.all(updatePromises);

        // 清空待更新列表
        setPendingOrderUpdates([]);
      } catch (error) {
        console.error("更新站點順序失敗:", error);
      }
    }

    setIsReordering(false);
  };

  const handleReorderClick = () => {
    if (isReordering) {
      // 點擊"完成排序"
      handleFinishReordering();
    } else {
      // 點擊"重新排序"
      setIsReordering(true);
      setPendingOrderUpdates([]); // 清空待更新列表
    }
  };

  return (
    <div className="station-left-panel">
      {!editMode && (
        <>
          <div className="map-selection">
            <h2>選擇地圖</h2>
            <select value={selectedMap || ""} onChange={onChangeMap}>
              <option value="">選擇地圖...</option>
              {maps.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.map} ({map.Robottype?.name})
                </option>
              ))}
            </select>
          </div>
          <div className="station-lists">
            <h2>站點列表</h2>
            <div className="station-list-creation">
              <input
                type="text"
                placeholder="站點列表名稱"
                value={newStationListName}
                onChange={(e) => setNewStationListName(e.target.value)}
              />
              <button onClick={createStationList}>建立站點列表</button>
            </div>
            <div className="station-lists-grid">
              {stationLists.map((list) => (
                <div key={list.id} className="station-list-card">
                  <div className="station-list-actions">
                    <button
                      className="icon-button edit"
                      onClick={(e) => handleEditStationList(e, list)}
                      title="修改名稱"
                    >
                      ✎
                    </button>
                    <button
                      className="icon-button delete"
                      onClick={(e) => handleDeleteStationList(e, list)}
                      title="刪除列表"
                    >
                      ×
                    </button>
                  </div>
                  <div
                    className="station-list-content"
                    onClick={() => fetchStationDetails(list.id)}
                  >
                    <h3>{list.stl_name}</h3>
                    <div className="station-count">
                      站點數量: {list.Stations?.length || 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {editMode && (
        <>
          <div className="station-edit-header">
            <button onClick={handleBackToNormal}>返回</button>
            <div className="right-buttons">
              <button onClick={handleCreateNewStation}>新增站點</button>
              <button
                onClick={handleReorderClick}
                className={isReordering ? "active" : ""}
              >
                {isReordering ? "完成排序" : "重新排序"}
              </button>
            </div>
          </div>
          <div className="station-cards">
            {stationDetails?.Stations.slice() // 創建陣列的副本，避免直接修改原陣列
              .sort((a, b) => a.order - b.order) // 按 order 值排序
              .map((station) => (
                <div
                  key={station.id}
                  draggable={isReordering}
                  onDragStart={(e) => handleDragStart(e, station)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e, station)}
                  className={`station-card-wrapper ${
                    draggedStation?.id === station.id ? "dragging" : ""
                  } ${isReordering ? "reordering" : ""}`}
                >
                  <StationCard
                    station={station}
                    onModify={(newDetails) =>
                      modifyStation(station.id, newDetails)
                    }
                    onDelete={() => deleteStation(station.id)}
                    setWaitingForLocation={setWaitingForLocation}
                    selectedStationId={selectedStationId}
                    setSelectedStationId={setSelectedStationId}
                    stationDetails={stationDetails}
                    isReordering={isReordering}
                  />
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  );
}

export default StationManagerLeftNormal;
