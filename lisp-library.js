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
