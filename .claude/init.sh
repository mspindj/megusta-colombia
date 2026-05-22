#!/bin/bash
# Me Gusta Colombia — Verificación de entorno
# El agente NO debe continuar si este script falla

set -e
ERRORS=0
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "🔍 Verificando entorno — Me Gusta Colombia"
echo "Raíz: $PROJECT_ROOT"
echo ""

# 1. Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js no instalado"
  ERRORS=$((ERRORS+1))
else
  echo "✅ Node.js $(node --version)"
fi

# 2. Dependencias Next.js
if [ ! -d "$PROJECT_ROOT/node_modules" ]; then
  echo "❌ node_modules ausente — ejecuta: npm install"
  ERRORS=$((ERRORS+1))
else
  echo "✅ node_modules presente"
fi

# 3. TypeScript (Next.js app)
echo "🔍 TypeScript check..."
cd "$PROJECT_ROOT"
TS_OUTPUT=$(npx tsc --noEmit 2>&1)
if echo "$TS_OUTPUT" | grep -q "error TS"; then
  echo "❌ TypeScript errors:"
  echo "$TS_OUTPUT" | grep "error TS" | head -5
  ERRORS=$((ERRORS+1))
else
  echo "✅ TypeScript OK"
fi

# 4. Archivos clave del proyecto
REQUIRED_FILES=(
  "CLAUDE.md"
  ".claude/agents.md"
  ".claude/feature_list.json"
  "src/app/page.tsx"
  "editor-pro-max-main/package.json"
)
for f in "${REQUIRED_FILES[@]}"; do
  if [ ! -f "$PROJECT_ROOT/$f" ]; then
    echo "❌ Falta: $f"
    ERRORS=$((ERRORS+1))
  fi
done

# 5. Supabase CLI (opcional — solo para Edge Functions)
if ! command -v supabase &> /dev/null; then
  echo "⚠️  Supabase CLI no instalado (necesario solo para Edge Functions)"
else
  echo "✅ Supabase CLI $(supabase --version)"
fi

# 6. Remotion (solo si CHECK_REMOTION=1)
if [ "$CHECK_REMOTION" = "1" ]; then
  if [ ! -d "$PROJECT_ROOT/editor-pro-max-main/node_modules" ]; then
    echo "❌ editor-pro-max-main/node_modules ausente"
    echo "   cd editor-pro-max-main && npm install"
    ERRORS=$((ERRORS+1))
  else
    echo "✅ Remotion dependencies OK"
  fi
fi

echo ""
echo "⚠️  Sin test suite configurado — validación via TypeScript + ESLint + criterios manuales."
echo ""

if [ $ERRORS -gt 0 ]; then
  echo "🔴 FALLO: $ERRORS problema(s). No continúes."
  exit 1
else
  echo "🟢 ENTORNO LISTO — puedes continuar."
  exit 0
fi
