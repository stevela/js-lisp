(defun fib (x)
  (cond ((eq x 1) 1)
	(t (* x (fib (- x 1))))))

(fib 10)

