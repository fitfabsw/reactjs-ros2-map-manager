
CREATE TABLE Mask
(
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
path TEXT,
name TEXT,
mid INTEGER REFERENCES map (id)
);

CREATE TABLE Robottype
(
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
name TEXT
);

CREATE TABLE Robot
(
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
rt_id INTEGER REFERENCES Robottype (id),
sn TEXT,
UNIQUE (rt_id, sn)
);

CREATE TABLE Map
(
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
map TEXT NOT NULL,
rt_id INTEGER NOT NULL REFERENCES Robottype (id),
mappath TEXT NOT NULL,
mapname TEXT NOT NULL,
real INTEGER NOT NULL,
UNIQUE (map, rt_id)
);

CREATE TABLE Mask
(
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
path TEXT NOT NULL,
name TEXT NOT NULL,
mid INTEGER NOT NULL REFERENCES Map (id),
);

CREATE TABLE StationList
(
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
stl_name TEXT NOT NULL,
mid INTEGER,
FOREIGN KEY (mid) REFERENCES map (id)
);

CREATE TABLE Station
(
id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
st_name TEXT NOT NULL,
type TEXT NOT NULL,
stl_id INTEGER NOT NULL REFERENCES StationList (id),
x REAL,
y REAL,
z REAL,
w REAL
);

-- Robottype
insert into Robottype (name) values("Lino2");
insert into Robottype (name) values("Artic");

-- Robot
INSERT INTO Robot (sn, rt_id) VALUES ("1234", 1);
INSERT INTO Robot (sn, rt_id) VALUES ("1234", 2);
INSERT INTO Robot (sn, rt_id) VALUES ("5678", 1);
INSERT INTO Robot (sn, rt_id) VALUES ("5678", 2);

-- Map
insert into map (map, rt_id, mappath, mapname, real) values("turtlebot3_world", 1, "/home/pi/fitrobot_db/maps/sim", "turtlebot3_world", 0);
insert into map (map, rt_id, mappath, mapname, real) values("turtlebot3_world", 2, "/home/pi/fitrobot_db/maps/sim", "turtlebot3_world", 0);
--
insert into map (map, rt_id, mappath, mapname, real) values("fit_office_2f", 1, "/home/pi/fitrobot_db/maps/real", "lino2_office_20240129", 1);
insert into map (map, rt_id, mappath, mapname, real) values("fit_office_2f", 2, "/home/pi/fitrobot_db/maps/real", "office_res002_0523", 1);
insert into map (map, rt_id, mappath, mapname, real) values("fit_newoffice_3f", 1, "/home/pi/fitrobot_db/maps/real", "lino2_newoffice_3f", 1);
insert into map (map, rt_id, mappath, mapname, real) values("fit_newoffice_3f", 2, "/home/pi/fitrobot_db/maps/real", "lino2_newoffice_3f", 1);
insert into map (map, rt_id, mappath, mapname, real) values("fit_newoffice_3fp", 1, "/home/pi/fitrobot_db/maps/real", "lino2_newoffice_3f_processed", 1);
insert into map (map, rt_id, mappath, mapname, real) values("fit_newoffice_3fp", 2, "/home/pi/fitrobot_db/maps/real", "lino2_newoffice_3f_processed", 1);


insert into station (st_name, type, stl_id, x, y, z, w) values("Tom Hc", 'home', 1, 0, 0, 0, 0);
