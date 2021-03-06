/**
 *Author : www.juliocanares.com/cv
 *Email : juliocanares@gmail.com
 */
var APP = APP || {};

APP.RequestItem = function(data, options) {
  data.from = data.from || null;
  data.data = JSON.parse(data.data);
  data.Product.config = JSON.parse(data.Product.config);
  data.artistRevenue = (Number(data.Product.config.margen) / 100 * data.Product.finalPrice);
  data.amRevenue = data.Product.finalPrice - data.artistRevenue;
  data.subtotal = data.artistRevenue + data.amRevenue;
  data.shipping = data.data.shipping;
  data.total = data.subtotal + data.shipping;

  APP.BaseElement.call(this, data, 'request-item', options);

  var scope = this;
  var step1 = this.view.find('.step-1');
  var step2 = this.view.find('.step-2');
  var step3 = this.view.find('.step-3');
  var step4 = this.view.find('.step-4');
  var step5 = this.view.find('.step-5');

  this.currentStep = this.data.status;

  if (this.currentStep === 'recibido') {
    step1.removeClass('hide');
  }
  if (this.currentStep === "paso2") {
    step2.removeClass('hide');
  }
  if (this.currentStep === "paso3") {
    step3.removeClass('hide');
  }
  if (this.currentStep === "paso4") {
    step4.removeClass('hide');
  }

  if (this.currentStep === "paso5") {
    step5.removeClass('hide');
  }

  var scope = this;

  step1.find('.yes').click(function(e) {
    e.preventDefault();

    scope.nextStepCaller({
      idOrder: data.id,
      currentStatus: scope.currentStep
    });

    step1.addClass('hide');
    step2.removeClass('hide');
  });

  step1.find('.no').click(function(e) {
    e.preventDefault();
    scope.nextStepCaller({
      idOrder: data.id,
      currentStatus: 'declined'
    });
  });

  step2.find('.done').click(function(e) {
    e.preventDefault();
    scope.nextStepCaller({
      idOrder: data.id,
      currentStatus: scope.currentStep
    });
    step2.addClass('hide');
    step3.removeClass('hide');
  });

  step3.find('.done').click(function(e) {
    e.preventDefault();
    scope.nextStepCaller({
      idOrder: data.id,
      currentStatus: scope.currentStep
    });
    step3.addClass('hide');
    step4.removeClass('hide');
  });

  step4.find('.upload').click(function() {
    scope.nextStepCaller({
      idOrder: data.id,
      currentStatus: scope.currentStep
    });
    step4.addClass('hide');
    step5.removeClass('hide');
  });

  // this.view.find('.cloudinary-fileupload').fileupload({
  //     start: function(e) {},
  //     fail: function(e, data) {}
  //   })
  // .off('cloudinarydone').on('cloudinarydone', function(e, data) {
  //   console.log(data);
  //   });
};

APP.RequestItem.prototype = Object.create(APP.BaseElement.prototype);

APP.RequestItem.constructor = APP.RequestItem;

APP.RequestItem.prototype.nextStepCaller = function(payload) {
  var url = DataApp.currentUser.url + '/account/next_step';
  $.post(url, payload).then(this.nextStepHandler.bind(this));
};

APP.RequestItem.prototype.nextStepHandler = function(response) {
  console.log(response);
  this.currentStep = response.data.order.status;
  console.log(this.currentStep);
};