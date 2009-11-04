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

function loadLibrary(env, fenv, errorString) {
  var library = new String();
  library += '(defun apply (f l) (cond ((not l) nil) (t (eval (cons f l)))))';
  library += '(defun mapcar (f l) (cond ((not l) nil) (t (cons (eval (list f (quote (car l)))) (mapcar f (cdr l))))))';
  library += '(defun cadr (l) (car (cdr l)))';
  library += '(defun cdar (l) (cdr (car l)))';
  library += '(defun not (l) (eq l nil))';
  library += '(defun len (l) (cond ((not l) 0) (t (+ 1 (len (cdr l))))))';

  var parsed = parseLisp(library, errorString);
  if (parsed == null) {
    return null;
  }

  return parsed.eval(env, fenv, errorString);
}
