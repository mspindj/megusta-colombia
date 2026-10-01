#!/bin/bash
# Guarda un token nuevo de Meta en .mcp.json sin que pase por el chat.
# Lo pide con read -s (no se ve al escribir), verifica contra la API que trae
# instagram_manage_insights y que los permisos anteriores siguen, y solo
# entonces lo escribe en META_ACCESS_TOKEN.
#
# Uso: bash scripts/set-meta-token.sh
set -euo pipefail

cd "$(dirname "$0")/.."
MCP=".mcp.json"
[ -f "$MCP" ] || { echo "No encuentro $MCP en $(pwd)"; exit 1; }

printf "Pega el token nuevo (no se muestra) y pulsa Enter: "
read -rs TOKEN
echo
[ -n "$TOKEN" ] || { echo "Token vacio."; exit 1; }

REQUIRED="instagram_manage_insights instagram_basic instagram_content_publish instagram_manage_comments pages_show_list pages_read_engagement pages_manage_posts ads_management ads_read business_management pages_manage_ads leads_retrieval"

PERMS=$(curl -s "https://graph.facebook.com/v21.0/me/permissions?access_token=$TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'error' in d:
    print('ERROR: ' + d['error'].get('message', 'desconocido'))
    sys.exit(0)
print(' '.join(p['permission'] for p in d.get('data', []) if p['status'] == 'granted'))
")

case "$PERMS" in ERROR*) echo "Meta rechazo el token: $PERMS"; exit 1;; esac

MISSING=""
for p in $REQUIRED; do
  case " $PERMS " in *" $p "*) ;; *) MISSING="$MISSING $p";; esac
done
if [ -n "$MISSING" ]; then
  echo "Al token le faltan permisos:$MISSING"
  echo "En el Graph API Explorer agrega esos permisos y genera el token otra vez."
  exit 1
fi

# Prueba real de insights sobre el ultimo post (un cero o un error se investiga, no se acepta).
IG="17841480006391349"
MEDIA=$(curl -s "https://graph.facebook.com/v21.0/$IG/media?fields=id&limit=1&access_token=$TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data'][0]['id'] if d.get('data') else '')")
[ -n "$MEDIA" ] || { echo "No pude leer los posts de la cuenta."; exit 1; }
INS=$(curl -s "https://graph.facebook.com/v21.0/$MEDIA/insights?metric=reach,saved,shares&access_token=$TOKEN")
echo "$INS" | python3 -c "
import sys, json
d = json.load(sys.stdin)
if 'error' in d:
    print('Insights fallo: ' + d['error'].get('message', ''))
    sys.exit(1)
vals = {m['name']: m['values'][0]['value'] for m in d.get('data', [])}
print('Insights OK en el ultimo post:', vals)
"

python3 - "$MCP" "$TOKEN" <<'EOF'
import json, sys
path, token = sys.argv[1], sys.argv[2]
d = json.load(open(path))
found = False
def walk(o):
    global found
    if isinstance(o, dict):
        for k, v in o.items():
            if k == "META_ACCESS_TOKEN":
                o[k] = token
                found = True
            else:
                walk(v)
    elif isinstance(o, list):
        for i in o:
            walk(i)
walk(d)
if not found:
    print("No hay META_ACCESS_TOKEN en .mcp.json, no escribi nada.")
    sys.exit(1)
json.dump(d, open(path, "w"), indent=2)
print("Token guardado en .mcp.json (META_ACCESS_TOKEN).")
EOF
