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
