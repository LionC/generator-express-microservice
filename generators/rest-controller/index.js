'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var pluralize = require('pluralize').plural;

module.exports = yeoman.Base.extend({
    prompting: function () {
        var prompts = [{
            type: 'input',
            name: 'entityName',
            message: 'What should the name of the entity controlled by the controller?'
        }, {
            type: 'confirm',
            name: 'crud',
            message: 'Should default CRUD behaviour be generated?',
            default: true
        }, {
            type: 'confirm',
            name: 'json',
            message: 'Should the endpoint accept JSON?',
            default: true,
            when: function(answers) {
              return !answers.crud;
            }
        }, {
            type: 'input',
            name: 'collection',
            message: 'What is the name of the mongo collection for CRUD?',
            default: function(answers) {
              return pluralize(answers.entityName);
            },
            when: function(answers) {
              return answers.crud;
            }
        }, {
            type: 'input',
            name: 'id',
            message: 'What is the name of the id property for CRUD?',
            when: function(answers) {
                return answers.crud;
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
            this.templatePath('controller.js'),
            this.destinationPath('controllers/' + this.props.collection + '/index.js'),
            {
                collection: this.props.collection,
                entityName: this.props.entityName,
                id: this.props.id,
                crud: this.props.crud,
                json: this.props.crud || this.props.json
            }
        );
    }
});
