
import pickle
from c07_athletes import *

def get_coach_data(file_name):
	try:
		with open(file_name) as fh:
			data = fh.readline()
		data = data.strip().split(',')
		return AthleteList(data.pop(0), data.pop(0), data)
	except IOError as err:
		print "File error: ", err
		return None

# Read each file in file_list, process data, create new pair (name, info).
# Then store all of them into pickle
def put_to_store(file_list):
	all_athletes = {}

	for fh in file_list:
		data = get_coach_data(fh)
		all_athletes[data.name] = data

	try:
		with open("athletes.pickle", "wb") as fh:
			pickle.dump(all_athletes, fh)
	except IOError as err:
		print "File error (put_to_store):", str(err)

	return all_athletes

def get_from_store():
	all_athletes = {}
	try:
		with open("athletes.pickle", "rb") as fh:
			all_athletes = pickle.load(fh)
	except IOError as err:
		print "File error (get_from_store):", str(err)

	for key in all_athletes:
		print all_athletes[key].dob, all_athletes[key]
	return all_athletes

def main():
	file_list = ["james2.txt", 'julie2.txt', 'mikey2.txt', 'sarah2.txt']
	put_to_store(file_list)
	all_athletes = get_from_store()

if __name__ == '__main__':
	main()