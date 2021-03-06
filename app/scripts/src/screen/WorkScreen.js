/**
 *Author : www.juliocanares.com/cv
 *Email : juliocanares@gmail.com
 */
var APP = APP || {};

APP.WorkScreen = function() {
  APP.BaseScreen.call(this, 'work');

  this.currentItem = this.oldItem;
  this.currentSection, this.oldSection;
  this.collections = [];
  this.idCollections = [];

  this.following = false;
};

APP.WorkScreen.constructor = APP.WorkScreen;
APP.WorkScreen.prototype = Object.create(APP.BaseScreen.prototype);

APP.WorkScreen.prototype.setupUI = function() {
  for (var i = 0; i < categories.length; i++) {
    var category = categories[i],
      products = [];
    for (var j = 0; j < category.subCategories.length; j++) {
      var subCategory = category.subCategories[j];
      for (var k = 0; k < subCategory.innerCategories.length; k++) {
        var innerCategory = subCategory.innerCategories[k];
        for (var l = 0; l < innerCategory.Products.length; l++) {
          products.push(innerCategory.Products[l]);
        }
      }
    }
    new APP.Viewer('carrouselItem', $('.' + category.nameSlugify), null, products);
  }

  new APP.Viewer('carrouselItem', $('.more'), null, more, {
    worked: true
  });
  new APP.Viewer('carrouselItem', $('.similar'), null, similar, {
    worked: true
  });

  new APP.Carrousel($('.js-more-carousel'), $('.more'));
  new APP.Carrousel($('.js-similar-carousel'), $('.similar'));

  new APP.PhotoSwipe('{"tag":"work", "selector":"#work-image"}');

  this.reviewsContainer = $('.reviews-items-container');
  for (var i = 0; i < reviews.length; i++)
    this.reviewsContainer.append(new APP.Review(reviews[i]).view);

  this.shareFb = $('.share-fb');
  this.shareTw = $('.share-tw');
  this.askBtn = $('.ask-availability');
  this.loginReview = $('.login-review');
  this.askRequester = $('.ask-requester');
  this.thanksRequester = $('.thanks-requester');
  this.likeBtn = $('.like-btn');
  this.afterLike = $('.after-like');
  this.saveBtn = $('.save-collections');
  this.saveBtnLoading = $('.save-collections-loading');
  this.followBtn = $('.am-Follow-button');
  this.collectionsContainer = $('.collections');
  this.collectionForm = $('.add-collection-form');
  this.reviewForm = $('.review-form');
  this.reviewContainer = $('.reviews-items-container');

  this.prevBtn = $('.prev-btn');
  this.nextBtn = $('.next-btn');

  new Clipboard('.copy', {
    text: this.copyHandler.bind(this)
  });


  this.featuredBtn = $('.featured');
  this.featuredBtn.click(this.featuredHandler.bind(this));
};

APP.WorkScreen.prototype.featuredHandler = function() {
  if (!DataApp.currentUser || !DataApp.currentUser.isAdmin) return;

  var url, tempId = 'work';

  if (work.featured) {
    url = '/user/' + work.User.username + '/' + tempId + '/unfeatured';
  } else {
    url = '/user/' + work.User.username + '/' + tempId + '/featured';
  }

  var scope = this,
    payload = {};
  payload['id' + Utils.capitalize(tempId)] = work.id;
  $.post(url, payload, function(response) {
    console.log(response);
    if (response.status === 200) {
      if (response.data[tempId].featured) {
        scope.featuredBtn.removeClass('disabled');
      } else {
        scope.featuredBtn.addClass('disabled');
      }
      work.featured = response.data[tempId].featured;
    }
  });
};

APP.WorkScreen.prototype.listeners = function() {
  APP.BaseScreen.prototype.listeners.call(this);
  this.shareFb.click(this.shareFBHandler.bind(this));
  this.shareTw.click(this.shareTWHandler.bind(this));

  $('.menu-item').click(this.menuItemHandler.bind(this));
  $('.menu-item[data-name=' + currentPath + ']').click();

  this.askBtn.click(this.askAvailabilityHandler.bind(this));
  this.loginReview.click(this.loginReviewHandler.bind(this));
  this.saveBtn.click(this.saveClickHandler.bind(this));

  if (DataApp.currentUser) {
    var collectionsUrl = DataApp.currentUser.url + '/collection/all';
    this.requestHandler(collectionsUrl, {
      meta: 'works'
    }, this.collectionsHandlerComplete);
    if (!owner) {
      var followingUrl = DataApp.currentUser.url + '/isFollowing';
      this.requestHandler(followingUrl, {
        idUser: work.User.id
      }, this.isFollowingComplete);
    }
  }

  this.likeBtn.click(this.likeBtnHandler.bind(this));

  this.followBtn.click(this.followHandler.bind(this));
  this.collectionForm.submit(this.collectionFormHandler.bind(this));
  this.reviewForm.submit(this.reviewFormHandler.bind(this));

  $(document).bind('keyup', this.documentKeyupHandler.bind(this));
};

APP.WorkScreen.prototype.documentKeyupHandler = function(event) {
  if (event.keyCode === 39 && this.prevBtn.length > 0)
    window.location.href = this.prevBtn.attr('href');

  if (event.keyCode === 37 && this.nextBtn.length > 0)
    window.location.href = this.nextBtn.attr('href');
};

APP.WorkScreen.prototype.copyHandler = function(trigger) {
  $('#lean_overlay').trigger("click");
  this.showFlash('succes', 'Link Copiado');
  return window.location.href;
};

