with open('mens_knight_invite14.txt') as f:
	print "name,place,adjplace,team,time"
	for line in f.readlines():
		print line[21:43].rstrip() + "," + line[2:5].strip() + "," + line[5:12].strip() + "," + line[43:70].rstrip().replace(" ","_").replace("(","").replace(")","").replace(".","") + "," + line[83:88].rstrip()
