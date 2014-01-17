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
	
	var center_point = 0;
	
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
				
				// define x,y,z dimension array
				var x_dimension = new Array();
				var y_dimension = new Array();
				var z_dimension = new Array();
				
				// find the center point, lines[i] represents each line
				for(var i = 0; i < lines.length; i++){
					// xyz[0], xyz[1], xyz[2] represent one 3D point
					var xyz = lines[i].split(' ');
					if(xyz.length != 3){
						continue; // skip the data with wrong format
					}
					else{
						// get point in dimension arrays
						x_dimension[i] = xyz[0];
						y_dimension[i] = xyz[1];
						z_dimension[i] = xyz[2];
					}
					
					var sum_distance = 0;
					
					for(var j = 0; j < lines.length; j++){
						var xyz2 = lines[j].split(' ');
						if(xyz2.length != 3){
							continue; // skip the data with wrong format
						}
						var dis = lineDistance(xyz, xyz2);
						sum_distance = sum_distance + dis;
					}
					
					if(sum_distance < min_distance){
						min_distance = sum_distance;
						center_point = xyz;
					}
				}
				
				// display the result
				$("#center_point").html("<strong>Centroid: (" + center_point[0] + " " + center_point[1] + " " + center_point[2] + ")</strong>");
				$("#distance").html("<strong>Cost: " + sum_distance + "</strong><br>(Sum of all distances from the centroid to the other points)");
				
				// calculate deviation and display
				$("#x_sd").html("Deviation of the centroid on X dimension: " + getDeviation(center_point[0], x_dimension));
				$("#y_sd").html("Deviation of the centroid on Y dimension: " + getDeviation(center_point[1], y_dimension));
				$("#z_sd").html("Deviation of the centroid on Z dimension: " + getDeviation(center_point[2], z_dimension));
				
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
		    newSphere.radius = 1.2;
		    newSphere.magicmode = false; // normal points are black and white
		    newSphere.modified(); // since we don't directly add the sphere, we have to
		    // call the CSG creator manually
    
		    // .. add the newSphere to our container
		    //spheres.children.push(newSphere);
    
		    // loop through the points and copy the created sphere to a new X.object
			
			var lines = $("#data").html().split('\n');
			for(var i = 0; i < lines.length; i++){
				var point = lines[i].split(' ');
				if(point.length != 3){
					continue; // skip the data with wrong format
				}
				
				else{
	  		      	// copy the template sphere over to avoid generating new ones
	  		      	var copySphere = new X.object(newSphere);
	  		      	// .. and move it to the correct position
	  		      	copySphere.transform.translateX(point[0] - firstPoint[0]);
	  		      	copySphere.transform.translateY(point[1] - firstPoint[1]);
	  		      	copySphere.transform.translateZ(point[2] - firstPoint[2]);
      
	  		     	 // .. add the copySphere to our container
	  		      	spheres.children.push(copySphere);
				}
					
			}
    		
			// render center point
		    var centerPointSphere = new X.sphere();
		    centerPointSphere.center = [firstPoint[0], firstPoint[1], firstPoint[2]];
		    centerPointSphere.radius = 1.8;
		    centerPointSphere.magicmode = true; // center point has color
		    centerPointSphere.modified();
			
			var copySphere2 = new X.object(centerPointSphere);
	      	copySphere2.transform.translateX(center_point[0] - firstPoint[0]);
	      	copySphere2.transform.translateY(center_point[1] - firstPoint[1]);
	      	copySphere2.transform.translateZ(center_point[2] - firstPoint[2]);
			
	      	spheres.children.push(copySphere2);
			
		    // add the sphere container to the renderer
		    r.add(spheres);
    
		    // animate! (on each rendering call)
		    r.onRender = function() {

		      // rotate the camera in X-direction
		      r.camera.rotate([1, 0]);
      
		    };
    

		  };
  
		  // .. and render it
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