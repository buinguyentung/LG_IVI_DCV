# import os
import pickle

def main():
	man = []
	other = []
	try:
		with open('sketch.txt') as data:
			for each_line in data:
				try:
					(role, spoken) = each_line.split(':', 1)
					each_line = each_line.strip()
					if role == 'Man':
						man.append(each_line)
					elif role == "Other Man":
						other.append(each_line)
				except ValueError:
					pass
	except IOError as err:
		print "The data file is missing", str(err)

	# print content to output file
	try:
		# with open('sketch_man.txt', 'w') as man_file:
		# 	man_file.write(str(man))
		with open('sketch_man_pickle.txt', 'wb') as man_file:
			pickle.dump(man, man_file)

		with open('sketch_other.txt', 'w') as other_file:
			other_file.write(str(other))
	except IOError as err:
		print("File error", str(err))
	except pickle.PickleError as err:
		print("Pickling error ", str(err))
	# finally:
	# 	man_file.close()
	# 	other_file.close()

if __name__ == '__main__':
	main()