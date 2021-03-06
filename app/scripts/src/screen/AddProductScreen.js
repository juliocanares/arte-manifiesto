/**
 *Author : www.juliocanares.com/cv
 *Email : juliocanares@gmail.com
 */
var APP = APP || {};

APP.AddProductScreen = function() {
  APP.BaseScreen.call(this, 'addProduct');
  this.product = null;
};

APP.AddProductScreen.constructor = APP.AddProductScreen;
APP.AddProductScreen.prototype = Object.create(APP.BaseScreen.prototype);

APP.AddProductScreen.prototype.setupUI = function() {
  this.workForm = $('.work-form');
  this.uploader = $('.uploader-work');
  this.name = $('input[name=name]');
  this.shortDescription = $('input[name=short]');
  this.weight = $('input[name=weight]');
  this.price = $('input[name=price]');
  this.profit = $('input[name=profit]');
  this.finalPrice = $('input[name=finalPrice]');
  this.category = $('select[name=category]');
  this.description = $('textarea[name=description]');
  this.information = $('textarea[name=information]');

  this.workPhotoPublished = $('.work-photo-published');
  this.workNamePublished = $('.work-name-published');
  this.workUserPublished = $('.work-user-published');
  this.workPublished = $('.work-published');
  this.workView = $('.work-view');
  this.workNew = $('.work-new');

  this.workDelete = $('.work-delete');
  this.workDeleteConfirm = $('.work-delete-confirm');
  this.workDeleteCancel = $('.work-delete-cancel');
  this.workDeleteForce = $('.work-delete-force');

  this.tags = $('input[name=tags]');
  this.tags.tagsInput({
    height: '50px',
    width: '100%',
    defaultText: '+Etiqueta'
  });

  for(i in tags){
    this.tags.addTag(tags[i].name);
  }
  
  this.send = $('.send');
  this.sendLoading = $('.send-loading');

  this.uploaderImage = new APP.UploaderImage(this.uploader, this.imgComplete);
};

APP.AddProductScreen.prototype.listeners = function() {
  APP.BaseScreen.prototype.listeners.call(this);
  this.workForm.submit(this.workFormSubmitHandler.bind(this));
  this.workDelete.click(this.deleteHandler.bind(this));
  this.workDeleteForce.click(this.workDeleteForceHandler.bind(this));
  this.workDeleteCancel.click(this.deleteCancel.bind(this));
  this.profit.on('input change paste',this.priceHandler.bind(this));
  this.category.change(this.categoryHandler.bind(this));
};


APP.AddProductScreen.prototype.workFormSubmitHandler = function(event) {
  event.preventDefault();
  var errors = [],
    scope = this;
  if (!this.uploaderImage.photo) errors.push('Ingrese una foto');
  if (Validations.notBlank(this.name.val())) errors.push('Ingrese un nombre');
  if (Validations.notBlank(this.weight.val())) errors.push('Ingrese un peso');
  if (Validations.notBlank(this.price.val())) errors.push('Ingrese un precio');
  if (isNaN(this.price.val())) errors.push('El precio no es un numero correcto');
  if (Validations.notBlank(this.profit.val())) errors.push('Ingrese una ganancia de artista');
  if (isNaN(this.profit.val())) errors.push('La ganancia del artista no es un numero correcto');
  if (Validations.notBlank(this.finalPrice.val())) errors.push('Ingrese el precio final');
  if (isNaN(this.finalPrice.val())) errors.push('El precio final no es un numero correcto');
  if (Validations.notBlank(this.category.val())) errors.push('Ingrese una categoria');
  if (Validations.notBlank(this.description.val())) errors.push('Ingrese una descripcion');
  if (Validations.notBlank(this.information.val())) errors.push('Ingrese informacion del producto');
  if (this.tags.val().split(',')[0].length < 1) errors.push('Ingrese etiquetas');

  if (errors.length > 0) return this.showFlash('error', errors);

  this.sendLoading.show();
  this.send.hide();

  var info = this.information.val().split('\n');

  var config = {
    weight: this.weight.val(),
    description: this.description.val(),
    profit: this.profit.val(),
    info: JSON.stringify(info)
  }

  var descriptionTemp = null;

  if(this.shortDescription.val()) descriptionTemp = this.shortDescription.val();

  var data = {
    product:{
      name: this.name.val(),
      description: descriptionTemp,
      price: (Math.round(parseInt(this.finalPrice.val()) * 1.2)).toString(),
      finalPrice: this.finalPrice.val(),
      photo: scope.uploaderImage.photo,
      printPhoto: scope.uploaderImage.photo,
      config: JSON.stringify(config),
      UserId: work.UserId,
      WorkId: work.id,
      CategoryId: this.category.val(),
      profit: parseFloat(this.profit.val()),
      profitType: 1
    },
    tags: this.tags.val().split(',')
  };

  var url = DataApp.currentUser.url + '/product/create';
  this.requestHandler(url, {
    data: JSON.stringify(data)
  }, this.workCreatedComplete);
};

APP.AddProductScreen.prototype.workCreatedComplete = function(response) {
  this.showFlash('succes', 'El producto se subió exitosamente')
  this.work = response.data.product;

  this.workForm.hide();

  this.sendLoading.hide();
  this.send.show();

  var url = '/report/products_applying/page-1'
  var photo = Utils.addImageFilter(this.work.photo, 'w_300,c_limit');

  this.workView.attr('href', url);
  this.workNew.attr('href', responseUrl + '/work/' + work.nameSlugify + '/add');
  this.workPhotoPublished.attr('src', photo);
  this.workNamePublished.text(this.work.name);
  this.workPublished.show();
};

APP.AddProductScreen.prototype.deleteHandler = function(event) {
  this.workDelete.hide();
  this.workDeleteConfirm.show();
};

APP.AddProductScreen.prototype.workDeleteForceHandler = function() {
  var url = responseUrl + '/product/delete';
  this.requestHandler(url, {
    id: this.work.id
  }, this.forceComplete);
};

APP.AddProductScreen.prototype.forceComplete = function() {
  this.showFlash('succes', 'Se elimino el product');
  setTimeout(function() {
    window.location.href = responseUrl;
  }, 1000);
};

APP.AddProductScreen.prototype.deleteCancel = function(response) {
  this.workDelete.show();
  this.workDeleteConfirm.hide();
};

APP.AddProductScreen.prototype.categoryHandler = function(event) {
  var i = this.category.find(':selected').data('info')
  var data = JSON.parse(categories[i-1].data);

  this.description.val(data.description);
  this.weight.val(data.weight);
  this.price.val(data.price);
  var temp = data.info.length-1;
  for(line in data.info){
    if(line == temp){
      this.information.append(data.info[line]);
    }
    else{
      this.information.append(data.info[line]+'\n');
    }
  }
};

APP.AddProductScreen.prototype.priceHandler = function(event) {
  var pro = parseFloat(this.profit.val()) / 100 + 1
  var preTax = parseFloat(this.price.val()) * pro;
  var tax = 1.18
  this.finalPrice.val(Math.round(preTax * tax));
};

APP.AddProductScreen.prototype.imgComplete = function(idImage) {
  this.$view.find('.upload').show();
  $('.cloudinary-fileupload').show();
  var filters = {
    width: 300,
    crop: 'limit'
  };
  $.cloudinary.image(idImage, filters).appendTo(this.$view.find('.preview'));
};