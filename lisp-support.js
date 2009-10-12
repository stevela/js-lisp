// Support functions for the html harness.

// Parse a program.
var lispProgram = new Array();

function parseLisp(toParse, errorString) {
  var errorOffsets = new Array();
  var errorLookaheads = new Array();
  var errorCount = 0;

  lispProgram = new Array();
  if ((errorCount = __parse(toParse, errorOffsets, errorLookaheads)) > 0) {
    for (var i = 0; i < errorCount; ++i) {
      errorString.value = errorString.value +
          'Parse error near "' + toParse.substr(errorOffsets[i])
          + '", expecting "' + errorLookaheads[i].join(', ') + '"\n';
    }

    return null;
  } else {
    lispProgram.splice(0, 0, new SymbolNode('progn'));
    return new ListNode(lispProgram);
  }
}

function evaluateInput(inputArea, evalArea, parseArea) {
  var errorString = new Object();
  errorString.value = new String();
  var program = parseLisp(inputArea.value, errorString);
  evalArea.value = '';
  parseArea.value = '';
  if (program != null) {
    parseArea.value = program;

    var env = new environment();
    var fenv = new environment();

    // Load the library.
    loadLibrary(env, fenv, errorString);
    if (errorString.value.length) {
      evalArea.value = errorString.value;
      return;
    }

    // Run the input.
    var result = program.eval(env, fenv, errorString);
    if (errorString.value.length) {
      evalArea.value = errorString.value;
      return;
    }

    evalArea.value = result;
  } else {
    parseArea.value = errorString.value;
  }
}

