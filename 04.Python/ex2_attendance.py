# http://172.16.219.6:8080

import requests

LOGIN_PATH = "http://172.16.219.6:8080/Account/Login"

s = requests.Session()

def login(u, p):
    values = {'Username' : u, 'Password': p}
    r = s.post(LOGIN_PATH, data = values)

    return r

def main():
    u = raw_input("Username: ");
    p = raw_input("Password: ");
    print login(u, p)

if __main__ == '__main__':
    main()


