import FMGofer from 'fm-gofer';

/**
 * FileMaker Service Module
 * 
 * This module provides a bridge between FileMaker and JavaScript, allowing for both
 * synchronous and asynchronous script execution with a callback registry system.
 * 
 * === EXTENDING THE CALLBACK REGISTRY FOR SYNCHRONOUS CALLS ===
 * 
 * The callback registry system allows developers to register functions that can be called
 * by FileMaker when synchronous script execution completes. Here's how to use it:
 * 
 * 1. Import your callback function:
 *    ```javascript
 *    import { myCallbackFunction } from './myFunctions';
 *    ```
 * 
 * 2. Register the function with FileMakerService:
 *    ```javascript
 *    FileMakerService.registerCallback('myCallbackName', myCallbackFunction);
 *    ```
 * 
 * 3. When executing a FileMaker script synchronously, include these properties in your params:
 *    ```javascript
 *    FileMakerService.executeScript({
 *      method: 'sync',
 *      script: 'Your Script Name',
 *      params: {
 *        // Your other parameters...
 *        callbackName: 'filemakerCallback', // This should always be 'filemakerCallback'
 *        callbackFunction: 'myCallbackName', // The name you registered
 *        callbackId: 'optional-tracking-id' // Optional identifier
 *      }
 *    });
 *    ```
 * 
 * 4. In your FileMaker script, return a JSON object with this structure:
 *    ```
 *    {
 *      "callbackFunction": "myCallbackName",
 *      "response": { "your": "data" },
 *      "callbackId": "optional-tracking-id"
 *    }
 *    ```
 * 
 * 5. The global filemakerCallback function will:
 *    - Parse the returned JSON
 *    - Look up the registered function by name
 *    - Call it with an object containing:
 *      ```javascript
 *      {
 *        json: response, // The data from FileMaker
 *        callbackId: callbackId // The optional tracking ID
 *      }
 *      ```
 * 
 * This system provides a single entry point for FileMaker to call back to JavaScript
 * while allowing for flexible handling of different types of responses.
 */

// Registry to store callback functions
const callbackRegistry = {};

/**
 * FileMaker Service for executing FileMaker scripts
 *
 * This service provides a method to execute FileMaker scripts either synchronously
 * or asynchronously based on the method parameter.
 */
const FileMakerService = {
  /**
   * Register a callback function
   * 
   * @param {string} name - Name of the callback function
   * @param {Function} fn - The callback function to register
   * @returns {void}
   */
  registerCallback(name, fn) {
    if (typeof fn !== 'function') {
      console.error(`Cannot register callback "${name}": not a function`);
      return;
    }
    callbackRegistry[name] = fn;
  },

  /**
   * Get a registered callback function
   * 
   * @param {string} name - Name of the callback function
   * @returns {Function|null} - The callback function or null if not found
   */
  getCallback(name) {
    return callbackRegistry[name] || null;
  },

  /**
   * Execute a FileMaker script
   *
   * @param {Object} props - Properties for script execution
   * @param {string} props.method - Method type ('async' or any other value for sync)
   * @param {string} props.script - Name of the FileMaker script to execute
   * @param {string|Object} props.params - Parameters to pass to the FileMaker script (will be stringified if object)
   * @returns {Promise<string>|void} - Returns a promise if method is async, otherwise void
   */
  executeScript({ method, script = "JS * Fetch Data", params }) {
    // Convert params to string if it's an object
    const paramString = typeof params !== 'string' ? JSON.stringify(params) : params;

    // Check if method is async
    if (method === 'async') {
      // Use asynchronous method
      /*  
          # — UPDATE PARAMS (for testing in absence of ScriptParameter)
            {
              "action": "update",
              "version": "vLatest",
              "layout": "devTasks",
              "action": "update",
              "recordId": "9",
              "fieldData": {
                "f_completed": 1
                ...
              }
            }

          # — READ PARAMS (example)
            {
              "action": "read",
              "version": "vLatest",
              "layout": "devTasks",
              "action": "read",
              "query": [
                {"f_active": 1}
              ]
            }
          
          # — CREATE PARAMS (commented out)
            {
              "action": "ceate",
              "version": "vLatest",
              "layouts": "devTasks",
              "action": "create",
              "fieldData": [
                {"f_completed": 1},
                {"task": "pick up pills"}
              ]
            }
          # — DELETE PARAMS
            {
              "action": "delete",
              "version": "vLatest",
              "layouts": "devTasks",
              "recordId": "9"
            }
          # — RETURN CONTEXT PARAMS
            {
              "action": "returnContext"
            } 
      */
      return FMGofer.PerformScript(script, paramString);
    } else {
      // Use synchronous method. greate for loading/initalizing state that we will need to reference later
      /*  
        param object must include a callbackName property with a default value of filemakerCallback 
        callbackId can be optionally included. When included, the result must be passed onto the action function.
        callbackFunction result must be passed onto the function.
        params {
          ...
          "callbackName": "filemakerCallback",
          "callbackFunction": "callbackFunction",
          "callbackId": "callbackId", // optional
        }
      */
      return FileMaker.PerformScript(script, paramString);
    }
  }
};

/**
 * Global callback function for FileMaker to call back to JavaScript
 * 
 * @param {string} data - JSON stringified object from FileMaker
 * @returns {void}
 */
window.filemakerCallback = function(data) {
  try {
    // Parse the JSON data
    const parsedData = JSON.parse(data);
    
    // Extract the callback function name and response
    const { callbackFunction, response, callbackId } = parsedData;
    
    // Get the callback function from the registry
    const callbackFn = FileMakerService.getCallback(callbackFunction);
    
    // Check if the callback function exists
    if (callbackFunction && callbackFn) {
      // Call the function with response as json prop and callbackId if available
      callbackFn({
        json: response,
        callbackId: callbackId || null
      });
    } else {
      console.error(`Callback function "${callbackFunction}" not found in registry`);
    }
  } catch (error) {
    console.error('Error in filemakerCallback:', error);
  }
};

export default FileMakerService;