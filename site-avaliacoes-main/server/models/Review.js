import { DataTypes } from "sequelize";
import sequelize from "../utils/db.js";

const Review = sequelize.define("Review", {
  placeId: DataTypes.STRING,
  rating: DataTypes.INTEGER,
  comment: DataTypes.TEXT,
  anonId: DataTypes.STRING,
}, {
  timestamps: true
});

export default Review;
