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

// Functions
function LispFunction(arity, minArgs, argsIsList, eval) {
  this.arity = arity;
  this.minArgs = minArgs;

  // argsIsList is an array with one element per minArgs.
  // Valid values for element are 'symbol', 'atom', 'list', null.
  this.argsIsList = argsIsList;

  this.eval = eval;
}

LispFunction.prototype.eval = function(list, env, fenv, errorString) {
  var func = list[0][0];
  if ((this.arity != null) && (this.arity != list.length - 1)) {
      errorString.value += '"' + func + '" expects '
          + this.arity + ' arguments.';
      return null;
  } else if ((this.minArgs != null) && (this.minArgs > list.length - 1)) {
      errorString.value += '"' + func + '" expects at least '
          + this.arity + ' arguments.';
      return null;
  }

  if (this.argsIsList != null) {
    for (var i = 0; (i < this.argsIsList.lenth) && (i < list.length - 1); ++i) {
      var type = list.argsIsList[i];
      if (type != null) {
        if ((type == 'symbol') && !list[i + 1].symbolP) {
          errorString.value += '"' + func + '" expects arg ' + i
              + ' to be a symbol.';
          return null;
        } else if ((type == 'atom') && !list[i + 1].atomP) {
          errorString.value += '"' + func + '" expects arg ' + i
              + ' to be an atom.';
          return null;
        } else if ((type == 'list') && list[i + 1].atomP) {
          errorString.value += '"' + func + '" expects arg ' + i
              + ' to be an atom.';
          return null;
        }
      }
    }
  }

  if (this.eval) {
    return this.eval(list, env, fenv, errorString);
  }
}

LispFunction.prototype.evalAllArgs = function(list, env, fenv, errorString) {
  // Everything else has all it's arguments evaluated.
  var evaledArgs = new Array();
  for (var i = 1; i < list.length; ++i) {
    evaledArgs.push(list[i].eval(env, fenv, errorString));
    if (evaledArgs[i - 1] == null) return null;
  }

  return evaledArgs;
}

var builtInFunctions = new Array();
builtInFunctions['quote'] =
    new LispFunction(1, 1, null,
                     function(list, env, fenv, errorString) {
        return list[1];
      });

builtInFunctions['atom'] =
    new LispFunction(1, 1, null,
                     function(list, env, fenv, errorString) {
        return list[1].atomP;
      });

builtInFunctions['list'] =
    new LispFunction(null, null, null,
                     function(list, env, fenv, errorString) {
        var evaledArgs = this.evalAllArgs(list, env, fenv, errorString);
        if (evaledArgs == null) return null;

        if (evaledArgs.length == 0) {
          return new NilNode();
        } else {
          return new ListNode(evaledArgs);
        }
      });

builtInFunctions['eval'] =
    new LispFunction(1, 1, null,
                     function(list, env, fenv, errorString) {
        var arg = list[1].eval(env, fenv, errorString);
        if (arg == null) return null;
        return arg.eval(env, fenv, errorString);
      });

builtInFunctions['setq'] =
    new LispFunction(2, 2, new Array('symbol', null),
                     function(list, env, fenv, errorString) {
        value = list[2].eval(env, fenv, errorString);
        if (value == null) return null;

        env.store(list[1][0], value);
        return value;
      });

builtInFunctions['let'] =
    new LispFunction(1, 1, new Array('list'),
                     function(list, env, fenv, errorString) {
        if (list.length < 3) {
          return new NilNode();
        }

        var lets = list[1];
        if (lets.length) {
          var localEnv = new environment(env);
          for (var i = 0; i < lets.length; ++i) {
            var let = lets[i];
            if (let.atomP || let.length != 2) {
              errorString += '"let" expects two element lists in binding list.';
              return null;
            }
            var value = let[1].eval(env, fenv, errorString);
            if (value == null) return null;
            localEnv.store(let[0][0], value);
          }
          return list[2].eval(localEnv, fenv, errorString);
        } else {
          return list[2].eval(env, fenv, errorString);
        }
      });

builtInFunctions['cond'] =
    new LispFunction(null, null, null, function(list, env, fenv, errorString) {
        for (var i = 1; i < list.length; ++i) {
          if (list[i].atomP || list[i].length != 2) {
            errorString.value += 'Args to "cond" must be lists of length 2.'
            return null;
          }
          var truthiness = list[i][0].eval(env, fenv, errorString);
          if (truthiness == null) return null;
          if (!truthiness.nilP) {
            return list[i][1].eval(env, fenv, errorString);
          }
        }
        return new NilNode();
      });

