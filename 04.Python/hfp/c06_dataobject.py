
def sanitize(time_string):
	if '-' in time_string:
		splitter = '-'
	elif ':' in time_string:
		splitter = ':'
	else:
		splitter = '.'
	(mins, secs) = time_string.split(splitter)
	return mins + "." + secs

def read_file(file_name):
	try:
		with open(file_name) as fh:
			data = fh.readline()
		data = data.strip().split(',')
		# data_dict = {}
		# data_dict['Name'] = data.pop(0)
		# data_dict['DOB'] = data.pop(0)
		# data_dict['Times'] = data
		# data_dict['Times'] = sorted(set([sanitize(item) for item in data]))

		return AthleteList(data.pop(0), data.pop(0), data)
	except IOError as err:
		print "File error: ", err
		return None

# Custom class
class Athlete:
	def __init__(self, a_name, a_dob = None, a_times = []):
		self.name = a_name
		self.dob = a_dob
		self.times = a_times

	def top3(self):
		return sorted(set([sanitize(item) for item in self.times]))[0:3]

	def add_times(self, new_times):
		self.times.extend(new_times)

# Python built-in class
class AthleteList(list):
	def __init__(self, a_name, a_dob = None, a_times = []):
		list.__init__([])
		self.name = a_name
		self.dob = a_dob
		self.extend(a_times)

	def top3(self):
		return sorted(set([sanitize(item) for item in self]))[0:3]

def main():
	james = read_file("james2.txt")
	julie = read_file("julie2.txt")
	mikey = read_file("mikey2.txt")
	sarah = read_file("sarah2.txt")

	# Using Custom class
	# print james.name, "'s fastest times are:", str(james.top3())
	# james.add_times(["1.59", "1.58", "2.51"])
	# print james.name, "'s fastest times are:", str(james.top3())

	# Using built-in class
	print james.name, "'s fastest times are:", str(james.top3())
	james.extend(['1.41', '3.01'])
	print james.name, "'s fastest times are:", str(james.top3())

if __name__ == '__main__':
	main()