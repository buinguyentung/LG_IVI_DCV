var U8_SZ = 1;
var U16_SZ = 2;
var U32_SZ = 4;
var U64_SZ = 8;
var ENUM_SZ = 4;

var gIpcID = -1;    // ID of the selected IPC command.
var gMgrID = -1;    // ID of the selected Manager.
var gDataLen = 0;   // Total length (incl. paddings) of all data fields

var gModules = ['hvac', 'teendriver', 'vehicle', 'settings', 'onstarphone', 'dev', 'nav', 'rvc', 'btphone', 'wifi', 'onstartbt', 'updater'];
var ipcData = null;

/**
 *  @brief Load the IPC JSON file corresponding to the selected dataset.
 *
 *  @param [in] filename Filename of the JSON file.
 *  @return Reference to the script tag for loading the JSON file.
 *
 *  @details After loading JSON file, call loadIpcData() to populate IPC data.
 */
function loadJsonFile(filename)
{
    var fileref = document.createElement('script');
    fileref.setAttribute("type","text/javascript");
    fileref.setAttribute("src", filename);
    document.getElementsByTagName("head")[0].appendChild(fileref);

    // check if the JSON has been loaded
    var tries = 3;
    var poll = function() {
      setTimeout(function() {
        if (--tries) {  // try again
          poll();
        } else {
          if (!ipcData) {
            alert("Error: could not load '" + filename + "'");
          }
          loadIpcData();
        }
      }, 100);
    };
    poll();
    return fileref;
}

var scriptRef = null;       // save the last loaded module script tag
var hasModules = false;     // check if modules selection box has been created
/**
 *  @brief Handle event when user selects an IPC dataset.
 *
 *  @param [in] m The selected option.
 *
 *  @details Load the corresponding IPC JSON file. At any time, there's only
 *  one JSON file loaded.
 */
function selectModule(m)
{
    // If a JSON file has been loaded then remove it so it can be reloaded
    // or another file can be loaded.
    if (scriptRef) {
        scriptRef.parentNode.removeChild(scriptRef);
        scriptRef = null;
        ipcData = null;
    }
    scriptRef = loadJsonFile("data/ipc_" + m.value + ".json");
}

/**
 *  @brief Load IPCs from the ipcData JSON data to the selection box.
 *
 *  @details IPCs' names and IDs will be loaded to the selection box on the
 *  interface. After that it clears the Manager selection box and data input
 *  fields.
 */
function loadIpcData()
{
  document.getElementById("ipc_name").innerHTML = "IPC: ";
  var txt = '';
  if (ipcData) {
    txt += '<option selected disabled value="hint">Select an IPC</option>';
    for (var ipc_name in ipcData) {
      txt += '<option value="' + ipcData[ipc_name].id + '">';
      txt += ipc_name + '</option>';
    }
  }
  document.getElementById("ipc_cmd").innerHTML = txt;
  document.getElementById("ipc_mgr").innerHTML = "";
  document.getElementById("mgr_name").innerHTML = "Manager: ";
  document.getElementById("ipc_data").innerHTML = "";
}

/**
 *  @brief Handle event when user selects an IPC command from the selection box.
 *
 *  @param [in] ipc The selected IPC option.
 *
 *  @details When an IPC command is selected, all its data including managers
 *  and data types will be populated to various input fields on the interface.
 */
function selectIpc(ipc)
{
  //var ipc = document.getElementById("ipc_cmd");
  var ipc_name = ipc.options[ipc.selectedIndex].text;
  var ipc_id = ipc.value;
  gIpcID = parseInt(ipc_id);
  document.getElementById("ipc_name").innerHTML = "IPC: "
    + "<span style=\"font-size: 0.6rem; color:blue\">"+ ipc_name + " [" + ipc_id + "]</span>";
  //alert("You've selected: " + ipc_name + " [" + ipc_id + "]");

  // populate Manager IDs
  gMgrID = -1;
  document.getElementById("mgr_name").innerHTML = "Manager: ";
  var mgrSelect = document.getElementById("ipc_mgr");
  mgrSelect.innerHTML = "";
  for (var m in ipcData[ipc_name].mgr) {
    if (m === "NULL") {
      mgrSelect.innerHTML = "<option selected disabled value='hint'>No Manager</option>";
      break;
    }
    mgrSelect.innerHTML += "<option value='" + ipcData[ipc_name].mgr[m] + "'>" + m + "</option>";
  }
  // if at least 1 manager, select the first
  if (mgrSelect.childElementCount > 0) {
      mgrSelect.selectedIndex = 0;
      selectMgr(mgrSelect);
  }

  // show IPC values depend on its type
  gDataLen = 0;
  var d = document.getElementById("ipc_data");
  txt = '<fieldset id="ipc_input"><legend class="input_name">IPC Data: </legend>';
  var type = ipcData[ipc_name].type
  if (type.indexOf("e") == 0) {
    txt += loadEnum(type);
  }
  else if (type.indexOf("LG") == 0) {
    txt += loadStruct(type);
  }
  else if (type != "") {
    txt += "<span style=\"font-size: 0.8rem\"><i>" + type + ":</i>  </span>";
    txt += loadPrimitive(type);
  } else {
    txt += "void";
  }
  d.innerHTML = txt + "</fieldset>";
  //console.log(txt);
  //alert("Value length: " + gDataLen);
}

