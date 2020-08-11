// Types for compiled templates
declare module 'ember-cached-decorator-polyfill/templates/*' {
  import { TemplateFactory } from 'htmlbars-inline-precompile';
  const tmpl: TemplateFactory;
  export default tmpl;
}
