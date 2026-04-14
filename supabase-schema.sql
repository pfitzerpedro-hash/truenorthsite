-- TrueNorth - Schema do Banco de Dados
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/jkffnfourgbrgsipntzc/sql

-- Tabela de perfis de usuários
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de operações (invoices processadas)
CREATE TABLE IF NOT EXISTS operations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  arquivo_nome TEXT,
  arquivo_tipo TEXT,
  arquivo_url TEXT,
  status TEXT DEFAULT 'completed',
  dados_extraidos JSONB,
  dados_validados JSONB,
  erros JSONB DEFAULT '[]',
  custo_total_erros NUMERIC DEFAULT 0,
  tempo_economizado_min INTEGER DEFAULT 17,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso para profiles
CREATE POLICY "Usuários veem próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários atualizam próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Service role gerencia profiles" ON profiles
  FOR ALL USING (true);

-- Políticas de acesso para operations
CREATE POLICY "Usuários veem próprias operações" ON operations
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role gerencia operations" ON operations
  FOR ALL USING (true);

-- Bucket de storage para invoices
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Política de storage
CREATE POLICY "Usuários acessam próprias invoices" ON storage.objects
  FOR ALL USING (bucket_id = 'invoices' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Service role acessa storage" ON storage.objects
  FOR ALL USING (bucket_id = 'invoices');
