const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const cors = require("cors");
const fs = require("fs").promises;
const os = require("os");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const yaml = require("js-yaml"); // 需要安裝: npm install js-yaml
const db = require("./models");
const apiRoutes = require("./routes/api_v2");
// const apiRoutes = require("./routes/api");

const app = express();
app.use(cors());
app.use(express.json());

let imageBuffer = null;
let compressedImageBuffer = null;
let processedBuffer = null;
let outputPath = "";
let processedPath = "";
let scaleProcessed = 1;
// map size in pixel (from pgm file)
let mapYamlInfo = {};
let mapYamlInfoProcessed = {};
// const MAX_DIMENSION = 2000;
const MAX_DIMENSION = 750;

// 創建一個目錄來存儲轉換後的圖片
const CONVERTED_PATH = path.join(__dirname, "converted");
fs.mkdir(CONVERTED_PATH).catch(() => {}); // 如果目錄已存在則忽略錯誤

// 使用 ImageMagick 轉換 PGM 到 PNG or vice versa
async function convertBtwPngPgm(inputPath, outputPath) {
  try {
    const { stdout, stderr } = await execPromise(
      `convert "${inputPath}" "${outputPath}"`,
    );
    if (stderr) {
      console.error("ImageMagick stderr:", stderr);
    }
    if (stdout) {
      console.log("ImageMagick stdout:", stdout);
    }
  } catch (error) {
    console.error("ImageMagick error:", error);
    throw new Error(`ImageMagick conversion failed: ${error.message}`);
  }
}

// 讀取 YAML 文件
async function readYamlFile(filePath) {
  try {
    const yamlContent = await fs.readFile(filePath, "utf8");
    return yaml.load(yamlContent);
  } catch (error) {
    console.error("Error reading YAML file:", error);
    return null;
  }
}

// 添加保存 YAML 文件的函數
async function saveYamlFile(filePath, content) {
  try {
    const yamlContent = yaml.dump(content);
    await fs.writeFile(filePath, yamlContent, "utf8");
    console.log("YAML file saved successfully:", filePath);
  } catch (error) {
    console.error("Error saving YAML file:", error);
    throw error;
  }
}

