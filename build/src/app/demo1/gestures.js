$(document).ready(function() {
	var el = document.getElementById('theCalendar');

	var ham = new Hammer(el);

	ham.add(new Hammer.Pinch( { threshold: 0, pointers: 2 }));

	ham.on("tap press", function(ev) {
		console.log("BOOM");
	});


	ham.on("pinch", function(ev) {
		console.log("pinched");
	});
});

