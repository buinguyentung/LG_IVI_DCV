from sys import argv

script, filename = argv

txt = open(filename)
print "Here's your file %r:" % filename
print txt.readline()


# Ex16: writing file
filename = 'file2.txt'
target = open(filename, 'w')
target.truncate()

line1 = raw_input("line 1: ")
line2 = raw_input("line 1: ")

target.write(line1 + "\n")
target.write(line2)

target.close()