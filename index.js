/*
 *
 * logo() constructor
 * @param _container (d3.selection)
 * @param _radius (number) - radius boundary of logo animation
 * @param _padding (number) - padding around the radius boundary
 * @param _delay (integer) - delay of the uper logo lines from the lines below
 * @param _fill (boolean) - show fills
 * @param _stroke (boolean) - show lines
 * @param _speed (object) - speed of lines {min:0.3, max:2}
 *
 */

var logo = (function(_container, _radius, _padding, _delay, _fill, _stroke, _speed){
	var module = {},
		delay = _delay,
		fill = _fill,
		stroke = _stroke,
		speed = _speed,
		boundaryRad = _radius,
		boundaryRadSquare = boundaryRad*boundaryRad,
		padding = _padding,
		svg = _container.append('svg')
			.attr('id','tsb-ani-logo')
			.attr('width',(boundaryRad+padding)*2)
			.attr('height',(boundaryRad+padding)*2)
			.append('g')
				.attr('transform','translate('+(boundaryRad+padding)+','+(boundaryRad+padding)+')');

	function randVelo(){
		var base = speed.max/2 + Math.random()*speed.max;
		if(Math.random()>0.5){
			base *= -1;
		}
		return base * 1;
	}

	function resize(n){
		return n/250*boundaryRad;
	}

	//Initial Logo Points
	var points = [
		{x:resize(-236),y:resize(33),velX:randVelo(),velY:randVelo(),hist:[]},
		{x:resize(-195),y:resize(154),velX:randVelo(),velY:randVelo(),hist:[]},
		{x:resize(145),y:resize(-200),velX:randVelo(),velY:randVelo(),hist:[]},
		{x:resize(199),y:resize(104),velX:randVelo(),velY:randVelo(),hist:[]},
		{x:resize(244),y:resize(7),velX:randVelo(),velY:randVelo(),hist:[]},
		{x:resize(-142),y:resize(-163),velX:randVelo(),velY:randVelo(),hist:[]}
	];

	var edges = [
		[0,1],
		[1,2],
		[0,2],

		[0,3],
		[2,3],

		[3,4],
		[4,5],
		[0,5]
	];

	var planes = [
		{nodes:[0,1,2],color:'rgba(255,0,0,0.8)'},
		{nodes:[0,2,3],color:'rgba(46,145,209,0.8)'},
		{nodes:[0,3,4,5],color:'rgba(46,145,209,0.8)'}
	];

	//Random points
	/*for(var i = 0; i<50; i++){
		points.push({x:(Math.random()-0.5)*200,y:(Math.random()-0.5)*200,velX:(Math.random()-0.5)*5,velY:(Math.random()-0.5)*5});
	}*/

	var paths = svg.append('g').selectAll('path').data(planes).enter().append('path')
		.attr('class','plane')
		.style('fill',function(d){ return (fill)?d.color:'transparent'; });

	var lines = svg.append('g').selectAll('line').data(edges).enter().append('line')
		.attr('class','edge')
		.style('stroke',function(d){ return (stroke)?'':'transparent'; });

	var histLines = svg.append('g').selectAll('line').data(edges).enter().append('line')
		.attr('class','hedge')
		.style('stroke',function(d){ return (stroke)?'':'transparent'; });

	var velocity = d3.scaleLinear().domain([0,1]).range([speed.max,speed.min]);

	function step() {

		points.forEach(function(p){

			var radSquare= p.x*p.x + p.y*p.y;

			//update
			var lastX = p.x;
			var lastY = p.y;

			p.x += p.velX*velocity(radSquare/boundaryRadSquare);
			p.y += p.velY*velocity(radSquare/boundaryRadSquare);

			p.hist.push({x:p.x,y:p.y});
			if(p.hist.length > delay){
				p.hist.splice(0,1);
			}
			
			//boundary
			if (radSquare > boundaryRadSquare) {
				
				//find intersection point with circle. simple method: midpoint
				var exitX = (lastX + p.x)/2;
				var exitY = (lastY + p.y)/2;
				
				//scale to proper radius
				var exitRad = Math.sqrt(exitX*exitX + exitY*exitY);
				exitX *= boundaryRad/exitRad;
				exitY *= boundaryRad/exitRad;
				
				p.x = exitX;
				p.y = exitY;

				//bounce
				var twiceProjFactor = 2*(exitX*p.velX + exitY*p.velY)/boundaryRadSquare;
				var vx = p.velX - twiceProjFactor*exitX;
				var vy = p.velY - twiceProjFactor*exitY;
				p.velX = vx;
				p.velY = vy;
			}
			
		});

		lines
			.attr('x1',function(d){ return points[d[0]].x; })
			.attr('x2',function(d){ return points[d[1]].x; })
			.attr('y1',function(d){ return points[d[0]].y; })
			.attr('y2',function(d){ return points[d[1]].y; });

		histLines
			.attr('x1',function(d){ return points[d[0]].hist[0].x; })
			.attr('x2',function(d){ return points[d[1]].hist[0].x; })
			.attr('y1',function(d){ return points[d[0]].hist[0].y; })
			.attr('y2',function(d){ return points[d[1]].hist[0].y; });

		paths
			.attr('d', function(d){
				var str = '';
				d.nodes.forEach(function(p, pi){
					if(pi===0){ str += 'M'; }else{ str += 'L'; }
					str += points[p].x + ' ' + points[p].y;
				});
				return str+'Z';
			});

		window.requestAnimationFrame(step);
	}

	window.requestAnimationFrame(step);

	return module;
});