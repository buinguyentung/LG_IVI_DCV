#ifndef WEBSOCKETSERVER_H
#define WEBSOCKETSERVER_H

#include <websocketpp/config/asio_no_tls.hpp>
//#include <websocketpp/config/asio.hpp>
#include <websocketpp/server.hpp>

typedef websocketpp::server<websocketpp::config::asio> ws_server;
//typedef websocketpp::server<websocketpp::config::asio> wss_server;

// pull out the type of messages sent by our config
typedef ws_server::message_ptr message_ptr;
//typedef websocketpp::lib::shared_ptr<websocketpp::lib::asio::ssl::context> context_ptr;

/**
 * @brief The WebsocketServer class
 */
class WebsocketServer
{
public:
    WebsocketServer(int port, bool ipv4Only);
    virtual ~WebsocketServer();

    bool init();
    void run();
    void shutdown();

protected:
    ws_server _ws;          // non-secure endpoint
    //wss_server _wss;        // secure endpoint
    int _port;
    bool _ipv4Only;

    // handlers
    virtual bool onValidate(websocketpp::connection_hdl hdl);
    virtual void onFail(websocketpp::connection_hdl hdl);
    virtual void onClose(websocketpp::connection_hdl hdl);
    virtual void onMessage(websocketpp::connection_hdl hdl, message_ptr msg);
};

#endif // WEBSOCKETSERVER_H
