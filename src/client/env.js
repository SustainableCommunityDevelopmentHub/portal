(function (window) {
  /***
   * The __env object is a container for all environment variables (configuration settings)
   * for the client application. For angular it is loaded as a constant by the app.
   * Directly inspired by:
   * http://www.jvandemo.com/how-to-configure-your-angularjs-application-using-environment-variables/
   */

  window.__env = window.__env || {};

 /* config settings for angular app
  * IMPORTANT: These should be specific to the deployment environment
  */

  // Base URL for app
  window.__env.app = {};
  window.__env.app.root = 'app';

  // Elasticsearch
  window.__env.elastic = {};
  window.__env.elastic.host  = 'local.portal.dev';
  window.__env.elastic.port = '9200';
  window.__env.elastic.apiVersion = '2.0';


  // debug mode
  //window.__env.enableDebug = true;
}(this));
