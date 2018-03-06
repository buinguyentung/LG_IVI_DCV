#include <iostream>
#include <functional>

#include "Log.h"
#include "WebsocketServer.h"

// namespace merging
using websocketpp::connection_hdl;

/**
 * @brief WebsocketServer::WebsocketServer
 * @param port
 * @param ipv4Only
 */
WebsocketServer::WebsocketServer(int port, bool ipv4Only)
    : _port(port), _ipv4Only(ipv4Only)
{
}

/**
 * @brief WebsocketServer::~WebsocketServer
 */
WebsocketServer::~WebsocketServer()
{
    shutdown();
}

/**
 * @brief WebsocketServer::init
 * @return
 */
bool WebsocketServer::init()
{
    // initialize ASIO
    _ws.init_asio();

    // use SO_REUSEADDR TCP socket option
    _ws.set_reuse_addr(true);

    // Set logging settings
//    _endPoint.set_access_channels(websocketpp::log::alevel::all);
//    _endPoint.clear_access_channels(websocketpp::log::alevel::frame_payload);

    // set custom logger (ostream-based)

    // register message handlers
    _ws.set_validate_handler(std::bind(
                                       &WebsocketServer::onValidate, this,
                                       std::placeholders::_1)
                                   );
    _ws.set_fail_handler(std::bind(
                                   &WebsocketServer::onFail, this,
                                   std::placeholders::_1)
                               );
    _ws.set_close_handler(std::bind(
                                    &WebsocketServer::onClose, this,
                                    std::placeholders::_1)
                                );
    _ws.set_message_handler(std::bind(
                                      &WebsocketServer::onMessage, this,
                                      std::placeholders::_1,
                                      std::placeholders::_2)
                                  );

    // listen for connections
    try {
        if (_ipv4Only) {
            // listen using the IPv4 only.
            _ws.listen(websocketpp::lib::asio::ip::tcp::v4(), _port);
        } else {
            // listen using IPv6 with mapped IPv4 for dual stack hosts.
            _ws.listen(_port);
        }
    } catch (websocketpp::exception const &e) {
        LOG(LOG_ERROR) << "exception on listen(): " << e.what();
    }
    LOG(LOG_INFO) << "listening on port " << _port
                  << " and waiting for connections...";

    // start the server accept loop
    websocketpp::lib::error_code ec;
    _ws.start_accept(ec);
    if (ec) {
        LOG(LOG_ERROR) << "accept connection failed: " << ec.message();
        return false;
    }

    return true;
}

/**
 * @brief WebsocketServer::run
 */
void WebsocketServer::run()
{
    try {
        // start the ASIO io_service run loop
        _ws.run();
    } catch (websocketpp::exception const &e) {
        LOG(LOG_ERROR) << "exception on run(): " << e.what();
    }
}

/**
 * Shutdown the server.
 *
 */
void WebsocketServer::shutdown()
{
    // stop the websocket listener and closing outstanding connections.
    websocketpp::lib::error_code ec;
    _ws.stop_listening(ec);
    if (ec) {
        // failed to stop listening
        LOG(LOG_ERROR) << "failed to stop listening: " << ec.message();
        return;
    }

    // close all existing websocket connections
    LOG(LOG_INFO) << "Terminating connection...";

    // stop the endpoint to ensure the transport backend is completely shutdown
    _ws.stop();
}

/**
 * Validate before accepting new connections.
 *
 */
bool WebsocketServer::onValidate(connection_hdl hdl)
{
    websocketpp::server<websocketpp::config::asio>::connection_ptr
            conn = _ws.get_con_from_hdl(hdl);
    websocketpp::uri_ptr uri = conn->get_uri();

    // check connection before accepting here

    // allow all connections
    LOG(LOG_INFO) << "accepted connection from ("
              << uri->str() << "), hdl <" << hdl.lock().get() << ">";
    return true;
}

/**
 * Handle when connection attemp to the server failed.
 *
 */
void WebsocketServer::onFail(connection_hdl hdl)
{
    websocketpp::server<websocketpp::config::asio>::connection_ptr
            conn = _ws.get_con_from_hdl(hdl);
    websocketpp::lib::error_code ec = conn->get_ec();
    if (ec) {
        LOG(LOG_ERROR) << "connection attempt by client failed: " << ec.message();
    }
}

/**
 *
 */
void WebsocketServer::onClose(connection_hdl hdl)
{
    LOG(LOG_INFO) << "connection hdl <" << hdl.lock().get() << "> closed!";
}

/**
 * Handle incoming messages.
 *
 */
void WebsocketServer::onMessage(connection_hdl hdl, message_ptr msg)
{
    LOG(LOG_INFO) << "onMessage called with hdl <" << hdl.lock().get() << ">";
    LOG(LOG_INFO) << ": received '" << msg->get_payload() << "'";

    std::string data = msg->get_payload();

    // send back result to client
    try {
        _ws.send(hdl, data, websocketpp::frame::opcode::text);
        LOG(LOG_INFO) << ": sent OK!";
    } catch (const websocketpp::lib::error_code& e) {
        LOG(LOG_ERROR) << " Echo failed because: " << "(" << e.message() << ")";
    }
}
