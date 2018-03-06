window.onload = function wsConnect() {

  // Get references to elements on the page.
  var messageField = document.getElementById('message');
  var messagesList = document.getElementById('messages');
  var socketStatus = document.getElementById('status');
  var connectBtn = document.getElementById('connect');

  // Close the WebSocket connection if connected or reconnect if it's closed.
  connectBtn.onclick = function(e) {
    e.preventDefault();

    // If open, close the WebSocket.
    if (isConnected(socket)) {
        socket.close();
        return false;
    }

    // Reconnect
    wsConnect();
    return false;
  };

  // Get host's IP and port
  var host = getHostname();
  if (host === "") {
    connectBtn.innerHTML = "Connect";
    connectBtn.disabled = false;
    connectBtn.className = "enabled";

    socketStatus.innerHTML = 'Please enter host name and port to connect!';
    socketStatus.className = '';

    return false;
  }

  // Create a WebSocket object and try to connect to server.
  connectBtn.innerHTML = "Connecting...";
  connectBtn.className = "disabled";

  socketStatus.innerHTML = 'Trying connecting to <b>' + host + '</b> ...';
  socketStatus.className = '';

  // Create a new WebSocket.
  var socket = new WebSocket('ws://' + host);
  if (!socket) {
      alert("Error: Failed to create WebSocket object!");
      return false;
  }
  socket.binaryType = 'arraybuffer';


  // Handle any errors that occur.
  socket.onerror = function(error) {
    console.log('WebSocket Error: ' + error);
  };


  // Show a connected message when the WebSocket is opened.
  socket.onopen = function(event) {
    connectBtn.innerHTML = "Disconnect";
    connectBtn.disabled = false;
    connectBtn.className = "enabled";

    socketStatus.innerHTML = 'Connected to: <b>' + host + '</b>';
    socketStatus.className = 'open';
  };


  // Handle messages sent by the server.
  socket.onmessage = function(event) {
    var message = event.data;
    messagesList.innerHTML += '<li class="received"><span>Received:</span>' +
                               message + '</li>';
  };


  // Show a disconnected message when the WebSocket is closed.
  socket.onclose = function(event) {
    connectBtn.innerHTML = "Connect";
    connectBtn.disabled = false;
    connectBtn.className = "enabled";

    socketStatus.innerHTML = 'Disconnected from <b>' + host + '</b>';
    socketStatus.className = 'closed';
  };

  if (!hasModules) {
      // show a selection box to allow user to select the desired IPC dataset
      var d = document.getElementById('ipc_module');
      d.innerHTML = '<option selected disabled value="hint">Select a Module</option>';
      for (var m in gModules) {
        d.innerHTML += '<option value="' + gModules[m] + '">' + gModules[m] + '</option>';
      }
      hasModules = true;
  }

/*
  // Send a message when the form is submitted.
  var form = document.getElementById('message_form');
  form.onsubmit = function(e) {
    e.preventDefault();

    if (!isConnected(socket)) {
        alert("Error: cannot send the message!\nYou have to connect to IPC server first!");
        return false;
    }

    // Retrieve the message from the textarea.
    var message = messageField.value;

    // Send the message through the WebSocket.
    socket.send(message);

    // Add the message to the messages list.
    messagesList.innerHTML += '<li class="sent"><span>Sent:</span>' + message +
                              '</li>';

    // Clear out the message field.
    messageField.value = '';

    return false;
  };
*/
  // Send IPC command when the IPC form is submitted
  var ipcForm = document.getElementById('ipc_form');
  ipcForm.onsubmit = function(e) {
    e.preventDefault();

    if (!isConnected(socket)) {
        alert("Error: cannot send IPC!\nYou have to connect to IPC server first!");
        return false;
    }

    // check if an IPC module has been selected
    if (document.getElementById('ipc_module').value === 'hint') {
        alert('Please select a module!');
        return false;
    }

    // check if an IPC has been selected
    var ipc_cmd = document.getElementById('ipc_cmd');
    if (ipc_cmd.value === 'hint') {
        alert('Please select an IPC!');
        return false;
    }
    var ipcId = parseInt(ipc_cmd.value);

    // check if a manager has been selected
    var ipc_mgr = document.getElementById('ipc_mgr');
    if (ipc_mgr.value === 'hint') {
        alert('Please select a manager!');
        return false;
    }
    var mgrId = parseInt(ipc_mgr.value);
    //alert("ipc: " + gIpcID + ", dest: " + gDestID);

    // create a buffer and a DataView to store IPC data
    var HDR_LEN = 12;
    var buffer = new ArrayBuffer(HDR_LEN + gDataLen);
    var dv = new DataView(buffer);

    // Endianness: true for little endian, false for big endian
    var endian = true;

    // set header values
    dv.setUint32(0, mgrId, endian);      // 4 bytes: manager ID
    dv.setUint32(4, ipcId, endian);      // 4 bytes: IPC ID
    dv.setUint32(8, gDataLen, endian);   // 4 bytes: data length

    var di = 0;     // starting offset of data in dataView
    // Loop through all value fields to copy values to buffer
    var nodes = document.getElementById('ipc_input').childNodes;
    for (var i = 0; i < nodes.length; i++) {
        var field = nodes[i];
        if (field.nodeName === "SELECT") {  // enum input
            if (field.options[field.selectedIndex].value === 'hint') {
                alert("Please select a value for: " + field.name);
                return false;
            }

            var len = parseInt(field.name);
            // copy value to buffer
            var v = parseInt(field.options[field.selectedIndex].value);
            if (len == ENUM_SZ) {
                di += calcPadding(di, ENUM_SZ);
                dv.setUint32(di + HDR_LEN, v, endian);
                di += ENUM_SZ;
            }
            else if (len == 1) {
                dv.setUint8(di + HDR_LEN, v, endian);
                di++;
            }
        }
        else if (field.nodeName === "INPUT") {
            if (field.name === 'string') {  // string input
                // copy string to buffer
                var len = parseInt(field.size);
                var txtView = new Uint8Array(buffer, di + HDR_LEN, len);
                for (var c = 0; c < len; c++) {
                    txtView[c++] = 0;
                }

                for (var c = 0; c < field.value.length; c++) {
                    txtView[c] = field.value.charCodeAt(c);
                }
                di += len;
            } else {                        // number input
                if (!isUintInput(field.value)) {
                    alert("Please enter an integer for: " + field.name);
                    return false;
                }

                // copy number to buffer
                var v = parseInt(field.value);
                if (field.name === 'uint8_t') {
                    //alert('u8: offset=' + di + ', v=' + v);
                    dv.setUint8(di + HDR_LEN, v, endian);
                    di++;
                }
                if (field.name === 'uint16_t') {
                    di += calcPadding(di, U16_SZ);
                    //alert('u16: offset=' + di + ', v=' + v);
                    dv.setUint16(di + HDR_LEN, v, endian);
                    di += U16_SZ;
                }
                if (field.name === 'uint32_t') {
                    di += calcPadding(di, U32_SZ);
                    //alert('u16: offset=' + di + ', v=' + v);
                    dv.setUint32(di + HDR_LEN, v, endian);
                    di += U32_SZ;
                }
                if (field.name === 'uint64_t') {
                    if (!isUint64Input(field.value)) {
                        alert("Invalid 64-bit unsigned integer!");
                        return false;
                    }
                    di += calcPadding(di, U64_SZ);
                    var u64 = UINT64(field.value);
                    dv.setUint32(di + HDR_LEN, u64.getLow32(), endian);
                    dv.setUint32(di + HDR_LEN + U32_SZ, u64.getHigh32(), endian);
                    di += U64_SZ;
                }
            }
        }
    } // end for

    // send the IPC to the simulator through the websocket
    socket.send(buffer);

    var msg = "IPC sent to Simulator!";

    // Add the message to the messages list.
    messagesList.innerHTML += '<li class="sent"><span>Sent:</span>' + msg +
                              '</li>';

    return false;
  }

};

