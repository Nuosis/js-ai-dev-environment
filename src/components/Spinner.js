/**
 * Spinner.js - A simple and elegant loading spinner component
 * 
 * This component creates a customizable loading spinner that can be
 * easily added to any part of your application.
 */

/**
 * Creates a new Spinner instance
 * @param {Object} options - Configuration options for the spinner
 * @param {string} [options.size='medium'] - Size of the spinner ('small', 'medium', 'large')
 * @param {string} [options.color='#0091CE'] - Color of the spinner (CSS color value)
 * @param {string} [options.containerClass=''] - Additional CSS class for the container
 * @returns {Object} - Spinner instance with methods to control the spinner
 */
function Spinner(options = {}) {
  // Default options
  const config = {
    size: options.size || 'medium',
    color: options.color || '#0091CE',
    containerClass: options.containerClass || ''
  };

  // Size mappings
  const sizes = {
    small: { size: '20px', borderWidth: '2px' },
    medium: { size: '40px', borderWidth: '3px' },
    large: { size: '60px', borderWidth: '4px' }
  };

  // Get size values
  const sizeValues = sizes[config.size] || sizes.medium;

  // Create spinner element
  const createSpinnerElement = () => {
    // Create container
    const container = document.createElement('div');
    container.className = `spinner-container ${config.containerClass}`;
    
    // Create spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    // Apply styles
    spinner.style.width = sizeValues.size;
    spinner.style.height = sizeValues.size;
    spinner.style.borderWidth = sizeValues.borderWidth;
    spinner.style.borderColor = `${config.color}20`; // 20 is hex for 12% opacity
    spinner.style.borderTopColor = config.color;
    
    // Append spinner to container
    container.appendChild(spinner);
    
    return container;
  };

  // Create spinner element
  const spinnerElement = createSpinnerElement();
  
  // Public methods
  return {
    /**
     * Get the spinner DOM element
     * @returns {HTMLElement} - The spinner DOM element
     */
    getElement: () => spinnerElement,
    
    /**
     * Append the spinner to a parent element
     * @param {HTMLElement|string} parent - Parent element or selector
     * @returns {Object} - The spinner instance for chaining
     */
    appendTo: (parent) => {
      const parentElement = typeof parent === 'string' 
        ? document.querySelector(parent) 
        : parent;
      
      if (parentElement) {
        parentElement.appendChild(spinnerElement);
      } else {
        console.error('Invalid parent element for spinner');
      }
      
      return this;
    },
    
    /**
     * Show the spinner
     * @returns {Object} - The spinner instance for chaining
     */
    show: () => {
      spinnerElement.style.display = 'flex';
      return this;
    },
    
    /**
     * Hide the spinner
     * @returns {Object} - The spinner instance for chaining
     */
    hide: () => {
      spinnerElement.style.display = 'none';
      return this;
    },
    
    /**
     * Remove the spinner from the DOM
     */
    remove: () => {
      if (spinnerElement.parentNode) {
        spinnerElement.parentNode.removeChild(spinnerElement);
      }
    }
  };
}

// Export the Spinner constructor
export default Spinner;