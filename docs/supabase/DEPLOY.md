# Deploy Edge Function: subscribe

## Opcion A — Desde el Dashboard (mas facil)

1. Ve a **supabase.com/dashboard** > tu proyecto Me Gusta Colombia
2. Ve a **Edge Functions** en el sidebar
3. Click **Create a new function**
4. Nombre: `subscribe`
5. Pega el contenido de `subscribe/index.ts`
6. **Importante:** Desactiva "Verify JWT" — esta funcion es publica (el form la llama sin auth)
7. Click **Deploy**

## Opcion B — Desde CLI

```bash
# Instalar Supabase CLI si no lo tienes
brew install supabase/tap/supabase

# Login
supabase login

# Link al proyecto
supabase link --project-ref uocwxwvcrnkfnnoyjzyb

# Deploy la funcion
supabase functions deploy subscribe --no-verify-jwt
```

## Configurar el API Key de Brevo

1. En el dashboard de Supabase > **Edge Functions** > click la funcion `subscribe`
2. Ve a **Secrets** (o Settings > Edge Function Secrets)
3. Agrega: `BREVO_API_KEY` = tu key de Brevo (`xkeysib-...`)

Alternativamente via CLI:
```bash
supabase secrets set BREVO_API_KEY=xkeysib-tu-key-aqui
```

## URL de la funcion

Despues del deploy, la URL sera:
```
https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/subscribe
```

## Test

```bash
curl -X POST https://uocwxwvcrnkfnnoyjzyb.supabase.co/functions/v1/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

Respuesta esperada: `{"success":true}`
