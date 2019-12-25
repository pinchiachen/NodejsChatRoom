# NodejsChatRoom

An interview test from AImazing.

---

## Question

請利用 node.js 實作一個具備會員管理功能的實時聊天系統
> 需求
- 必須實作 unit test
- 前端設計只需完成功能演示即可，設計美觀不列評鑑考量

> 功能
- 會員管理後台
  - 管理者登入功能
  - 管理者登入後，顯示會員列表，可針對會員做 CRUD
- 會員聊天室
  - 會員註冊功能
    - 帳號和密碼
  - 會員登入功能
  - 會員登入成功後，看到聊天室的畫面
  - 聊天室採開放式設計，無需指定聊天對象
  - 必須能在不刷新頁面的情況下收到實時聊天訊息 (不能使用 HTTP Polling)
  - 聊天室必須有對話紀錄，紀錄包含:
    - 日期與時間
    - 帳號名稱
    - 聊天內容

---

## 完成情況

- unit test -> 未完成
- 部署至雲端平台 -> 未完成 

---

## Build With

- Node
- express
- mongodb
- socket.io

--- 

## Setup

1. `git clone https://github.com/pinchiachen/NodejsChatRoom.git` 
   clone 此專案
2. `npm install express socket.io body-parser crypto mongoose events`
   安裝套件
3. `cd NodejsChatRoom`
   切換至專案資料夾
4. `node index.js`
   開啟server
5. 訪問 `localhost:3000`

---

## Model

### messages
- name
  - type: String
- msg
  - type: String
- time
  - type: Date

### Users
- username
  - type: String
- userpsw:
  - type: String

### Admins
- username
  - type: String
- userpsw:
  - type: String

---

## Note

- 管理員帳號密碼皆為 `admin`


