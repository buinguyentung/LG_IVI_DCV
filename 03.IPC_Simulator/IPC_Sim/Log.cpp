#include <cstdio>
#include <ctime>
#include <iostream>

#include "Log.h"

const char* LEVEL_NAME[8] = {
    "ERR",
    "WRN",
    "INF",
    "DB0",
    "DB1",
    "DB2",
    "DB3",
    "ALL"
};

#if __cplusplus < 201103L
std::string currentTime()
{
    std::time_t now = std::time(NULL);
    char timeStr[20] = {0};
    std::strftime(timeStr, sizeof(timeStr), "%H:%M:%S", std::localtime(&now));
    return timeStr;
}
#else
// Use C++11 std::chrono for more precise time
#include <chrono>
std::string currentTime()
{
    using namespace std::chrono;
    system_clock::time_point now = system_clock::now();

    std::time_t nowTime = system_clock::to_time_t(now);
    char timeStr[20] = {0};
    std::strftime(timeStr, sizeof(timeStr), "%H:%M:%S", std::localtime(&nowTime));

    char msStr[25] = {0};
    system_clock::duration since_epoch = now.time_since_epoch();
    since_epoch -= duration_cast<seconds>(since_epoch);
    std::sprintf(msStr, "%s.%03u", timeStr,
            static_cast<unsigned>(duration_cast<milliseconds>(since_epoch).count()));
    return msStr;
}
#endif

Log::Log(LogLevel level)
{
    _os << "-[" << LEVEL_NAME[level] << "][" << currentTime() << "]"
        << (Log::name().empty() ? "" : "[" + Log::name() + "]")
        << std::string(level > LOG_DEBUG ? (level - LOG_DEBUG) * 2 : 1, ' ');
}

LogLevel& Log::reportingLevel()
{
    static LogLevel level;
    return level;
}

std::string& Log::name()
{
    static std::string name;
    return name;
}

Log::~Log()
{
    _os << std::endl;
    std::cerr << _os.str();
    //fprintf(stderr, "%s", _os.str().c_str());
    //fflush(stderr);
}

