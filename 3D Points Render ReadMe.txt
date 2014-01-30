3D Points Render Description:

1. Calculate the centroid from an imported text file with points positions. 
The point position's format is like "x y z m", where x,y,z represent the position of the point in 3D space and m represents the mass of the point. There can be multiple space ' ' between x,y,z,m. For example, "1  2 3      4", which is one line in a text file, is valid. 
Moreover, if 'm' is 1.0 for all the points, then the centroid reverts to the average. Where 'm' != 1.0, the centroid will shift in space according to the mass distribution and the spatial distribution. 
x,y,z can be any float/int value. m should be > 0.

2. Display all the points from the imported text file and centroid. The point with the largest mass has the biggest opacity. The point with the smallest mass has the smallest opacity.

3. Display all the lines between the centroid with other points;

4. Calculate the cost (sum distance between centroid with other points);

5. Calculate the deviation of centroid in each dimension (x, y ,z).

PS: This project uses an open-source JavaScript library to display 3D points and lines.
    The library can be found on http://www.goxtk.com/