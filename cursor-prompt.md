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
4B. 地圖位置點圖示不會更新
4C1. 提示不會消失
4C2. 滑鼠標示沒有從十字會回箭頭
4D3. (x,y)位置沒有變回原本的值



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
