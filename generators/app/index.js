'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');

module.exports = yeoman.Base.extend({
  prompting: function () {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the ' + chalk.yellow('express microservice') + ' generator!'
    ));

    var prompts = [{
      type: 'checkbox',
      name: 'optionalDependencies',
      message: 'Choose which optional dependencies you would like to install (this generator does not depend on any of them)',
      choices: [
          { name: 'body-parser', checked: true },
          { name: 'express-basic-auth' },
          { name: 'json-schema-validation-middleware' },
          { name: 'mongoennung', value: 'Acomodeo/mongoennung' }
      ]
  }, {
      type: 'input',
      name: 'apiPrefix',
      message: 'Which API prefix should be used? (enter / for no prefix)',
      default: '/api',
      validate: function (prefix) {
          return prefix.startsWith('/') || 'Prefix has to start with \'/\'';
      }
  }];

    return this.prompt(prompts).then(function (props) {
      // To access props later use this.props.someAnswer;
      this.props = props;
    }.bind(this));
  },

    writing: function () {
        //this.fs.mkdir('middleware'); maybe add automatic basicauthmiddleware?

        this.fs.copyTpl(
            this.templatePath('server.js'),
            this.destinationPath('server.js'),
            { apiPrefix: this.props.apiPrefix }
        );

        this.fs.copy(
            this.templatePath('controllers.js'),
            this.destinationPath('controllers/index.js')
        );
    },

  install: function () {
    var dependencies = [ 'express' ];

    for(var i in this.props.optionalDependencies)
        dependencies.push(this.props.optionalDependencies[i]);

    this.npmInstall(dependencies, { 'save': true });
  }
});
