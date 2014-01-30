(function() {

	// getElementById
	function $id(id) {
		return document.getElementById(id);
	}

	// output information
	function Output(msg) {
		var m = $id("messages");
		m.innerHTML = msg + m.innerHTML;
	}

	// file drag hover
	function FileDragHover(e) {
		e.stopPropagation();
		e.preventDefault();
		e.target.className = (e.type == "dragover" ? "hover" : "");
	}

	// file selection
	function FileSelectHandler(e) {

		// cancel event and hover styling
		FileDragHover(e);

		// fetch FileList object
		var files = e.target.files || e.dataTransfer.files;

		// show the result field
		var result = $id("result");
		result.style.display = "inline";
		
		// show the messages field
		var messages = $id("messages");
		messages.style.display = "inline-block";
		
		//hide the drag area after dragging
		var drag_area = $id("drag_area");
		drag_area.style.display = "none";
		
		// process all File objects
		for (var i = 0, f; f = files[i]; i++) {
			ParseFile(f);
		}

	}
	
	var centroid_x = 0;
	var centroid_y = 0;
	var centroid_z = 0;
	var max_mass = 0; // for visualize different positions purpose
	var number_of_points = 0;
	
	// define x,y,z dimension array, for getting deviation
	var x_dimension = new Array();
	var y_dimension = new Array();
	var z_dimension = new Array();
	var mass_array = new Array();
	
	// output file information
	function ParseFile(file) {
		/*
		Output(
			"<p>File information: <strong>" + file.name +
			"</strong> type: <strong>" + file.type +
			"</strong> size: <strong>" + file.size +
			"</strong> bytes</p>"
		);
		*/
		
		// display an image
		/*
		if (file.type.indexOf("image") == 0) {
			var reader = new FileReader();
			reader.onload = function(e) {
				Output(
					"<p><strong>" + file.name + ":</strong><br />" +
					'<img src="' + e.target.result + '" /></p>'
				);
			}
			reader.readAsDataURL(file);
		}
		*/
		
		// display text
		if (file.type.indexOf("text") == 0) {
			var reader = new FileReader();
			reader.onload = function(e) {
				/*
				Output(
					"<p><strong>" + file.name + ":</strong></p><pre>" +
					e.target.result.replace(/</g, "&lt;").replace(/>/g, "&gt;") +
					"</pre>"
				);
				*/
				
				// display data from file in html
				$("#data").html(e.target.result);
				
				// put the 3D positions in an array
			 	var lines = e.target.result.split('\n');
				//var center_point = 0;
				var min_distance = 10000000000; // dummy value
				
				
				
				var x_sum = 0;
				var y_sum = 0;
				var z_sum = 0;
				var temp_x_value = 0;
				var temp_y_value = 0;
				var temp_z_value = 0;
				// lines[i] represents each line in file, parse the data into arrays
				for(var i = 0; i < lines.length; i++){
					// xyz[0], xyz[1], xyz[2] represent one 3D point
					var format_data = lines[i].replace(/\s{2,}/g, ' '); //replaces all the space with single space
					var xyz = format_data.split(' ');
					if(xyz.length != 4){
						continue; // skip the data with wrong format
					}
					else{
						// get point in dimension arrays
						x_dimension[i] = xyz[0];
						y_dimension[i] = xyz[1];
						z_dimension[i] = xyz[2];
						if(max_mass < xyz[3]){
							max_mass = xyz[3];
						}
						mass_array[i] = xyz[3];
						
						// calculate centroid
						temp_x_value = xyz[0] * xyz[3];
						x_sum = x_sum + temp_x_value;
					
						temp_y_value = xyz[1] * xyz[3];
						y_sum = y_sum + temp_y_value;
					
						temp_z_value = xyz[2] * xyz[3];
						z_sum = z_sum + temp_z_value;
						
						number_of_points = number_of_points + 1;
					}
				}
				
				centroid_x = x_sum / x_dimension.length;
				centroid_y = y_sum / y_dimension.length;
				centroid_z = z_sum / z_dimension.length;
				//alert(centroid_x+","+centroid_y+","+centroid_z);
				
				var centroid = new Array(centroid_x, centroid_y, centroid_z);
				
				// calculate the cost from centroid to other points
				var sum_distance = 0;
				for(var l = 0; l < lines.length; l++){
					var format_data2 = lines[l].replace(/\s{2,}/g, ' ');
					var xyz2 = format_data2.split(' ');
					if(xyz2.length != 4){
						continue; // skip the data with wrong format
					}
					
					var dis = lineDistance(centroid, xyz2);
					sum_distance = sum_distance + dis;
				}
				
				// display the result
				$("#center_point").html("<strong>Centroid: (" + centroid_x + ", " + centroid_y + ", " + centroid_z + ")</strong>");
				$("#distance").html("<strong>Cost: " + sum_distance + "</strong><br>(Sum of all distances from the centroid to the other points)");
				
				// calculate deviation and display
				$("#x_sd").html("Deviation of the centroid on X dimension: " + getDeviation(centroid_x, x_dimension));
				$("#y_sd").html("Deviation of the centroid on Y dimension: " + getDeviation(centroid_y, y_dimension));
				$("#z_sd").html("Deviation of the centroid on Z dimension: " + getDeviation(centroid_z, z_dimension));
				
				// visualize
				visualize();
			}
			reader.readAsText(file);
		}
		else{
			window.location="index.html";
			window.alert("Please upload text file!");
		}

	}
	
	// given two points represented by two arrays
	function lineDistance(point1, point2){
	  	var xs = 0;
	  	var ys = 0;
		var zs = 0;
		
	  	xs = point2[0] - point1[0];
	  	xs = xs * xs;
 
	 	ys = point2[1] - point1[1];
	  	ys = ys * ys;
 	    
	 	zs = point2[2] - point1[2];
	  	zs = zs * zs;
		
	  	return Math.sqrt(xs + ys + zs);
	}
	
	// point is the x or y or z of the center point, array contains all the x value in x dimension
	// deviation is the distance between the point and the average value of the array
	function getDeviation(point, array){
		var sum = 0;
		for(var i = 0; i < array.length; i++){
			if(!isNaN(parseInt(array[i]))){// Check whether a number is an illegal number
				sum = sum + parseInt(array[i]);
			} 
		}
		var avg = sum/array.length;
		
		var deviation = point - avg;
		
		return deviation;
	}
	
	function visualize() {
		  // create and initialize a 3D renderer
		  var r = new X.renderer3D();
		  r.init();
  
		  // create a mesh and associate it to the VTK Point Data
		  var p = new X.mesh();
		  p.file = 'http://x.babymri.org/?pits.vtk';
  
		  // add the points
		  r.add(p);
  

		  // the onShowtime function gets called automatically, just before the first
		  // rendering happens
		  r.onShowtime = function() {

		    p.visible = false; // hide the mesh since we just want to use the
		    // coordinates
    
		    var numberOfPoints = 50;//p.points.count; // in this example 411
    
		    // for convenience, a container which holds all spheres
		    spheres = new X.object();
    
		    // grab the first coordinate triplet
		    var firstPoint = p.points.get(0);
    
		    // create a new sphere as a template for all other ones
		    // this is an expensive operation due to CSG's mesh generation
		    var newSphere = new X.sphere();
		    newSphere.center = [firstPoint[0], firstPoint[1], firstPoint[2]];
		    newSphere.radius = 2;
		    newSphere.magicmode = false; // normal points are black and white
		    newSphere.modified(); // since we don't directly add the sphere, we have to
		    // call the CSG creator manually
    
		    // .. add the newSphere to our container
		    //spheres.children.push(newSphere);
    
			////////////////////////////////////////////////////////////////////////////////////////
			// render points from the text file
		    // loop through the points and copy the created sphere to a new X.object
			var lines = $("#data").html().split('\n');
			for(var i = 0; i < lines.length; i++){
				var format_data = lines[i].replace(/\s{2,}/g, ' '); //replaces all the space with single space
				var point = format_data.split(' ');
				if(point.length != 4){
					continue; // skip the data with wrong format
				}
				
				else{
	  		      	// copy the template sphere over to avoid generating new ones
	  		      	var copySphere = new X.object(newSphere);
					
	  		      	// .. and move it to the correct position
	  		      	copySphere.transform.translateX(point[0] - firstPoint[0]);
	  		      	copySphere.transform.translateY(point[1] - firstPoint[1]);
	  		      	copySphere.transform.translateZ(point[2] - firstPoint[2]);
					
					// the point with the largest mass has the largest opacity.
					var each_opacity = (1/max_mass) * point[3];
					if (each_opacity > 1){
						each_opacity = 1;
					}
      			  	copySphere.opacity = each_opacity;
	  		     	 // .. add the copySphere to our container
	  		      	spheres.children.push(copySphere);
				}
			}
			
			////////////////////////////////////////////////////////////////////////////////////////
			// render center point
		    var centerPointSphere = new X.sphere();
		    centerPointSphere.center = [firstPoint[0], firstPoint[1], firstPoint[2]];
		    centerPointSphere.radius = 2;
		    centerPointSphere.magicmode = true; // center point has color
		    centerPointSphere.modified();
			
			var copySphere2 = new X.object(centerPointSphere);
	      	copySphere2.transform.translateX(centroid_x - firstPoint[0]);
	      	copySphere2.transform.translateY(centroid_y - firstPoint[1]);
	      	copySphere2.transform.translateZ(centroid_z - firstPoint[2]);
			
			copySphere2.opacity = 1;
			
	      	spheres.children.push(copySphere2);
			
		    // add the sphere container to the renderer
		    r.add(spheres);
			
    		////////////////////////////////////////////////////////////////////////////////////////
			// render lines between centroid with other points
			var displayed_points = 0;
			var number_of_loop = parseInt(number_of_points/9);
			var remaining = number_of_points % 9;
			
			if(remaining > 0){
				number_of_loop++;
			}
			
			//alert("number_of_points:"+number_of_points + "; number_of_loop:"+number_of_loop + "; remaining:"+remaining);
			var index = 0;
			for(var k = 0; k < number_of_loop; k++){

				var box = new X.object();
				box.points = new X.triplets(72);
				box.normals = new X.triplets(72);
				box.type = 'LINES';
				
				var number_of_points_to_render = 0;
				if(k+1 == number_of_loop && remaining > 0){ // only need to render the remaining points in last round (< 9 points) 
					number_of_points_to_render = remaining;
				}
				else{
					number_of_points_to_render = 9;
				}
				
				for(var i = index; i < index + number_of_points_to_render; i++){ // 9 is maximum number of points to render at each round
					box.points.add(centroid_x, centroid_y, centroid_z);
					box.points.add(x_dimension[i], y_dimension[i], z_dimension[i]);
					//alert("k:"+k+"; number_of_points_to_render:"+number_of_points_to_render+"; i:"+i);
				}
			
				for(var l = 0; l < 2 * number_of_points_to_render; l++){ // two times of number_of_points_to_render
					box.normals.add(0, 0, 0);
				}
				
				index = index + number_of_points_to_render;
				r.add(box);
			}
			
		    // animate! (on each rendering call)
		    r.onRender = function() {

		      // rotate the camera in X-direction
		      r.camera.rotate([1, 0]);
      
		    };
		  };
		  
		  r.render();
  
		//}
	}
	
	// initialize
	function Init() {
		var fileselect = $id("fileselect"),
			filedrag = $id("filedrag"),
			submitbutton = $id("submitbutton");
			result = $id("result");
			messages = $id("messages");
			
		// file select
		fileselect.addEventListener("change", FileSelectHandler, false);

		// is XHR2 available? check browser
		var xhr = new XMLHttpRequest();
		if (xhr.upload) {

			// file drop
			filedrag.addEventListener("dragover", FileDragHover, false);
			filedrag.addEventListener("dragleave", FileDragHover, false);
			filedrag.addEventListener("drop", FileSelectHandler, false);
			filedrag.style.display = "block";

			// remove submit button
			submitbutton.style.display = "none";
			result.style.display = "none";
			messages.style.display = "none";
		}

	}

	// call initialization file
	if (window.File && window.FileList && window.FileReader) {
		Init();
	}

})();