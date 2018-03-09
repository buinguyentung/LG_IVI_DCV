# https://btc-e.com/

import urllib
import json
import time
import os
import sys
from datetime import datetime

# List of All to usd
currency = ['nvc', 'nmc', 'ppc']
low_price = [9.35, 2.3, 2.25]
high_price = [9.7, 2.7, 2.6]
sell_price = 0.0
buy_price = 0.0
chance_number = 0

def getPrice(n):
    global chance_number

    ref_key = currency[n] + "_usd"
    ref_link = "https://btc-e.com/api/3/ticker/" + currency[n] + "_usd"
    # print ref_link

    ticker = json.load(urllib.urlopen(ref_link))
    sell_price = float(ticker[ref_key]['sell'])
    buy_price = float(ticker[ref_key]['buy'])
    print "%s: sell = %0.3f;  buy = %0.3f" % (currency[n], sell_price, buy_price)

    if (low_price[n] >= buy_price):
        print "HEY. DUMP. YOU SHOULD CONSIDER TO BUY SOME!"
        chance_number += 1

    if (high_price[n] <= sell_price):
        print "BUMP. BUMP. SHOULD YOU SELL TO GET $"
        chance_number += 1

def main():
    while True:
        now = datetime.now()
        print "%s-%s-%s  %s:%s    CHANCE=%d" % (now.year, now.month, now.day, now.hour, now.minute, chance_number)

        # ticker = json.load(urllib.urlopen("https://btc-e.com/api/3/ticker/btc_usd"))
        # print ticker["btc_usd"]['sell'], ticker["btc_usd"]['buy']
        for i in range(len(currency)):
            getPrice(i)
        print "\n"
        time.sleep(120) # every 5 minutes

if __name__ == '__main__':
    main();
