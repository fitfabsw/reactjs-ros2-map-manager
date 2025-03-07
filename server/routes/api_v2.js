const express = require("express");
const router = express.Router();
const db = require("../models");
const { exec } = require("child_process"); // Import exec from child_process

const app = express();

// 設定 json 請求體的大小限制為 50MB
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const yaml = require("js-yaml");


const REMOTE_LOG_DIR = "/var/log/journal/remote";
var robot_info_to_ip = [];
function fetch_robot_info() {
  exec(`ls ${REMOTE_LOG_DIR}`, (error, stdout, stderr) => {
    if (error) {
      console.log(error);
    }
    if (stderr) {
      console.log(stderr);
    }
    const filenames = stdout.split('\n')
        .filter(filename => filename.endsWith('.journal') && filename.length < 31);
    const ip_array = filenames.map(filename => {
      const match = filename.match(/remote-(\d+\.\d+\.\d+\.\d+)\.journal/);
      return match ? match[1] : null;
    }).filter(ip => ip !== null);

    const promises = filenames.map(filename => {
      return new Promise((resolve, reject) => {
        exec(`sudo journalctl --file ${REMOTE_LOG_DIR}/${filename} -u fitrobot.robot-info.service | grep 'ROBOT_INFO' | tail -n 1 | awk -F'ROBOT_INFO=' '{print $2}'`, (error, stdout, stderr) => {
          if (error) {
            return reject(error);
          }
          if (stderr) {
            return reject(stderr);
          }
          resolve(stdout.trim()||"unknown_robot");
        });
      });
    });

    Promise.all(promises)
      .then(results => {
        robot_info_array = results;
        robot_data = ip_array.map((ip, index) => ({ ip, info: robot_info_array[index] }));

        robot_info_to_ip = robot_data.reduce((acc, { ip, info }) => {
          if (!acc[info]) {
            acc[info] = [];
          }
          acc[info].push(ip);
          return acc;
        }, {});
      })
      .catch(err => {
        console.log(err);
      });
  });
}

fetch_robot_info();
setInterval(() => {
  fetch_robot_info();
}, 10000);


