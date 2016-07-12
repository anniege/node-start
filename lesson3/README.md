#Instruction to ImgOpt-Cli utility
##A tool for rapidly optimization of images

####How to install

npm install -g (in cloned repository of utility)


####Examples of use


**Get current version of utility:**

```
imgOptimize -v 
```

**Get help on commands:**

```
imgOptimize -h
```


**Simple optimization:**

1) To optimize image use option -i or --input and then specify the path to your file:

```
imgOptimize -i <filePathToImage>
```

2) To resize the image along with optimization use command *resize* with options:

-i or --input <filePathToImage> 
- e or --exact (optional) <width> <height> (width and height of image that will be resized to, in other case, default values -  width:500 and height:300 will be applied)


```
imgOptimize resize -i <filePathToImage> -e <width> <height>
```