// @TODO:
// STRING LITERALS DONT RESPECT WHITESPACES (kasalanan ng javascript)
// SYNTAX ERRORS
// COMMENTS
// CONCATENATION
// ASSIGNMENT


// define regex here
var regex = {
  'NOOB': /^NOOB$/,
  'TROOF': /^(WIN|FAIL)$/,
  'NUMBR': /^-?\d+$/,
  'NUMBAR': /^-?\d+\.\d+$/,
  'YARN': /^".*"$/
};

var editor;

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
  editor = ace.edit("editor");
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
    $scope.variables = [];

    // set lexemeIndex
    $scope.lexemeIndex = 0;

    // split by lines
    var code = ace.edit("editor").getValue();
    var lines = code.split('\n');
    var identifier;

    // get lexemes
    var ignore = false;

    for(var i = 0; i < lines.length; i++){
      var hasComment = false;

      // remove excess lines
      lines[i] = lines[i].trim();

      // top level keyword checker
      if(/\s*TLDR\s*$/.test(lines[i])){
        // set ignore to false
        ignore = false;

        // add lexeme
        addLexeme('TLDR', 'grey-text', 'Comment Delimiter');
      }

      // strip comments
      if(/\s+BTW\s*/.test(lines[i])){
        // remove btw
        lines[i] = lines[i].substring(0, lines[i].indexOf('BTW')).trim();

        hasComment = true;
      }

      // proceed to new line if comment mode
      if(ignore){
        continue;
      }

      var operator1;
      var operator2;

      // check keyword
      if(/^\s*HAI\s*$/.test(lines[i])){
        addLexeme('HAI', 'green-text', 'Code Delimeter');
      }
      else if(/^\s*KTHXBYE\s*$/.test(lines[i])){
        addLexeme('KTHXBYE', 'green-text', 'Code Delimeter');
      }
      else if(/^\s*VISIBLE\s+/.test(lines[i])){
        addLexeme('VISIBLE', 'green-text', 'Output Keyword');

        identifier = lines[i].substr(8).trim();
        type = checkLiteral(identifier);

        addLexemeLiteral(identifier, type);
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
          var type = checkLiteral(value);

          // add lexemes
          // identifier
          addLexeme(identifier, 'white-text', 'Variable Identifier');

          // add ITZ
          addLexeme('ITZ', 'green-text', 'Variable Assignment');

          // add value
          addLexemeLiteral(value, type);
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
      // comment
      else if(/\s*OBTW\s*.*$/.test(lines[i])){
        // set ignore to true
        ignore = true;

        // add lexeme
        addLexeme('OBTW', 'grey-text', 'Comment Delimiter');
      }
      // arithmetic operations
      else if(/\s*SUM OF\s+/.test(lines[i])){
        addLexeme('SUM OF', 'green-text', 'Addition Operator');

        // remove whitespaces
        operators = lines[i].substr(7).trim();

        operators = operators.split(' AN ');

        operator1 = {
          value: operators[0].trim(),
          type: checkLiteral(operators[0].trim())
        };

        operator2 = {
          value: operators[1].trim(),
          type: checkLiteral(operators[1].trim())
        };

        // add lexemes
        addLexemeLiteral(operator1.value, operator1.type);
        addLexeme('AN', 'green-text', 'Operand Separator');
        addLexemeLiteral(operator2.value, operator2.type);
      }
      else if(/\s*DIFF OF\s+/.test(lines[i])){
        addLexeme('DIFF OF', 'green-text', 'Subtraction Operator');

        // remove whitespaces
        operators = lines[i].substr(8).trim();

        operators = operators.split(' AN ');

        operator1 = {
          value: operators[0].trim(),
          type: checkLiteral(operators[0].trim())
        };

        operator2 = {
          value: operators[1].trim(),
          type: checkLiteral(operators[1].trim())
        };

        // add lexemes
        addLexemeLiteral(operator1.value, operator1.type);
        addLexeme('AN', 'green-text', 'Operand Separator');
        addLexemeLiteral(operator2.value, operator2.type);
      }
      else if(/\s*PRODUKT OF\s+/.test(lines[i])){
        addLexeme('PRODUKT OF', 'green-text', 'Multiplication Operator');

        // remove whitespaces
        operators = lines[i].substr(11).trim();

        operators = operators.split(' AN ');

        operator1 = {
          value: operators[0].trim(),
          type: checkLiteral(operators[0].trim())
        };

        operator2 = {
          value: operators[1].trim(),
          type: checkLiteral(operators[1].trim())
        };

        // add lexemes
        addLexemeLiteral(operator1.value, operator1.type);
        addLexeme('AN', 'green-text', 'Operand Separator');
        addLexemeLiteral(operator2.value, operator2.type);
      }
      else if(/\s*QUOSHUNT OF\s+/.test(lines[i])){
        addLexeme('QUOSHUNT OF', 'green-text', 'Division Operator');

        // remove whitespaces
        operators = lines[i].substr(12).trim();

        operators = operators.split(' AN ');

        operator1 = {
          value: operators[0].trim(),
          type: checkLiteral(operators[0].trim())
        };

        operator2 = {
          value: operators[1].trim(),
          type: checkLiteral(operators[1].trim())
        };

        // add lexemes
        addLexemeLiteral(operator1.value, operator1.type);
        addLexeme('AN', 'green-text', 'Operand Separator');
        addLexemeLiteral(operator2.value, operator2.type);
      }
      else if(/\s*MOD OF\s+/.test(lines[i])){
        addLexeme('MOD OF', 'green-text', 'Modulus Operator');

        // remove whitespaces
        operators = lines[i].substr(7).trim();

        operators = operators.split(' AN ');

        operator1 = {
          value: operators[0].trim(),
          type: checkLiteral(operators[0].trim())
        };

        operator2 = {
          value: operators[1].trim(),
          type: checkLiteral(operators[1].trim())
        };

        // add lexemes
        addLexemeLiteral(operator1.value, operator1.type);
        addLexeme('AN', 'green-text', 'Operand Separator');
        addLexemeLiteral(operator2.value, operator2.type);
      }
      else if(/\s*BIGGR OF\s+/.test(lines[i])){
        addLexeme('BIGGR OF', 'green-text', 'Max Operator');

        // remove whitespaces
        operators = lines[i].substr(9).trim();

        operators = operators.split(' AN ');

        operator1 = {
          value: operators[0].trim(),
          type: checkLiteral(operators[0].trim())
        };

        operator2 = {
          value: operators[1].trim(),
          type: checkLiteral(operators[1].trim())
        };

        // add lexemes
        addLexemeLiteral(operator1.value, operator1.type);
        addLexeme('AN', 'green-text', 'Operand Separator');
        addLexemeLiteral(operator2.value, operator2.type);
      }
      else if(/\s*SMALLR OF\s+/.test(lines[i])){
        addLexeme('SMALLR OF', 'green-text', 'Min Operator');

        // remove whitespaces
        operators = lines[i].substr(10).trim();

        operators = operators.split(' AN ');

        operator1 = {
          value: operators[0].trim(),
          type: checkLiteral(operators[0].trim())
        };

        operator2 = {
          value: operators[1].trim(),
          type: checkLiteral(operators[1].trim())
        };

        // add lexemes
        addLexemeLiteral(operator1.value, operator1.type);
        addLexeme('AN', 'green-text', 'Operand Separator');
        addLexemeLiteral(operator2.value, operator2.type);
      }

      // add comment lexeme if it has
      if(hasComment){
        // add btw lexeme
        addLexeme('BTW', 'grey-text', 'Comment');
      }
    }

    // parsing is successful if we manage to get to this code
    $scope.checkSyntaxErrors();
  };

  $scope.checkSyntaxErrors = function(){
    //checking if the first delimiter is HAI

    if(!(/^\s*HAI\s*$/.test($scope.lexemes[0].lexeme.text))){
      $scope.console.push({text: '> Syntax Error: Expected delimiter: HAI on line 1'});
      return;
    } //checking if the last delimiter is KTHXBYE
    else if(!(/^\s*KTHXBYE\s*$/.test($scope.lexemes[($scope.lexemes.length)-1].lexeme.text))){
      $scope.console.push({text: '> Syntax Error: Expected delimiter: KTHXBYE on line ' + (($scope.lexemes.length)-1)});
      return;
    }

    // for(var i=1; i<($scope.lexemes.length)-2; i++){
    //   /*if(().test($scope.lexemes[i].lexeme.text)){
    //
    //   }*/
    // }

    // success
    $scope.run(0);
  };

  $scope.run = function(i){
    // start running the program
    for(; i < $scope.lexemes.length; i++, $scope.lexemeIndex++){
      var value;
      var identifier;
      var symbol;
      var typeText;

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
        value = $scope.lexemes[++i].lexeme.text;
        $scope.lexemeIndex++;

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
          // get symbol object
          symbol = $scope.symbolTable[$scope.symbolTable.indexOfAttr('identifier', value)];

          typeText = symbol.type.text;
          value = symbol.value.text;
          valueColor = symbol.value.color;
        }

        // edit symbol
        editSymbol(identifier, typeText, 'yellow-text', value, valueColor);
      }
      else if($scope.lexemes[i].lexeme.text == 'VISIBLE'){
        value = $scope.lexemes[++i].lexeme.text;
        $scope.lexemeIndex++;
        var type = checkLiteral(value);

       switch(type){
          case 'TROOF':
            if(value == 'WIN') printToConsole('WIN');
            else printToConsole('FAIL');
            break;
          case 'NOOB':
          case 'NUMBR':
          case 'NUMBAR':
            printToConsole(value);
            break;
          case 'YARN':
            printToConsole($scope.lexemes[++i].lexeme.text);
            i++;
            $scope.lexemeIndex += 2;
            break;
          case 'variable':
            symbol = $scope.symbolTable[$scope.symbolTable.indexOfAttr('identifier', value)];

            typeText = symbol.type.text;
            value = symbol.value.text;

            switch(typeText){
              case 'TROOF':
                if(value == 'WIN') printToConsole('WIN');
                else printToConsole('FAIL');
                break;
              case 'NOOB':
              case 'NUMBR':
              case 'NUMBAR':
                printToConsole(value);
                break;
              case 'YARN':
                printToConsole(value.substr(1, value.length - 2));
                break;
            }

            break;
       }
      }
    }

    // end of program
    $scope.state = "idle";

    // focus editor
    editor.focus();
    session = editor.getSession();
    count = session.getLength();
    editor.gotoLine(count, session.getLine(count-1).length);
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

  // ctrl + enter
  $scope.ctrlEnter = function(e){
    if(e.ctrlKey && e.keyCode == 13){
      $scope.execute();
    }
  };

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

  function checkLiteral(value){
    if(regex.NOOB.test(value)){
      // NOOB
      return 'NOOB';
    }
    else if(regex.TROOF.test(value)){
      // TROOF
      return 'TROOF';
    }
    else if(regex.NUMBR.test(value)){
      // NUMBR
      return 'NUMBR';
    }
    else if(regex.NUMBAR.test(value)){
      // NUMBAR
      return 'NUMBAR';
    }
    else if(regex.YARN.test(value) || value == '"'){
      // YARN
      return 'YARN';
    }
    else{
      // variable
      return 'variable';
    }
  }

  function addLexemeLiteral(value, type){
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
      case 'variable':
        addLexeme(value, 'white-text', 'Variable Identifier');
        break;
    }
  }
});
