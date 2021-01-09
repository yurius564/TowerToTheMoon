from PIL import Image

img = Image.open('conf.bmp')
img = img.convert('RGB')
pix = img.load()

gridmap = [['' for i in range(img.size[1])] for i in range(img.size[0])] 
for y in range(img.size[1]):
    for x in range(img.size[0]):
        if pix[x,y] == (0,0,0):
          gridmap[x][y] = "#"
        elif pix[x,y] == (255,0,0):
          gridmap[x][y] = "F"
        elif pix[x,y] == (0,255,0):
          gridmap[x][y] = " "
        else:
          gridmap[x][y] = ""


with open("static/js/conf.js", "w") as f:
    f.write(f"const PRECONFIG = {str(gridmap)};")