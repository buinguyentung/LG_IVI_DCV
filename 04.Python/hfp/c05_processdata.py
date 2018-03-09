
def sanitize(time_string):
	if '-' in time_string:
		splitter = '-'
	elif ':' in time_string:
		splitter = ':'
	else:
		splitter = '.'

	(mins, secs) = time_string.split(splitter)

	return mins + "." + secs

# return the sorted list
def sort_list(list_name):
	for i in range(len(list_name)):
		 list_name[i] = sanitize(list_name[i])

	list_name.sort(reverse = True)

	return list_name

# remove duplicates in list and return unique list
def remove_duplicate_list(list_name, list2):
	unique_list = []
	for item in list_name:
		if item not in unique_list:
			unique_list.append(item)
	return unique_list, hgjhgh

def read_file(file_name):
	with open(file_name) as fh:
		data = fh.readline()
	return data


def main():
	data = read_file("james.txt")
	james = data.strip().split(",")
	data = read_file("julie.txt")
	julie = data.strip().split(",")
	data = read_file("mikey.txt")
	mikey = data.strip().split(",")
	data = read_file("sarah.txt")
	sarah = data.strip().split(",")

	# james = sort_list(james)
	# julie = sort_list(julie)
	# mikey = sort_list(mikey)
	# sarah = sort_list(sarah)

	clean_james = sorted(set([sanitize(item) for item in james]))
	clean_julie = sorted(set([sanitize(item) for item in julie]))
	clean_mikey = sorted(set([sanitize(item) for item in mikey]))
	clean_sarah = sorted(set([sanitize(item) for item in sarah]))

	# unique_james = remove_duplicate_list(clean_james)
	# unique_julie = remove_duplicate_list(clean_julie)
	# unique_mikey = remove_duplicate_list(clean_mikey)
	# unique_sarah = remove_duplicate_list(clean_sarah)

	print clean_james[0:3]
	print clean_julie[0:3]
	print clean_mikey[0:3]
	print clean_sarah[0:3]

if __name__ == '__main__':
	main()