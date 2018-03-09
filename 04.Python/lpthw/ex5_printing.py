# python -m pydoc os, sys, open, file

def main():
    # exercise 5-9
    my_name = "Tung"
    my_age = 26
    my_hair = 'Black'

    print "Let's talk about %s" % my_name
    print "I am %d years old" % my_age
    print "I got %r hair." % my_hair


    # exercise 10
    chubby_cat = "\tI'm a chubby cat"
    persian_cat = "I'm split \non a line"
    black_cat = "I'm a \\ black \\ cat"
    print chubby_cat
    print persian_cat
    print black_cat


    # exercise 11
    print "Input your position: "
    position = raw_input()
    salary = int(raw_input("Input your salary: "))

    print "So you are a/an %s, and your salary is %d" % (position, salary)

if __name__ == '__main__':
    main()

# day = ["Monday", "Tuesday", "Wenesday"]
