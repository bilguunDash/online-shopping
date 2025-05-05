// Script to prevent template scripts from executing on admin pages
if (window.location.pathname.includes('/admin')) {
  // Create a function that replaces jQuery methods that affect the header/menu
  window.preventTemplateInitialization = function() {
    if (window.jQuery) {
      // Store original jQuery
      var originalJQuery = window.jQuery;
      
      // Create a proxy for jQuery
      window.jQuery = window.$ = function(selector) {
        // If this is a header or menu related selector, return a dummy object
        if (
          typeof selector === 'string' && 
          (
            selector.includes('header') || 
            selector.includes('menu') || 
            selector.includes('nav') ||
            selector.includes('loader') ||
            selector.includes('.main-menu') ||
            selector.includes('#wrapper') ||
            selector.includes('#sidebarCollapse')
          )
        ) {
          // Return a dummy jQuery object that does nothing
          return {
            ready: function(callback) { return this; },
            on: function() { return this; },
            mouseover: function() { return this; },
            mouseleave: function() { return this; },
            addClass: function() { return this; },
            removeClass: function() { return this; },
            toggleClass: function() { return this; },
            fadeToggle: function() { return this; },
            tooltip: function() { return this; },
            carousel: function() { return this; }
          };
        }
        
        // For other selectors, use the original jQuery
        return originalJQuery(selector);
      };
      
      // Copy all properties from the original jQuery
      for (var prop in originalJQuery) {
        if (originalJQuery.hasOwnProperty(prop)) {
          window.jQuery[prop] = originalJQuery[prop];
        }
      }
    }
  };
  
  // Execute immediately
  window.preventTemplateInitialization();
  
  // Also execute when DOM is loaded
  document.addEventListener('DOMContentLoaded', window.preventTemplateInitialization);
} 