/**
 *Author : www.juliocanares.com/cv
 *Email : juliocanares@gmail.com
 */
var APP = APP || {};

var normal = (function() {
  var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛãàáäâèéëêìíïîòóöôùúüûÑñÇç",
    to = "AAAAAEEEEIIIIOOOOUUUUaaaaaeeeeiiiioooouuuunncc",
    mapping = {};

  for (var i = 0, j = from.length; i < j; i++)
    mapping[from.charAt(i)] = to.charAt(i);

  return function(str) {
    var ret = [];
    for (var i = 0, j = str.length; i < j; i++) {
      var c = str.charAt(i);
      if (mapping.hasOwnProperty(str.charAt(i)))
        ret.push(mapping[c]);
      else
        ret.push(c);
    }
    return ret.join('');
  }
})();

APP.BuyScreen = function() {
  this.productConfig = JSON.parse(product.config);
  APP.BaseScreen.call(this, 'buy');
  this.totalShipping;
  this.currentIgv;
  this.totalPrice;
};

APP.BuyScreen.constructor = APP.BuyScreen;
APP.BuyScreen.prototype = Object.create(APP.BaseScreen.prototype);

APP.BuyScreen.prototype.setupUI = function() {
  this.payBtn = $('.btn-pay');
  this.form = $('form[name=buy-form]');
};

APP.BuyScreen.prototype.listeners = function() {
  $('select[name=city]').change(this.shippingHandler);
  $('select[name=city]').change();
  this.form.submit(this.submitHandler.bind(this));

  $('input[name=direction]').geocomplete();
};

APP.BuyScreen.prototype.submitHandler = function(e) {
  var errors = [];

  if (Validations.notBlank($('input[name=firstname]').val())) errors.push('Ingrese un nombre');
  if (Validations.notBlank($('input[name=lastname]').val())) errors.push('Ingrese tus apellidos');
  if (Validations.notBlank($('input[name=direction]').val())) errors.push('Ingrese una dirección');
  if (Validations.notBlank($('input[name=province]').val())) errors.push('Ingrese tú provincia');
  if (Validations.notBlank($('input[name=zip]').val())) errors.push('Ingrese el código postal');
  if (Validations.notBlank($('input[name=phone]').val())) errors.push('Ingrese tú telefono');
  if (Validations.notBlank($('input[name=email]').val())) errors.push('Ingrese tú correo');

  if (errors.length > 0){
    this.showFlash('error', errors);
    return false;
  }

  $('input[name=buyerEmail]').val($('input[name=email]').val());
  $('input[name=buyerFullName]').val($('input[name=firstname]').val() + ' ' + $('input[name=lastname]').val());
  $('input[name=telephone]').val($('input[name=phone]').val());
  $('input[name=shippingAddress], input[name=billingAddress]').val($('input[name=direction]').val() + ' Int. ' + $('input[name=departament]').val());
  $('input[name=shippingCity], input[name=billingCity]').val($('input[name=province]').val());
  $('input[name=zipCode]').val($('input[name=zip]').val());
  
  var name = $('input[name=buyerFullName]').val();
  var direction = $('input[name=shippingAddress]').val();
  var city = $('select[name=shippingCity]').val();
  var province = $('input[name=shippingCity]').val();
  var zipcode = $('input[name=zipCode]').val();
  var price = $('input[name=amount]').val();
  var country = $('select[name=shippingCountry]').val();
  var phone = $('input[name=telephone]').val();
  var email = $('input[name=buyerEmail]').val();
  var signature = $('input[name=signature]').val();

  var url = '/user/' + product.User.username + '/product/' + product.nameSlugify;

  var data1 = {
    name: name,
    direction: direction,
    city: city,
    price: price,
    province: province,
    zipcode: zipcode,
    country: country,
    phone: phone,
    email: email
  }

  if (product.CategoryId === 87 || product.CategoryId === 88){
    data1.size = Cookies.get('size_product');
  }

  var data2 = {
    userId: user.id,
    url: url,
    signature: signature
  }

  $('input[name=extra1]').val(JSON.stringify(data1));
  $('input[name=extra2]').val(JSON.stringify(data2));
};

// APP.BuyScreen.prototype.cityChangeHandler = function() {
//   var name = normal($('select[name=city]').val());
//   var url = '/user/' + product.User.username + '/product/shipping';
//   if (name === 'Pucallpa') name = 'PUCALLPA (CALLERIA)';
//   if (name === 'Chincha') name = 'CHINCHA ALTA';

//   var payload = {
//     "nom_destino": name.toUpperCase(),
//     "peso": this.productConfig.pkgWeight,
//     "servicio": "Atencion en Oficina",
//     "options2": "Kilos",
//     "largo": this.productConfig.pkgLarge,
//     "ancho": this.productConfig.pkgWidth,
//     "alto": this.productConfig.pkgHeight,
//     "cantidad": 1,
//     "m_largo": "cms",
//     "m_ancho": "cms",
//     "m_alto": "cms"
//   }
//   this.requestHandler(url, {
//     config: JSON.stringify(payload)
//   }, this.shippingHandler);
// };

APP.BuyScreen.prototype.shippingHandler = function() {
  // var data = response.data.data;

  this.totalShipping = 5.00;
  this.totalPrice = Number(product.finalPrice) + this.totalShipping;

  $('.subtotal').text(product.finalPrice);
  $('.baseprice').text(this.totalShipping);
  $('.totallity').text(this.totalPrice);
};