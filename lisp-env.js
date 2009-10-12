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
