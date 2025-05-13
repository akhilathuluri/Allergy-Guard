/*
  # Initial schema setup for AllergyGuard

  1. New Tables
    - `allergies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `severity` (text)
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
    - `scan_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `product_name` (text, nullable)
      - `ingredients` (text array)
      - `matched_allergies` (text array)
      - `has_matches` (boolean)
      - `analysis` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create allergies table
CREATE TABLE IF NOT EXISTS allergies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create scan history table
CREATE TABLE IF NOT EXISTS scan_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  product_name text,
  ingredients text[] NOT NULL,
  matched_allergies text[] NOT NULL,
  has_matches boolean NOT NULL,
  analysis text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

-- Create policies for allergies table
CREATE POLICY "Users can create their own allergies"
  ON allergies
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own allergies"
  ON allergies
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own allergies"
  ON allergies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own allergies"
  ON allergies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for scan_history table
CREATE POLICY "Users can create their own scan history"
  ON scan_history
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scan history"
  ON scan_history
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS allergies_user_id_idx ON allergies (user_id);
CREATE INDEX IF NOT EXISTS scan_history_user_id_idx ON scan_history (user_id);
CREATE INDEX IF NOT EXISTS scan_history_created_at_idx ON scan_history (created_at DESC);