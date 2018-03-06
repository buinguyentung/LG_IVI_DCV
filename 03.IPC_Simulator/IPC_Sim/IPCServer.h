#ifndef ICPSERVER_H
#define IPCSERVER_H

#include "WebsocketServer.h"

const int DEFAULT_PORT = 5555;

/**
 * @brief The IPCServer class reprents a websocket server that receives IPC
 * messages from clients and sends them to AppMain.
 */
class IPCServer : public WebsocketServer
{
public:
    IPCServer(int port = DEFAULT_PORT, bool ipv4Only = true);

protected:
    void onMessage(websocketpp::connection_hdl hdl,
                   ws_server::message_ptr msg);
};

#endif // ICPSERVER_H
