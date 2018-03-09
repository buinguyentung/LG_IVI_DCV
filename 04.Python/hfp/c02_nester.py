import nester

# List of lists
movies = ["Tom and Jerry", 1950, "Disney Channel", 100,
			["Tom", "Jerry"], ["Dog", ["Bird", "Sparrow", "Duck"], "Fish"]]

def main():
	with open('nester.txt', 'w') as data:
		nester.list_print(movies, True, 1, data)

if __name__ == '__main__':
	main()
