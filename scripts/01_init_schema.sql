-- Création du schéma de base de données pour FaceAFace SaaS
-- Exécutez ce script dans votre console Supabase SQL Editor

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des funnels
CREATE TABLE IF NOT EXISTS funnels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    views INTEGER DEFAULT 0,
    conversions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des quiz
CREATE TABLE IF NOT EXISTS quiz (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB NOT NULL DEFAULT '{}',
    theme JSONB DEFAULT '{}',
    ai_insights JSONB DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),
    completions INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des soumissions
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_id UUID REFERENCES funnels(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES quiz(id) ON DELETE CASCADE,
    contact_info JSONB NOT NULL DEFAULT '{}',
    responses JSONB NOT NULL DEFAULT '{}',
    ai_analysis JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT submission_type_check CHECK (
        (funnel_id IS NOT NULL AND quiz_id IS NULL) OR 
        (funnel_id IS NULL AND quiz_id IS NOT NULL)
    )
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_funnels_user_id ON funnels(user_id);
CREATE INDEX IF NOT EXISTS idx_funnels_status ON funnels(status);
CREATE INDEX IF NOT EXISTS idx_quiz_user_id ON quiz(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_status ON quiz(status);
CREATE INDEX IF NOT EXISTS idx_submissions_funnel_id ON submissions(funnel_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_funnels_updated_at BEFORE UPDATE ON funnels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quiz_updated_at BEFORE UPDATE ON quiz FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) pour sécuriser les données
ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les funnels
CREATE POLICY "Users can view their own funnels" ON funnels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own funnels" ON funnels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own funnels" ON funnels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own funnels" ON funnels FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour les quiz
CREATE POLICY "Users can view their own quiz" ON quiz FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quiz" ON quiz FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quiz" ON quiz FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quiz" ON quiz FOR DELETE USING (auth.uid() = user_id);

-- Politiques RLS pour les submissions (plus permissives pour permettre les soumissions publiques)
CREATE POLICY "Anyone can insert submissions" ON submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can view submissions for their funnels/quiz" ON submissions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM funnels f WHERE f.id = submissions.funnel_id AND f.user_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM quiz q WHERE q.id = submissions.quiz_id AND q.user_id = auth.uid()
    )
);

-- Données de test (optionnel)
INSERT INTO funnels (user_id, title, description, config, status) VALUES
('00000000-0000-0000-0000-000000000000', 'Funnel de Test', 'Un funnel de démonstration', '{"steps": [{"type": "landing", "title": "Bienvenue"}]}', 'active')
ON CONFLICT DO NOTHING;

INSERT INTO quiz (user_id, title, description, config, status) VALUES
('00000000-0000-0000-0000-000000000000', 'Quiz de Test', 'Un quiz de démonstration', '{"questions": [{"type": "multiple", "question": "Question test?"}]}', 'active')
ON CONFLICT DO NOTHING;
