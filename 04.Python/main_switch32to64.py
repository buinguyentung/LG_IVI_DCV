# The program's purpose is to switch between Rhapsody 32 bit and 64 bit
# Enter your choice:
#   0 - if you want 32 bit
#   1 - if you want 64 bit

import os
import shutil
import time

rhapsody_dir = "C:\ProgramData\IBM\Rational\Rhapsody\8.1.5\Share"
cur_dir = os.getcwd()
choose_dir = ""
ref_version = ["32bit", "64bit"]
# List of files need to be modified
ref_file = ["qnxcwmake.bat", "QNXCWbuild.mak", "omosconfig.h", "QNXOS.h", "QNXOS.cpp", "factoryC++.prp "]
ref_dir = ["\etc", "\LangCpp", "\LangCpp\osconfig\QNX", "\LangCpp\oxf", "\LangCpp\oxf", "\Properties"]


# Replace file from corresponding ref folder to Share folder
def replace_file():
    # Check if all files are exist
    for n in range(len(ref_file)):
        work_dir = rhapsody_dir + ref_dir[n]
        print work_dir + " - " + ref_file[n]
        if not (os.path.isfile(work_dir + "\\" + ref_file[n])):
            print "...File NOT exist"
            return

    print "All files exist"
    print "Modifying..."
    for n in range(len(ref_file)):
        src_file = choose_dir + "\\" + ref_file[n]
        work_file = rhapsody_dir + ref_dir[n] + "\\" + ref_file[n]
        # work_dir = "C:\\" + ref_file[n]
        # print src_file
        # print work_file
        shutil.copy(src_file, work_file)

def check_precondition():
    print "Please check your directories first."
    # rhapsody directory
    print "1. Rhapsody directory:"
    print "\tC:\ProgramData\IBM\Rational\Rhapsody\8.1.5\Share"
    print "If NOT, please modify in main.py - line 10\n"

    # qnx700 directory
    print "2. qnx700 directory:"
    print "\tC:/qnx700"
    print "If NOT, please modify in \\64bit\qnxcwmake.bat - line 7\n"

def main():
    check_precondition()
    global choose_dir
    while True:
        choice = int(raw_input("Select your version - 0 (for 32) or 1 (for 64): "))
        if choice == 0 or choice == 1:
            print "Your choice = " + ref_version[choice]
            break;
        print "Wrong input"

    choose_dir = cur_dir + "\\" + ref_version[choice]
    print choose_dir

    replace_file()

    print "...Done!!!"
    time.sleep(5)


if __name__ == '__main__':
    main()
