#!/bin/bash

# Layout өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/Layout"|from "../components/layout/Layout"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "./Layout"|from "./layout/Layout"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../../components/Layout"|from "../../components/layout/Layout"|g'

# Header өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/Header"|from "../components/layout/Header"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "./Header"|from "./layout/Header"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../../components/Header"|from "../../components/layout/Header"|g'

# Footer өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/Footer"|from "../components/layout/Footer"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "./Footer"|from "./layout/Footer"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../../components/Footer"|from "../../components/layout/Footer"|g'

# Banner өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/Banner"|from "../components/layout/Banner"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "./Banner"|from "./layout/Banner"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../../components/Banner"|from "../../components/layout/Banner"|g'

# AllProductsSection өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/AllProductsSection"|from "../components/products/AllProductsSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "./AllProductsSection"|from "./products/AllProductsSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../../components/AllProductsSection"|from "../../components/products/AllProductsSection"|g'

# ProductCard өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/ProductCard"|from "../components/products/ProductCard"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "./ProductCard"|from "./products/ProductCard"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../../components/ProductCard"|from "../../components/products/ProductCard"|g'

# Categories өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/CategoriesHeadphone"|from "../components/categories/CategoriesHeadphone"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/CategoriesLaptop"|from "../components/categories/CategoriesLaptop"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/CategoriesPc"|from "../components/categories/CategoriesPc"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/CategoriesPhone"|from "../components/categories/CategoriesPhone"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/CategoriesSmartTv"|from "../components/categories/CategoriesSmartTv"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/CategoriesTablet"|from "../components/categories/CategoriesTablet"|g'

# Product sections өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/SmartTvSection"|from "../components/products/SmartTvSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/TabletSection"|from "../components/products/TabletSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/PhoneSection"|from "../components/products/PhoneSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/LaptopSection"|from "../components/products/LaptopSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/HeadPhoneSection"|from "../components/products/HeadPhoneSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/DeskPcSection"|from "../components/products/DeskPcSection"|g'

# Admin өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/AdminHeader"|from "../components/admin/AdminHeader"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../../components/AdminHeader"|from "../../components/admin/AdminHeader"|g'

# Pages өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/ProdCartSection"|from "../components/pages/ProdCartSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/ProdDetailSection"|from "../components/pages/ProdDetailSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/AboutSection"|from "../components/pages/AboutSection"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/AccountSection"|from "../components/pages/AccountSection"|g'

# Common өөрчлөлтүүд
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/FeatureBoxes"|from "../components/common/FeatureBoxes"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/CustomerReviews"|from "../components/common/CustomerReviews"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/LaptopPromo"|from "../components/common/LaptopPromo"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/ContactForm"|from "../components/common/ContactForm"|g'
find src -type f -name "*.js" -o -name "*.jsx" -o -name "*.tsx" | xargs sed -i 's|from "../components/ErrorBoundary"|from "../components/common/ErrorBoundary"|g'

echo "Бүх импортын замууд шинэчлэгдэж дууслаа" 