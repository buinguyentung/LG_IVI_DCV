#ifndef LOG_H
#define LOG_H

#include <sstream>

enum LogLevel
{
    LOG_ERROR,
    LOG_WARNING,
    LOG_INFO,
    LOG_DEBUG,
    LOG_DEBUG1,
    LOG_DEBUG2,
    LOG_DEBUG3,
    LOG_ALL
};

#define LOG(level) \
    if (level > Log::reportingLevel()) ; \
    else Log(level)

// Simple logging class
class Log
{
public:
    Log(LogLevel level = LOG_INFO);
    virtual ~Log();

    static LogLevel& reportingLevel();
    static std::string& name();

    template<typename T>
    Log& operator<<(T const &value)
    {
        _os << value;
        return *this;
    }

protected:
    std::ostringstream _os;
    std::string _name;

private:
    Log(const Log&);
    Log& operator=(const Log&);

    LogLevel _logLevel;
};

#endif // LOG_H