app.post("/convert-pgm", async (req, res) => {
  try {
    const { mapId } = req.body; // 從請求中獲取 mapId
    console.log("mapId", mapId);
    console.log(typeof mapId);
    if (!mapId) {
      throw new Error("Map ID is required");
    }
    const map = await db.Map.findByPk(mapId);
    if (!map) {
      throw new Error("Map not found");
    }
    const pgmBuffer = map.pgm; // 獲取 pgm BLOB 數據
    const yamlBuffer = map.yaml; // 獲取 yaml BLOB 數據
    if (!pgmBuffer) {
      throw new Error("PGM data is missing");
    }

    // 將 BLOB 數據寫入臨時文件以進行處理
    const tempPgmPath = path.join(CONVERTED_PATH, `${mapId}.pgm`);
    await fs.writeFile(tempPgmPath, pgmBuffer); // 將 BLOB 寫入臨時文件

    const yamlData = yamlBuffer ? yaml.load(yamlBuffer.toString("utf8")) : null; // 讀取 YAML 數據
    const baseName = path.basename(tempPgmPath, ".pgm");
    const outputFileName = `${baseName}.png`;
    const processedFileName = `${baseName}_processed.png`;
    outputPath = path.join(CONVERTED_PATH, outputFileName);
    processedPath = path.join(CONVERTED_PATH, processedFileName);

    await convertBtwPngPgm(tempPgmPath, outputPath);
    const metadata = await sharp(outputPath).metadata();
    let { scaledWidth, scaledHeight, scale } = resizeImage(metadata);
    scaleProcessed = scale;
    imageBuffer = await sharp(outputPath).toBuffer();
    processedBuffer = imageBuffer;
    compressedImageBuffer = await sharp(imageBuffer)
      .resize(scaledWidth, scaledHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    await sharp(compressedImageBuffer).toFile(processedPath);
    console.log("Processed image saved to:", processedPath);

    mapYamlInfo.width = metadata.width; // in pixel
    mapYamlInfo.height = metadata.height;
    mapYamlInfo.resolution = yamlData?.resolution;
    mapYamlInfo.origin = yamlData?.origin;
    mapYamlInfoProcessed = { ...mapYamlInfo };

    const responseData = {
      image: compressedImageBuffer.toString("base64"),
      metadata: {
        mapWidth: metadata.width,
        mapHeight: metadata.height,
        origin: mapYamlInfo.origin.map((v) => -v),
        scale: scale,
        resolution: mapYamlInfo.resolution,
      },
    };

    res.json(responseData);
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({
      error: "Image conversion failed",
      details: error.message,
    });
  }
});

app.post("/rotate", async (req, res) => {
  try {
    const angle = parseInt(req.body.angle) || 0;
    const action = req.body.action || null;
    console.log("Rotating image by angle:", angle);

    processedBuffer = await sharp(imageBuffer)
      .rotate(angle, {
        background: { r: 205, g: 205, b: 205, alpha: 1.0 },
      })
      .toBuffer();

    const rotatedMetadata = await sharp(processedBuffer).metadata();
    console.log(
      "Rotated image dimensions:",
      rotatedMetadata.width,
      rotatedMetadata.height,
    );

    let { scaledWidth, scaledHeight, scale } = resizeImage(rotatedMetadata);
    scaleProcessed = scale;
    compressedImageBuffer = await sharp(processedBuffer)
      .resize(scaledWidth, scaledHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    // both in meter
    const [h, w] = [mapYamlInfo.height, mapYamlInfo.width].map(
      (v) => v * mapYamlInfo.resolution,
    );
    const [H, W] = [rotatedMetadata.height, rotatedMetadata.width].map(
      (v) => v * mapYamlInfo.resolution,
    );

    let angle_ = -angle;
    const angleRad = (angle_ * Math.PI) / 180;
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // deduced from the h & w & angle
    const H_meter = Math.abs(h * cos) + Math.abs(w * sin);
    const W_meter = Math.abs(h * sin) + Math.abs(w * cos);
    const H_pixel = Math.round(H_meter / mapYamlInfo.resolution);
    const W_pixel = Math.round(W_meter / mapYamlInfo.resolution);

    console.log(`H: ${rotatedMetadata.height}`);
    console.log(`W: ${rotatedMetadata.width}`);
    console.log(`H_pixel: ${H_pixel}`);
    console.log(`W_pixel: ${W_pixel}`);

    const [x, y] = mapYamlInfo.origin.map((v) => -v); // in meter
    let [X, Y] = [0, 0]; // in meter

    if (angle_ >= 0 && angle_ <= 90) {
      [X, Y] = [h * sin, 0];
    } else if (angle_ > 90 && angle_ <= 180) {
      [X, Y] = [W, -h * cos];
    } else if (angle_ >= -90 && angle_ < 0) {
      [X, Y] = [0, -w * sin];
    } else if (angle_ >= -180 && angle_ < -90) {
      [X, Y] = [-w * cos, H];
    }
    // origin in meter, map origin relative to bottom-left corner
    const originX = X + x * cos - y * sin;
    const originY = Y + x * sin + y * cos;
    // origin in meter, scaled, map origin relative to top-left corner with y-axis downwards
    const pixelX = Math.round((originX / mapYamlInfo.resolution) * scale);
    const pixelY = Math.round(((H - originY) / mapYamlInfo.resolution) * scale);

    console.log(`x: ${x}`);
    console.log(`y: ${y}`);
    console.log(`angle_: ${angle_}`);
    console.log(`sin: ${sin}`);
    console.log(`cos: ${cos}`);
    console.log(`h: ${h}`);
    console.log(`w: ${w}`);
    console.log(`H: ${H}`);
    console.log(`W: ${W}`);
    console.log(`W: W`);
    console.log("X: " + X);
    console.log("Y: " + Y);
    console.log(`originX: ${originX}`);
    console.log(`originY: ${originY}`);
    console.log(`pixelX: ${pixelX}`);
    console.log(`pixelY: ${pixelY}`);

    if (action == "apply") {
      imageBuffer = processedBuffer;
      mapYamlInfo = {
        ...mapYamlInfo,
        width: rotatedMetadata.width,
        height: rotatedMetadata.height,
        origin: [-originX, -originY],
      };
      mapYamlInfoProcessed.width = rotatedMetadata.width;
      mapYamlInfoProcessed.height = rotatedMetadata.height;
      mapYamlInfoProcessed.resolution = mapYamlInfo.resolution;
      mapYamlInfoProcessed.origin = [-originX, -originY];
    } else if (action == "cancel") {
      processedBuffer = imageBuffer;
    }

    const responseData = {
      image: compressedImageBuffer.toString("base64"),
      metadata: {
        // map width & height in pixels
        mapWidth: rotatedMetadata.width,
        mapHeight: rotatedMetadata.height,
        // origin in meter, map origin relative to bottom-left corner
        origin: [originX, originY],
        scale: scale,
      },
    };
    // 發送響應
    res.json(responseData);
  } catch (error) {
    console.error("Rotation error:", error);
    res.status(500).json({ error: "Image rotation failed" });
  }
});

function resizeImage(metadata, max_dimension = MAX_DIMENSION) {
  const { width, height } = metadata;
  let scale = 1;
  // if max_dimension is 0, do not resize
  if (max_dimension != 0) {
    if (width > height && width > max_dimension) {
      scale = max_dimension / width;
    } else if (height > max_dimension) {
      scale = max_dimension / height;
    }
  }
  const scaledWidth = Math.round(width * scale);
  const scaledHeight = Math.round(height * scale);
  console.log(`scale: ${scale}, Resizing to: ${scaledWidth}x${scaledHeight}`);
  return { scaledWidth, scaledHeight, scale };
}

app.post("/save-image", async (req, res) => {
  console.log("save-image !!");
  try {
    if (!compressedImageBuffer) {
      return res.status(400).json({
        error: "No image available to save",
      });
    }

    // 保存當前的圖片
    await sharp(processedBuffer).toFile(processedPath);
    console.log("Image saved to:", processedPath);

    // 轉換為 PGM
    const processedPgmPath = path.join(
      CONVERTED_PATH,
      path.basename(processedPath, ".png") + ".pgm",
    );
    await convertBtwPngPgm(processedPath, processedPgmPath);
    console.log("PGM conversion successful");

    // 保存 YAML 文件
    const yamlPath = processedPgmPath.replace(".pgm", ".yaml");
    const yamlContent = {
      image: path.basename(processedPgmPath),
      mode: "trinary",
      resolution: mapYamlInfoProcessed.resolution,
      origin: [...mapYamlInfoProcessed.origin, 0],
      negate: 0,
      occupied_thresh: 0.65,
      free_thresh: 0.25,
    };

    await saveYamlFile(yamlPath, yamlContent);
    console.log("YAML file saved to:", yamlPath);

    res.json({
      message: `Image and YAML files successfully saved to ${path.basename(processedPath)}`,
    });
  } catch (error) {
    console.error("Error saving files:", error);
    res.status(500).json({
      error: "Failed to save files",
      details: error.message,
    });
  }
});

app.post("/crop-image", async (req, res) => {
  try {
    const { crop } = req.body;
    // const metadata = await sharp(processedBuffer).metadata();
    const metadata = await sharp(imageBuffer).metadata();
    console.log("Original metadata:", metadata);
    console.log("Crop data received:", crop);
    console.log(`scaleProcessed: ${scaleProcessed}`);
    crop.x = crop.x / scaleProcessed;
    crop.y = crop.y / scaleProcessed;
    crop.width = crop.width / scaleProcessed;
    crop.height = crop.height / scaleProcessed;
    console.log("After scale:  Crop data received:", crop);

    const crop_m = {
      ...crop,
      x: crop.x * mapYamlInfo.resolution,
      y: crop.y * mapYamlInfo.resolution,
      width: crop.width * mapYamlInfo.resolution,
      height: crop.height * mapYamlInfo.resolution,
      unit: "m",
    };
    console.log("crop_m:", crop_m);

    // 直接使用像素值而不是百分比
    const cropData = {
      left: Math.max(0, Math.round(crop.x)),
      top: Math.max(0, Math.round(crop.y)),
      width: Math.min(
        metadata.width - Math.round(crop.x),
        Math.round(crop.width),
      ),
      height: Math.min(
        metadata.height - Math.round(crop.y),
        Math.round(crop.height),
      ),
    };
    console.log("Calculated crop data:", cropData);

    // 驗證裁剪區域
    if (
      cropData.width <= 0 ||
      cropData.height <= 0 ||
      cropData.left + cropData.width > metadata.width ||
      cropData.top + cropData.height > metadata.height
    ) {
      throw new Error("Invalid crop dimensions");
    }

    // 執行裁剪
    processedBuffer = await sharp(processedBuffer)
      .extract({
        left: cropData.left,
        top: cropData.top,
        width: cropData.width,
        height: cropData.height,
      })
      .toBuffer();
    imageBuffer = processedBuffer;

    // 更新元數據
    const newMetadata = await sharp(processedBuffer).metadata();
    console.log("New metadata after crop:", newMetadata);

    let { scaledWidth, scaledHeight, scale } = resizeImage(newMetadata);
    scaleProcessed = scale;
    compressedImageBuffer = await sharp(processedBuffer)
      .resize(scaledWidth, scaledHeight, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .toBuffer();

    const [x, y] = mapYamlInfoProcessed.origin.map((v) => -v); // in meter
    const [xc, yc, wc, hc] = [crop_m.x, crop_m.y, crop_m.width, crop_m.height];
    const H = metadata.height * mapYamlInfo.resolution;
    const originX = x - xc;
    const originY = y + hc + yc - H;

    mapYamlInfo = {
      ...mapYamlInfo,
      width: newMetadata.width,
      height: newMetadata.height,
      origin: [-originX, -originY],
    };
    mapYamlInfoProcessed = { ...mapYamlInfo };
    console.log("Updated map info:", mapYamlInfo);

    res.json({
      image: compressedImageBuffer.toString("base64"),
      metadata: {
        mapWidth: newMetadata.width,
        mapHeight: newMetadata.height,
        origin: [originX, originY],
        scale: scale,
      },
    });
  } catch (error) {
    console.error("Crop error:", error);
    res.status(500).json({
      error: "Failed to crop image",
      details: error.message,
      stack: error.stack,
    });
  }
});

// 添加 API 路由
app.use("/api", apiRoutes);

// 同步數據庫並啟動服務器
db.sequelize
  .sync()
  .then(() => {
    app.listen(5000, () => {
      console.log("Server is running on port 5000");
    });
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
