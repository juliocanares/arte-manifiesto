/**
 *Author : www.juliocanares.com/cv
 *Email : juliocanares@gmail.com
 */
var APP = APP || {};

APP.Filters = function (filters) {
	this.filters = filters;

	this.oldCategory = this.filters.currentCategory;
	this.oldOrder = this.filters.currentOrder;

	this.isFeatured = Utils.getUrlParameter('featured');
	this.term = decodeURIComponent(Utils.getUrlParameter('term'));
	this.currentCategory = this.currentOrder = null;

	this.buildFilters();
	this.listeners();
};

APP.Filters.constructor = APP.Filters;

APP.Filters.prototype.buildFilters = function() {
	var itemRenderer = function(data, meta) {
		var item = APP.TemplateManager.instance.getFromDoc('filter-item');
		$.each(data, function(index, value){
			value = _.isObject(value) ? value : {name: value}
			value.meta = meta;
			$('.filter-' + meta).append(item(value));
		});
	};
	itemRenderer(this.filters.categories, 'category');
	itemRenderer(this.filters.order, 'order');
};

APP.Filters.prototype.listeners = function () {
	$("[data-meta='category']").on('click', this.filterItemHandler.bind(this, 'category'));
	$("[data-meta='order']").on('click', this.filterItemHandler.bind(this, 'order'));
	$(".am-Switch-button").on('click', this.featuredHandler);

	$(window).on("popstate", function(e) {
			 if (e.originalEvent.state !== null) {
			 location.reload()
			 }
	 });

	var scope = this;
	this.term = this.term === 'undefined' ? '' : this.term;
	$('.am-Search-input input').val(this.term);
	$('.am-Search-input input').keypress(function(e) {
		if(e.which == 13) {
			var value = $(this).val();
			if(value.length >= 1) {
				if(scope.term) {
					DataApp.currentUrl = DataApp.currentUrl.replace('&term=' + encodeURIComponent(scope.term), '&term=' + encodeURIComponent(value));
				}else {
					DataApp.currentUrl = DataApp.currentUrl + '&term='+ value;
				}
				scope.term = value;
				Broadcaster.dispatchEvent('FILTER_CHANGED');
			}
    }
	});
	//
	// var filterRight = $('.filter.right')
	// var rightSelect = $('.filter.right .am-Select')
	//
	// $(rightSelect).click(function () {
	// 	var state = filterRight.attr('data-state')
	// 	if(state == 'closed') filterRight.attr('data-state', 'open')
	// 	else filterRight.attr('data-state', 'closed')
	// })
	//
	// var filterLeft = $('.filter.left')
	// var leftSelect = $('.filter.left .am-Select')
	// var discoverContent = $('.discover-content')
	//
	// $(leftSelect).click(function () {
	// 	var state = filterLeft.attr('data-state')
	// 	if(state == 'closed') {
	// 		filterLeft.attr('data-state', 'open')
	// 		discoverContent.attr('data-state', 'expand')
	// 	}
	// 	else{
	// 		filterLeft.attr('data-state', 'closed')
	// 		discoverContent.attr('data-state', 'reduce')
	// 	}
	// })
	//
	// var switchButton = $('.am-Switch-button')
	// $(switchButton).click(function () {
	// 	var state = switchButton.attr('data-state')
	// 	console.log('state: ', state)
	// 	if(state == "active") switchButton.attr('data-state', 'inactive')
	// 	else switchButton.attr('data-state', 'active')
	// })
};

APP.Filters.prototype.featuredHandler = function() {
	if(this.isFeatured) {
		DataApp.currentUrl = DataApp.currentUrl.replace('&featured=1','');
	}else {
		DataApp.currentUrl = DataApp.currentUrl + '&featured=1';
	}
	this.isFeatured = !this.isFeatured;
	Broadcaster.dispatchEvent('FILTER_CHANGED');
};

APP.Filters.prototype.filterItemHandler = function(meta, event) {
	var filterCapitalized = Utils.capitalize(meta);
	var oldFilter = 'old' + filterCapitalized;
	var currentFilter = 'current' + filterCapitalized;

	this[currentFilter] = $(event.target).attr('data-value');

	DataApp.currentUrl = DataApp.currentUrl.replace(this[oldFilter], this[currentFilter]);
	this[oldFilter] = this[currentFilter];

	Broadcaster.dispatchEvent('FILTER_CHANGED',{meta:meta, newValue: this[currentFilter]});
};
