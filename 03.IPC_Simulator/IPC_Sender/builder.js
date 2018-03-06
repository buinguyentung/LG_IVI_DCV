var jsonIpc = {};
var shownIpc = {};
var enumDropdownHTML = '';
var structDropdownHTML = '';

window.onload = initViewer();

function initViewer()
{
  loadIpcData();
  var options = {
    valueNames: ['name', 'id'],
    page: 25,
    pagination: [{
      name: "pagination",
      innerWindow: 5,
      outerWindow: 2
    }]
  };
  var ipcList = new List('test-list', options);
  //console.log(document.getElementById("ipc-page").innerHTML);
  document.getElementById("json-txt").value = 'var ipcData =\n{\n}\n';
  document.getElementById("ipc-search").value = '';
};

function loadIpcData()
{
  var list = document.getElementById("ipc-list");
  var txt = "";
  for (var ipc_name in ipcData) {
    txt += "<li><a href='#' class='name' onclick='showIpc(this);'>" + ipc_name + "</a> "
         + "<span class='id'>" + ipcData[ipc_name].id + "</span> "
         + "<a href='#' class='action' onclick=\"addIpc(this);\">[Add]</a>"
         + "</li>";
  }
  list.innerHTML = txt;
  if (enumDropdownHTML === '') {
    enumDropdownHTML = enumDropdown();
  }
  if (structDropdownHTML === '') {
    structDropdownHTML = structDropdown();
  }
}

function clearTextarea()
{
  if (Object.keys(jsonIpc).length === 0) {
    return;
  }
  jsonIpc = {};
  initViewer();
}

function getIpcString(ipcJson)
{
  var txt = '{\n';
  txt    += '    "id": ' + ipcJson.id + ',\n'
         +  '    "mgr": {\n';
  if (Object.keys(ipcJson.mgr).length === 0) {
    txt += '      "NULL": -1\n';
  } else {
    for (var m in ipcJson.mgr) {
      txt  += '      "' + m + '": ' + ipcJson.mgr[m] + ',\n';
    }
    txt = txt.slice(0, -2) + '\n';
  }
  txt    += '    },\n'
         +  '    "type": "' + ipcJson.type + '"\n'
         +  '  }';
  return txt;
}

function jsonIpcToString()
{
  var txt = '';
  for (var name in jsonIpc) {
    txt += '\n  "' + name + '": ' + jsonIpc[name] + ',\n';
  }
  txt = txt.slice(0, -2);
  return txt;
}

/**
 *  @brief Add JSON data of an IPC to the textarea
 *  
 *  @param [in] e The element containing the IPC name.
 *  
 *  @details This function acts like a commit. The current IPC data is stored
 *  in shownIpc variable. This data will be stored in jsonIpc and then add to
 *  the textarea. [Add] is changed to [Updated] [Remove]
 */
function addIpc(e)
{
  var items = e.parentNode.children;
  var ipcName = items[0].innerText;
  
  // if this IPC has been edited
  if (("id" in shownIpc) && (shownIpc.id === ipcData[ipcName].id)) {
    // store shownIpc data to jsonIpc
    jsonIpc[ipcName] = getIpcString(shownIpc);
    shownIpc = {};  // clear the temporary IPC data after being added to textarea
  } else {
    jsonIpc[ipcName] = getIpcString(ipcData[ipcName]);
  }
  //alert(txt);
  document.getElementById("json-txt").value = "var ipcData =\n{" + jsonIpcToString() + "\n}\n";
  document.getElementById("json-txt").scrollTop = document.getElementById("json-txt").scrollHeight;
  items[2].innerText = "[Update]";
  items[2].style.color = "steelblue";
  e.parentNode.innerHTML += ' <a href="#" style="font-weight:bold; color:red" onclick="removeIpc(this)">[Remove]</a>';
}

function removeIpc(e)
{
  var items = e.parentNode.children;
  var ipcName = items[0].innerText;
  if (!jsonIpc[ipcName]) return;
  delete jsonIpc[ipcName];

  // refill the textarea's content
  document.getElementById("json-txt").value = "var ipcData =\n{" + jsonIpcToString() + "\n}\n";
  items[2].innerText = "[Add]";
  items[2].style.color = "blue";
  e.parentNode.removeChild(items[3]);
}

