var _ = require('lodash');

var Chance = require('chance');
var chance = new Chance();

module.exports = function (sequelize, DataTypes) {
    var Product = sequelize.define('Product', {
            name: {
                type: DataTypes.STRING,
                set: function (value) {
                    this.setDataValue('nameSlugify', global.slugify(value));
                    this.setDataValue('name', value);
                }
            },
            nameSlugify: DataTypes.STRING,
            price: DataTypes.INTEGER,
            photo: DataTypes.STRING,
            description: DataTypes.TEXT,
            featured: {type: DataTypes.BOOLEAN, defaultValue: false}
        }, {
            classMethods: {
                associate: function (models) {
                    Product.belongsToMany(models.User, {as: 'ProductViewers', through: 'ProductViewers'});
                    Product.belongsToMany(models.User, {as: 'ProductLikes', through: 'ProductLikes'});

                    Product.belongsToMany(models.Collection, {through: models.CollectionProduct});

                    Product.belongsTo(models.Work, {onDelete: 'cascade'});
                    Product.belongsTo(models.User);
                    Product.belongsTo(models.ProductType);
                    Product.hasMany(models.ProductFeatured);
                }
            },
            hooks: {
                afterCreate: function (product, options) {
                    return global.db.ProductType.find(_.random(1, 5)).then(function (type) {
                        return type.addProduct(product);
                    });
                }
            }
        }
    );
    return Product;
};
