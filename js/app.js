// @TODO:
// Negative NUMBR/NUMBAR
// Initializing with variable

// define regex here
var regex = {
  'NOOB': /^NOOB$/,
  'TROOF': /^(WIN|FAIL)$/,
  'NUMBR': /^-?\d+$/,
  'NUMBAR': /^-?\d+\.\d+$/,
  'YARN': /^".*"$/
};

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

    // print to console
    printToConsole('Executing code.');

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

      // check keyword
      if(/^\s*HAI\s*$/.test(lines[i])){
        addLexeme('HAI', 'green-text', 'Code Delimeter');
      }
      else if(/^\s*KTHXBYE\s*$/.test(lines[i])){
        addLexeme('KTHXBYE', 'green-text', 'Code Delimeter');
      }
      else if(/\s*I HAS A\s+/.test(lines[i])){
        addLexeme('I HAS A', 'green-text', 'Variable Declaration');

        // remove whitespaces
        identifier = lines[i].substr(8).trim();

        // check if it has ITZ
        if(/ ITZ /.test(identifier)){
          // get index of ITZ
          var index = identifier.indexOf('ITZ');

          // get value
          var value = identifier.substring(index + 3).trim();

          // get identifier
          identifier = identifier.substring(0, index).trim();

          // identify type of value
          var type;

          if(regex.NOOB.test(value)){
            // NOOB
            type = 'NOOB';
          }
          else if(regex.TROOF.test(value)){
            // TROOF
            type = 'TROOF';
          }
          else if(regex.NUMBR.test(value)){
            // NUMBR
            type = 'NUMBR';
          }
          else if(regex.NUMBAR.test(value)){
            // NUMBAR
            type = 'NUMBAR';
          }
          else if(regex.YARN.test(value)){
            // YARN
            type = 'YARN';
          }
          else{
            // variable
          }

          // add lexemes
          // identifier
          addLexeme(identifier, 'white-text', 'Variable Identifier');

          // add ITZ
          addLexeme('ITZ', 'green-text', 'Variable Assignment');

          // add value
          switch(type){
            case 'NOOB':
              addLexeme(value, 'yellow-text', 'Null Literal');
              break;
            case 'TROOF':
              addLexeme(value, 'red-text', 'Boolean Literal');
              break;
            case 'NUMBR':
              addLexeme(value, 'white-text', 'Integer Literal');
              break;
            case 'NUMBAR':
              addLexeme(value, 'white-text', 'Float Literal');
              break;
            case 'YARN':
              // omit string delimeters
              value = value.substring(1, value.length - 1);
              addLexeme('"', 'blue-text', 'String Delimeter');
              addLexeme(value, 'blue-text', 'String Literal');
              addLexeme('"', 'blue-text', 'String Delimeter');
              break;
          }
        }
        else{
          // add variable
          addLexeme(identifier, 'white-text', 'Variable Identifier');
        }
      }
      else if(/\s*GIMMEH\s+/.test(lines[i])){
        addLexeme('GIMMEH', 'green-text', 'Input Identifier');

        // remove whitespaces
        identifier = lines[i].substr(7).trim();

        // add identifier
        addLexeme(identifier, 'white-text', 'Variable Identifier');
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

        addSymbol(identifier, 'NOOB', 'yellow-text', 'NOOB', 'yellow-text');
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
      else if($scope.lexemes[i].lexeme.text == 'ITZ'){
        // get identifier and value
        identifier = $scope.lexemes[(i - 1)].lexeme.text;
        var value = $scope.lexemes[++i].lexeme.text;
        $scope.lexemeIndex++;

        var typeText;
        var valueColor;

        // identify typeText
        if(regex.NOOB.test(value)){
          // NOOB
          typeText = 'NOOB';
          valueColor = 'yellow-text';
        }
        else if(regex.TROOF.test(value)){
          // TROOF
          typeText = 'TROOF';
          valueColor = 'red-text';
        }
        else if(regex.NUMBR.test(value)){
          // NUMBR
          typeText = 'NUMBR';
          valueColor = 'white-text';
        }
        else if(regex.NUMBAR.test(value)){
          // NUMBAR
          typeText = 'NUMBAR';
          valueColor = 'white-text';
        }
        else if(value == '"'){
          // YARN
          typeText = 'YARN';
          valueColor = 'blue-text';

          value = '"' + $scope.lexemes[++i].lexeme.text + '"';
          i++;
          $scope.lexemeIndex += 2;
        }
        else{
          // variable
        }

        // edit symbol
        editSymbol(identifier, typeText, 'yellow-text', value, valueColor);
      }
    }

    // end of program
    $scope.state = "idle";
  };

  $scope.input = function(){
    var identifier = $scope.identifier;
    var value = $('#input').val();
    var typeText = 'YARN';
    var typeColor = 'yellow-text';
    var valueText = '"' + value + '"';
    var valueColor = 'blue-text';

    // add to console
    printToConsole(value);

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

  function printToConsole(text){
    $scope.console.push({
      text: '> ' + text
    });
  }
});