/**
 *  @brief Show IPC information when user clicks on its name.
 *  
 *  @param [in] e The <a> tag that has IPC name.
 *  
 *  @details If the information has been shown, clicking on IPC name will close
 *  it. Click on another IPC name will close the current IPC infor and show info
 *  for the clicked IPC.
 */
function showIpc(e)
{
  var curItem = document.getElementById("ipc-info");
  if (curItem && curItem.parentNode === e.parentNode) {
    curItem.parentNode.removeChild(curItem);
    return;
  }
  if (curItem) {
    curItem.parentNode.removeChild(curItem);
  }
  shownIpc = {};
  var item = e.parentNode;
  var ipcName = e.innerText;
  // if the IPC has been added then get its JSON data from jsonIpc else get from ipcData
  if (ipcName in jsonIpc) {
    shownIpc = JSON.parse(jsonIpc[ipcName]);
  } else {
    var jsonTxt = JSON.stringify(ipcData[ipcName]);
    shownIpc = JSON.parse(jsonTxt);
  }
  if ('NULL' in shownIpc.mgr) {
    delete shownIpc.mgr['NULL'];
  }
  var type = shownIpc.type;
  var html = '<table id="ipc-info">'
           + '<tr><th>Managers</th><th>Type</th></tr>'
           + '<tr><td style="vertical-align: top">' + managersDropdown()
           + '<hr><div id="mgr-info" class="update">';
  for (var m in shownIpc.mgr) {
    html += '<span style="display:block">' + m + ' <a href="#" class="action" onclick="removeManager(\'' + m + '\')">[-]</a></span>';
  }
  html    += '</div></td>'
           + '<td style="vertical-align: top">'
           + '<input type="radio" name="ipc-type" value="void" onclick="showEditType(this)"> void'
           + '<input type="radio" name="ipc-type" value="primitive" onclick="showEditType(this)"> primitive'
           + '<input type="radio" name="ipc-type" value="enum" onclick="showEditType(this)"> enum'
           + '<input type="radio" name="ipc-type" value="struct" onclick="showEditType(this)"> struct'
           + '<hr><div id="ipc-type-edit"><em style="color:crimson">*** Select a type to edit ***</em></div>'
           + '<hr><div id="ipc-type-info" class="update">' + (type === '' ? 'void' : type) + '</div>'
           + '</td>'
           + '</table>';
  item.innerHTML += html;
}

/**
 *  @brief Show ICP type editing when user selects one of (void, primitive, enum, or struct)
 *  
 *  @param [in] e The selected type.
 */
function showEditType(e)
{
  var type = e.value;
  if (type === "void") {
    document.getElementById('ipc-type-edit').innerHTML = 'void <a href="#" class="action" onclick="addVoid()">[+]</a>';
  }
  else if (type === "primitive") {
    var html = '<input type="text" class="search-lite" placeholder="uint8_t, uint16_t, uint32_t, uint32_t, or uint8_t[n]"> ';
    html += '<a href="#" class="action" onclick="addPrimitive(this)">[+]</a>';
    document.getElementById('ipc-type-edit').innerHTML = html;
  }
  else if (type === "enum") {
    document.getElementById('ipc-type-edit').innerHTML = enumDropdownHTML;
  }
  else if (type === "struct") {
    document.getElementById('ipc-type-edit').innerHTML = structDropdownHTML;
  }
  else {
    alert("Error: undefined type!");
  }
}

function toggleDropdown(listId)
{
  document.getElementById(listId).classList.toggle("show");
}

