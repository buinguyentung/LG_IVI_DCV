""" Note: Potential to silently ignore runtime errors when using try ... except
"""

# import os

def main():
	# if os.path.exists('sketch.txt'):
	try:

		data = open('sketch.txt')

		for each_line in data:
			# if each_line.find(':') >= 0:
			try:
				(role, spoken) = each_line.split(':', 1)
				print role,
				print " said: ",
				print spoken,
			except ValueError:
				print each_line,
				pass

		data.close();
	# else:
	except IOError:
		print "The data file is missing"

if __name__ == '__main__':
	main()