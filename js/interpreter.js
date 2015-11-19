// @TODO:
// operation

// angular part
angular.module('app', []).controller('AppController', function($scope){
  $scope.lexemes = [];
  $scope.symbolTable = [];
  $scope.console = [];
  $scope.lexemeIndex = 0;
  $scope.state = "idle";
  $scope.identifier = null;
  $scope.operationStack = [];
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
      if(regex.HAI.test(lines[i])){
        addLexeme('HAI', 'green-text', 'Code Delimeter');
      }
      else if(regex.KTHXBYE.test(lines[i])){
        addLexeme('KTHXBYE', 'green-text', 'Code Delimeter');
      }
      else if(regex.VISIBLE.test(lines[i])){
        addLexeme('VISIBLE', 'green-text', 'Output Keyword');

        identifier = lines[i].substr(8).trim();

            //VISIBLE + SMOOSH
            if(regex.SMOOSH.test(identifier)){
                printToConsole("Perform: "+identifier);
                addLexeme('SMOOSH', 'green-text', 'String Concatenation');
                identifier = identifier.substring(6);
                identifier = identifier.split('AN');
                addLexemeLiteral(identifier[0].trim(), 'YARN');
                addLexeme('AN', 'green-text', 'Operand Separator');
                addLexemeLiteral(identifier[1].trim(), 'YARN');
            }
            else{
              type = checkLiteral(identifier);
              addLexemeLiteral(identifier, type);
            }

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
      else if(regex.BTW.test(lines[i])){
        // add lexeme
        addLexeme('BTW', 'grey-text', 'Comment Delimiter');
      }
      else if(regex.OBTW.test(lines[i])){
        // set ignore to true
        ignore = true;

        // add lexeme
        addLexeme('OBTW', 'grey-text', 'Comment Delimiter');
      }
      // operations
      else if(regex.expression.test(lines[i])){
        addLexemeLiteral(lines[i], 'expression');
      }
      else if(regex.WTF.test(lines[i])){
        addLexeme('WTF?', 'green-text', 'Start of Switch Case');
      }
      else if(regex.OIC.test(lines[i])){
        addLexeme('OIC', 'green-text', 'End of Switch Case/If-Then');
      }
      else if(regex.ORLY.test(lines[i])){
        addLexeme('O RLY?', 'green-text', 'Start of If-Then');
      }
      else if(regex.YARLY.test(lines[i])){
        addLexeme('YA RLY', 'green-text', 'If Clause');
      }
      else if(regex.NOWAI.test(lines[i])){
        addLexeme('NO WAI', 'green-text', 'Else Clause');
      }
      else if(regex.GTFO.test(lines[i])){
        addLexeme('GTFO', 'green-text', 'Break');
      }
      else if(regex.OMG.test(lines[i])){
        addLexeme('OMG', 'green-text','Case');
        var literal = lines[i].trim();
        literal = lines[i].substring(lines[i].indexOf('G') + 2, lines[i].length);
        addLexemeLiteral(literal, 'YARN');
      }
      else if(regex.OMGWTF.test(lines[i])){
        addLexeme('OMGWTF', 'green-text', 'Default Case');
      }
      else if(regex.TLDR.test(lines[i])){}
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
        $scope.console.push({text: '> SYNTAX ERROR: Expected delimiter: HAI on line 1'});
        return;
      } //checking if the last delimiter is KTHXBYE
      else if(!(/^\s*KTHXBYE\s*$/.test($scope.lexemes[($scope.lexemes.length)-1].lexeme.text))){
        $scope.console.push({text: '> SYNTAX ERROR: Expected delimiter: KTHXBYE on last line'});
        return;
      }

      //loop for all variables
      for(var i=1; i<($scope.lexemes.length)-1; i++){
        var identifier;

        if($scope.lexemes[i].lexeme.text == "I HAS A"){
          identifier = $scope.lexemes[++i].lexeme.text;
          if(!(regex.variable.test(identifier))){
            $scope.console.push({text: '> SYNTAX ERROR: Invalid variable next to "I HAS A" expression' });
            return;
          }
        }

        else if($scope.lexemes[i].lexeme.text == "GIMMEH"){
          identifier = $scope.lexemes[++i].lexeme.text;
          if(!(regex.variable.test(identifier))){
            $scope.console.push({text: '> SYNTAX ERROR: Invalid variable next to "GIMMEH expression"'});
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
            // checks if value is string, number, numbar
        }

        else if($scope.lexemes[i].lexeme.text == "YA RLY"){
            // checks if value is string, number, numbar
        }

        else if($scope.lexemes[i].lexeme.text == "NO WAI"){
            // checks if value is string, number, numbar
        }

        else if($scope.lexemes[i].lexeme.text == "OMG"){
            // checks if value is string, number, numbar
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
            // ignores lines before TLDR because used for multi line comments
        }

        else if($scope.lexemes[i].lexeme.text == "TLDR"){
            // closing for multi lines of code
        }
        else if($scope.lexemes[i].desc == "Unknown Keyword"){
            // checks if value is string, number, numbar
            printToConsole('SYNTAX ERROR: Unknown keyword');
            return;
        }
      }

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
      else if($scope.lexemes[i].lexeme.text == 'VISIBLE'){
        value = $scope.lexemes[++i].lexeme.text;
        $scope.lexemeIndex++;
        var type = checkLiteral(value);

        console.log(type);

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

            if(!symbol){
              printToConsole("SYNTAX ERROR: Variable does not exist.");
              return;
            }
            else{
              typeText = symbol.type.text;
              value = symbol.value.text;
            }

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
          case 'expressionToken':
            var expressionValue = evaluateExpression();
            var expressionType = checkLiteral(expressionValue);

            switch(expressionType){
              case 'TROOF':
                if(value == 'WIN') printToConsole('WIN');
                else printToConsole('FAIL');
                break;
              case 'NOOB':
              case 'NUMBR':
              case 'NUMBAR':
                printToConsole(expressionValue);
                break;
              case 'YARN':
                printToConsole(expressionValue.substr(1, value.length - 2));
                break;
            }

            break;
       }
      }
      else if($scope.lexemes[i].lexeme.text == 'R'){
        identifier = $scope.lexemes[i - 1].lexeme.text;
        value = $scope.lexemes[++i].lexeme.text;
        $scope.lexemeIndex++;

        var valueColor;

        //syntax checking
        var type = checkLiteral(identifier);

        if(type == "variable"){
          symbol = $scope.symbolTable[$scope.symbolTable.indexOfAttr('identifier', identifier)];
        }

        if(!symbol){
          printToConsole("SYNTAX ERROR: Variable does not exist.");
          return;
        }

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
    else if(regex.variable.test(value)){
      // variable
      return 'variable';
    }
    else if(regex.expression.test(value)){
      return 'expression';
    }
    else if(regex.expressionToken.test(value)){
      return 'expressionToken';
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
      case 'expression':
        var operator;
        var operation;
      default:
        value = value.substring(1, value.length - 1);
        addLexeme(value, 'red-text', 'Invalid keyword');
        break;

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
        else if(regex.NOT.test(value)){
          operation = 'NOT';
          operator = 'Negation Operator';
        }
        else if(regex.BOTHSAEMOF.test(value)){
          operation = 'BOTH SAEM OF';
          operator = 'Equality Operator';
        }
        else if(regex.DIFFRINTOF.test(value)){
          operation = 'DIFFRINT OF';
          operator = 'Inequality Operator';
        }


        // @TODO: other operations

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
        if(operator2.value != ''){
          addLexeme('AN', 'green-text', 'Operand Separator');
          addLexemeLiteral(value2, type2);
        }
    }
  }

  function splitAN(string){
    var s = string;

    var a = s.split(' ');

    for(var i = 0; i < s.length; i++){
      if(a[i] == 'SUM' || a[i] == 'DIFF' || a[i] == 'PRODUKT' || a[i] == 'QUOSHUNT' || a[i] == 'MOD' || a[i] == 'BIGGR' || a[i] == 'SMALLR' || a[i] == 'BOTH' || a[i] == 'EITHER' || a[i] == 'DIFFRINT' || a[i] == 'SMOOSH'){
        a[i] = a[i] + ' ' +a[i + 1];
        a.splice(i + 1, 1);
      }
    }

    var stack = [];

    i = 0;
    var c = 0;

    do{
      if(a[i] == 'SUM OF' || a[i] == 'DIFF OF' || a[i] == 'PRODUKT OF' || a[i] == 'QUOSHUNT OF' || a[i] == 'MOD OF' || a[i] == 'BIGGR OF' || a[i] == 'SMALLR OF' || a[i] == 'BOTH OF'  || a[i] == 'EITHER OF' || a[i] == 'BOTH SAEM OF' || a[i] == 'DIFFRINT OF' || a[i] == 'SMOOSH' ){
        stack.push(0);
      }
      else if(a[i] == 'AN'){
        stack.pop();
        c++;
      }
      i++;
    }while(stack.length)

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
    do{
      if(regex.literal.test($scope.operationStack[$scope.operationStack.length - 1]) &&
         regex.literal.test($scope.operationStack[$scope.operationStack.length - 2])){

        alert($scope.operationStack);

        var rightOperand = $scope.operationStack.pop();
        var leftOperand = $scope.operationStack.pop();
        var operator = $scope.operationStack.pop();

        // convert operands
        if(regex.NUMBR.test(rightOperand)){
          rightOperand = parseInt(rightOperand);
        }
        else if(regex.NUMBAR.test(rightOperand)){
          rightOperand = parseFloat(rightOperand);
        }
        else if(regex.TROOF.test(rightOperand)){
          rightOperand = rightOperand == 'WIN'? true: false;
        }
        else if(regex.variable.test(rightOperand)){
          rightOperand = $scope.symbolTable[$scope.symbolTable.indexOfAttr('identifier', rightOperand)].value.text;

          if(regex.NUMBR.test(rightOperand)){
            rightOperand = parseInt(rightOperand);
          }
          else if(regex.NUMBAR.test(rightOperand)){
            rightOperand = parseFloat(rightOperand);
          }
          else if(regex.TROOF.test(rightOperand)){
            rightOperand = rightOperand == 'WIN'? true: false;
          }
        }

        if(regex.NUMBR.test(leftOperand)){
          leftOperand = parseInt(leftOperand);
        }
        else if(regex.NUMBAR.test(leftOperand)){
          leftOperand = parseFloat(leftOperand);
        }
        else if(regex.TROOF.test(leftOperand)){
          leftOperand = leftOperand == 'WIN'? true: false;
        }
        else if(regex.variable.test(rightOperand)){
          leftOperand = $scope.symbolTable[$scope.symbolTable.indexOfAttr('identifier', leftOperand)].value.text;

          if(regex.NUMBR.test(rightOperand)){
            rightOperand = parseInt(rightOperand);
          }
          else if(regex.NUMBAR.test(rightOperand)){
            rightOperand = parseFloat(rightOperand);
          }
          else if(regex.TROOF.test(rightOperand)){
            rightOperand = rightOperand == 'WIN'? true: false;
          }
        }

        var operatedFlag = false;

        switch(operator){
          case 'SUM OF':
            $scope.operationStack.push((leftOperand + rightOperand) + '');
            operatedFlag = true;
            break;
          case 'DIFF OF':
            $scope.operationStack.push((leftOperand - rightOperand) + '');
            operatedFlag = true;
            break;
          case 'PRODUKT OF':
            $scope.operationStack.push((leftOperand * rightOperand) + '');
            operatedFlag = true;
            break;
          case 'QUOSHUNT OF':
            $scope.operationStack.push((leftOperand / rightOperand) + '');
            operatedFlag = true;
            break;
          case 'MOD OF':
            $scope.operationStack.push((leftOperand % rightOperand) + '');
            operatedFlag = true;
            break;
          case 'BIGGR OF':
            $scope.operationStack.push((leftOperand >= rightOperand? leftOperand: rightOperand) + '');
            operatedFlag = true;
            break;
          case 'SMALLR OF':
            $scope.operationStack.push((leftOperand <= rightOperand? leftOperand: rightOperand) + '');
            operatedFlag = true;
            break;
          case 'BOTH OF':
            $scope.operationStack.push((leftOperand && rightOperand? 'WIN': 'FAIL') + '');
            operatedFlag = true;
            break;
          case 'EITHER OF':
            $scope.operationStack.push((leftOperand || rightOperand? 'WIN': 'FAIL') + '');
            operatedFlag = true;
            break;
          case 'WON OF':
            $scope.operationStack.push(((leftOperand? !rightOperand: rightOperand)? 'WIN': 'FAIL') + '');
            operatedFlag = true;
            break;
        }

        if($scope.operationStack.length == 1){
          var ret = $scope.operationStack[0];
          $scope.operationStack = [];
          return ret;
        }

        if(operatedFlag){
          $scope.lexemeIndex++;
          continue;
        }
      }

      if(currentLexeme() != 'AN'){
        $scope.operationStack.push(currentLexeme());
      }
      $scope.lexemeIndex++;
    } while($scope.operationStack.length > 0)
  }

  function currentLexeme(){
    return $scope.lexemes[$scope.lexemeIndex].lexeme.text;
  }
});