function filterFunc(inputId, listId)
{
  var filter, aTags;
  filter = document.getElementById(inputId).value.toUpperCase();
  aTags = document.getElementById(listId).children;
  for (var i = 0; i < aTags.length; ++i) {
    if (aTags[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      aTags[i].style.display = "";
    } else {
      aTags[i].style.display = "none";
    }
  }
}

function managersDropdown()
{
  var html = '<div class="dropdown">'
       + '<input type="text" class="search-lite" id="mgr-input" onkeyup="filterFunc(\'mgr-input\', \'mgr-list\');" onfocus="toggleDropdown(\'mgr-list\');" placeholder="Add a manager...">'
       + ' <a href="#" class="action" onclick="toggleDropdown(\'mgr-list\');">[Hide]</a>';
  html += '<div class="dropdown-content" id="mgr-list">'
  for (var name in ipcManagers) {
    if (name === 'NULL') continue;
    html += '<span>' + name + ' <a href="#" class="action" onclick="addManager(\'' + name + '\')">[+]</a></span>';
  }
  html += '</div></div>';
  return html;
}

function enumDropdown()
{
  var html = '<div class="dropdown">'
       + '<input type="text" class="search-lite" id="enum-input" onkeyup="filterFunc(\'enum-input\', \'enum-list\');" onfocus="toggleDropdown(\'enum-list\');" placeholder="Add an enum...">'
       + ' <a href="#" class="action" onclick="toggleDropdown(\'enum-list\');">[Hide]</a>';
  html += '<div class="dropdown-content" id="enum-list">'
  for (var name in ipcEnum) {
    html += '<span>' + name + ' <a href="#" class="action" onclick="addEnum(\'' + name + '\')">[+]</a></span>';
  }
  html += '</div></div>';
  return html;
}

function structDropdown()
{
  var html = '<div class="dropdown">'
       + '<input type="text" class="search-lite" id="struct-input" onkeyup="filterFunc(\'struct-input\', \'struct-list\');" onfocus="toggleDropdown(\'struct-list\');" placeholder="Add a struct...">'
       + ' <a href="#" class="action" onclick="toggleDropdown(\'struct-list\');">[Hide]</a>';
  html += '<div class="dropdown-content" id="struct-list">'
  for (var name in ipcStruct) {
    html += '<span>' + name + ' <a href="#" class="action" onclick="addStruct(\'' + name + '\')">[+]</a></span>';
  }
  html += '</div></div>';
  return html;
}

function addManager(name)
{
  if (name in shownIpc.mgr) {
    toggleDropdown("mgr-list");
    return;
  }
  shownIpc.mgr[name] = ipcManagers[name];
  alert(name + ', id=' + shownIpc.mgr[name] + ' added!');
  toggleDropdown("mgr-list");
  var e = document.getElementById('mgr-info');
  e.innerHTML = '';
  for (var m in shownIpc.mgr) {
    e.innerHTML += '<span style="display:block">' + m + ' <a href="#" class="action" onclick="removeManager(\'' + m + '\')">[-]</a></span>';
  }
}

function removeManager(name)
{
  delete shownIpc.mgr[name];
  var e = document.getElementById('mgr-info');
  e.innerHTML = '';
  for (var m in shownIpc.mgr) {
    e.innerHTML += '<span style="display:block">' + m + ' <a href="#" class="action" onclick="removeManager(\'' + m + '\')">[-]</a></span>';
  }
}

function addVoid()
{
  document.getElementById('ipc-type-info').innerHTML = 'void';
  shownIpc.type = '';
}

function addPrimitive(e)
{
  // check if text input is valid
  var re = /^uint(8|16|32|64)_t(\[[1-9]+\])*$/g;
  var type = e.parentNode.firstChild.value;
  var match = re.exec(type);
  if (match === null) {
    alert("Error: invalid primitive type!\nValid is uint8_t, uint16_t, uint32_t, uint64_t or uint8_t[n]");
    return;
  }
  if (match[1] !== '8' && match[2]) {
    alert("Error: invalid primitive type!\nValid is uint8_t[n] where n > 1");
    return;
  }
  document.getElementById('ipc-type-info').innerHTML = type;
  shownIpc.type = type;
  e.parentNode.firstChild.value = '';
}

function addEnum(type)
{
  document.getElementById('ipc-type-info').innerHTML = type;
  shownIpc.type = type;
  toggleDropdown("enum-list");
}

function addStruct(type)
{
  document.getElementById('ipc-type-info').innerHTML = type;
  shownIpc.type = type;
  toggleDropdown("struct-list");
}

