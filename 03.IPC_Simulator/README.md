Instructions for running IPC Simulator
===========================================

## 1. Build IPC Simulator
--------------------------
Libs:
+ asio
+ websocketpp (wspp)

Command:
cd App
SOCK=/alt ./sample 9999 &

Qt:
qt5_cadaques.pdf

## 2. IPC Data Files
---------------------------
Following is the format of a data file:
```javascript
var ipcData = {
  "<ipc_name>": {
    "id": <ipc_id>,
    "mgr": {
      "<mgr_name>": <mgr_id>
    },
    "type": "<type_name>"
  },
  
  // other IPCs
};
```
where:
* `<ipc_name>` is an IPC name such as `IDM_MMCM_AMAIN_HVAC_RES_REARPANELSYNC`.
* `<ipc_id>` is an IPC id such as `12809`.
* `<mgr_name>` is a manager name such as `IDP_MGR_MCM`.
* `<mgr_id>` is a manager ID such as `1`.
* `<type_name>` is name of the type of the IPC. It can be empty, enum name, struct name or any of (`uint8_t`, `uint16_t`, `uint32_t`, `uint64_t`).
