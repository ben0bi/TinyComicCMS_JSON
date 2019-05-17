
def convImg(txt):
	print("Converting to Image-Entry...")
	ret ='	{\n		"ID": '
	pos=0
	intext=0
	for c in txt:
		if(c=="," and intext==0): # add position after comma
			if(pos == 1): # first position was id, second is title.
				ret=ret+',\n		"TITLE": "'
			if(pos == 2): # image.
				ret=ret+'",\n		"IMAGE": "'
			if(pos == 3): # datetime.
				ret=ret+'",\n		"DATETIME": "'
			if(pos == 4): # order.
				ret=ret+'",\n		"ORDER": '
			pos=pos+1
		else:
			if(pos==1 or pos==5): #first position is id
				if(c!=")"):
					ret=ret+c
			if(pos==2 or pos==3 or pos==4):
						# second, third, fourth position:
						# title, text, datetime
				if(intext==1 and c!="'"):
					ret=ret+c
				if(c=="'"):
					if(intext==0):
						intext=1
					else:
						intext=0
			if(c=='(' and pos==0):	# add position after first (
				pos=pos+1
			if(c==')' and pos==5):	# end
				ret = ret+'\n	}'
				pos=pos+1
	return ret

def convBlg(txt):
	print("Converting to Blog-Entry...")
	ret ='	{\n		"ID": '
	pos=0
	intext=0
	for c in txt:
		if(c=="," and intext==0): # add position after comma
			if(pos == 1): # first position was id, second is title.
				ret=ret+',\n		"TITLE": "'
			if(pos == 2): # text.
				ret=ret+'",\n		"TEXT": "'
			if(pos == 3): # imageid.
				ret=ret+'",\n		"IMAGEID": '
			if(pos == 4): # datetime.
				ret=ret+',\n		"DATETIME": "'
			pos=pos+1
		else:
			if(pos==1 or pos==4): # first, fourth position:
					      # id, imageid
				ret=ret+c
			if(pos==2 or pos==3 or pos==5):
						# second, third, fift position:
						# title, text, datetime
				if(intext==1 and c!="'"):
					ret=ret+c
				if(c=="'"):
					if(intext==0):
						intext=1
					else:
						intext=0
			if(c=='(' and pos==0):	# add position after first (
				pos=pos+1
			if(c==')' and pos==5):	# end
				ret = ret+'"\n	}'
				pos=pos+1
	return ret

f = open("starforce.sql","r",1)

st = f.readlines()

ln = raw_input("Line Number (ENTER for first line): > ")
if(ln==''):
	ln=0

ln = int(ln)
if(ln<=0):
	ln=0

# do not add a comma if this is 1
firstblog = 1
firstimage = 1

blogs='{\n"BLOGPOSTS":[\n'
images = '{\n"IMAGES":[\n'

for i in range(len(st)):
	q = st[i]
	print("\n\nLN: "+str(i)+" ___________________________________________________________\n")
	print q
	add = "** not used **"
	if(ln<=i):
		p=raw_input("1: to Images | 2: to Blog | 3: <Save..> | ENTER: Go ahead > ")
		if(p=="1"):
			add = convImg(q)
			if(firstimage==0):
				images=images+",\n"
			firstimage=0
			images = images + add
		if(p=="2"):
			add = convBlg(q)
			if(firstblog==0):
				blogs=blogs+",\n"
			firstblog=0
			blogs=blogs+add
		if(p=="3"):
			pp=raw_input("1: save Images | 2: save Blogposts | ENTER: Cancel > ")
			s="*** nothing saved ***"
			fname=""
			if(pp=="1"):
				s = images + "\n]\n}"
				fname="imagedb.json"
			if(pp=="2"):
				s = blogs + "\n]\n}"
				fname = "blogdb.json"
			print("*** Save output: ***")
			if(fname!=""):
				qf = open(fname, "w")
				qf.write(s)
				qf.close()
			print(s)
			print("*** ENDOF save output ***")
	print(" ")
	print(add)

f.close()
