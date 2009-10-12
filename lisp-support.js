// Copyright 2009 Stephen John Lacey
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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

