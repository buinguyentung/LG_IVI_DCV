#include "IPCServer.h"
#include "Log.h"

#include "cmn2/global/CGlobalData.h"
#include "cmn2/utils/CMqUtil.h"
#include "LGDeviceProjectionGCI.h"
#include "IPCheader.h"

// namespace merging
using websocketpp::connection_hdl;

/**
 * @brief IPCServer::IPCServer
 * @param port The port the server listens on.
 * @param ipv4Only The Internet protocol to use.
 */
IPCServer::IPCServer(int port, bool ipv4Only)
    : WebsocketServer(port, ipv4Only)
{
    Log::reportingLevel() = LOG_ALL;
    Log::name() = "IPC Sim";
}

static std::string toBinStr(uint8_t b)
{
    const int BYTE_SZ = 8;
    char bits[BYTE_SZ + 2];   // format: bbbb_bbbb
    bits[BYTE_SZ+1] = '\0';
    for (int i = 0; i < BYTE_SZ; ++i) {
        int offset = (i < 4) ? (BYTE_SZ - i) : (BYTE_SZ - i - 1);
        bits[offset] = ((b >> i) & 0x01) + '0';
    }
    bits[4] = '_';
    return bits;
}

/**
 * @brief Dump IPC data as Hex and Char strings.
 * @param data Data to be dumped.
 * @param len  Length of the data.
 *
 * @details For example:
 *        Hex                                      Char
 *    0h: 0C73 7065 6564 2072 6570 6F72 0064 6973  .s pe ed  r ep or .d is
 *   10h: 7461 6E63 6520 6472 6976 651F 4100 7E00  ta nc e  dr iv e. A. ~.
 *   20h: A700 8900 0000                           �. �. .. .. .. .. .. ..
 */
static void dumpData(const uint8_t* data, int len)
{
    if (len <= 0) return;
    int bytesPerLine = 16;
    int width = bytesPerLine * 2 + bytesPerLine / 2 - 1;
    std::string logName("[data]");
    std::ostringstream oss;
    oss << "data=\n" << logName << "        "
        << std::setw(width) << std::left << "Hex" << "  "
        << std::setw(width) << std::left << "Char"
        << std::right;
    for (int i = 0; i < len; i += bytesPerLine) {
        if ((i % bytesPerLine) == 0) {
            oss << "\n" << logName << std::setw(5) << i << "h: ";
        }
        int c = i;
        while (c < i + bytesPerLine && c < len) {
            oss << std::hex << std::uppercase;
            if (c % 2 == 0) {
                oss << std::setfill('0') << std::setw(2) << (int)data[c];
            } else {
                oss << std::setfill('0') << std::setw(2) << (int)data[c]
                    << std::setfill(' ') << " ";
            }
            c++;
        }
        oss << " ";
        c = i;
        while (c < i + bytesPerLine && c < len) {
            oss << (char)(data[c] > 31 ? data[c] : '.');
            if (c % 2) oss << " ";
            c++;
        }
    }
    oss << std::dec << std::endl;
    LOG(LOG_DEBUG1) << oss.str();
}

/**
 * @brief Decode the message from the sender and send IPC message to AppMain.
 * @param msg Message received from the sender.
 * @return 0 if send OK, 1 if fail to send.
 */
static int sendIPCMessage(const std::string& msg)
{
    // decode the IPC message received
    uint8_t* payload = (uint8_t*)msg.c_str();
    uint32_t mgr = *(uint32_t*)payload;                         // first 4 bytes: dest ID
    uint32_t cmd = *(uint32_t*)(payload + sizeof(uint32_t));    // second 4 bytes: IPC cmd
    uint32_t len = *(uint32_t*)(payload + 2*sizeof(uint32_t));  // third 4 bytes: data length
    uint8_t* data = (uint8_t*)(payload + 3*sizeof(uint32_t));
    LOG(LOG_DEBUG)  << "IPC message:";
    LOG(LOG_DEBUG1) << "mgr =[" << mgr << "]";
    LOG(LOG_DEBUG1) << "cmd =[" << cmd  << "]";
    LOG(LOG_DEBUG1) << "len =[" << len  << "]";
    dumpData(data, len);

    // send the IPC message to AppMain using MQ
    base::CGlobalData::get_instance()->set_proc_id((ProcId)mgr);
    int ret = base::CMqUtil::get_instance()->send_message_queue(
                IDP_APP_MAIN,
                cmd,
                data,
                len);
    base::CGlobalData::get_instance()->set_proc_id(MAX_PROC_NAME);
    return ret;
}

/**
 * @brief Handlle incoming messages
 * @param hdl Connection handle.
 * @param msg Pointer to received message.
 */
void IPCServer::onMessage(connection_hdl hdl, ws_server::message_ptr msg)
{
    LOG(LOG_DEBUG) << "onMessage called with hdl <" << hdl.lock().get() << ">";

    std::string res;
    if (sendIPCMessage(msg->get_payload()) == 0) {
        res = "IPC message sent to AppMain OK!";
    } else {
        res = "Failed to send IPC message to AppMain!";
    }

    // send back result to client
    try {
        _ws.send(hdl, res, websocketpp::frame::opcode::text);
    } catch (const websocketpp::lib::error_code& e) {
        LOG(LOG_ERROR) << "failed to send message to client: " << "(" << e.message() << ")";
    }
}
