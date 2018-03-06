# genIpcData.py --- generates ipc_all.json, ipcEnum.json and ipcStruct.json

import os, glob, re

print("IMPORTANT: Please run this script in HMI\IPC\ folder")
raw_input("Press Enter to generate IPC data JSON files!")

# for each .cpp file in "HMI\IPC\EventsHandler\IPCReceiveHandler\" folder
rcv2Ipc = {}
files = []
for ext in ['*.cpp', '*.h']:
    files.extend(glob.glob(os.path.join("EventsHandler/IPCReceiveHandler/", ext)))

for rcvHandlerFile in files:
    try:
        with open(rcvHandlerFile, 'r') as cppFile:
            for line in cppFile:
                # read line having "ADD_CMD(" and get IPC cmd:
                found = re.search(r'^\s*ADD_CMD\(([0-9A-Z_]+),\s*(&|)(\w+)', line, re.I)
                if found:
                    ipcName = found.group(1)
                    rcvName = found.group(3)
                    if rcvName not in rcv2Ipc.keys():
                        rcv2Ipc[rcvName] = []
                    rcv2Ipc[rcvName].append(ipcName)
    except IOError:
        print("ERROR: Could not open file " + rcvHandlerFile + "!")

# read file rcvManagerFilename to get IDP_MGR names: xxxRcvHandler -> IDP_XXX_YYY
rcv2Mgr = {}
rcv2Mgr['NULL'] = 'NULL'
try:
    with open("LGIntegration/Common/Managers/MSGRcvManager.cpp", 'r') as rcvManagerFile:
        for line in rcvManagerFile:
            found = re.search(r'add_listener\(static_cast<int>\(([A-Z_]+)\),\s*new\s*(\w+)', line, re.M)
            if found:
                mgrId = found.group(1)
                rcvName = found.group(2)
                rcv2Mgr[rcvName] = mgrId
except IOError:
    print("ERROR: Could not open file MSGRcvManager.cpp!")


# get IDP_MGR ids: IDP_XXX_YYY -> nn
mgr2Id = {}
mgr2Id['NULL'] = -1
try:
    with open("../../../Inc/cmn2/GlobalHeader.h", 'r') as hdrFile:
        for line in hdrFile:
            found = re.search(r'^\s*(IDP_[A-Z_]+)\s*=\s*([0-9]+),', line, re.M)
            if found:
                k = found.group(1)
                v = found.group(2)
                mgr2Id[k] = v
except IOError:
    print("ERROR: Could not open file GlobalHeader.h!")

# from rcv2Ipc, rcv2Mgr build ipc2Mgr
ipc2Mgr = {}
for rcvName, ipcList in rcv2Ipc.iteritems():
    mgrName = ''
    if rcvName in rcv2Mgr.keys():
        mgrName = rcv2Mgr[rcvName]
    else:
        continue

    for ipcName in ipcList:
        if ipcName not in ipc2Mgr.keys():
            ipc2Mgr[ipcName] = []
        ipc2Mgr[ipcName].append(mgrName)


# build dict: {ipc_name: ipc_id,}
ipc2Id = {}
try:
    with open("../../../Inc/DCV/IPCheader.h", 'r') as ipcFile:
        ipcId = 0
        count = 0
        for line in ipcFile:
            found = re.search(r'^\s*(([0-9A-Z]+_)+[0-9A-Z]+)(,|\s*=\s*|)(\w*)', line, re.M)
            if found:
                #print("line: '" + line + "'")
                count += 1
                #print("current id: " + str(ipcId))
                name = found.group(1);
                id   = found.group(4);
                if id:
                    ipcId = int(id, 16)
                else:
                    ipcId += 1
                #print(name + ": " + str(ipcId))
                ipc2Id[name] = ipcId
    print("Number of IPCs: {}".format(count))
except IOError:
    print("ERROR: Could not open file IPCheader.h!")

# generate ipc_all.json file
ipcFile = "ipc_all.json"
try:
    with open(ipcFile, 'w') as jsonFile:
        jsonFile.write('{')
        nIpc = 0
        nTotal = len(ipc2Mgr.keys())
        for ipcName, mgrList in ipc2Mgr.iteritems():
            if ipcName not in ipc2Id.keys():
                nTotal -= 1
                continue
            nIpc += 1
            jsonFile.write('\n  "' + ipcName + '": {\n')
            ipcId = str(ipc2Id[ipcName])
            jsonFile.write('    "id": ' + ipcId + ',\n')
            jsonFile.write('    "mgr": {\n')
            nMgr = 0
            for mgrName in mgrList:
                nMgr += 1
                mgrId = str(mgr2Id[mgrName])
                jsonFile.write('      "' + mgrName + '": ' + mgrId)
                jsonFile.write('\n') if nMgr == len(mgrList) else jsonFile.write(',\n')
            jsonFile.write('    },\n')
            jsonFile.write('    "type": ""\n')
            jsonFile.write('  }\n') if nIpc == nTotal else jsonFile.write('  },\n')
        jsonFile.write('}\n')
    print("File " + ipcFile + " created successfully!")
except IOError:
    print("ERROR: Could not open file " + ipcFile + " for writing!")

