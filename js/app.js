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
  $scope.state = "idle";
  $scope.identifier = null;
  $scope.buttonText = function(){
    if($scope.state == "input") return "RUNNING";
    return "EXECUTE";
  };
  $scope.disabled = function(){
    if($scope.state == "input") return "disabled";
    return "";
  };

  $scope.execute = function(){
    // disallow execute on input mode
    if($scope.state == "input") return;

    // clear values
    $scope.lexemes = [];
    $scope.symbolTable = [];

    // set lexemeIndex
    $scope.lexemeIndex = 0;

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
    $scope.checkSyntaxErrors();
  };

  $scope.checkSyntaxErrors = function(){
    // check here

    // success
    $scope.run(0);
  };

  $scope.run = function(i){
    var identifier;

    // start running the program
    for(; i < $scope.lexemes.length; i++, $scope.lexemeIndex++){
      if($scope.lexemes[i].lexeme.text == "I HAS A"){
        identifier = $scope.lexemes[++i].lexeme.text;
        $scope.lexemeIndex++;

        addSymbol(identifier, 'NOOB', 'red-text', 'NOOB', 'red-text');
      }
      else if($scope.lexemes[i].lexeme.text == "GIMMEH"){
        identifier = $scope.lexemes[++i].lexeme.text;
        $scope.lexemeIndex++;

        // wait for input
        $('#input').focus();

        // set state to waiting for input
        $scope.state = "input";

        // set identifier
        $scope.identifier = identifier;

        // break run
        return;
      }
    }

    // end of program
    $scope.state = "idle";
  };

  $scope.input = function(){
    var identifier = $scope.identifier;
    var value = $('#input').val();
    var typeText;
    var typeColor;
    var valueText;
    var valueColor;

    // add to console
    $scope.console.push({text: '> '+value});

    if(!value){
      typeText = 'NOOB';
      typeColor = 'red-text';
      valueText = 'NOOB';
      valueColor = 'red-text';
    }
    else if(/^\d+$/.test(value)){
      typeText = 'NUMBR';
      typeColor = 'yellow-text';
      valueText = value;
      valueColor = 'white-text';
    }
    else if(/^\d+\.\d+$/.test(value)){
      // NUMBARs
      typeText = 'NUMBAR';
      typeColor = 'yellow-text';
      valueText = value;
      valueColor = 'white-text';
    }
    else{
      typeText = 'YARN';
      typeColor = 'yellow-text';
      valueText = '"' + value + '"';
      valueColor = 'blue-text';
      // YARN
    }

    editSymbol(identifier, typeText, typeColor, valueText, valueColor);

    // clear value
    $('#input').val('');
    $('#input').blur();

    $scope.run(++$scope.lexemeIndex);
  };

  $scope.focusInput = function(){
    if($scope.state != "input"){
      $('#input').blur();
    }
  };

  // scroll down on console update
  $scope.$watch(function(){
    return $('.console-list').children().length;
  }, function(){
    $('.console').scrollTop($('.console')[0].scrollHeight);
  });

  // scroll down on keypres
  $('#input').on('keypress', function(){
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
