# Run program by command:
# 		python ex13_param.py one two three four

from sys import argv

def main():
    script, param1, param2, param3, param4 = argv

    print "The script: ", script
    print "Your first param is: ", param1
    print "Your second param is: ", param2
    print "Your third param is: ", param3
    print "Your fourth param is: ", param4

if __name__ == '__main__':
    main()
