#!/usr/bin/env python3
"""Bundle the static export (./out) into ONE self-contained HTML file that opens from disk.

Usage:  npm run build && python3 scripts/single-file-preview.py [output.html]

Each page (Home, About, Services & Results) is embedded with its CSS, fonts, JS chunks and local
images inlined; the file loads itself with ?page=<slug> and writes the requested page into the
document, so every page has a real file:// URL and Next.js hydrates normally (hero video, service
tabs, mobile menu all work). Wix-hosted images and the hero video are still loaded from the web.
Forms do not send. Expect a React hydration notice and prefetch errors in the dev console; they are
harmless in this preview."""
import re, base64, os, mimetypes
import sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT=f"{R}/out"
DEST=sys.argv[1] if len(sys.argv)>1 else f"{R}/edcloud-preview.html"
def read(p, mode="r"): return open(p, mode, encoding=None if "b" in mode else "utf-8").read()
_cache={}
def data_uri(path):
    """Inline a file. Large JPEG/PNG photos are downscaled for the preview only (max 1600px, JPEG q80)
    because each one is embedded several times per page."""
    if path in _cache: return _cache[path]
    mt=mimetypes.guess_type(path)[0] or ("font/woff2" if path.endswith(".woff2") else "application/octet-stream")
    data=read(path,"rb")
    if mt in ("image/jpeg","image/png") and len(data) > 300_000:
        try:
            from PIL import Image
            import io
            im=Image.open(io.BytesIO(data)); im.thumbnail((1600,1600))
            buf=io.BytesIO()
            if mt=="image/jpeg": im.convert("RGB").save(buf, "JPEG", quality=80, optimize=True, progressive=True)
            else: im.save(buf, "PNG", optimize=True)
            data=buf.getvalue()
        except ImportError:
            pass
    _cache[path]=f"data:{mt};base64,"+base64.b64encode(data).decode()
    return _cache[path]
PAGES=[("home","index.html","EdCloud Venture Partners"),("about","about.html","About"),("services-and-results","services-and-results.html","Services & Results")]
ROUTES={"/":"home","/about":"about","/services-and-results":"services-and-results"}
def inline_page(fn):
    html=read(f"{OUT}/{fn}")
    # stylesheets → <style>, fonts → data URIs
    def css_repl(m):
        css=read(f"{OUT}{m.group(1)}")
        css=re.sub(r"url\((/_next/static/media/[^)]+)\)", lambda u: f"url({data_uri(OUT+u.group(1))})", css)
        return '<link rel="stylesheet" href="data:text/css;base64,'+base64.b64encode(css.encode()).decode()+'" data-precedence="next"/>'
    html=re.sub(r'<link rel="stylesheet" href="(/_next/static/chunks/[^"]+\.css)"[^>]*/?>', css_repl, html)
    # drop preloads/prefetch of _next assets
    html=re.sub(r'<link[^>]+href="/_next/[^"]*"[^>]*/?>', "", html)
    # script chunks → inline, in order
    def js_repl(m):
        js=read(f"{OUT}{m.group(1)}").replace("</script","<\\/script")
        # inline scripts have no src: the Turbopack runtime and Next's asset-prefix check read it, so
        # point both at a data-src attribute carrying the original chunk path.
        js=js.replace('{src:e.getAttribute("src")}','{src:e.getAttribute("data-src")}')
        js=js.replace('new URL(e.src)','new URL(e.getAttribute("data-src")||"/_next/static/chunks/x.js","http://localhost/")')
        return f'<script data-src="{m.group(1)}">'+js+"</script>"
    html=re.sub(r'<script src="(/_next/static/chunks/[^"]+\.js)"[^>]*></script>', js_repl, html)
    # local public images → data URIs
    html=re.sub(r'/images/[A-Za-z0-9._-]+', lambda m: data_uri(OUT+m.group(0)), html)
    # internal links → top-window hash routes (target=_top makes Next's Link skip client routing)
    def link_repl(m):
        href=m.group(1); path,_,anchor=href.partition("#")
        if path in ROUTES:
            slug=ROUTES[path]; return f'href="?page={slug}{("#"+anchor) if anchor else ""}" target="_top"'
        return m.group(0)
    html=re.sub(r"url\((/_next/static/media/[^)]+)\)", lambda u: f"url({data_uri(OUT+u.group(1))})", html)
    html=re.sub(r"/_next/static/media/[A-Za-z0-9._-]+", lambda u: data_uri(OUT+u.group(0)), html)
    # Cross-page links: React restores the original hrefs after hydration, so intercept clicks at
    # runtime (capture phase runs before React's delegated handlers) and navigate via ?page=.
    nav_js = """<script>(function(){var MAP={'/':'home','/about':'about','/services-and-results':'services-and-results'};
document.addEventListener('click',function(e){var a=e.target&&e.target.closest?e.target.closest('a[href]'):null;if(!a)return;var href=a.getAttribute('href')||'';var path=href.split('#')[0],anchor=href.split('#')[1];
if(path in MAP){e.preventDefault();e.stopPropagation();location.href=location.pathname+'?page='+MAP[path]+(anchor?'#'+anchor:'');}},true);})();</script>"""
    html=html.replace("</body>", nav_js+"</body>")
    return html
blocks=[]; 
for slug,fn,title in PAGES:
    doc=inline_page(fn); b64=base64.b64encode(doc.encode("utf-8")).decode()
    blocks.append(f'<script type="text/plain" id="page-{slug}">{b64}</script>')
    print(slug, len(doc)//1024, "KB")
shell=f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>EdCloud Venture Partners — site preview</title>
</head>
<body>
{"".join(blocks)}
<script>
(function () {{
  var PAGES = ['home', 'about', 'services-and-results'];
  var page = new URLSearchParams(location.search).get('page') || 'home';
  if (PAGES.indexOf(page) < 0) page = 'home';
  var b64 = document.getElementById('page-' + page).textContent;
  var bin = atob(b64); var bytes = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  var html = new TextDecoder().decode(bytes);
  document.open(); document.write(html); document.close();
}})();
</script>
</body>
</html>'''
open(DEST,"w",encoding="utf-8").write(shell); print("wrote", DEST, round(os.path.getsize(DEST)/1024/1024,2), "MB")
