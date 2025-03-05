import React, { useState, useEffect, useRef } from "react";
import "./MaskManager.css";

function MaskManager() {
  const [maps, setMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(null);
  const [masks, setMasks] = useState([]);

  const imgRef = useRef(null);
  const [imageData, setImageData] = useState(null);
  const [originImageMeta, setOriginImageMeta] = useState(null);

  const [yamlData, setYamlData] = useState(null);

  const [mapid, setMapID] = useState(null);

  // 當前正在編輯的多邊形的點
  const [polygonPoints, setPolygonPoints] = useState([]);
  // 儲存的多邊形（每一筆都是一組點）
  const [savedPolygons, setSavedPolygons] = useState([]);
  // 是否允許點擊繪製多邊形
  const [drawingEnabled, setDrawingEnabled] = useState(false);
  // 用於儲存圖片顯示尺寸，供 SVG viewBox 使用
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  //編輯
  const handleButtonClick = () => {
    // alert(`You selected map ID: ${selectedMap}`);
    fetchImage(mapid);
    setDrawingEnabled(true); // 按下「編輯」後顯示新按鈕
    
  };

   //預覽
   const seeMaskButtonClick = () => {
    fetchImageMask(mapid);
    setDrawingEnabled(true); // 按下「編輯」後顯示新按鈕
  };
  
  //完成
  const finishButtonClick = () => {
    fetchImage(mapid);

    // 刪除正在編輯中的多邊形
    if (polygonPoints.length > 0) {
      setPolygonPoints([]);
    }
    // 進入最終模式
    setDrawingEnabled(false);

    exportToPGM();
  };

  //取消
  const cancelButtonClick = () => {
    fetchImage(mapid);

    // 刪除正在編輯中的多邊形
    if (polygonPoints.length > 0) {
      setPolygonPoints([]);
    }

    setSavedPolygons([]);

    // 進入最終模式
    setDrawingEnabled(false);
  };

  // 更新圖片尺寸（當圖片載入後更新）
  useEffect(() => {
    if (imgRef.current) {
      const updateSize = () => {
        setImgSize({
          width: imgRef.current.clientWidth,
          height: imgRef.current.clientHeight,
        });
      };
      updateSize();
      window.addEventListener("resize", updateSize);
      return () => window.removeEventListener("resize", updateSize);
    }
  }, [imageData]);

  // 點擊圖片時記錄點 (編輯模式才接受點擊)
  const handleClick = (e) => {
    if (!drawingEnabled) return;
    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPolygonPoints([...polygonPoints, { x, y }]);
  };

   // 將點陣列轉換成 SVG polygon 的 points 格式
   const getPointsString = (points) =>
    points.map((point) => `${point.x},${point.y}`).join(" ");

   // 根據是否為最終模式，決定多邊形的樣式
  const getPolygonElement = (points, key, isCurrent = false) => {
    const pointsString = getPointsString(points);
    const fill = !drawingEnabled ? "black" : isCurrent ? "rgba(255, 0, 0, 0.3)" : "rgba(0, 0, 255, 0.3)";
    const stroke = !drawingEnabled ? "black" : isCurrent ? "red" : "blue";
    return (
      <polygon
        key={key}
        points={pointsString}
        fill={fill}
        stroke={stroke}
        strokeWidth="2"
      />
    );
  };

 // 產生所有已儲存的多邊形元素
 const savedPolygonsElements = savedPolygons.map((polygon, index) =>
  getPolygonElement(polygon, `saved-${index}`)
);

// 當前正在編輯的多邊形元素（如果有點的話）
const currentPolygonElement =
  polygonPoints.length > 0 && getPolygonElement(polygonPoints, "current", true);


  //儲存目前多邊形並清空，讓使用者可開始繪製新的多邊形
  const handleSavePolygon = () => {
    if (polygonPoints.length > 0) {
      setSavedPolygons([...savedPolygons, polygonPoints]);
      setPolygonPoints([]); // 清空當前編輯的多邊形
    }
  };

  // 刪除目前正在編輯的多邊形（不影響已儲存的多邊形）
  const handleClearPolygon = () => {
    setPolygonPoints([]);
  };

  // 重置
  // const resetPolygon = () => {
  //   setSavedPolygons([]);
  // };

   //ExportToPGM（僅在最終模式下顯示）：將圖片與所有黑色多邊形輸出為 PGM 檔案
   const exportToPGM = () => {
    if (!imgRef.current) return;

    const { mapWidth, mapHeight, origin, resolution } = originImageMeta;

    // 取得圖片原始尺寸
const naturalWidth = mapWidth;
const naturalHeight = mapHeight;

// 取得圖片在頁面上的顯示尺寸
const displayedWidth = imgRef.current.clientWidth;
const displayedHeight = imgRef.current.clientHeight;

// 取得圖片的 CSS 樣式
const imgStyles = window.getComputedStyle(imgRef.current);
const objectFit = imgStyles.getPropertyValue("object-fit");

// 計算圖片等比例縮放後的有效顯示範圍
let effectiveWidth, effectiveHeight, offsetX, offsetY;
const aspectRatio = naturalWidth / naturalHeight;
const displayAspectRatio = displayedWidth / displayedHeight;

if (objectFit === "contain" || objectFit === "scale-down" || objectFit === "none") {
  // 圖片等比例縮放，可能有空白區域
  if (displayAspectRatio > aspectRatio) {
    // 以 `height` 為基準，圖片未填滿 `width`
    effectiveHeight = displayedHeight;
    effectiveWidth = displayedHeight * aspectRatio;
    offsetX = (displayedWidth - effectiveWidth) / 2; // X 軸空白區域
    offsetY = 0;
  } else {
    // 以 `width` 為基準，圖片未填滿 `height`
    effectiveWidth = displayedWidth;
    effectiveHeight = displayedWidth / aspectRatio;
    offsetX = 0;
    offsetY = (displayedHeight - effectiveHeight) / 2; // Y 軸空白區域
  }
} else {
  // `cover`, `fill` 不會有空白區域
  effectiveWidth = displayedWidth;
  effectiveHeight = displayedHeight;
  offsetX = 0;
  offsetY = 0;
}

// 計算等比例縮放比例
const scaleX = naturalWidth / effectiveWidth;
const scaleY = naturalHeight / effectiveHeight;

// 建立 Canvas
const canvas = document.createElement("canvas");
canvas.width = naturalWidth;
canvas.height = naturalHeight;
const ctx = canvas.getContext("2d");

// 繪製原圖到 Canvas
ctx.drawImage(imgRef.current, 0, 0, naturalWidth, naturalHeight);

// 繪製已儲存的多邊形
ctx.fillStyle = "black";
ctx.strokeStyle = "black";
ctx.lineWidth = 2;

savedPolygons.forEach((polygon) => {
  if (polygon.length < 2) return;
  ctx.beginPath();
  polygon.forEach((point, index) => {
    // 修正點的座標
    const x = (point.x - offsetX) * scaleX;
    const y = (point.y - offsetY) * scaleY;

    if (index === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  });
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
});

// 取得 Canvas 像素資料
const imageDataCanvas = ctx.getImageData(0, 0, naturalWidth, naturalHeight);
const pixels = imageDataCanvas.data;

// 轉換為灰階
const grayValues = [];
for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
  grayValues.push(gray);
}

    // // 組成 ASCII PGM 格式內容
    // let pgm = `P2\n${naturalWidth} ${naturalHeight}\n255\n`;
    // const valuesPerLine = 15;
    // for (let i = 0; i < grayValues.length; i++) {
    //   pgm += grayValues[i] + " ";
    //   if ((i + 1) % valuesPerLine === 0) {
    //     pgm += "\n";
    //   }
    // }
    //  // 建立 Blob 並觸發下載
    //  const blob = new Blob([pgm], { type: "application/octet-stream" });
    //  const url = URL.createObjectURL(blob);
    //  const a = document.createElement("a");
    //  a.href = url;
    //  a.download = "output.pgm";
    //  document.body.appendChild(a);
    //  a.click();
    //  document.body.removeChild(a);
    //  URL.revokeObjectURL(url);


     // 建立 header（使用 P5 魔數）
    const header = `P5\n${naturalWidth} ${naturalHeight}\n255\n`;

    // 將 header 轉成 Uint8Array（二進位編碼）
    const headerBytes = new TextEncoder().encode(header);

    // 將灰階數值轉為 Uint8Array（二進位資料）
    const pixelData = new Uint8Array(grayValues);

    // 建立一個新的 Uint8Array 用於組合 header 與像素資料
    const pgmBytes = new Uint8Array(headerBytes.length + pixelData.length);
    pgmBytes.set(headerBytes, 0);
    pgmBytes.set(pixelData, headerBytes.length);


    yamlData.image = `keepout_mask_${yamlData.image}`;

    handleEditMask(pgmBytes);

    //清空多邊形列表
     setSavedPolygons([]);
   };

  useEffect(() => {
    // 載入地圖列表
    fetch("/api/maps")
      .then((res) => res.json())
      .then((data) => setMaps(data))
      .catch((err) => console.error("Error loading maps:", err));
  }, []);

  useEffect(() => {
    if (selectedMap) {
      // 載入選定地圖的遮罩
      fetch(`/api/maps/${selectedMap}/masks`)
        .then((res) => res.json())
        .then((data) => setMasks(data))
        .catch((err) => console.error("Error loading masks:", err));
    }
  }, [selectedMap]);

  function onChangeMap(e) {
    setSelectedMap(e.target.value);
    let found = maps.find((m) => m.id === parseInt(e.target.value));
    fetchImage(found.id);
    setMapID(found.id);
  }

  // const fetchImage = async (mapfile) => {
  const fetchImageMask = async (map_id) => {
    try {
      const response = await fetch("/maskconvert-pgm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mapId: map_id }),
      });
      const data = await response.json();
      console.log(1111,data);
      if (response.ok) {
        console.log("Image Data:", data.image);
        setImageData(data.image);
        // setOriginImageMeta(data.metadata);
      } else {
        console.error("Error fetching image:", data.error);
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  // const fetchImage = async (mapfile) => {
    const fetchImage = async (map_id) => {
      try {
        const response = await fetch("/convert-pgm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ mapId: map_id }),
        });
        const data = await response.json();
        console.log(1111,data);
        if (response.ok) {
          console.log("Image Data:", data.image);
          setImageData(data.image);
          setYamlData(data.yaml);
          setOriginImageMeta(data.metadata);
        } else {
          console.error("Error fetching image:", data.error);
        }
      } catch (error) {
        console.error("Error fetching image:", error);
      }
    };


    // 修改Mask
    const handleEditMask = async (imagepgm) => {
      if (!imagepgm || !yamlData || !mapid) return;  

      // 將 Uint8Array 轉換為 base64 字串
  let binaryStr = '';
  for (let i = 0; i < imagepgm.length; i++) {
    binaryStr += String.fromCharCode(imagepgm[i]);
  }
  const base64PGM = window.btoa(binaryStr);

      try {
        const response = await fetch(`/api/masks/mapid/${mapid}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // stl_name: newName,
            // mid: selectedMap,
            pgm: base64PGM,
            yaml:yamlData,
          }),
        });
  
        if (response.ok) {
          //重新讀取Mask
          fetchImageMask(mapid);
          console.log("更新Masks成功");
        } else {
          console.error("更新Masks失敗");
          createMasks(base64PGM);
        }
      } catch (error) {
        console.error("更新Masks時發生錯誤:", error);
      }
    };

   //新增Mask
   const createMasks = async (base64PGM) => {
    if (!base64PGM || !yamlData || !mapid) return;

    try {
      const response = await fetch("/api/masks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pgm: base64PGM,
          yaml: yamlData,
          map_id: mapid,
        }),
      });
      if (response.ok) {
        //重新讀取Mask
        fetchImageMask(mapid);
        console.log("更新Masks成功");
      } else {
        console.error("Error creating station list:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating station list:", error);
    }
  };


  return (
    <div className="mask-manager">
      <div className="maskmap-selection">
        <h2>Select Maptest</h2>
        <select
          value={selectedMap || ""}
          onChange={onChangeMap}>
          <option value="">Select a map...</option>
          {maps.map((map) => (
            <option key={map.id} value={map.id}>
              {map.name} ({map.Robottype?.name})
            </option>
          ))}
        </select>

        {imageData && 
        <div className="extra-buttons">
          <button onClick={seeMaskButtonClick}style={{backgroundColor: "#008080", }}>編輯現有Mask</button>
          <button onClick={handleButtonClick}style={{backgroundColor: "#008080", }}>編輯空白Map</button>
          </div>
        }

        {drawingEnabled && 
        <div className="extra-buttons">
        <button onClick={handleSavePolygon}style={{backgroundColor: "#2196f3", }}>儲存當前圖形</button>
        <button onClick={handleClearPolygon}style={{backgroundColor: "#2196f3", }}>清除當前圖形</button>
        <button onClick={cancelButtonClick}style={{backgroundColor: "#ff0000", }}>取消編輯</button>
        <button onClick={finishButtonClick}>完成</button>
        </div>
        }
  
      </div>
        <div className="masks-grid">
          {imageData && (
          <img
            ref={imgRef}
              src={`data:image/png;base64,${imageData}`}
              alt="Maptest1"
              style={{
                maxWidth: "100%",
                height: "auto",
                display: "block",
              }}
              onClick={handleClick}
            />
          )}
          {imageData && (
          <svg
          // 利用 viewBox 讓 SVG 內部的座標系基於圖片原始尺寸，隨圖片縮放
          viewBox={`0 0 ${imgSize.width} ${imgSize.height}`}
           style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none", // 預設讓 SVG 不擋住滑鼠事件，如果需要接收事件則移除此屬性
        }}
      >
        {savedPolygonsElements}
        {currentPolygonElement}
      </svg>
          )}
        </div>
    </div>
  );
}

export default MaskManager;
