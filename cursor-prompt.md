### 2024/12/13

in Db.js, when first load, I will load all tables using loadData()

the exact line is
const fetchedData = await fetchTable(table);

when dealing with table map, it will call backend API /maps

Currently it will ignore three blob fields, ie: pgm, yaml, thumbnail
this exact line is in
=== api_v2.js ===

router.get("/maps", async (req, res) => {
console.log("get maps");
try {
const maps = await db.Map.findAll({
attributes: { exclude: ["pgm", "yaml", "thumbnail"] },
include: [db.Robottype],
});
...

however, at the frontend, I want to know which blob field has data

for example, If the row 2 of map is
pgm: has data, yaml: no data, thumbnail: no data
I want to UI to render as
pgm: BLOB, yaml-->empty, thumbnail-->empty

How can I achieve this?

### 2024/12/12

Database management 模組包含 Db.js & DbTable 兩個組件
在DbTable.js component 中, 當選點修改時,
目前僅有 ["TEXT", "INTEGER", "REAL"] 這三個格式, 才允許修改

我的 database table 中, 有的欄位格式為blob
我希望針對 blob 格式的欄位, 在點選 Edit 按鈕後, 對應的欄位中增加一個可供選擇檔案的 input
當選擇檔案時, 輸入以下sql指令插入database
ex1:
update map set pgm=readfile(filepath) where id=<current map id>; <-- 當欄位為pgm
ex2:
update map set yaml=readfile(filepath) where id=<current map id>; <-- 當欄位為yaml
ex3:
update map set thumbnail=readfile(filepath) where id=<current map id>; <-- 當欄位為thumbnail

目前有 blob 的 table 有 map & mask

### 2024/11/20

===預期行為===

在 edit 模式下, 點選"修改button", 點選 "選擇位置button"
地圖會出現

1. "請選擇欲更動之位置" 提示
2. 且滑鼠游標圖示由箭頭變成十字

暫且把此狀態稱為 "等待點選"狀態

3. 若沒進入等待點選狀態, 不會有提示和十字
4. 進入等待點選狀態後
   在地圖上點選新的位置點
   A. 左側StationCard中的(x,y)位置會更新
   B. 地圖的位置點圖示也會更新
   C. 此時按下保存
   C1.提示消失
   C2.十字變回箭頭
   C3.(x,y)位置會維持更新
   C4.地圖位置點會維持更新
   D. 此時按下取消 -> 提示消失, 十字變回箭頭, 且 (x,y)位置和地圖位置點均會變為原本的值和位置
   D1.提示消失
   D2.十字變回箭頭
   D3.(x,y)位置變回原本的值
   D4.地圖位置點變回原本的位置

===現在問題===
4D3. (x,y)位置沒有變回原本的值
4D4. 地圖位置點沒變回原本的位置

### 2024/11/19

測試結果

1. 只有在點選修改按鈕後，才能拖曳對應的站點
   ok
2. 拖曳時會顯示抓取游標
   not ok.
   只能拖一下，即使滑鼠還按著，也會停止拖曳
3. 放開滑鼠按鈕後會停止拖曳
   not ok
4. 滑鼠離開圖片區域時也會停止拖曳
   無法測試
5. 非編輯狀態的站點不可拖曳
   ok

另外, x,y 欄位的值沒有更新

I am now working on the frontend module StationManager
which have three components

- StationCard
- StationManager
- StationManagerLeftNormal

In the left panel, we have StationManagerLeftNormal component, which have following functions

1. select map
   based on the map, it will

   1. list the related station lists
   2. show the map in the center area

2. Select station list
   if there are station lists, it will show cards

3. List all stations
   When clicking on a card, it will enter "edit mode" and replace original content with all stations info
   each station info is a StationCard component

Right now, StationCard have modify and delete buttons but not functional.

Please help me to fix it.

The frontend should call backend API to get the jobs done. Related APIs as as follows

- stationlist
  /api/stationslists
- stations
  /api/stations
- maps
  /api/maps

### 2024/11/18

help me create a professional & elegant interface

which can

1. create stationlist

available stationlist field are:

- stl_name
- mid: the mid of the created station is the current selected map id

2. create a station and add it into existed stationlist

available station field are:

- st_name
- stl_id: the stl_id of the current stationlist
- x
- y
- z
- w
- type (choice: start, end, station)

### 2024/11/16

@server @client
我們現在開始開發 stations 功能
這會依賴呼叫backend的API

先做以下功能

1. 進入stations頁面時，call API /api/maps
   抓到所有map的item
2. 以表格方式列出所有items

---

Now you know my db model.
Let's work on frontend

We already have map editor module located at 3000:/

First, move it into different entry, say, 3000:/map-editor/

Now we are working on modules stations &

- stations: located at 3000:0/stations
- masks: located at 3000:0/masks
