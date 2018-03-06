TEMPLATE = app

CONFIG += console c++11
CONFIG -= app_bundle qt

TARGET = IPCSim

INCLUDEPATH += $$PWD/.
INCLUDEPATH += $$PWD/../libs/wspp
INCLUDEPATH += $$PWD/../libs/asio/include
INCLUDEPATH += $$PWD/../../Inc
INCLUDEPATH += $$PWD/../../Inc/DCV
INCLUDEPATH += $$PWD/../../Inc/cmn2

LIBS += -lsocket -lmq
LIBS += "$$PWD/../../Inc/cmn2/lib/libcmnbase2.so"
LIBS += "$$PWD/../../Inc/cmn2/lib/liblogger.so"

DEFINES+="ASIO_STANDALONE"

SOURCES += main.cpp \
    WebsocketServer.cpp \
    IPCServer.cpp \
    Log.cpp

HEADERS += \
    WebsocketServer.h \
    IPCServer.h \
    Log.h
