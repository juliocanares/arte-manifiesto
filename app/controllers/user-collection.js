var basePath = 'user/collection/';

exports.index = function(req, res) {
  var query = {
    build: true,
    viewer: req.viewer,
    addUser: true
  };

  var afterGet = function(items) {
    return res.render(basePath + 'index', {
      collection: req.collection,
      items: items,
      owner: req.owner,
      cloudinary: global.cl,
      cloudinayCors: global.cl_cors
    });
  }
  if (req.collection.meta === 'works') {
    query.order = [
      [global.db.sequelize.col('CollectionWork.createdAt'), 'DESC']
    ];
    req.collection.getWorks(query).then(afterGet);
  } else {
    query.order = [
      [global.db.sequelize.col('CollectionProduct.createdAt'), 'DESC']
    ];
    query.include = [global.db.Work, global.db.Category];
    req.collection.getProducts(query).then(afterGet);
  }
}

exports.all = function(req, res) {
  var query = {
    where: {
      meta: req.body.meta
    }
  };
  // if (req.body.idProduct)
  //   query = {
  //     idProduct: req.body.idProduct,
  //     productInside: true
  //   };
  req.user.getCollections(query).then(function(collections) {
    return res.ok({
      collections: collections
    }, 'Colecciones listadas');
  });
}

/**
 * Collection create
 * ====================================================================
 * create a collection
 */
exports.create = function(req, res) {
  req.body.UserId = req.user.id;
  req.body.description = 'Coleccion curada por ' + req.user.fullname;
  req.body.cover = 'http://res.cloudinary.com/arte-manifiesto/image/upload/v1496794106/general/collection-banner.jpg'
  global.db.Collection.create(req.body).then(function(collection) {
    if (req.xhr)
      return res.ok({
        collection: collection
      }, 'Coleccion creada');
  });
};

/**
 * Collection update
 * ====================================================================
 * update collection
 */
exports.update = function(req, res) {
  if(req.body.cover){
    global.cl.uploader.upload(req.body.cover).then(function(result) {
      console.log(req.body.cover);
      req.body.cover = result.url;
      console.log(req.body.cover);
      req.collection.updateAttributes(req.body).then(function() {
        return res.ok({
          collection: req.collection
        }, 'Coleccion actualizada');
      });
    });
  }
  else{
    req.collection.updateAttributes(req.body).then(function() {
      return res.ok({
        collection: req.collection
      }, 'Coleccion actualizada');
    });
  }
  
};

/**
 * Collection remove
 * ====================================================================
 * remove a collection
 */
exports.delete = function(req, res) {
  req.collection.destroy().then(function() {
    return res.ok({
      collection: req.collection
    }, 'Coleccion eliminada');
  });
};

exports.featured = function(req, res) {
  req.collection.updateAttributes({
    featured: true
  }).then(function() {
    return res.ok({
      collection: req.collection
    }, 'Collection featured');
  });
};

exports.unFeatured = function(req, res) {
  req.collection.updateAttributes({
    featured: false
  }).then(function() {
    return res.ok({
      collection: req.collection
    }, 'Collection unFeatured');
  });
};

exports.public = function(req, res) {
  req.collection.updateAttributes({
    public: true
  }).then(function() {
    return res.ok({
      collection: req.collection
    }, 'Coleccion publica');
  });
};

exports.private = function(req, res) {
  req.collection.updateAttributes({
    public: false
  }).then(function() {
    return res.ok({
      collection: req.collection
    }, 'Coleccion privada');
  });
};