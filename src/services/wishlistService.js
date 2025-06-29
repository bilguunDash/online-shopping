// Get wishlist from localStorage
export const getWishlist = () => {
    try {
        const savedWishlist = localStorage.getItem('wishlist');
        
        if (savedWishlist) {
            const parsed = JSON.parse(savedWishlist);
            return { products: parsed };
        }
        return { products: [] };
    } catch (error) {
        return { products: [] };
    }
};

// Add product to wishlist
export const addToWishlist = (productId, productData = null) => {
    try {
        // Get current wishlist items
        let currentWishlist = [];
        try {
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                currentWishlist = JSON.parse(saved);
            }
        } catch (e) {
            // Error parsing wishlist
        }
        
        // If product already exists in wishlist, don't add it again
        if (currentWishlist.some(item => (item.id === productId || item.productId === productId))) {
            return { products: currentWishlist };
        }

        let product = productData;
        
        // If product data wasn't passed, try to find it
        if (!product) {
            // Try to get from localStorage
            try {
                product = JSON.parse(localStorage.getItem('selectedProduct'));
            } catch (e) {
                // Error parsing selectedProduct
            }
            
            // If still not found, create a minimal product
            if (!product) {
                product = {
                    id: productId,
                    productId: productId,
                    name: "Product " + productId,
                    title: "Product " + productId,
                    price: 0,
                    imageUrl: "/placeholder.jpg"
                };
            }
        }
        
        // Create wishlist item
        const wishlistItem = {
            id: productId,
            productId: productId,
            name: product.name || product.title || "Product",
            title: product.title || product.name || "Product",
            price: product.price || 0,
            imageUrl: product.imageUrl || "/placeholder.jpg",
            category: product.category || "",
            description: product.description || ""
        };
        
        // Add to wishlist
        const newWishlist = [...currentWishlist, wishlistItem];
        
        // Save to localStorage
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        
        return { products: newWishlist };
    } catch (error) {
        // Return current wishlist on error
        try {
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                return { products: JSON.parse(saved) };
            }
        } catch (e) {
            // Error getting wishlist after error
        }
        return { products: [] };
    }
};

// Remove product from wishlist
export const removeFromWishlist = (productId) => {
    try {
        // Get current wishlist items
        let currentWishlist = [];
        try {
            const saved = localStorage.getItem('wishlist');
            if (saved) {
                currentWishlist = JSON.parse(saved);
            }
        } catch (e) {
            return { products: [] };
        }
        
        // Filter out the product
        const newWishlist = currentWishlist.filter(item => {
            const itemId = item.id || item.productId;
            return itemId !== productId;
        });
        
        // Save to localStorage
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
        
        return { products: newWishlist };
    } catch (error) {
        return { products: [] };
    }
};

// Clear entire wishlist
export const clearWishlist = () => {
    try {
        localStorage.setItem('wishlist', JSON.stringify([]));
        return { products: [] };
    } catch (error) {
        return { products: [] };
    }
}; 