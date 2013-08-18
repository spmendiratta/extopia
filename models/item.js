/* Object/Relational mapping for instances of the Item class.
     - classes correspond to tables
     - instances correspond to rows
     - fields correspond to columns
In other words, this code defines how a row in the postgres order table
maps to the JS Order object.
*/
module.exports = function(sequelize, DataTypes) {
  return sequelize.define("Item", {
    item_id: {type: DataTypes.STRING, unique: true, allowNull: false},
    country_of_origin: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    cost: {type: DataTypes.FLOAT},
    image_url: {type: DataTypes.STRING}
  });
};