/**
 *  @brief Handle event when user selects a Manager from the selection box.
 *
 *  @param [in] mgr The selected manager option.
 */
function selectMgr(mgr)
{
  var mgr_name = mgr.options[mgr.selectedIndex].text;
  var mgr_id = mgr.value;
  if (mgr_id === 'hint') {
    gMgrID = -1;
    return false;
  }
  gMgrID = parseInt(mgr_id);
  document.getElementById("mgr_name").innerHTML = "Manager: "
    + "<span style=\"font-size: 0.6rem; color:blue\">"+ mgr_name + " [" + mgr_id + "]</span>";
}

/**
 *  @brief Create input fields and enum values for struct data type.
 *
 *  @param [in] name struct data type name.
 *  @return HTML text for creating list of enum values and input fields.
 */
function loadStruct(name)
{
  var txt = "";
  for (var i in ipcStruct[name]) {
    for (var s in ipcStruct[name][i]) {
        var v = ipcStruct[name][i][s];
        //alert(v);
        txt += "<span style=\"font-size: 0.8rem\"><i>" + v + ":</i>  </span>";
        if (v.indexOf("e") == 0) {
          txt += loadEnum(v);
        } else if ((v.indexOf("L") == 0) && (v.indexOf("G") == 1) ){
            var re = /^(\S+)(\[[0-9]+\])/g;
            var match = re.exec(v);
            if (match == null) {
                txt += loadStruct(v);
            } else {
                var len = match[1];
                for (var i in len) {
                    txt += "<span style=\"font-size: 0.8rem\"><i>" + match[1]+ "[" + i + "]" + ":</i>  </span>";
                    txt += loadStruct(match[1]);
                }
            }
          
        } else {
          txt += loadPrimitive(v);
        }
    }
  }
  return txt;
}

/**
 *  @brief Calculates padding for a field of a struct type.
 *
 *  @param [in] offset The index of the field in the byte array.
 *  @param [in] size The size of type of the field. It can be ENUM_SZ, U8_SZ, etc.
 *  @return Padding for the data field.
 */
function calcPadding(offset, size)
{
    return ((size - (offset % size)) % size);
}

/**
 *  @brief Create a list of values for enum type.
 *
 *  @param [in] name enum type name.
 *  @return HTML text for creating list of enum values.
 */
function loadEnum(name)
{
  var re = /^(\S+):([0-9]+)/g;  // eLGTeenDriverAvailibilty:8 or eLGSpeedLimitStatus
  var match = re.exec(name);    // [enum_name]:[enum_size]

  var txt = "<select name='";
  if (match == null) {
    txt += "4'>";       // sizeof enum is 4 bytes
    gDataLen += calcPadding(gDataLen, ENUM_SZ);
    gDataLen += ENUM_SZ;
  } else {
    txt += "1'>";
    gDataLen += U8_SZ;      // sizeof enum is 1 byte
    name = match[1];    // get enum_name
  }
  txt += "<option selected disabled value='hint'>Select a value</option>";
  for (var i in ipcEnum[name]) {
    for (var e in ipcEnum[name][i])
      txt  += "<option value='" + ipcEnum[name][i][e] + "'>" + e + "</option>";
  }
  txt    += "</select><br>";
  return txt;
}

/**
 *  @brief Create input field for primitive data types.
 *
 *  @param [in] name Primitive type name: uint8_t, uint8_t[n], uint16_t, uint32_t, or uint64_t
 *  @return HTML text for creating input fields of primitive data.
 *
 *  @details Primitive types: uint8_t, uint8_t[n], uint16_t, uint32_t, and uint64_t.
 *  For uint8_t and uint8_t[n], no padding needed. uint16_t, uint32_t, and uint64_t
 *  will be aligned at address divisible by its size.
 */
function loadPrimitive(name)
{
    var txt = "";
  var re = /\[([0-9]+)\]/g;
  var match = re.exec(name);
  if (match == null) {  // name is: uint8_t, uint16_t, uint32_t, or uint64_t
    var sz = 0;
    if (name === 'uint8_t') {
        gDataLen += U8_SZ;
        sz = 3;
    }
    if (name === 'uint16_t') {
        gDataLen += calcPadding(gDataLen, U16_SZ);
        gDataLen += U16_SZ;
        sz = 5;
    }
    if (name === 'uint32_t') {
        gDataLen += calcPadding(gDataLen, U32_SZ);
        gDataLen += U32_SZ;
        sz = 10;
    }
    if (name === 'uint64_t') {
        gDataLen += calcPadding(gDataLen, U64_SZ);
        gDataLen += U64_SZ;
        sz = 20;
    }
    txt += "<input name=\"" + name
        + "\" type=\"text\" maxlength=\"" + sz + "\" size=\"" + sz + "\""
        + " placeholder='" + name + "' value=\"0\"><br>";
    return txt;
  }

  var len = match[1];   // name is uint8_t[len]
  txt += "<input name=\"string\" type=\"text\" maxlength=\"" + len
    + "\" size=\"" + len + "\" placeholder='char[" + len + "]'><br>";
  gDataLen += parseInt(len);

  return txt;
}
