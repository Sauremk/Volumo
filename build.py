"""Une los archivos de src/ en un solo dist/index.html (la app completa en un archivo)."""
import pathlib, re
R = pathlib.Path(__file__).parent
S = R / 'src'
html = (S / 'src.html').read_text(encoding='utf-8')
for marker, f in [('HUMAN', 'human.js'), ('RAW', 'ejercicios.js'), ('MUS', 'ranking.js'), ('BODY3D', 'body3d.js'),
                  ('ANIM', 'anim.js'), ('WK', 'wk.js'), ('FEAT', 'feat.js')]:
    html = html.replace('/*%s*/' % marker, (S / f).read_text(encoding='utf-8'))
(R / 'dist').mkdir(exist_ok=True)
(R / 'dist' / 'index.html').write_text(html, encoding='utf-8')
print('dist/index.html listo:', len(html) // 1024, 'KB')
(R / 'docs').mkdir(exist_ok=True)
(R / 'docs' / 'index.html').write_text(html, encoding='utf-8')
print('docs/index.html listo (GitHub Pages)')
