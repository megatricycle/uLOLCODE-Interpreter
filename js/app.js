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

  $scope.execute = function(){
    // display execution message
    $scope.console.push({text: '> Parsing code.'});

    // clear values
    $scope.lexemes = [];
    $scope.symbolTable = [];

    // split by lines
    var code = ace.edit("editor").getValue();
    var lines = code.split('\n');

    for(var i = 0; i < lines.length; i++){
      // remove excess lines
      lines[i] = lines[i].trim();

      // test
      if(/^\s*HAI\s*$/.test(lines[i])){
        $scope.lexemes.push({
          lexeme: {
            text: 'HAI',
            color: 'green-text'
          },
          desc: 'Keyword'
        });
      }
      else if(/^\s*KTHXBYE\s*$/.test(lines[i])){
        $scope.lexemes.push({
          lexeme: {
            text: 'KTHXBYE',
            color: 'green-text'
          },
          desc: 'Keyword'
        });
      }
      else if(/\s*I HAS A\s+/.test(lines[i])){
        $scope.lexemes.push({
          lexeme: {
            text: 'I HAS A',
            color: 'green-text'
          },
          desc: 'Keyword'
        });

        var identifier = lines[i].substr(8).trim();

        // add variable
        $scope.lexemes.push({
          lexeme: {
            text: identifier,
            color: 'white-text'
          },
          desc: 'Identifier'
        });

        // check if symbol already exists
        if($scope.symbolTable.indexOfAttr('identifier', identifier) == -1){
          $scope.symbolTable.push({
            identifier: identifier,
            type: {
              text: 'undefined',
              color: 'red-text'
            },
            value: {
              text: 'undefined',
              color: 'red-text'
            }
          });
        }
      }
    }

    // since it's still hardcoded, assume Success
    $scope.console.push({text: '> Parsing success.'});
  };

  // scroll down on console update
  $scope.$watch(function(){
    return $('.console').children().length;
  }, function(){
    $('.console').scrollTop($('.console')[0].scrollHeight);
  });
});
