#include "IPCServer.h"

int main(int argc, char *argv[])
{
    // get port number from command line
    int port;
    if (argc == 2) {
        port = std::atoi(argv[1]);
    } else {
        port = DEFAULT_PORT;
    }

    IPCServer ipcsim(port);
    if (ipcsim.init()) {
        ipcsim.run();
    } else {
        return EXIT_FAILURE;
    }
    return EXIT_SUCCESS;
}