/**
 *  @brief Check if a websocket object has been connected.
 *
 *  @param [in] ws WebSocket object.
 *  @return true if connected, else returns false.
 */
function isConnected(ws)
{
    return (ws && (ws.readyState <= WebSocket.OPEN));
}

/**
 *  @brief Get hostname from text inputs.
 *
 *  @return hostname if valid input, empty string if invalid.
 *
 *  @details If port number is empty returns "host", else returns "host:port".
 */
function getHostname()
{
    var host = document.getElementById('host-ip').value;
    var re = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/g;
    if (!re.test(host)) {
        alert("Error: invalid hostname!");
        return "";
    }
    var port = document.getElementById('host-port').value;
    if (port === "") {
        return host;
    }
    if (!isUintInput(port)) {
        alert("Error: invalid port number!\nPlease input a positive integer!");
        return "";
    }
    if (parseInt(port) < 1024 || parseInt(port) > 0xFFFF) {
        alert("Error: invalid port number!\nPort number should be in [1024..65535]");
        return "";
    }
    return host + ":" + port;
}

/**
 *  @brief Check if a string represents a valid integer.
 *
 *  @param [in] s String representing an integer.
 *  @return true if valid integer, false if not.
 *
 *  @details This function can be used to check a long string representing
 *  a very big integer.
 */
function isIntInput(s)
{
    var re = /^([+\-]?[1-9]\d*|0)$/g;
    return re.test(s);
}

/**
 *  @brief Check if a string represents a valid positive integer.
 *
 *  @param [in] s String representing a positive integer.
 *  @return true if valid integer, false if not.
 *
 *  @details This function can be used to check a long string representing
 *  a very big positive integer.
 */
function isUintInput(s)
{
    var re = /^([1-9]\d*|0)$/g;
    return re.test(s);
}

/**
 *  @brief Check if a string represents a valid 64-bit unsigned integer.
 *
 *  @param [in] s String representing a 64-bit unsigned integer.
 *  @return true if valid, false if not.
 *
 *  @details More details
 */
function isUint64Input(s)
{
    if (s.length > 20) {
        return false;
    }
    else if (s.length == 20) {
        var MAX_UINT64 = '18446744073709551616';
        return (s.localeCompare(MAX_UINT64) <= 0);
    }
    else {
        return isUintInput(s);
    }
}
