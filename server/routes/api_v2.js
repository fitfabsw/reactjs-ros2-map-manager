const express = require("express");
const router = express.Router();
const db = require("../models");

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
    const stationLists = await db.StationList.findAll({
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

module.exports = router;
