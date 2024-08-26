all: tesis.pdf

tesis.pdf: tesis.tex introduccion.tex disenio.tex bibliografia.tex abstract.tex caratula.pdf conclusiones.tex agradecimientos.tex
	pdflatex -halt-on-error tesis.tex && pdflatex tesis.tex

clean:
	rm -f *.out *.log *.aux tesis.toc tesis.pdf
