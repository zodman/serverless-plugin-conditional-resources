'use strict';

/**
  * Plugin Class
  */
class serverlessPluginConditionalResources {
  /**
    * C'tor
    * @param {*} serverless
    * @param {*} options
    */
  constructor(serverless, options = {}) {
    this.serverless = serverless;
    this.options = options;
    this.hooks = {
      'before:package:initialize': this.applyConditions.bind(this),
      'before:offline:start:init': this.applyConditions.bind(this),
    };
    this.pluginName = 'serverless-plugin-conditional-functions';
  }
  /**
    * Evaluates function 'enabled' states
    */
  applyConditions() {
    const resources = this.serverless.service.resources;
    if (!this.isValidObject(resources)) {
      return;
    }
    Object.keys(resources).forEach((resource) => {
      const resourceObj = resources[resource];
      if (resourceObj.enabled) {
        try {
          const EnabledValue = eval(resourceObj.enabled);
          const action = EnabledValue ? 'Enable' : 'Disable';

          this.logConditionValue(resourceObj.enabled, EnabledValue);
          this.verboseLog(this.pluginName + ' - ' + action + ': ' + resourceObj.name);
          if (!EnabledValue) {
            delete this.serverless.service.resources[resource];
          }
        } catch (exception) {
          this.logException(resourceObj.enabled, exception);
        }
      }
    });
  }

  /**
    * Object validation
    * @param {*} item
    * @return {boolean} whether the object is valid
    */
  isValidObject(item) {
    return item && typeof item == 'object';
  }

  /**
    * Logs condition evaluation
    * @param {*} condition
    * @param {*} matched
    */
  logConditionValue(condition, matched) {
    this.verboseLog(this.pluginName + ' - ' +
                    'Condition: ' + condition + '. ' +
                    'Evaluation: ' + matched);
  }

  /**
    * Writes to log if verbose flag given
    * @param {*} text
    */
  verboseLog(text) {
    if (this.options.v || this.options.verbose) {
      this.serverless.cli.log(text);
    }
  }

  /**
    * Logs exception in a readable format
    * @param {*} condition
    * @param {*} exception
    */
  logException(condition, exception) {
    this.serverless.cli.log(
        this.pluginName + ' - ' +
            'exception evaluating condition ' + condition + ' : ' +
            exception);
  }
}

module.exports = serverlessPluginConditionalResources;
