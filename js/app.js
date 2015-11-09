$(document).ready(function(){
  var remote = require('remote');
  var Menu = remote.require('menu');
  var MenuItem = remote.require('menu-item');
  var ipc = require('ipc');

  // render menu
  var template = [{
    label: 'File',
    submenu: [
      {
        label: 'Open file',
        accelerator: 'CmdOrCtrl+O',
        click: function(){
          ipc.send('open-file');
        }
      },
      {
        label: 'Open dev tools',
        accelerator: 'F12',
        click: function(){
          ipc.send('open-devtools');
        }
      }
    ]
  }];

  menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // set editor
  var editor = ace.edit("editor");
  editor.setTheme("ace/theme/terminal");

  // listen for possible file read
  ipc.on('send-code', function(data){
    ace.edit("editor").setValue(data);
  });
});

// angular part
angular.module('app', []).controller('AppController', function($scope){
  $scope.lexemes = [];
  $scope.symbolTable = [];
  $scope.console = [];
  $scope.lexemeIndex = 0;

  $scope.execute = function(){
    // display execution message
    $scope.console.push({text: '> Parsing code.'});

    // clear values
    $scope.lexemes = [];
    $scope.symbolTable = [];

    // split by lines
    var code = ace.edit("editor").getValue();
    var lines = code.split('\n');
    var identifier;

    // get lexemes

    for(var i = 0; i < lines.length; i++){
      // remove excess lines
      lines[i] = lines[i].trim();

      // test
      if(/^\s*HAI\s*$/.test(lines[i])){
        addLexeme('HAI', 'green-text', 'Code delimeter');
      }
      else if(/^\s*KTHXBYE\s*$/.test(lines[i])){
        addLexeme('KTHXBYE', 'green-text', 'Code delimeter');
      }
      else if(/\s*I HAS A\s+/.test(lines[i])){
        addLexeme('I HAS A', 'green-text', 'Variable declaration');

        identifier = lines[i].substr(8).trim();

        // add variable
        addLexeme(identifier, 'white-text', 'Variable identifier');
      }
      else if(/\s*GIMMEH\s+/.test(lines[i])){
        addLexeme('GIMMEH', 'green-text', 'Input identifier');

        identifier = lines[i].substr(7).trim();

        // add identifier
        addLexeme(identifier, 'white-text', 'Variable identifier');
      }
    }

    // parsing is successful if we manage to get to this code
    $scope.console.push({text: '> Parsing success.'});

    $scope.checkSyntaxErrors();
  };

  $scope.checkSyntaxErrors = function(){
    // check here

    // success
    $scope.run(0);
  };

  $scope.run = function(i){
    // start running the program
    for(; i < $scope.lexemes.length; i++){
      if($scope.lexemes[i].lexeme.text == "I HAS A"){
        var identifier = $scope.lexemes[++i].lexeme.text;

        addSymbol(identifier, 'undefined', 'red-text', 'undefined', 'red-text');
      }
    }
  };

  // scroll down on console update
  $scope.$watch(function(){
    return $('.console').children().length;
  }, function(){
    $('.console').scrollTop($('.console')[0].scrollHeight);
  });

  // helper functions
  function addLexeme(text, color, desc){
    $scope.lexemes.push({
      lexeme: {
        text: text,
        color: color
      },
      desc: desc
    });
  }

  function addSymbol(identifier, typeText, typeColor, valueText, valueColor){
    $scope.symbolTable.push({
      identifier: identifier,
      type: {
        text: typeText,
        color: typeColor
      },
      value: {
        text: valueText,
        color: valueColor
      }
    });
  }

  function editSymbol(identifier, typeText, typeColor, valueText, valueColor){
    // get index of identifier
    var index = $scope.symbolTable.indexOfAttr('identifier',  identifier);

    if(index == -1) throw 'Invalid index';

    $scope.symbolTable[index].type.text = typeText;
    $scope.symbolTable[index].type.color = typeColor;
    $scope.symbolTable[index].value.text = valueText;
    $scope.symbolTable[index].value.color = valueColor;
  }
});
