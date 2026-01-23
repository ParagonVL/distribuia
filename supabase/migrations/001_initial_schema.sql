-- Distribuia Database Schema
-- Migration: 001_initial_schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom ENUM types
CREATE TYPE user_plan AS ENUM ('free', 'starter', 'pro');
CREATE TYPE input_type AS ENUM ('youtube', 'article', 'text');
CREATE TYPE tone_type AS ENUM ('profesional', 'cercano', 'tecnico');
CREATE TYPE output_format AS ENUM ('x_thread', 'linkedin_post', 'linkedin_article');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    plan user_plan NOT NULL DEFAULT 'free',
    conversions_used_this_month INTEGER NOT NULL DEFAULT 0,
    billing_cycle_start TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversions table
CREATE TABLE public.conversions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    input_type input_type NOT NULL,
    input_url TEXT,
    input_text TEXT NOT NULL,
    tone tone_type NOT NULL,
    topics TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Outputs table
CREATE TABLE public.outputs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversion_id UUID NOT NULL REFERENCES public.conversions(id) ON DELETE CASCADE,
    format output_format NOT NULL,
    content TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_conversions_user_id ON public.conversions(user_id);
CREATE INDEX idx_conversions_created_at ON public.conversions(created_at);
CREATE INDEX idx_outputs_conversion_id ON public.outputs(conversion_id);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outputs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data"
    ON public.users
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
    ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
    ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- RLS Policies for conversions table
CREATE POLICY "Users can view their own conversions"
    ON public.conversions
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversions"
    ON public.conversions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversions"
    ON public.conversions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversions"
    ON public.conversions
    FOR DELETE
    USING (auth.uid() = user_id);

-- RLS Policies for outputs table
CREATE POLICY "Users can view their own outputs"
    ON public.outputs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.conversions
            WHERE conversions.id = outputs.conversion_id
            AND conversions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own outputs"
    ON public.outputs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversions
            WHERE conversions.id = outputs.conversion_id
            AND conversions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own outputs"
    ON public.outputs
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversions
            WHERE conversions.id = outputs.conversion_id
            AND conversions.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.conversions
            WHERE conversions.id = outputs.conversion_id
            AND conversions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own outputs"
    ON public.outputs
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.conversions
            WHERE conversions.id = outputs.conversion_id
            AND conversions.user_id = auth.uid()
        )
    );

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, plan, conversions_used_this_month, billing_cycle_start, created_at)
    VALUES (NEW.id, 'free', 0, NOW(), NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Function to reset monthly conversions (to be called by a cron job)
CREATE OR REPLACE FUNCTION public.reset_monthly_conversions()
RETURNS void AS $$
BEGIN
    UPDATE public.users
    SET conversions_used_this_month = 0,
        billing_cycle_start = NOW()
    WHERE billing_cycle_start < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
