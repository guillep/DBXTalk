
function toggleSearch() {
	$("#search")
		.mouseenter(function() {
			$("#search").clearQueue().removeClass("hidden");
		})
		.mouseleave(function() {
			$("#search").delay(1500).queue(function() {
				$(this).addClass("hidden");
			});
		});
}

$(toggleSearch);
	