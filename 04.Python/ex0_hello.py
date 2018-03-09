print "Hello"

days = ["Monday", "Tuesday", "Wednesday", ]

base = 10

LG_range = ["E1", "E2", "S1", "S2", "PL", "MM", "SM", "GM"]
LG_pairs = [('E1', 1), ('E2', 1), ('S1', 2), ('S2', 3), ('PL', 5), ('MM', 8), ('SM', 13), ('GM', 21)]

rank = raw_input("Input your rank: ")

if rank in LG_range:
    print "OK"
    if r,p in LG_pairs:
        if r == rank:
            print p * base;
else:
    print "Not OK"