# build dict: {enum: {name:val,},}
enumDict = {}
try:
    for file in glob.glob(os.path.join("../../../Inc/DCV/", 'LG*.h')):
        if re.search(r'LGDevGCI|LGVPMGCI|LGNaviGCI', file, re.M): continue
        with open(file, 'r') as gciFile:
            defines = {}
            enumName = ""
            currentVal = 0
            for line in gciFile:
                # get define macros for lengths: #define LG* (nn)
                found = re.search(r'^#define\s+([A-Z_]+)\s+\(([0-9]+)\)', line, re.M)
                if found:
                    name = found.group(1)
                    val  = found.group(2)
                    defines[name] = int(val)
                    continue

                # line: #define LG* "/foo/bar"
                found = re.search(r'^#define\s+([A-Z_]+)\s+"(.+)"', line, re.M)
                if found:
                    name = found.group(1)
                    val  = found.group(2)
                    defines[name] = val
                    continue

                # check if line is 'enum eLG*'
                found = re.search(r'^\s*enum\s+(eLG\w+)', line, re.M)
                if found:
                    enumName = found.group(1)
                    currentVal = 0
                    enumDict[enumName] = []
                    continue

                if re.search(r'};', line, re.M):
                    enumName = ""
                    currentVal = 0
                    continue

                if not enumName: continue

                # check if line is an enum identifier: IDENTIFIER = value
                found = re.search(r'^\s*([0-9A-Za-z_]+)\s*=\s*((0[xX])*[0-9A-Fa-f]+)', line, re.M)
                #print("line:" + line)
                if found:
                    id  = found.group(1)
                    currentVal = int(found.group(2), 16) if found.group(3) else int(found.group(2))
                    enumDict[enumName].append({id:currentVal})
                    currentVal += 1
                    continue

                # check if line is an enum identifier: IDENTIFIER,*
                found = re.search(r'^\s*([0-9A-Za-z_]+)\s*,*', line, re.M)
                if found:
                    id = found.group(1)
                    enumDict[enumName].append({id:currentVal})
                    currentVal += 1
except IOError:
    print("ERROR: Could not open file!")

# generate ipcEnum.json file
ipcFile = "ipcEnum.json"
try:
    with open(ipcFile, 'w') as jsonFile:
        jsonFile.write('var ipcEnum = {')
        nEnum = 0
        for name, idList in enumDict.iteritems():
            nEnum += 1
            jsonFile.write('\n  "' + name + '": [\n')
            nId = 0
            for id in idList:
                for k, v in id.iteritems():
                    jsonFile.write('    {"' + k + '": ' + str(v) + '}')
                nId += 1
                jsonFile.write('\n') if nId == len(idList) else jsonFile.write(',\n')
            jsonFile.write('  ]\n') if nEnum == len(enumDict.keys()) else jsonFile.write('  ],\n')
        jsonFile.write('}\n')
    print("File " + ipcFile + " created successfully!")
except IOError:
    print("ERROR: Could not open file " + ipcFile + " for writing!")

# build dict: {struct: {field: type,}
structDict = {}
try:
    for file in glob.glob(os.path.join("../../../Inc/DCV/", 'LG*.h')):
        if re.search(r'LGDevGCI|LGVPMGCI|LGNaviGCI', file, re.M): continue
        with open(file, 'r') as gciFile:
            defines = {}
            structName = ""
            currentVal = 0
            for line in gciFile:
                # get define macros for lengths: #define LG* (nn)
                found = re.search(r'^#define\s+([A-Z0-9_]+)\s+\(([0-9]+)\)', line, re.M)
                if found:
                    name = found.group(1)
                    val  = found.group(2)
                    defines[name] = int(val)
                    continue

                # line: #define LG* "/foo/bar"
                found = re.search(r'^#define\s+([A-Z0-9_]+)\s+"(.+)"', line, re.M)
                if found:
                    name = found.group(1)
                    val  = found.group(2)
                    defines[name] = val
                    continue

                # check if line is 'struct LG*_t'
                found = re.search(r'^\s*struct\s+(LG\w+_t)', line, re.M)
                if found:
                    structName = found.group(1)
                    currentVal = 0
                    structDict[structName] = []
                    continue

                if re.search(r'};', line, re.M):
                    structName = ""
                    currentVal = 0
                    continue

                if not structName: continue

                # type and field name
                found = re.search(r'^\s*(\w+)\s*(\w+)(|\[(\w+)\]|\s*(:[0-9]+))\s*;', line, re.M)
                if found:
                    type = found.group(1)
                    name = found.group(2)
                    lenName = found.group(4)
                    bits = found.group(5)
                    if lenName:
                        if lenName in defines:
                            type = type + '[' + str(defines[lenName]) + ']'
                        elif lenName == '0':
                            continue
                        else:
                            #print("******* " + lenName + " *********" + line)
                            type = type + found.group(3)
                    if bits:
                        type = type + bits
                    structDict[structName].append({name:type})
except IOError:
    print("ERROR: Could not open file!")

# generate ipcStruct.json file
ipcFile = "ipcStruct.json"
try:
    with open(ipcFile, 'w') as jsonFile:
        jsonFile.write('var ipcStruct = {')
        nStruct = 0
        for name, fieldList in structDict.iteritems():
            nStruct += 1
            jsonFile.write('\n  "' + name + '": [\n')
            nId = 0
            for id in fieldList:
                for k, v in id.iteritems():
                    jsonFile.write('    {"' + k + '": "' + v + '"}')
                nId += 1
                jsonFile.write('\n') if nId == len(fieldList) else jsonFile.write(',\n')
            jsonFile.write('  ]\n') if nStruct == len(structDict.keys()) else jsonFile.write('  ],\n')
        jsonFile.write('};\n')
    print("File " + ipcFile + " created successfully!")
except IOError:
    print("ERROR: Could not open file " + ipcFile + " for writing!")