// Robottype CRUD
router.get("/robottypes", async (req, res) => {
  console.log("get robottypes");
  try {
    const robottypes = await db.Robottype.findAll();
    res.json(robottypes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/robottypes/:id", async (req, res) => {
  console.log("get robottypes/id");
  try {
    const robottype = await db.Robottype.findByPk(req.params.id);
    if (robottype) {
      res.json(robottype);
    } else {
      res.status(404).json({ error: "Robottype not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/robottypes", async (req, res) => {
  console.log("post robottypes");
  try {
    const robottype = await db.Robottype.create(req.body);
    res.status(201).json(robottype);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/robottypes/:id", async (req, res) => {
  try {
    const robottype = await db.Robottype.findByPk(req.params.id);
    if (robottype) {
      await robottype.update(req.body);
      res.json(robottype);
    } else {
      res.status(404).json({ error: "Robottype not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/robottypes/:id", async (req, res) => {
  try {
    const robottype = await db.Robottype.findByPk(req.params.id);
    if (robottype) {
      await robottype.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Robottype not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Map CRUD
router.get("/maps", async (req, res) => {
  try {
    const maps = await db.Map.findAll({
      attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
      include: [db.Robottype],
    });
    res.json(maps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/maps/:id", async (req, res) => {
  try {
    const map = await db.Map.findByPk(req.params.id, {
      attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
      include: [db.Robottype],
    });
    if (map) {
      res.json(map);
    } else {
      res.status(404).json({ error: "Map not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/maps", async (req, res) => {
  try {
    const map = await db.Map.create(req.body);
    res.status(201).json(map);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/maps/:id", async (req, res) => {
  try {
    const map = await db.Map.findByPk(req.params.id);
    if (map) {
      await map.update(req.body);
      res.json(map);
    } else {
      res.status(404).json({ error: "Map not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/maps/:id", async (req, res) => {
  try {
    const map = await db.Map.findByPk(req.params.id);
    if (map) {
      await map.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Map not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增路由來上傳 BLOB 數據
router.post("/maps/:id/blob", async (req, res) => {
  try {
    const map = await db.Map.findByPk(req.params.id);
    if (map) {
      // 假設 BLOB 數據在 req.body 中
      map.blobField = req.body.blobField; // 更新 BLOB 字段
      await map.save();
      res.status(200).json({ message: "BLOB data uploaded successfully" });
    } else {
      res.status(404).json({ error: "Map not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 新增路由來下載 BLOB 數據
// router.get("/maps/:id/blob", async (req, res) => {
router.get("/maps/:id/pgm", async (req, res) => {
  try {
    const map = await db.Map.findByPk(req.params.id);
    if (map) {
      res.status(200).send(map.pgm); // 返回 BLOB 數據
      // res.status(200).json({
      //   pgm: map.pgm,
      //   yaml: map.yaml,
      //   thumbnail: map.thumbnail,
      // }); // 返回多個 BLOB 數據
      // res.status(200).send(map.blobField); // 返回 BLOB 數據
    } else {
      res.status(404).json({ error: "Map not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Robot CRUD
router.get("/robots", async (req, res) => {
  try {
    const robots = await db.Robot.findAll({
      include: [db.Robottype],
    });
    res.json(robots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/robots/:id", async (req, res) => {
  try {
    const robot = await db.Robot.findByPk(req.params.id, {
      include: [db.Robottype],
    });
    if (robot) {
      res.json(robot);
    } else {
      res.status(404).json({ error: "Robot not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/robots", async (req, res) => {
  try {
    const robot = await db.Robot.create(req.body);
    res.status(201).json(robot);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/robots/:id", async (req, res) => {
  try {
    const robot = await db.Robot.findByPk(req.params.id);
    if (robot) {
      await robot.update(req.body);
      res.json(robot);
    } else {
      res.status(404).json({ error: "Robot not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/robots/:id", async (req, res) => {
  try {
    const robot = await db.Robot.findByPk(req.params.id);
    if (robot) {
      await robot.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Robot not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加一個額外的路由來根據 robottype_id 和 sn 查詢機器人
router.get("/robots/find/:robottype_id/:sn", async (req, res) => {
  try {
    const robot = await db.Robot.findOne({
      where: {
        robottype_id: req.params.robottype_id,
        sn: req.params.sn,
      },
      include: [db.Robottype],
    });
    if (robot) {
      res.json(robot);
    } else {
      res.status(404).json({ error: "Robot not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 添加一個路由來根據 robottype_id 獲取所有機器人
router.get("/robots/bytype/:robottype_id", async (req, res) => {
  try {
    const robots = await db.Robot.findAll({
      where: {
        robottype_id: req.params.robottype_id,
      },
      include: [db.Robottype],
    });
    res.json(robots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// StationList CRUD
router.get("/stationlists", async (req, res) => {
  try {
    const { map_id, stl_name } = req.query; // 從查詢參數中獲取 map_id

    const queryOptions = {
      include: [
        {
          model: db.Map,
          attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
          include: [db.Robottype],
        },
        {
          model: db.Station,
        },
      ],
    };

    // Initialize where clause
    queryOptions.where = {};

    // 如果提供了 map_id，則添加過濾條件
    if (map_id) {
      queryOptions.where.map_id = map_id; // 假設 StationList 有 map_id 屬性
    }
    if (stl_name) {
      queryOptions.where.name = stl_name; // 假設 StationList 有 name 屬性
    }

    const stationLists = await db.StationList.findAll(queryOptions);
    res.json(stationLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stationlists/:id", async (req, res) => {
  try {
    const stationList = await db.StationList.findByPk(req.params.id, {
      include: [
        {
          model: db.Map,
          attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
          include: [db.Robottype],
        },
        {
          model: db.Station,
        },
      ],
    });
    if (stationList) {
      res.json(stationList);
    } else {
      res.status(404).json({ error: "StationList not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ex: /api/stationlists/find/fit_newoffice_3fp/lino2/for_dqe
router.get(
  "/stationlists/find/:mapName/:robotTypeName/:stl_name",
  async (req, res) => {
    try {
      const { mapName, robotTypeName, stl_name } = req.params;
      // 查詢 StationList，並根據 mapName 和 robotTypeName 進行過濾
      // const stationList = await db.StationList.findOne({
      const stationList = await db.StationList.findAll({
        where: { name: stl_name },
        include: [
          {
            model: db.Map,
            where: { name: mapName }, // 假設 Map 模型有 name 屬性
            attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
            include: [
              {
                model: db.Robottype,
                where: { name: robotTypeName }, // 假設 Robottype 模型有 name 屬性
              },
            ],
          },
          {
            model: db.Station,
          },
        ],
      });
      if (stationList) {
        res.json(stationList);
      } else {
        res.status(404).json({ error: "StationList not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
);

router.post("/stationlists", async (req, res) => {
  try {
    const stationList = await db.StationList.create(req.body);
    res.status(201).json(stationList);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/stationlists/:id", async (req, res) => {
  try {
    const stationList = await db.StationList.findByPk(req.params.id);
    if (stationList) {
      await stationList.update(req.body);
      res.json(stationList);
    } else {
      res.status(404).json({ error: "StationList not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/stationlists/:id", async (req, res) => {
  try {
    const stationList = await db.StationList.findByPk(req.params.id);
    if (stationList) {
      await stationList.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "StationList not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// StationjCRUD
router.get("/stations", async (req, res) => {
  try {
    const stations = await db.Station.findAll({
      // include: [
      //   {
      //     model: db.StationList,
      //     include: [
      //       {
      //         model: db.Map,
      //         attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
      //         include: [db.Robottype],
      //       },
      //     ],
      //   },
      // ],
    });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/stations/:id", async (req, res) => {
  try {
    const station = await db.Station.findByPk(req.params.id, {
      // include: [
      //   {
      //     model: db.StationList,
      //     include: [
      //       {
      //         model: db.Map,
      //         attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
      //         include: [db.Robottype],
      //       },
      //     ],
      //   },
      // ],
    });
    if (station) {
      res.json(station);
    } else {
      res.status(404).json({ error: "Station not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/stations", async (req, res) => {
  console.log("post stations");
  console.log(req.body);
  try {
    const station = await db.Station.create(req.body);
    res.status(201).json(station);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.put("/stations/:id", async (req, res) => {
  try {
    const station = await db.Station.findByPk(req.params.id);
    if (station) {
      await station.update(req.body);
      res.json(station);
    } else {
      res.status(404).json({ error: "Station not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/stations/:id", async (req, res) => {
  try {
    const station = await db.Station.findByPk(req.params.id);
    if (station) {
      await station.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Station not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根據 StationList ID 獲取所有站點
router.get("/stationlists/:id/stations", async (req, res) => {
  try {
    const stations = await db.Station.findAll({
      where: {
        stationlist_id: req.params.id,
      },
      include: [
        {
          model: db.StationList,
          include: [
            {
              model: db.Map,
              attributes: ["id"],
              include: [db.Robottype],
            },
          ],
        },
      ],
    });
    res.json(stations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根據 Map ID 獲取所有 StationList，只返回 map_id
router.get("/maps/:id/stationlists", async (req, res) => {
  try {
    const stationLists = await db.StationList.findAll({
      where: {
        map_id: req.params.id,
      },
      attributes: ["id", "map_id", "name"], // 只返回 id 和 map_id
      include: [
        {
          model: db.Map,
          attributes: ["id"], // 只返回 map 的 id
          include: [db.Robottype],
        },
        {
          model: db.Station,
          // attributes: ["id"], // 只返回 station 的 id
        },
      ],
    });
    res.json(stationLists);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mask CRUD
router.get("/masks", async (req, res) => {
  try {
    const masks = await db.Mask.findAll({
      attributes: { exclude: ["pgm", "yaml"] },
      include: [
        {
          model: db.Map,
          attributes: ["id"],
          include: [db.Robottype],
        },
      ],
    });
    res.json(masks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/masks/:id", async (req, res) => {
  try {
    const mask = await db.Mask.findByPk(req.params.id, {
      attributes: { exclude: ["pgm", "yaml"] },
      include: [
        {
          model: db.Map,
          attributes: ["id"],
          include: [db.Robottype],
        },
      ],
    });
    if (mask) {
      res.json(mask);
    } else {
      res.status(404).json({ error: "Mask not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/masks", async (req, res) => {
  try {
    req.body.pgm = Buffer.from(req.body.pgm, 'base64');
    yamlContent = yaml.dump(req.body.yaml);
    req.body.yaml = Buffer.from(yamlContent, "utf8");

    const mask = await db.Mask.create(req.body);
    res.status(201).json(mask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/masks/:id", async (req, res) => {
  try {
    const mask = await db.Mask.findByPk(req.params.id);
    if (mask) {
      await mask.update(req.body);
      res.json(mask);
    } else {
      res.status(404).json({ error: "Mask not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/masks/:id", async (req, res) => {
  try {
    const mask = await db.Mask.findByPk(req.params.id);
    if (mask) {
      await mask.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Mask not found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根據地圖 ID 獲取所有遮罩
router.get("/maps/:id/masks", async (req, res) => {
  try {
    const masks = await db.Mask.findAll({
      where: {
        map_id: req.params.id,
      },
      include: [
        {
          model: db.Map,
          include: [db.Robottype],
        },
      ],
    });
    res.json(masks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 根據地圖 ID 更新Mask
router.put("/masks/mapid/:map_id", async (req, res) => {
  try {
    console.log(`正在尋找 map_id = ${req.params.map_id}`);
    const mask = await db.Mask.findOne({ where: { map_id: req.params.map_id } });
    if (mask) {
      console.log(`錯誤0: `, req.body.yaml);
      // 將收到的 base64 字串轉換成 Buffer
      const pgmBuffer = Buffer.from(req.body.pgm, 'base64');

      yamlContent = yaml.dump(req.body.yaml);
      const yamlBuffer = Buffer.from(yamlContent, "utf8");
      // 更新 pgm 欄位（假設該欄位為 BLOB 或 binary 類型）
      await mask.update({ pgm: pgmBuffer });
      await mask.update({ yaml: yamlBuffer });
      res.json(mask);
      console.log(`更新完成，回傳資料: `, mask);
    } else {
      console.log(`1111 `, mask);
      res.status(404).json({ error: "Mask not found" });
    }
  } catch (error) {
    console.log(`2222 `, mask);
    res.status(500).json({ error: error.message });
  }
});

// 新增路由來獲取表的 schema
router.get("/tables/:tableName/schema", async (req, res) => {
  const { tableName } = req.params;

  // 確保模型存在
  const model = db[tableName.charAt(0).toUpperCase() + tableName.slice(1)];
  if (!model) {
    return res.status(404).json({ error: "Table not found" });
  }

  // 獲取模型的屬性
  const attributes = model.rawAttributes;
  const schema = Object.keys(attributes).map((key) => ({
    column: key,
    type: attributes[key].type.key, // 獲取類型
  }));

  res.json(schema);
});

router.get("/logs", (req, res) => {
  const { robot_info, service, start, end, lines, search } = req.query;

  const since = start ? start.replace('T', ' ') : undefined;
  const until = end ? end.replace('T', ' ') : undefined;
  const n = lines ? lines : 1000;
  const robot_ip_array = robot_info_to_ip[robot_info];
  const file_param = robot_ip_array ? robot_ip_array.map(ip => `--file ${REMOTE_LOG_DIR}/remote-${ip}.journal`).join(' ') : '';
  const search_param = search=="undefined" ? undefined : search;

  // Type "vim /etc/sudoers" and add "parallels ALL=(ALL) NOPASSWD: /usr/bin/journalctl" at the end of the file to make sudo work
  const cmd = `sudo journalctl ` +
              `${file_param}` +
              `${service ? ` -u ${service}` : ''}` +
              `${since ? ` --since '${since}'` : ''}` +
              `${until ? ` --until '${until}'` : ''}` +
              ` -n ${n}` +
              `${search_param ? ` | grep -i '${search_param}'` : ''}`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      return res.status(200).json({ results: [error.message] });
    }
    if (stderr) {
      return res.status(200).json({ results: [error.message] });
    }
    const escapedResults = stdout.split("\n").filter(Boolean);
    res.json({ results: escapedResults });
  });
});

router.get("/services", (req, res) => {
  res.json({ services: ["fitrobot.bringup", "fitrobot.master", "fitrobot.central"] });
});

router.get("/devices", (req, res) => {
  const devices = Object.keys(robot_info_to_ip);
  res.json(["central", ...devices]);
});

module.exports = router;
