#!/bin/bash

# Find all JavaScript files
JS_FILES=$(find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx")

# Loop through each file and fix imports
for file in $JS_FILES; do
  echo "Checking $file..."

  # Layout/Header/Footer/Banner imports
  sed -i 's|from "../components/Layout"|from "../components/layout/Layout"|g' "$file"
  sed -i 's|from "../components/Header"|from "../components/layout/Header"|g' "$file"
  sed -i 's|from "../components/Footer"|from "../components/layout/Footer"|g' "$file"
  sed -i 's|from "../components/Banner"|from "../components/layout/Banner"|g' "$file"
  
  # Also fix relative imports within the same directories
  sed -i 's|from "./Layout"|from "./layout/Layout"|g' "$file"
  sed -i 's|from "./Header"|from "./layout/Header"|g' "$file"
  sed -i 's|from "./Footer"|from "./layout/Footer"|g' "$file"
  sed -i 's|from "./Banner"|from "./layout/Banner"|g' "$file"
  
  # Product related imports
  sed -i 's|from "../components/AllProductsSection"|from "../components/products/AllProductsSection"|g' "$file"
  sed -i 's|from "../components/ProductCard"|from "../components/products/ProductCard"|g' "$file"
  sed -i 's|from "../components/ProductSection"|from "../components/products/ProductSection"|g' "$file"
  sed -i 's|from "../components/SmartTvSection"|from "../components/products/SmartTvSection"|g' "$file"
  sed -i 's|from "../components/TabletSection"|from "../components/products/TabletSection"|g' "$file"
  sed -i 's|from "../components/PhoneSection"|from "../components/products/PhoneSection"|g' "$file"
  sed -i 's|from "../components/LaptopSection"|from "../components/products/LaptopSection"|g' "$file"
  sed -i 's|from "../components/HeadPhoneSection"|from "../components/products/HeadPhoneSection"|g' "$file"
  sed -i 's|from "../components/DeskPcSection"|from "../components/products/DeskPcSection"|g' "$file"
  
  # Categories imports
  sed -i 's|from "../components/CategoriesHeadphone"|from "../components/categories/CategoriesHeadphone"|g' "$file"
  sed -i 's|from "../components/CategoriesLaptop"|from "../components/categories/CategoriesLaptop"|g' "$file"
  sed -i 's|from "../components/CategoriesPc"|from "../components/categories/CategoriesPc"|g' "$file"
  sed -i 's|from "../components/CategoriesPhone"|from "../components/categories/CategoriesPhone"|g' "$file"
  sed -i 's|from "../components/CategoriesSmartTv"|from "../components/categories/CategoriesSmartTv"|g' "$file"
  sed -i 's|from "../components/CategoriesTablet"|from "../components/categories/CategoriesTablet"|g' "$file"
  
  # Page component imports
  sed -i 's|from "../components/ProdCartSection"|from "../components/pages/ProdCartSection"|g' "$file"
  sed -i 's|from "../components/ProdDetailSection"|from "../components/pages/ProdDetailSection"|g' "$file"
  sed -i 's|from "../components/AboutSection"|from "../components/pages/AboutSection"|g' "$file"
  sed -i 's|from "../components/AccountSection"|from "../components/pages/AccountSection"|g' "$file"
  
  # Admin imports - both with single and double quotes
  sed -i 's|from "../components/AdminHeader"|from "../components/admin/AdminHeader"|g' "$file"
  sed -i "s|from '../../components/AdminHeader'|from '../../components/admin/AdminHeader'|g" "$file"
  sed -i 's|from "../../components/AdminHeader"|from "../../components/admin/AdminHeader"|g' "$file"
  
  # Common component imports
  sed -i 's|from "../components/FeatureBoxes"|from "../components/common/FeatureBoxes"|g' "$file"
  sed -i 's|from "../components/CustomerReviews"|from "../components/common/CustomerReviews"|g' "$file"
  sed -i 's|from "../components/LaptopPromo"|from "../components/common/LaptopPromo"|g' "$file"
  sed -i 's|from "../components/ContactForm"|from "../components/common/ContactForm"|g' "$file"
  sed -i 's|from "../components/ErrorBoundary"|from "../components/common/ErrorBoundary"|g' "$file"
  
  # Fix deeper imports (../../components/...)
  sed -i 's|from "../../components/Layout"|from "../../components/layout/Layout"|g' "$file"
  sed -i 's|from "../../components/Header"|from "../../components/layout/Header"|g' "$file"
  sed -i 's|from "../../components/Footer"|from "../../components/layout/Footer"|g' "$file"
  sed -i 's|from "../../components/Banner"|from "../../components/layout/Banner"|g' "$file"
done

echo "All import paths have been updated!" 