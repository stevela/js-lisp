// An environment to hold symbols and their values.
function environment(parent) {
  this.symbols = new Array();
  this.parent = parent;
}

environment.prototype.store = function(key, value) {
  for (var i in this.symbols) {
    if (this.symbols[i].key == key) {
      this.symbols[i].value = value;
    }
  }

  var newSymbol = new Object();
  newSymbol.key = key;
  newSymbol.value = value;

  this.symbols.push(newSymbol);
}

environment.prototype.lookup = function(key) {
  for (var i in this.symbols) {
    if (this.symbols[i].key == key) {
      return this.symbols[i].value;
    }
  }

  if (this.parent) {
    return this.parent.lookup(key);
  }

  return null;
}
