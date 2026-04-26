import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Electronics", "Clothing", "Food", "Books", "Sports", "Other"],
      default: "Electronics",
    },
    productPrice: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    offerPrice: {
      type: Number,
      min: [0, "Offer price cannot be negative"],
      default: 0,
    },
    images: [
      {
        url: { type: String, required: true },
        filename: { type: String },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual field for discount percentage
productSchema.virtual("discountPercent").get(function () {
  if (this.productPrice > 0 && this.offerPrice > 0) {
    return Math.round(
      ((this.productPrice - this.offerPrice) / this.productPrice) * 100,
    );
  }
  return 0;
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

export default mongoose.model("Product", productSchema);
