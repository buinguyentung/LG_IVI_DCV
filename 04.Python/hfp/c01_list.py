
import sys

# List of lists
movies = ["Tom and Jerry", 1950, "Disney Channel", 100,
			["Tom", "Jerry"], ["Dog", ["Bird", "Sparrow", "Duck"], "Fish"]]
namex = ["Bird"]

def list_print(list_name, fh = sys.stdout, indent = False, level = 0):
	for item in list_name:
		if isinstance(item, list):
			list_print(item, fh, indent, level + 1)
		else:
			if indent:
				for tabb in range(level):
					fh.write("\t")
			fh.write(str(item) + "\n")
			# fh.write("\n")

def main():
	print movies[4][1]	# print "Jerry"

	with open('nester.txt', 'w') as data:
		list_print(movies, data, True)

if __name__ == '__main__':
	main()
