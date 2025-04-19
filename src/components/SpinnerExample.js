/**
 * SpinnerExample.js - Example usage of the Spinner component
 * 
 * This file demonstrates how to use the Spinner component in your application.
 */

import Spinner from './Spinner.js';

/**
 * Creates and demonstrates different spinner configurations
 */
function demonstrateSpinners() {
  // Get or create container
  let container = document.getElementById('spinner-examples');
  if (!container) {
    container = document.createElement('div');
    container.id = 'spinner-examples';
    document.body.appendChild(container);
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Add title
  const title = document.createElement('h2');
  title.textContent = 'Spinner Examples';
  container.appendChild(title);
  
  // Example 1: Default spinner
  const example1 = createExampleSection('Default Spinner');
  const spinner1 = new Spinner();
  spinner1.appendTo(example1);
  container.appendChild(example1);
  
  // Example 2: Small blue spinner
  const example2 = createExampleSection('Small Blue Spinner');
  const spinner2 = new Spinner({ 
    size: 'small', 
    color: '#0091CE' 
  });
  spinner2.appendTo(example2);
  container.appendChild(example2);
  
  // Example 3: Large green spinner
  const example3 = createExampleSection('Large Green Spinner');
  const spinner3 = new Spinner({ 
    size: 'large', 
    color: '#00A651' 
  });
  spinner3.appendTo(example3);
  container.appendChild(example3);
  
  // Example 4: Custom spinner with toggle button
  const example4 = createExampleSection('Toggle Spinner');
  
  // Create spinner (initially hidden)
  const spinner4 = new Spinner({ 
    size: 'medium',
    color: '#FF5733',
    containerClass: 'custom-spinner'
  });
  
  const spinnerElement = spinner4.getElement();
  spinnerElement.style.display = 'none'; // Initially hidden
  example4.appendChild(spinnerElement);
  
  // Add toggle button
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Toggle Spinner';
  toggleButton.style.marginTop = '10px';
  
  let isVisible = false;
  toggleButton.addEventListener('click', () => {
    if (isVisible) {
      spinner4.hide();
      toggleButton.textContent = 'Show Spinner';
    } else {
      spinner4.show();
      toggleButton.textContent = 'Hide Spinner';
    }
    isVisible = !isVisible;
  });
  
  example4.appendChild(toggleButton);
  container.appendChild(example4);
}

/**
 * Helper function to create an example section
 * @param {string} title - Section title
 * @returns {HTMLElement} - The created section element
 */
function createExampleSection(title) {
  const section = document.createElement('div');
  section.className = 'example-section';
  section.style.margin = '20px 0';
  section.style.padding = '15px';
  section.style.border = '1px solid #ddd';
  section.style.borderRadius = '4px';
  
  const sectionTitle = document.createElement('h3');
  sectionTitle.textContent = title;
  sectionTitle.style.marginTop = '0';
  
  section.appendChild(sectionTitle);
  return section;
}

// Export the demonstration function
export default demonstrateSpinners;