builtInFunctions['car'] =
    new LispFunction(1, 1, null, function(list, env, fenv, errorString) {
        var evaledArgs = this.evalAllArgs(list, env, fenv, errorString);
        if (evaledArgs == null) return null;

        if (evaledArgs[0].nilP) {
          return new NilNode();
        }
        if (evaledArgs[0].atomP) {
          errorString.value += 'Argument to "car" is not a list.';
          return null;
        }
        return evaledArgs[0][0];
      });

builtInFunctions['cdr'] =
    new LispFunction(1, 1, null, function(list, env, fenv, errorString) {
        var evaledArgs = this.evalAllArgs(list, env, fenv, errorString);
        if (evaledArgs == null) return null;

        if (evaledArgs[0].nilP) {
          return new NilNode();
        }
        if (evaledArgs[0].atomP) {
          errorString.value += 'Argument to "cdr" is not a list.';
          return null;
        }
        if (evaledArgs[0].length < 2) {
          return new NilNode();
        }
        return new ListNode(evaledArgs[0].slice(1));
      });

builtInFunctions['cons'] =
    new LispFunction(2, 2, null, function(list, env, fenv, errorString) {
        var evaledArgs = this.evalAllArgs(list, env, fenv, errorString);
        if (evaledArgs == null) return null;

        var arg1 = evaledArgs[0];
        var arg2 = evaledArgs[1];
        var tmp = new Array();
        tmp.push(arg1);
        if (!arg2.nilP) {
          if (arg2.atomP || arg2.lambdaP) {
            tmp.push(arg2);
          } else {
            tmp = tmp.concat(arg2);
          }
        }
        return new ListNode(tmp);
      });

builtInFunctions['progn'] =
    new LispFunction(null, null, null, function(list, env, fenv, errorString) {
        var evaledArgs = this.evalAllArgs(list, env, fenv, errorString);
        if (evaledArgs == null) return null;

        if (evaledArgs.length == 0) {
          return new NilNode();
        }
        return evaledArgs.pop();
      });

builtInFunctions['eq'] =
    new LispFunction(null, 2, null, function(list, env, fenv, errorString) {
        var evaledArgs = this.evalAllArgs(list, env, fenv, errorString);
        if (evaledArgs == null) return null;

        var result1 = evaledArgs[0];
        for (var i = 1; i < evaledArgs.length; ++i) {
          var result2 = evaledArgs[i];

          if ((result1.numberP != result2.numberP) ||
              (result1.stringP != result2.stringP) ||
              (result1.nilP != result2.nilP) ||
              (result1.atomP != result2.atomP) ||
              (result1.lambdaP != result2.lambdaP)) {
            // Incompatible types.
            return new NilNode();
          }

          // Numeric and string equality.
          if (result1.numberP || result1.stringP) {
            if (result1[0] != result2[0]) {
              return new NilNode();
            } else {
              continue;
            }
          }

          // TODO(sjl): List equality.

          // Boolean equality.
          if (result1.nilP != result2.nilP) {
            return new NilNode();
          }
        }

        return new TrueNode();
      });

builtInFunctions['defun'] =
    new LispFunction(null, 3, null, function(list, env, fenv, errorString) {
        var name = list[1];
        if (!name.symbolP) {
          errorString += 'Function name passed to "defun" should be a symbol.';
          return null;
        }

        var args = list[2];
        if (args.atomP && !args.nilP) {
          errorString += 'Args to "defun" should be nil or a list.';
          return null;
        }
        var body = list.slice(3);
        body.splice(0, 0, new SymbolNode('progn'));
        var progn = new ListNode(body);
        var lambda = new ListNode(
            new Array(new SymbolNode('lambda'), args, progn));
        lambda.lambdaP = true;
        fenv.store(name[0], lambda);
        return name[0];
      });

function numericOpFunc(list, env, fenv, errorString) {
  var evaledArgs = this.evalAllArgs(list, env, fenv, errorString);
  if (evaledArgs == null) return null;

  var result = evaledArgs[0];
  if (!result.numberP) {
    errorString.value += result + ' is not a number.';
    return null;
  }

  result = result[0];

  for (var i = 1; i < evaledArgs.length; ++i) {
    var value = evaledArgs[i];
    if (!value.numberP) {
      errorString.value += value + ' is not a number.';
      return null;
    }

    if (list[0][0] == '+') result += value[0];
    else if (list[0][0] == '-') result -= value[0];
    else if (list[0][0] == '*') result *= value[0];
    else if (list[0][0] == '/') result /= value[0];
  }

  return new NumberNode(result);
}

builtInFunctions['+'] = new LispFunction(null, 1, null, numericOpFunc);
builtInFunctions['-'] = new LispFunction(null, 1, null, numericOpFunc);
builtInFunctions['*'] = new LispFunction(null, 1, null, numericOpFunc);
builtInFunctions['/'] = new LispFunction(null, 1, null, numericOpFunc);
