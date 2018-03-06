# genIpc2Idp.py --- generates Ipc2Idp.json file that maps IPC cmd IDs to IDP IDs

import os, glob, re

print("IMPORTANT: Please run this script in HMI\IPC\ folder")
raw_input("Press Enter to generate Ipc2Idp.json file!")

# for each .cpp file in "HMI\IPC\EventsHandler\IPCReceiveHandler"
# xxxRcvHandler -> IPC_XXX_YYY
cls2Ipc = {}
files = []
for ext in ['*.cpp', '*.h']:
    files.extend(glob.glob(os.path.join("EventsHandler/IPCReceiveHandler/", ext)))

for rcvHandlerFile in files:
    try:
        with open(rcvHandlerFile, 'r') as cppFile:
            clsFound = None
            clsName = ''
            for line in cppFile:
                # get class name
                # if source file
                if '.cpp' in rcvHandlerFile:
                    if not clsFound:
                        clsFound = re.match(r'void\s+(\w+)::init', line, re.I)

                # if header file
                if '.h' in rcvHandlerFile:
                    if not clsFound:
                        clsFound = re.match(r'class\s+(\w+)\s*:', line, re.I)

                if clsFound and not clsName:
                    clsName = clsFound.group(1)
                    #print "\n==========", clsName, "=========="
                    if clsName not in cls2Ipc.keys():
                        cls2Ipc[clsName] = []

                # read line having "ADD_CMD(" and get IPC cmd:
                found = re.search(r'\s*ADD_CMD\(([0-9A-Z_]+),\s*&', line, re.I)
                if found:
                    ipcName = found.group(1)
                    #print "IPC cmd: ", ipcName
                    cls2Ipc[clsName].append(ipcName)
    except IOError:
        print("ERROR: Could not open file " + rcvHandlerFile + "!")


# read file rcvManagerFilename to get IDP names: xxxRcvHandler -> IDP_XXX_YYY
cls2Idp = {}
try:
    with open("LGIntegration/Common/Managers/MSGRcvManager.cpp") as rcvManagerFile:
        for line in rcvManagerFile:
            found = re.search(r'add_listener\(static_cast<int>\(([A-Z_]+)\),\s*new\s*(\w+)', line, re.I)
            if found:
                idpId = found.group(1)
                clsName = found.group(2)
                cls2Idp[clsName] = idpId
except IOError:
    print("ERROR: Could not open file MSGRcvManager.cpp!")


# get IDP ids: IDP_XXX_YYY -> nn
idp2Id = {}
try:
    with open("../../../Inc/cmn2/GlobalHeader.h", 'r') as hdrFile:
        for line in hdrFile:
            found = re.search(r'\s*(IDP_[A-Z_]+)\s*=\s*([0-9]+),', line, re.I)
            if found:
                k = found.group(1)
                v = found.group(2)
                idp2Id[k] = v
except IOError:
    print("ERROR: Could not open file GlobalHeader.h!")


ipc2idp = {}
for clsName, v in cls2Ipc.iteritems():
    idpName = ''
    if clsName in cls2Idp.keys():
        idpName = cls2Idp[clsName]
    else:
        continue

    for ipcName in v:
        if ipcName not in ipc2idp.keys():
            ipc2idp[ipcName] = []
        ipc2idp[ipcName].append(idpName)


# generate Ipc2Idp.json file
try:
    with open("Ipc2Idp.json", 'w') as jsonFile:
        jsonFile.write('{')
        nIpc = 0
        for ipcName, v in ipc2idp.iteritems():
            nIpc += 1
            jsonFile.write('\n  "' + ipcName + '":\n  {\n')
            nIdp = 0
            for idpName in v:
                nIdp += 1
                if nIdp == len(v):
                    jsonFile.write('    "' + idpName + '": ' + idp2Id[idpName] + '\n')
                else:
                    jsonFile.write('    "' + idpName + '": ' + idp2Id[idpName] + ',\n')
            if nIpc == len(ipc2idp.keys()):
                jsonFile.write('  }\n')
            else:
                jsonFile.write('  },\n')
        jsonFile.write('}\n')
    print("File Ipc2Idp.json created successfully!")
except IOError:
    print("ERROR: Could not open file Ipc2Idp.json for writing!")