APP.WorkScreen.prototype.reviewFormHandler = function(event) {
  event.preventDefault();
  var url = DataApp.currentUser.url + '/work/review/create';
  this.requestHandler(url, $(event.target).serialize(), this.reviewComplete);
};

APP.WorkScreen.prototype.reviewComplete = function(response) {
  $('.value-input').val('');
  this.reviewContainer.append(new APP.Review(response.data.review).view);
}


APP.WorkScreen.prototype.followHandler = function() {
  Utils.checkAuthentication();
  var url = DataApp.currentUser.url + (this.isFollowing ? '/unfollow/' : '/follow/');
  this.requestHandler(url, {
    idUser: work.User.id
  }, this.followComplete);
};

APP.WorkScreen.prototype.followComplete = function(response) {
  console.log(response);
  if (this.isFollowing) {
    this.followBtn.removeClass('following').text('+ SEGUIR');
  } else {
    this.followBtn.addClass('following').text('Siguiendo');
  }

  this.isFollowing = !this.isFollowing;
}

APP.WorkScreen.prototype.isFollowingComplete = function(response) {
  this.isFollowing = response.data.following;
  this.isFollowing && this.followBtn.addClass('following').text('Siguiendo');
}

APP.WorkScreen.prototype.saveClickHandler = function() {
  this.saveBtn.hide();
  this.saveBtnLoading.show();

  var url = DataApp.currentUser.url + '/work/add_to_collection';
  var payload = {
    collections: JSON.stringify(this.idCollections),
    idWork: work.id
  };
  this.requestHandler(url, payload, this.saveRequestComplete);
};

APP.WorkScreen.prototype.saveRequestComplete = function() {
  this.saveBtn.show();
  this.saveBtnLoading.hide();
  this.showFlash('succes', 'Su actualizo tus colecciones');

  $('#lean_overlay').trigger('click');
};


APP.WorkScreen.prototype.collectionFormHandler = function(event) {
  event.preventDefault();
  var url = DataApp.currentUser.url + '/collection/create';
  this.requestHandler(url, $(event.target).serialize(), this.collectionFormComplete);
};

APP.WorkScreen.prototype.collectionFormComplete = function(response) {
  var item = new APP.CollectionItem(response.data.collection);
  item.addEventListener(Events.COLLECTION_ITEM_SELECTED, this.collectionItemSelected.bind(this));
  this.collections.push(item);
  this.collectionsContainer.append(item.view);
};


APP.WorkScreen.prototype.likeBtnHandler = function() {
  Utils.checkAuthentication();
  if (!work.liked) {
    var url = DataApp.currentUser.url + '/work/like';
    this.requestHandler(url, {
      idWork: work.id
    }, this.likeComplete);
  }
};

APP.WorkScreen.prototype.likeComplete = function(response) {
  console.log(response);
  work.liked = !work.liked;
  $('.likes').text(response.data.likes);
  this.likeBtn.parent().addClass('active');
  this.afterLike.show();
};

APP.WorkScreen.prototype.collectionsHandlerComplete = function(response) {
  var collections = response.data.collections;
  var i, item;
  for (i = 0; i < collections.length; i++) {
    item = new APP.CollectionItem(collections[i]);
    this.collections.push(item);
    item.addEventListener(Events.COLLECTION_ITEM_SELECTED, this.collectionItemSelected.bind(this));
    this.collectionsContainer.append(item.view);
  }

  var url = DataApp.currentUser.url + '/work/inside_collection';
  this.requestHandler(url, {
    idWork: work.id
  }, this.insideCollectionHandler);
};

APP.WorkScreen.prototype.insideCollectionHandler = function(response) {
  var collections = response.data.collections;
  var i, j;
  for (i = 0; i < this.collections.length; i++)
    this.collections[i].view.removeClass('selected');

  this.idCollections = [];
  for (i = 0; i < collections.length; i++) {
    for (j = 0; j < this.collections.length; j++) {
      if (collections[i].id === this.collections[j].data.id) {
        this.idCollections.push(collections[i].id);
        this.collections[j].view.addClass('selected');
      }
    }
  }
};

APP.WorkScreen.prototype.collectionItemSelected = function(event) {
  var item = event.target;
  var index = this.idCollections.indexOf(item.data.id);
  if (index === -1)
    this.idCollections.push(item.data.id);
  else
    this.idCollections.splice(index, 1);
};

APP.WorkScreen.prototype.askAvailabilityHandler = function(event) {
  Utils.checkAuthentication();
  var url = DataApp.currentUser.url + '/work/availability';
  this.requestHandler(url, {
    idWork: work.id
  }, this.askAvailabilityComplete);
};

APP.WorkScreen.prototype.loginReviewHandler = function() {
  Utils.checkAuthentication();
};

APP.WorkScreen.prototype.askAvailabilityComplete = function(response) {
  this.askRequester.hide();
  this.thanksRequester.show();
};

APP.WorkScreen.prototype.menuItemHandler = function(event) {
  this.currentItem = $(event.currentTarget);
  var path = this.currentItem.data('name');
  this.currentSection = $('.' + path + '-container');
  this.currentSection.show();
  var url = '/user/' + work.User.username + '/work/' + work.nameSlugify +
    '/' + (path === 'index' ? '' : path);

  $('.menu-item').removeClass('selected');
  this.currentItem.addClass('selected');

  this.oldSection && this.oldSection.hide();
  this.oldSection = this.currentSection;
  Utils.changeUrl(DataApp.baseTitle + Utils.capitalize(path), url);
};

APP.WorkScreen.prototype.shareFBHandler = function() {
  Utils.shareFBWork(work);
};

APP.WorkScreen.prototype.shareTWHandler = function() {
  Utils.shareTWWork(work);
};