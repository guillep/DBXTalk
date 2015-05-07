var inSearch = null;
var searchIndex = 0;
var searchCache = [];
var searchString = '';

function fullListSearch() {
  // generate cache
  searchCache = [];
  $('#full_list li').each(function() {
    var link = $(this).find('a.object_link');
    searchCache.push({name:link.text(), node:$(this), link:link});
  });

  key = {enter: 13, left: 37, up: 38, right: 39, down: 40 };

  $('#search input').keyup(function(e) {
	if (e.keyCode == key.down) {
		return selectNext();
	} else if (e.keyCode == key.up) {
		return selectPrev();
	} else if (e.keyCode == key.enter) {
		return activateCurrentSelection();
	}
    searchString = this.value.toLowerCase();
    if (searchString == "") {
      clearTimeout(inSearch);
      inSearch = null;
      $('#full_list, #content').removeClass('insearch');
      $('#full_list li').removeClass('found').each(function() {
        var link = $(this).find('a.object_link');
        link.text(link.text()); 
      });
      if (clicked) {
        clicked.parents('ul').each(function() {
          $(this).removeClass('collapsed').prev().removeClass('collapsed');
        });
      }
      highlight();
    } else {
      if (inSearch) clearTimeout(inSearch);
      searchIndex = 0;
		selectedItemIndex = undefined;
      lastRowClass = '';
      $('#full_list, #content').addClass('insearch');
      $('#noresults').text('');
      searchItem();
    }
  });
  
  $('#search input').focus();
  $('#full_list').after("<div id='noresults'></div>")
}

// ==============================================================================
var selectedItemIndex;
var items;
function selectFirst() {
	items = $("#full_list").find("li").get();
	select(0);
}

function select(itemIndex) {
	deselectAll();
	item = $(items[itemIndex]);
	item.addClass("selected");
	$("html,body").scrollTop(item.offset().top - item.height()*6);
	selectedItemIndex = itemIndex;
}

function selectNext() {
	if (selectedItemIndex == undefined) {
		return selectFirst();
	}
	select(selectedItemIndex+1)
}
function selectPrev() {
	if (selectedItemIndex == undefined) {
		return selectFirst();
	}
	select(selectedItemIndex-1)
}

function deselectAll() {
	$("#full_list").find("li").removeClass("selected");
}

function activateCurrentSelection() {
	item.find("a").click();
}

// ==============================================================================
var lastRowClass = '';
function searchItem() {
  for (var i = 0; i < searchCache.length / 50; i++) {
    var item = searchCache[searchIndex];
    if (item.name.toLowerCase().indexOf(searchString) == -1) {
      item.node.removeClass('found');
    } else {
      item.node.css('padding-left', '10px').addClass('found');
      item.node.removeClass(lastRowClass).addClass(lastRowClass == 'r1' ? 'r2' : 'r1');
      lastRowClass = item.node.hasClass('r1') ? 'r1' : 'r2';
      item.link.html(item.name.replace(new RegExp("(" + 
        searchString.replace(/([\/.*+?|()\[\]{}\\])/g, "\\$1") + ")", "ig"), 
        '<strong>$1</strong>'));
    }

    if (searchCache.length == searchIndex + 1) {
      return searchDone();
    } else {
      searchIndex++;
    }
  }
  inSearch = setTimeout('searchItem()', 0);
}

function searchDone() {
  highlight(true);
  if ($('#full_list li:visible').size() == 0) {
    $('#noresults').text('No results were found.').hide().fadeIn();
  } else {
    $('#noresults').text('');
  }
  $('#content').removeClass('insearch');
  clearTimeout(inSearch);
  inSearch = null;
}

clicked = null;
function linkList() {
  $('#full_list li, #full_list li a:last').click(function(evt) {
    if ($(this).hasClass('toggle')) return true;
    if (this.tagName.toLowerCase() == "li") {
      var toggle = $(this).children('a.toggle');
      if (toggle.size() > 0 && evt.pageX < toggle.offset().left) {
        toggle.click();
        return false;
      }
    }
    if (clicked) clicked.removeClass('clicked');
	 if (this.tagName.toLowerCase() == "a") {
      	clickListLink($(this));
    } else {
		clickListLink($(this).find("a:first"));
    }
    return false;
  });
}

function clickListLink(a) {
	clicked = a.parent('li').addClass('clicked');
	var win = window.top.frames[a.attr("target")];
	var href = a.attr('href');
	if (!win) {
		win = window.parent;
	}
	win.location = href;
}

function collapse() {
  if (!$('#full_list').hasClass('class')) return;
  $('#full_list.class a.toggle').click(function() { 
    $(this).parent().toggleClass('collapsed').next().toggleClass('collapsed');
    highlight();
    return false; 
  });
  $('#full_list.class ul').each(function() {
    $(this).addClass('collapsed').prev().addClass('collapsed');
  });
  $('#full_list.class').children().removeClass('collapsed');
  highlight();
}

function highlight(no_padding) {
  var n = 1;
  $('#full_list li:visible').each(function() {
    var next = n == 1 ? 2 : 1;
    $(this).removeClass("r" + next).addClass("r" + n);
    if (!no_padding && $('#full_list').hasClass('class')) {
      $(this).css('padding-left', (10 + $(this).parents('ul').size() * 15) + 'px');
    }
    n = next;
  });
}

function escapeShortcut() {
  $(document).keydown(function(evt) {
    if (evt.which == 27) {
      $('#search_frame', window.top.document).slideUp(100);
      $('#search a', window.top.document).removeClass('active inactive')
      $(window.top).focus();
    }
  });
}

$(escapeShortcut);
$(fullListSearch);
$(linkList);
$(collapse);
