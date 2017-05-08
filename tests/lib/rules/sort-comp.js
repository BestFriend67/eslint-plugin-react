/**
 * @fileoverview Enforce component methods order
 * @author Yannick Croissant
 */
'use strict';

// ------------------------------------------------------------------------------
// Requirements
// ------------------------------------------------------------------------------

var rule = require('../../../lib/rules/sort-comp');
var RuleTester = require('eslint').RuleTester;

var parserOptions = {
  ecmaVersion: 8,
  sourceType: 'module',
  ecmaFeatures: {
    experimentalObjectRestSpread: true,
    jsx: true
  }
};

require('babel-eslint');

// ------------------------------------------------------------------------------
// Tests
// ------------------------------------------------------------------------------

var ruleTester = new RuleTester({parserOptions});
ruleTester.run('sort-comp', rule, {

  valid: [{
    // Must validate a full class
    code: [
      'var Hello = createReactClass({',
      '  displayName : \'\',',
      '  propTypes: {},',
      '  contextTypes: {},',
      '  childContextTypes: {},',
      '  mixins: [],',
      '  statics: {},',
      '  getDefaultProps: function() {},',
      '  getInitialState: function() {},',
      '  getChildContext: function() {},',
      '  componentWillMount: function() {},',
      '  componentDidMount: function() {},',
      '  componentWillReceiveProps: function() {},',
      '  shouldComponentUpdate: function() {},',
      '  componentWillUpdate: function() {},',
      '  componentDidUpdate: function() {},',
      '  componentWillUnmount: function() {},',
      '  render: function() {',
      '    return <div>Hello</div>;',
      '  }',
      '});'
    ].join('\n')
  }, {
    // Must validate a class with missing groups
    code: [
      'var Hello = createReactClass({',
      '  render: function() {',
      '    return <div>Hello</div>;',
      '  }',
      '});'
    ].join('\n')
  }, {
    // Must put a custom method in 'everything-else'
    code: [
      'var Hello = createReactClass({',
      '  onClick: function() {},',
      '  render: function() {',
      '    return <button onClick={this.onClick}>Hello</button>;',
      '  }',
      '});'
    ].join('\n')
  }, {
    // Must allow us to re-order the groups
    code: [
      'var Hello = createReactClass({',
      '  displayName : \'Hello\',',
      '  render: function() {',
      '    return <button onClick={this.onClick}>Hello</button>;',
      '  },',
      '  onClick: function() {}',
      '});'
    ].join('\n'),
    options: [{
      order: [
        'lifecycle',
        'render',
        'everything-else'
      ]
    }]
  }, {
    // Must allow us to create a RegExp-based group
    code: [
      'class Hello extends React.Component {',
      '  customHandler() {}',
      '  render() {',
      '    return <div>Hello</div>;',
      '  }',
      '  onClick() {}',
      '}'
    ].join('\n'),
    options: [{
      order: [
        'lifecycle',
        'everything-else',
        'render',
        '/on.*/'
      ]
    }]
  }, {
    // Must allow us to create a named group
    code: [
      'class Hello extends React.Component {',
      '  customHandler() {}',
      '  render() {',
      '    return <div>Hello</div>;',
      '  }',
      '  onClick() {}',
      '}'
    ].join('\n'),
    options: [{
      order: [
        'lifecycle',
        'everything-else',
        'render',
        'customGroup'
      ],
      groups: {
        customGroup: [
          '/on.*/'
        ]
      }
    }]
  }, {
    // Must allow a method to be in different places if it's matches multiple patterns
    code: [
      'class Hello extends React.Component {',
      '  render() {',
      '    return <div>Hello</div>;',
      '  }',
      '  onClick() {}',
      '}'
    ].join('\n'),
    options: [{
      order: [
        '/on.*/',
        'render',
        '/.*Click/'
      ]
    }]
  }, {
    // Must allow us to use 'constructor' as a method name
    code: [
      'class Hello extends React.Component {',
      '  constructor() {}',
      '  displayName() {}',
      '  render() {',
      '    return <div>Hello</div>;',
      '  }',
      '}'
    ].join('\n'),
    options: [{
      order: [
        'constructor',
        'lifecycle',
        'everything-else',
        'render'
      ]
    }]
  }, {
    // Must ignore stateless components
    code: [
      'function Hello(props) {',
      '  return <div>Hello {props.name}</div>',
      '}'
    ].join('\n'),
    parser: 'babel-eslint'
  }, {
    // Must ignore stateless components (arrow function with explicit return)
    code: [
      'var Hello = props => (',
      '  <div>Hello {props.name}</div>',
      ')'
    ].join('\n'),
    parser: 'babel-eslint'
  }, {
    // Must ignore spread operator
    code: [
      'var Hello = createReactClass({',
      '  ...proto,',
      '  render: function() {',
      '    return <div>Hello</div>;',
      '  }',
      '});'
    ].join('\n'),
    parser: 'babel-eslint'
  }, {
    // Type Annotations should be first
    code: [
      'class Hello extends React.Component {',
      '  props: { text: string };',
      '  constructor() {}',
      '  render() {',
      '    return <div>{this.props.text}</div>;',
      '  }',
      '}'
    ].join('\n'),
    parser: 'babel-eslint',
    options: [{
      order: [
        'type-annotations',
        'static-methods',
        'lifecycle',
        'everything-else',
        'render'
      ]
    }]
  }, {
    // Properties with Type Annotations should not be at the top
    code: [
      'class Hello extends React.Component {',
      '  props: { text: string };',
      '  constructor() {}',
      '  state: Object = {};',
      '  render() {',
      '    return <div>{this.props.text}</div>;',
      '  }',
      '}'
    ].join('\n'),
    parser: 'babel-eslint',
    options: [{
      order: [
        'type-annotations',
        'static-methods',
        'lifecycle',
        'everything-else',
        'render'
      ]
    }]
  }],

  invalid: [{
    // Must force a lifecycle method to be placed before render
    code: [
      'var Hello = createReactClass({',
      '  render: function() {',
      '    return <div>Hello</div>;',
      '  },',
      '  displayName : \'Hello\',',
      '});'
    ].join('\n'),
    errors: [{message: 'render should be placed after displayName'}]
  }, {
    // Must run rule when render uses createElement instead of JSX
    code: [
      'var Hello = createReactClass({',
      '  render: function() {',
      '    return React.createElement("div", null, "Hello");',
      '  },',
      '  displayName : \'Hello\',',
      '});'
    ].join('\n'),
    errors: [{message: 'render should be placed after displayName'}]
  }, {
    // Must force a custom method to be placed before render
    code: [
      'var Hello = createReactClass({',
      '  render: function() {',
      '    return <div>Hello</div>;',
      '  },',
      '  onClick: function() {},',
      '});'
    ].join('\n'),
    errors: [{message: 'render should be placed after onClick'}]
  }, {
    // Must force a custom method to be placed after render if no 'everything-else' group is specified
    code: [
      'var Hello = createReactClass({',
      '  displayName: \'Hello\',',
      '  onClick: function() {},',
      '  render: function() {',
      '    return <button onClick={this.onClick}>Hello</button>;',
      '  }',
      '});'
    ].join('\n'),
    options: [{
      order: [
        'lifecycle',
        'render'
      ]
    }],
    errors: [{message: 'onClick should be placed after render'}]
  }, {
    // Must validate static properties
    code: [
      'class Hello extends React.Component {',
      '  render() {',
      '    return <div></div>',
      '  }',
      '  static displayName = \'Hello\';',
      '}'
    ].join('\n'),
    parser: 'babel-eslint',
    errors: [{message: 'render should be placed after displayName'}]
  }, {
    // Type Annotations should not be at the top by default
    code: [
      'class Hello extends React.Component {',
      '  props: { text: string };',
      '  constructor() {}',
      '  state: Object = {};',
      '  render() {',
      '    return <div>{this.props.text}</div>;',
      '  }',
      '}'
    ].join('\n'),
    parser: 'babel-eslint',
    errors: [{message: 'props should be placed after state'}]
  }, {
    // Type Annotations should be first
    code: [
      'class Hello extends React.Component {',
      '  constructor() {}',
      '  props: { text: string };',
      '  render() {',
      '    return <div>{this.props.text}</div>;',
      '  }',
      '}'
    ].join('\n'),
    parser: 'babel-eslint',
    errors: [{message: 'constructor should be placed after props'}],
    options: [{
      order: [
        'type-annotations',
        'static-methods',
        'lifecycle',
        'everything-else',
        'render'
      ]
    }]
  }, {
    // Properties with Type Annotations should not be at the top
    code: [
      'class Hello extends React.Component {',
      '  props: { text: string };',
      '  state: Object = {};',
      '  constructor() {}',
      '  render() {',
      '    return <div>{this.props.text}</div>;',
      '  }',
      '}'
    ].join('\n'),
    parser: 'babel-eslint',
    errors: [{message: 'state should be placed after constructor'}],
    options: [{
      order: [
        'type-annotations',
        'static-methods',
        'lifecycle',
        'everything-else',
        'render'
      ]
    }]
  }, {
    code: [
      'export default class View extends React.Component {',
      '  componentDidMountOk() {}',
      '  getB() {}',
      '  componentWillMount() {}',
      '  getA() {}',
      '  render() {}',
      '}'
    ].join('\n'),
    parser: 'babel-eslint',
    errors: [{message: 'componentDidMountOk should be placed after getA'}],
    options: [{
      order: [
        'static-methods',
        'lifecycle',
        '/^on.+$/',
        '/^(get|set)(?!(InitialState$|DefaultProps$|ChildContext$)).+$/',
        'everything-else',
        '/^render.+$/',
        'render'
      ]
    }]
  }]
});
