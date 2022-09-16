import EmberRouter from '@ember/routing/router';
import config from 'dummy/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType as 'auto';
  rootURL = config.rootURL;
}

Router.map(function () {});
