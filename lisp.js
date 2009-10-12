// Base class for all nodes.
function BaseNode() {
}

BaseNode.prototype = new Array();
BaseNode.prototype.atomP = true;
BaseNode.prototype.lambdaP = false;
BaseNode.prototype.nilP = false;
BaseNode.prototype.symbolP = false;
BaseNode.prototype.numberP = false;
BaseNode.prototype.stringP = false;

BaseNode.prototype.eval = function(env, fenv, errorString) {
  errorString.value += 'Evaluation of basenode.'
  return null;
}

// A node that represents a number.
function NumberNode(val) {
  this.push(val);
}

NumberNode.prototype = new BaseNode();
NumberNode.prototype.constructor = NumberNode;
NumberNode.prototype.baseClass = BaseNode.prototype.constructor;
NumberNode.prototype.numberP = true;
NumberNode.prototype.toString = function() {
  return 'Number [' + this[0] + ']';
}

NumberNode.prototype.eval = function(env, fenv, errorString) {
  return this;
}

// A node that represents a string.
function StringNode(val) {
  this.push(val);
}

StringNode.prototype = new BaseNode();
StringNode.prototype.constructor = StringNode;
StringNode.prototype.baseClass = BaseNode.prototype.constructor;
StringNode.prototype.stringP = true;
StringNode.prototype.toString = function() {
  return 'String [' + this[0] + ']';
}

StringNode.prototype.eval = function(env, fenv, errorString) {
  return this;
}

// A node that represents nil.
function NilNode() {
}

NilNode.prototype = new BaseNode();
NilNode.prototype.nilP = true;
NilNode.prototype.toString = function() {
  return 'nil';
}

NilNode.prototype.eval = function(env, fenv, errorString) {
  return this;
}

// A node that represents truth.
function TrueNode() {
}

TrueNode.prototype = new BaseNode();
TrueNode.prototype.toString = function() {
  return 't';
}

TrueNode.prototype.eval = function(env, fenv, errorString) {
  return this;
}

// Node that represents a symbol.
function SymbolNode(val) {
  this.push(val);
}

SymbolNode.prototype = new BaseNode();
SymbolNode.prototype.constructor = SymbolNode;
SymbolNode.prototype.baseClass = BaseNode.prototype.constructor;
SymbolNode.prototype.symbolP = true;

SymbolNode.prototype.toString = function() {
  return 'Symbol [' + this[0] + ']';
}

SymbolNode.prototype.eval = function(env, fenv, errorString) {
  var result = env.lookup(this[0]);
  if (result == null) {
    errorString.value += 'No such symbol "' + this[0] + '".';
  }

  return result;
}

// Node that represents a list.
function ListNode(val) {
  for (var i = 0; i < val.length; ++i) {
    this.push(val[i]);
  }

  if (val[0].symbolP && val[0][0] == 'lambda') {
    this.lambdaP = true;
  }
}

ListNode.prototype = new BaseNode();
ListNode.prototype.constructor = ListNode;
ListNode.prototype.baseClass = BaseNode.prototype.constructor;
ListNode.prototype.atomP = false;

ListNode.prototype.toString = function() {
  if (this.lambdaP) {
    return 'Lambda (' + this.slice(1).join(', ') + ')';
  } else {
    return 'List (' + this.join(', ') + ')';
  }
}

ListNode.prototype.eval = function(env, fenv, errorString) {
  // Bare lambda functions evaluate to themselves.
  if (this.lambdaP) {
    return this;
  }

  // Lambda function.
  if (this[0].lambdaP) {
    // Evaluate arguments.
    var lambda = this[0];
    var lambdaParams = lambda[1];
    var lambdaBody = lambda[2];
    var numArgs = this.length - 1;

    if (lambdaParams.length != this.length - 1) {
      errorString.value += 'Incorrect number of parameters'
          + ' (given ' + this.length - 1+ ')'
          + ' to lambda function (takes ' + lambdaParams.length + ').';
      return null;
    }

    // Evaluate arguments.
    var evaledArgs = new Array();
    for (var i = 1; i < this.length; ++i) {
      evaledArgs.push(this[i].eval(env, fenv, errorString));
      if (evaledArgs[i - 1] == null) return null;
    }

    // Build the local environment.
    var localEnv = new environment(env);
    for (var i = 0; i < numArgs; ++i) {
      if (!lambdaParams[i].symbolP) {
        errorString.value += 'Formal parameter ' + i + ' is not a symbol.';
        return null;
      }

      localEnv.store(lambdaParams[i][0], evaledArgs[i]);
    }

    // Evaluate.
    return lambdaBody.eval(localEnv, fenv, errorString);
  }

  // First argument must be a symbol.
  if (!this[0].symbolP) {
    errorString.value += '"' + this[0] + '" is not a symbol or lambda.';
    return null;
  }

  // Deal with built in functions.
  var builtin = builtInFunctions[this[0][0]];
  if (builtin != null) {
    var result = builtin.eval(this, env, fenv, errorString);
    if (result == null) return null;

    return result;
  }

  // Deal with defined functions.
  var lambdaFunc = fenv.lookup(this[0][0]);
  if (lambdaFunc == null) {
    errorString.value += lambdaFunc + ' is not a function.';
    return null;
  }

  var call = new ListNode(this);
  call.splice(0, 1, lambdaFunc);
  return call.eval(env, fenv, errorString);
}

