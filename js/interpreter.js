// @TODO:
// nested operator on infinite operator
// visible infinite arity (RE-CHECK)
// suppress visible new line

// at wtf, push it value to selection stack and executedFlag
// at case, skip when it != top of selection stack
// at OMGWTF, skip when top of selection stack has executedFLag

// angular part
angular.module('app', []).controller('AppController', function($scope){
  $scope.lexemes = [];
  $scope.symbolTable = [];
  $scope.console = [];
  $scope.lexemeIndex = 0;
  $scope.state = "idle";
  $scope.identifier = null;
  $scope.operationStack = [];
  $scope.it = null;
  $scope.selectionStack = [];
  $scope.runningMode = false;
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
    $scope.operationStack = [];
    $scope.it = null;
    $scope.selectionStack = [];
    $scope.runningMode = false;

    // set lexemeIndex
    $scope.lexemeIndex = 0;

    // split by lines
    var code = ace.edit("editor").getValue();
    var lines = [];

    // split by soft breaks
    var segments = code.split(',');
    segments.forEach(function(segment){
      lines = lines.concat(segment.split('\n'));
    });

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
      if(regex.HAI.test(lines[i])){
        addLexeme('HAI', 'green-text', 'Code Delimeter');
      }
      else if(regex.KTHXBYE.test(lines[i])){
        addLexeme('KTHXBYE', 'green-text', 'Code Delimeter');
      }
      else if(regex.IHASA.test(lines[i])){
        addLexeme('I HAS A', 'green-text', 'Variable Declaration');

        // remove whitespaces
        identifier = lines[i].substr(8).trim();

        // check if it has ITZ
        if(regex.ITZ.test(identifier)){
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
      else if(regex.GIMMEH.test(lines[i])){

        addLexeme('GIMMEH', 'green-text', 'Input Identifier');

        // get string to concat
        identifier = lines[i].substr(7).trim();

        // add identifier
        addLexeme(identifier, 'white-text', 'Variable Identifier');
      }
      else if(regex.R.test(lines[i])){

        identifier = lines[i].split(' R ');

        //variable
        addLexeme(identifier[0], 'white-text', 'Variable Identifier');

        addLexeme('R', 'green-text', 'Assignment Statement');

        //value
        addLexemeLiteral(identifier[1], checkLiteral(identifier[1]));
      }
      // comment
      else if(regex.OBTW.test(lines[i])){
        // set ignore to true
        ignore = true;

        // add lexeme
        addLexeme('OBTW', 'grey-text', 'Comment Delimiter');
      }
      else if(regex.BTW.test(lines[i])){
        // add lexeme
        addLexeme('BTW', 'grey-text', 'Comment Delimiter');
      }
      // operations
      else if(regex.expression.test(lines[i])){
        addLexemeLiteral(lines[i], 'expression');
      }
      else if(regex.ORLY.test(lines[i])){
        addLexeme('O RLY?', 'white-text', 'If-then Statement');
      }
      else if(regex.YARLY.test(lines[i])){
        addLexeme('YA RLY', 'green-text', 'If Clause');
      }
      else if(regex.NOWAI.test(lines[i])){
        addLexeme('NO WAI', 'green-text', 'Else Clause');
      }
      else if(regex.OIC.test(lines[i])){
        addLexeme('OIC', 'green-text', 'Selection Statement Delimeter');
      }
      else if(regex.WTF.test(lines[i])){
        addLexeme('WTF?', 'green-text', 'Switch-case Statement');
      }
      else if(regex.OMGWTF.test(lines[i])){
        addLexeme('OMGWTF', 'green-text', 'Switch-case Default');
      }
      else if(regex.OMG.test(lines[i])){
        addLexeme('OMG', 'green-text', 'Case Statement');

        // get literal
        var literal = lines[i].substring(4).trim();

        addLexemeLiteral(literal, checkLiteral(literal));
      }
      else if(regex.GTFO.test(lines[i])){
        addLexeme('GTFO', 'green-text', 'Break Statement');
      }
      else if(regex.OMGWTF.test(lines[i])){
        addLexeme('OMGWTF', 'green-text', 'Default Statement');
      }
      else if(regex.TLDR.test(lines[i])){}
      else if(regex.literal.test(lines[i])){
        addLexemeLiteral(lines[i], checkLiteral(lines[i]));
      }
      else if(lines[i] == ''){}
      else{
        addLexeme(lines[i], 'red-text', 'Unknown Keyword');
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
        printToConsole('SYNTAX ERROR: Expected delimiter: HAI on line 1');
        return;
      } //checking if the last delimiter is KTHXBYE
      else if(!(/^\s*KTHXBYE\s*$/.test($scope.lexemes[($scope.lexemes.length)-1].lexeme.text))){
        printToConsole('SYNTAX ERROR: Expected delimiter: KTHXBYE on last line');
        return;
      }

      //loop for all variables
      for(var i=1; i<($scope.lexemes.length)-1; i++){
        var identifier;

        if($scope.lexemes[i].lexeme.text == "I HAS A"){
          identifier = $scope.lexemes[++i].lexeme.text;
          if(!(regex.variable.test(identifier))){
            printToConsole('SYNTAX ERROR: Invalid variable next to "I HAS A" expression');
            return;
          }
          if(regex.reserved.test(identifier)){
            printToConsole('SYNTAX ERROR: Reserved word or keyword used as variable identifier ');
            return;
          }
        }

        else if($scope.lexemes[i].lexeme.text == "GIMMEH"){
          identifier = $scope.lexemes[++i].lexeme.text;
          if(!(regex.variable.test(identifier))){
            printToConsole('SYNTAX ERROR: Invalid variable next to "GIMMEH" expression');
            return;
          }
          if(regex.reserved.test(identifier)){
            printToConsole('SYNTAX ERROR: Reserved word or keyword used as variable identifier ');
            return;
          }
        }
        else if($scope.lexemes[i].lexeme.text == "ITZ"){
          identifier = $scope.lexemes[++i].lexeme.text;
          var type = checkLiteral(identifier);

          if(type == "invalid"){
            printToConsole('SYNTAX ERROR: Invalid type next to "ITZ" expression');
            return;
          }
        }
        else if($scope.lexemes[i].lexeme.text == "R"){
          identifier = $scope.lexemes[++i].lexeme.text;
          var type = checkLiteral(identifier);

          if(type == "invalid"){
            printToConsole('SYNTAX ERROR: Invalid type next to "R" expression');
            return;
          }

        }

        else if($scope.lexemes[i].lexeme.text == "AN"){
          identifier =  $scope.lexemes[++i].lexeme.text;
          if(identifier == "AN"){
            printToConsole('SYNTAX ERROR: Cannot use AN after AN expression');
          }
        }

        else if($scope.lexemes[i].lexeme.text == "O RLY?"){
          identifier =  $scope.lexemes[++i].lexeme.text;
          if(identifier != "YA RLY"){
            printToConsole('SYNTAX ERROR: Expected expression after "O RLY?"');
          }
        }

        else if($scope.lexemes[i].lexeme.text == "VISIBLE"){
          identifier = $scope.lexemes[++i].lexeme.text;
          if(regex.reserved.test(identifier)){
            printToConsole('SYNTAX ERROR: Reserved word or keyword used as variable identifier ');
            return;
          }
        }


        else if($scope.lexemes[i].lexeme.text == "OMGWTF"){
            // checks if value is string, number, numbar
        }

        else if($scope.lexemes[i].lexeme.text == "GTFO"){
            // checks if value is string, number, numbar
        }

        else if($scope.lexemes[i].lexeme.text == "BTW"){
            // ignores the entire line of comments
        }

        else if($scope.lexemes[i].lexeme.text == "OBTW"){
          identifier = $scope.lexemes[++i].lexeme.text;

          if(identifier != "TLDR"){
            printToConsole('SYNTAX ERROR: No closing in "OBTW" expression');
            return;
          }
        }
        else if($scope.lexemes[i].desc == "Unknown Keyword"){
            // checks if value is string, number, numbar
            printToConsole('SYNTAX ERROR: Unknown keyword');
            return;
        }
        else if($scope.lexemes[i].desc == "Invalid Keyword"){
            // checks if value is string, number, numbar
            printToConsole('SYNTAX ERROR: Invalid keyword');
            return;
        }
      }

      $scope.run(0);
  };

  $scope.run = function(i){
    // start running the program
    for($scope.lexemeIndex = i; $scope.lexemeIndex < $scope.lexemes.length; $scope.lexemeIndex++){
      var value;
      var identifier;
      var symbol;
      var typeText;

      if(currentLexeme() == "I HAS A"){
        identifier = $scope.lexemes[++$scope.lexemeIndex].lexeme.text;

        addSymbol(identifier, 'NOOB', 'yellow-text', 'NOOB', 'yellow-text');
      }
      else if(currentLexeme() == 'HAI'){}
      else if(currentLexeme() == 'KTHXBYE'){}
      else if(currentLexeme() == "GIMMEH"){
        identifier = $scope.lexemes[++$scope.lexemeIndex].lexeme.text;
        var type = checkLiteral(identifier);

        if(type == "variable"){
          symbol = $scope.symbolTable[$scope.symbolTable.indexOfAttr('identifier', identifier)];

          if(!symbol){
            printToConsole("SYNTAX ERROR: Variable does not exist.");
            return;
          }
          else{
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
        else{
          printToConsole('SYNTAX ERROR: Invalid variable!')
        }
      }
      else if(currentLexeme() == 'ITZ'){
        // get identifier and value
        identifier = $scope.lexemes[($scope.lexemeIndex - 1)].lexeme.text;
        value = $scope.lexemes[++$scope.lexemeIndex].lexeme.text;

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

          value = '"' + $scope.lexemes[++$scope.lexemeIndex].lexeme.text + '"';
          $scope.lexemeIndex++;
        }
        else if(regex.expressionToken.test(value)){
          value = evaluateExpression();
          typeText = checkLiteral(value);

          switch(typeText){
            case 'NOOB':
              valueColor = 'yellow-text';
              break;
            case 'TROOF':
              valueColor = 'red-text';
              break;
            case 'NUMBR':
            case 'NUMBAR':
              valueColor = 'white-text';
              break;
            case 'YARN':
              valueColor = 'blue-text';
              break;
          }
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
      else if(currentLexeme() == 'VISIBLE'){
        $scope.lexemeIndex++;

        var ret = '';

        // concatenate
        while(true){
          if(currentLexeme() == '"'){
            ret += nextLexeme();
            $scope.lexemeIndex += 2;
          }
          else if(regex.expressionToken.test(currentLexeme())){
            ret += evaluateExpression();
          }
          else if(regex.literal.test(currentLexeme())){
            ret += parseLiteral(currentLexeme(), 'lol');
          }

          if(nextLexeme() != 'AN'){
            break;
          }
          else{
            $scope.lexemeIndex++;
          }

          $scope.lexemeIndex++;
        }

        printToConsole(ret);
        // edit symbol
        editSymbol(identifier, typeText, 'yellow-text', value, valueColor);
      }
      else if(regex.expressionToken.test(currentLexeme())){
        var it = {
          type: {
            text: null,
            color: 'yellow-text'
          },
          value: {
            text: parseLiteral(evaluateExpression(), 'lol', 'stringify'),
            color: null
          }
        };

        // get type
        it.type.text = checkLiteral(it.value.text);

        // get color

        switch(it.type.text){
          case 'NOOB':
            it.value.color = 'yellow-text';
            break;
          case 'TROOF':
            it.value.color = 'red-text';
            break;
          case 'NUMBR':
          case 'NUMBAR':
            it.value.color = 'white-text';
            break;
          case 'YARN':
            it.value.color = 'blue-text';
            break;
        }

        $scope.it = it;
      }
      else if(regex.ORLY.test(currentLexeme())){
        $scope.selectionStack.push($scope.it.value.text);
      }
      else if(regex.YARLY.test(currentLexeme())){
        if($scope.selectionStack[$scope.selectionStack.length - 1] == 'FAIL'){
          skipToNext();
        }
      }
      else if(regex.NOWAI.test(currentLexeme())){
        if($scope.selectionStack[$scope.selectionStack.length - 1] == 'WIN'){
          skipToNext();
        }
      }
      else if(regex.WTF.test(currentLexeme())){
        $scope.selectionStack.push({
          it: $scope.it.value.text,
          hasExecuted: false
        });
      }
      else if(regex.OMGWTF.test(currentLexeme())){}
      else if(regex.OMG.test(currentLexeme())){
        // if next literal == it, set running mode to true and lexemeIndex++ parseLiteral($scope.it.value.text, null, 'stringify')));
        if(parseLiteral(nextLexeme()) == parseLiteral($scope.it.value.text, null, 'stringify')){
          if(nextLexeme() == '"'){
            $scope.lexemeIndex += 3;
          }
          else{
            $scope.lexemeIndex++;
          }
          $scope.runningMode = true;

          // alert('yey');
        }
        else if($scope.runningMode){
          $scope.lexemeIndex++;
        }
        // else skip
        else{
          skipToNext();
        }
      }
      else if(regex.GTFO.test(currentLexeme())){
        skipToNext();
      }
      else if(regex.OIC.test(currentLexeme())){
        $scope.runningMode = false;
        $scope.selectionStack.pop();
      }
      else if(regex.literal.test(currentLexeme())){
        // ensure first that this is not an assignemnt Statement
        if(nextLexeme() == 'R') continue;

        var text;

        if(currentLexeme() == '"'){
          text = '"' + nextLexeme() + '"';
          $scope.lexemeIndex += 2;
        }
        else{
          text = parseLiteral(currentLexeme(), 'lol', 'stringify');
        }

        var it = {
          type: {
            text: null,
            color: 'yellow-text'
          },
          value: {
            text: text,
            color: null
          }
        };

        // get type
        it.type.text = checkLiteral(it.value.text);

        // get color

        switch(it.type.text){
          case 'NOOB':
            it.value.color = 'yellow-text';
            break;
          case 'TROOF':
            it.value.color = 'red-text';
            break;
          case 'NUMBR':
          case 'NUMBAR':
            it.value.color = 'white-text';
            break;
          case 'YARN':
            it.value.color = 'blue-text';
            break;
        }

        $scope.it = it;
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
    if(value == 'AN'){
      return 'operandSeparator'
    }
    else if(value == 'MKAY'){
      return 'infiniteArityDelimeter'
    }
    else if(regex.NOOB.test(value)){
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
    else if(regex.expression.test(value)){
      return 'expression';
    }
    else if(regex.expressionToken.test(value)){
      return 'expressionToken';
    }
    else if(regex.variable.test(value)){
      // variable
      return 'variable';
    }
    else return 'invalid';
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
      case 'operandSeparator':
        addLexeme('AN', 'green-text', 'Operand Separator');
        break;
      case 'infiniteArityDelimeter':
        addLexeme('MKAY', 'purple-text', 'Infinite Arity Delimeter');
        break;
      case 'expressionToken':
        // 'expressionToken': /^(SUM OF|DIFF OF|PRODUKT OF|QUOSHUNT OF|MOD OF|BIGGR OF|SMALLR OF|BOTH OF|EITHER OF|WON OF|NOT|ALL OF|ANY OF|BOTH SAEM OF|DIFFRINT OF|SMOOSH)$/,
        var operator;
        var operation;

        if(value == 'SUM OF'){
          operation = 'SUM OF';
          operator = 'Sum Operator';
        }
        else if(value == 'DIFF OF'){
          operation = 'DIFF OF';
          operator = 'Subtraction Operator';
        }
        else if(value == 'PRODUKT OF'){
          operation = 'PRODUKT OF';
          operator = 'Multiplication Operator';
        }
        else if(value == 'QUOSHUNT OF'){
          operation = 'QUOSHUNT OF';
          operator = 'Division Operator';
        }
        else if(value == 'MOD OF'){
          operation = 'MOD OF';
          operator = 'Modulus Operator';
        }
        else if(value == 'SMOOSH'){
          operation = 'SMOOSH';
          operator = 'Concatenation Operator';
        }
        else if(value == 'BIGGR OF'){
          operation = 'BIGGR OF';
          operator = 'Max Operator';
        }
        else if(value == 'SMALLR OF'){
          operation = 'SMALLR OF';
          operator = 'Min Operator';
        }
        else if(value == 'BOTH OF'){
          operation = 'BOTH OF';
          operator = 'And Operator';
        }
        else if(value == 'EITHER OF'){
          operation = 'EITHER OF';
          operator = 'Or Operator';
        }
        else if(value == 'WON OF'){
          operation = 'WON OF';
          operator = 'Xor Operator';
        }
        else if(value == 'BOTH SAEM'){
          operation = 'BOTH SAEM';
          operator = 'Equality Operator';
        }
        else if(value == 'DIFFRINT'){
          operation = 'DIFFRINT';
          operator = 'Inequality Operator';
        }

        addLexeme(operation, 'green-text', operator);
        break;

      case 'invalid':
        value = value.substring(1, value.length - 1);
        addLexeme(value, 'red-text', 'Invalid Keyword');
        break;
      case 'expression':
        var operator;
        var operation;

        // unary
        if(regex.unary.test(value)){
          if(regex.NOT.test(value)){
            operation = 'NOT';
            operator = 'Negation Operator';
          }

          addLexeme(operation, 'green-text', operator);

          var value = value.substr(operation.length + 1).trim();
          var type = checkLiteral(value);

          addLexemeLiteral(value, type);
        }
        // binary
        else if(regex.binary.test(value)){
          if(regex.SUMOF.test(value)){
            operation = 'SUM OF';
            operator = 'Sum Operator';
          }
          else if(regex.DIFFOF.test(value)){
            operation = 'DIFF OF';
            operator = 'Subtraction Operator';
          }
          else if(regex.PRODUKTOF.test(value)){
            operation = 'PRODUKT OF';
            operator = 'Multiplication Operator';
          }
          else if(regex.QUOSHUNTOF.test(value)){
            operation = 'QUOSHUNT OF';
            operator = 'Division Operator';
          }
          else if(regex.MODOF.test(value)){
            operation = 'MOD OF';
            operator = 'Modulus Operator';
          }
          else if(regex.SMOOSH.test(value)){
            operation = 'SMOOSH';
            operator = 'Concatenation Operator';
          }
          else if(regex.BIGGROF.test(value)){
            operation = 'BIGGR OF';
            operator = 'Max Operator';
          }
          else if(regex.SMALLROF.test(value)){
            operation = 'SMALLR OF';
            operator = 'Min Operator';
          }
          else if(regex.BOTHOF.test(value)){
            operation = 'BOTH OF';
            operator = 'And Operator';
          }
          else if(regex.EITHEROF.test(value)){
            operation = 'EITHER OF';
            operator = 'Or Operator';
          }
          else if(regex.WONOF.test(value)){
            operation = 'WON OF';
            operator = 'Xor Operator';
          }
          else if(regex.BOTHSAEM.test(value)){
            operation = 'BOTH SAEM';
            operator = 'Equality Operator';
          }
          else if(regex.DIFFRINT.test(value)){
            operation = 'DIFFRINT';
            operator = 'Inequality Operator';
          }

          addLexeme(operation, 'green-text', operator);

          // remove whitespaces
          operators = splitAN(value.substr(operation.length + 1).trim());

          operator1 = {
            value: operators[0].trim(),
            type: checkLiteral(operators[0].trim())
          };

          operator2 = {
            value: operators[1].trim(),
            type: checkLiteral(operators[1].trim())
          };

          // add lexemes
          var value1 = operator1.value;
          var type1 = operator1.type;
          var value2 = operator2.value;
          var type2 = operator2.type;

          addLexemeLiteral(value1, type1);
          addLexeme('AN', 'green-text', 'Operand Separator');
          addLexemeLiteral(value2, type2);
        }
        // infinity
        else if(regex.infinity.test(value)){
          if(regex.ALLOF.test(value)){
            operation = 'ALL OF';
            operator = 'Infinite Arity And';
          }
          else if(regex.ANYOF.test(value)){
            operation = 'ANY OF';
            operator = 'Infinite Arity Or';
          }
          else if(regex.SMOOSH.test(value)){
            operation = 'SMOOSH';
            operator = 'String Concatenation';
          }
          else if(regex.VISIBLE.test(value)){
            operation = 'VISIBLE';
            operator = 'Output Keyword';
          }

          addLexeme(operation, 'green-text', operator);

          var operands = splitANInfinite(value.substr(operation.length + 1).trim());

          operands.forEach(function(operand){
            var type = checkLiteral(operand);

            addLexemeLiteral(operand, type);
          });
        }
    }
  }

  function splitANInfinite(string){
    var s = string;

    var a = s.splitANArguments();

    // consider spaces
    for(var i = 0; i < a.length; i++){
      if(a[i] == '"' && a[i + 1] == '"'){
        a[i] = '" "';
        a.splice(i + 1, 1);
      }
    }

    for(var i = 0; i < a.length; i++){
      if(a[i] == 'SUM' || a[i] == 'DIFF' || a[i] == 'PRODUKT' || a[i] == 'QUOSHUNT' || a[i] == 'MOD' || a[i] == 'BIGGR' || a[i] == 'SMALLR' || a[i] == 'BOTH' || a[i] == 'EITHER' || a[i] == 'WON' || a[i] == 'DIFFRINT'){
        a[i] = a[i] + ' ' +a[i + 1];
        a.splice(i + 1, 1);
      }
    }

    return a;
  }

  function splitAN(string){
    var s = string;

    var a = s.splitANArguments();

    for(var i = 0; i < a.length; i++){
      if(a[i] == 'SUM' || a[i] == 'DIFF' || a[i] == 'PRODUKT' || a[i] == 'QUOSHUNT' || a[i] == 'MOD' || a[i] == 'BIGGR' || a[i] == 'SMALLR' || a[i] == 'BOTH' || a[i] == 'EITHER' || a[i] == 'WON' || a[i] == 'DIFFRINT'){
        a[i] = a[i] + ' ' +a[i + 1];
        a.splice(i + 1, 1);
      }
    }

    var stack = [];

    i = 0;
    var c = 0;

    for(i = 0; i < a.length; i++){
      if(a[i] == 'SUM OF' || a[i] == 'DIFF OF' || a[i] == 'PRODUKT OF' || a[i] == 'QUOSHUNT OF' || a[i] == 'MOD OF' || a[i] == 'BIGGR OF' || a[i] == 'SMALLR OF' || a[i] == 'BOTH OF' || a[i] == 'EITHER OF' || a[i] == 'WON OF' || a[i] == 'BOTH SAEM' || a[i] == 'DIFFRINT'){
        stack.push(a[i]);
      }
      else if(a[i] == 'AN'){
        if(stack.length == 0) break;

        stack.pop();
        c++;
      }
    }

    var o = 0;

    for(i = 0; i < s.length; i++){
      if('AN' == s.charAt(i) + s.charAt(i + 1)){
        o++;
        if(o == c + 1) break;
      }
    }

    return [string.substring(0, i), string.substring(i + 3)]
  }

  // @TODO: YARN not working
  function evaluateExpression(){
    if(regex.unary.test(currentLexeme())){
      if(currentLexeme() == 'NOT'){
        do{
          if($scope.operationStack.length > 0 &&
             !regex.expressionToken.test($scope.operationStack[$scope.operationStack.length - 1])){
            var operand = $scope.operationStack.pop();
            var operator = $scope.operationStack.pop();

            operand = parseLiteral(operand);

            var operatedFlag = false;

            operatedFlag = evaluateOperation(operator, operand);

            if($scope.operationStack.length == 1){
              var ret = $scope.operationStack[0];
              $scope.operationStack = [];
              $scope.lexemeIndex--;
              return ret;
            }

            if(operatedFlag){
              continue;
            }
          }

          if(currentLexeme() != 'AN'){
            $scope.operationStack.push(currentLexeme());
          }
          $scope.lexemeIndex++;
        } while($scope.operationStack.length > 0)
      }
    }
    else if(regex.binary.test(currentLexeme())){
      do{
        if($scope.operationStack[$scope.operationStack.length - 1] &&
           $scope.operationStack[$scope.operationStack.length - 2] &&
           !regex.expressionToken.test($scope.operationStack[$scope.operationStack.length - 1]) &&
           !regex.expressionToken.test($scope.operationStack[$scope.operationStack.length - 2])){

          var rightOperand = $scope.operationStack.pop();
          var leftOperand = $scope.operationStack.pop();
          var operator = $scope.operationStack.pop();

          // convert operands
          rightOperand = parseLiteral(rightOperand);
          leftOperand = parseLiteral(leftOperand);

          var operatedFlag = false;
          operatedFlag = evaluateOperation(operator, leftOperand, rightOperand);

          if($scope.operationStack.length == 1){
            var ret = $scope.operationStack[0];
            $scope.operationStack = [];
            $scope.lexemeIndex--;
            return ret;
          }

          if(operatedFlag){
            continue;
          }
        }

        if(currentLexeme() == '"'){
          $scope.operationStack.push('"' + nextLexeme() + '"');
          $scope.lexemeIndex += 2;
        }
        else if(currentLexeme() != 'AN'){
          $scope.operationStack.push(currentLexeme());
        }
        $scope.lexemeIndex++;
      } while($scope.operationStack.length > 0)
    }
    else if(currentLexeme() == 'SMOOSH'){
      $scope.lexemeIndex++;

      var ret = '';

      // concatenate
      while(true){
        if(currentLexeme() == '"'){
          ret += nextLexeme();
          $scope.lexemeIndex += 2;
        }
        else if(regex.expressionToken.test(currentLexeme())){
          ret += evaluateExpression();
        }
        else if(regex.literal.test(currentLexeme())){
          ret += parseLiteral(currentLexeme(), 'lol');
        }

        if(nextLexeme() != 'AN'){
          break;
        }
        else{
          $scope.lexemeIndex++;
        }

        $scope.lexemeIndex++;
      }

      return '"' + ret + '"';
    }
    else if(regex.infinity.test(currentLexeme())){
      // check what kind of operator
      var operator;
      if(currentLexeme() == 'ALL OF') operator = 'ALL OF';
      else if(currentLexeme() == 'ANY OF') operator = 'ANY OF';

      // push values
      var infiniteStack = [];

      $scope.lexemeIndex++;
      while(currentLexeme() != 'MKAY'){
        if(currentLexeme() != 'AN'){
          if(regex.expressionToken.test(currentLexeme())){
            infiniteStack.push(evaluateExpression());
          }
          else{
            infiniteStack.push(currentLexeme());
          }
        }
        $scope.lexemeIndex++;
      }

      // evaluate the whole stack with the operator]
      var ret;
      if(operator == 'ALL OF'){
        if(infiniteStack.indexOf('FAIL') == -1) ret = 'WIN';
        else ret = 'FAIL';
      }
      else if(operator == 'ANY OF'){
        if(infiniteStack.indexOf('WIN') == -1) ret = 'FAIL';
        else ret = 'WIN';
      }

      // return
      return ret;
    }
  }

  function evaluateOperation(operator, firstOperand, secondOperand){
    //runtime syntax checking
    if(regex.arithmeticExpression.test(operator)){
      if(!( regex.NUMBR.test(firstOperand) || regex.NUMBAR.test(firstOperand) || regex.YARN.test(firstOperand) )){
        printToConsole('SYNTAX ERROR: Invalid first operand');
        return false;
      }

      if(!( regex.NUMBR.test(secondOperand) || regex.NUMBAR.test(secondOperand) || regex.YARN.test(secondOperand) )){
        printToConsole('SYNTAX ERROR: Invalid second operand');
        return false;
      }
    }

    if(regex.booleanExpression.test(operator)){
      if(!( firstOperand === true || firstOperand === false)){
        printToConsole('SYNTAX ERROR: Invalid first operand');
        return false;
      }
      if(!( secondOperand === true || secondOperand === false)){
        printToConsole('SYNTAX ERROR: Invalid second operand');
        return false;
      }
    }


    switch(operator){
      case 'NOT':
        $scope.operationStack.push((firstOperand? 'FAIL': 'WIN') + '');
        return true;
      case 'SUM OF':
        $scope.operationStack.push((parseFloat(firstOperand) + parseFloat(secondOperand)) + '');
        return true;
      case 'DIFF OF':
        $scope.operationStack.push((parseFloat(firstOperand) - parseFloat(secondOperand)) + '');
        return true;
      case 'PRODUKT OF':
        $scope.operationStack.push((parseFloat(firstOperand) * parseFloat(secondOperand)) + '');
        return true;
      case 'QUOSHUNT OF':
        $scope.operationStack.push((parseFloat(firstOperand) / parseFloat(secondOperand)) + '');
        return true;
      case 'MOD OF':
        $scope.operationStack.push((parseFloat(firstOperand) % parseFloat(secondOperand)) + '');
        return true;
      case 'BIGGR OF':
        $scope.operationStack.push((parseFloat(firstOperand) >= parseFloat(secondOperand)? parseFloat(firstOperand): parseFloat(secondOperand)) + '');
        return true;
      case 'SMALLR OF':
        $scope.operationStack.push((parseFloat(firstOperand) <= parseFloat(secondOperand)? parseFloat(firstOperand): parseFloat(secondOperand)) + '');
        return true;
      case 'BOTH OF':
        $scope.operationStack.push((firstOperand && secondOperand? 'WIN': 'FAIL') + '');
        return true;
      case 'EITHER OF':
        $scope.operationStack.push((firstOperand || secondOperand? 'WIN': 'FAIL') + '');
        return true;
      case 'WON OF':
        $scope.operationStack.push(((firstOperand? !secondOperand: secondOperand)? 'WIN': 'FAIL') + '');
        return true;
      case 'BOTH SAEM':
        $scope.operationStack.push((firstOperand == secondOperand? 'WIN': 'FAIL') + '');
        return true;
      case 'DIFFRINT':
        $scope.operationStack.push((firstOperand != secondOperand? 'WIN': 'FAIL') + '');
        return true;
      default:
        return false;
    }
  }

  function currentLexeme(){
    return $scope.lexemes[$scope.lexemeIndex].lexeme.text;
  }

  function nextLexeme(){
    return $scope.lexemes[$scope.lexemeIndex + 1].lexeme.text;
  }

  function skipToNext(){
    var stack = [];

    if(currentLexeme() == 'YA RLY'){
      do{
        if(currentLexeme() == 'YA RLY'){
          stack.push(true);
        }
        else if(currentLexeme() == 'NO WAI'){
          stack.pop();
        }

        $scope.lexemeIndex++;
      } while(stack.length > 0)
    }
    else if(currentLexeme() == 'NO WAI'){
      do{
        if(currentLexeme() == 'NO WAI'){
          stack.push(true);
        }
        else if(currentLexeme() == 'OIC'){
          stack.pop();
        }

        $scope.lexemeIndex++;
      } while(stack.length > 0)
    }
    else if(currentLexeme() == 'OMG'){
      do{
        $scope.lexemeIndex++;
      } while(currentLexeme() != 'OMG' && currentLexeme() != 'OIC' && currentLexeme() != 'OMGWTF');
    }
    else if(currentLexeme() == 'GTFO'){
      do{
        $scope.lexemeIndex++;
      } while(currentLexeme() != 'OIC');
    }
    // omg wtf possible bug

    $scope.lexemeIndex--;
  }

  function parseLiteral(x, option1, option2){
    if(regex.NUMBR.test(x)){
      return parseInt(x);
    }
    else if(regex.NUMBAR.test(x)){
      return parseFloat(x);
    }
    else if(regex.TROOF.test(x)){
      if(option1 == 'lol'){
        return x == 'WIN'? 'WIN': 'FAIL';
      }
      else{
        return x == 'WIN'? true: false;
      }
    }
    else if(x == '"'){
      return '"' + $scope.lexemes[$scope.lexemeIndex + 2].lexeme.text + '"';
    }
    else if(regex.YARN.test(x)){
      if(option2 == 'stringify') return x;
      return x.substring(1, x.length - 1);
    }
    else if(regex.variable.test(x)){
      x = $scope.symbolTable[$scope.symbolTable.indexOfAttr('identifier', x)].value.text;
      return parseLiteral(x, option1, option2);
    }
  }
});
