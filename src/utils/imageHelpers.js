/**
 * Helper functions for handling product images
 */

/**
 * Gets the front view image URL from a product object
 * If the product has a productImages array with a FRONT view, returns that URL
 * Otherwise returns the default imageUrl property
 * 
 * @param {Object} product - The product object
 * @returns {string} - The image URL for the front view
 */
export const getFrontImageUrl = (product) => {
  if (!product) return '';
  
  // First check if product has a productImages array with a FRONT view
  if (product.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
    const frontImage = product.productImages.find(img => img.viewType === 'FRONT');
    if (frontImage && frontImage.imageUrl) {
      return frontImage.imageUrl;
    }
  }
  
  // Fallback to the default imageUrl property
  return product.imageUrl || '';
};

/**
 * Gets the image URL for a specific view type from a product's productImages array
 * 
 * @param {Object} product - The product object
 * @param {string} viewType - The view type (FRONT, BACK, LEFT, RIGHT)
 * @returns {string} - The image URL for the specified view type
 */
export const getImageUrlByViewType = (product, viewType) => {
  if (!product) return '';
  
  // Check if product has a productImages array
  if (product.productImages && Array.isArray(product.productImages) && product.productImages.length > 0) {
    const image = product.productImages.find(img => img.viewType === viewType);
    if (image && image.imageUrl) {
      return image.imageUrl;
    }
  }
  
  // If requested view type is FRONT and no FRONT image in productImages,
  // fallback to the default imageUrl
  if (viewType === 'FRONT') {
    return product.imageUrl || '';
  }
  
  // For other view types, if not found in productImages, return empty string
  return '';
};

/**
 * Gets all available view types from a product's productImages array
 * 
 * @param {Object} product - The product object
 * @returns {Array} - Array of available view types
 */
export const getAvailableViewTypes = (product) => {
  if (!product || !product.productImages || !Array.isArray(product.productImages)) {
    return ['FRONT']; // Default to just FRONT if no product images
  }
  
  // Get unique view types
  const viewTypes = [...new Set(
    product.productImages
      .map(img => img.viewType)
      .filter(Boolean) // Remove any null/undefined/empty values
  )];
  
  return viewTypes.length > 0 ? viewTypes : ['FRONT'];
}; 