/*
  # Add JSON fields to portfolio_projects

  1. Changes
    - Add `summary` field (text) for project summary
    - Add `features` field (jsonb array) for list of project features
    - Add `technologies` field (jsonb array) for list of technologies used
    - Add `images` field (jsonb array) for additional project images
    - Add `objectifs` field (text) for project objectives
    
  2. Notes
    - Using JSONB for better performance and indexing
    - All fields are optional to maintain backwards compatibility
*/

DO $$
BEGIN
  -- Add summary field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'summary'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN summary text;
  END IF;

  -- Add features field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'features'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN features jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add technologies field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'technologies'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN technologies jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add images field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'images'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN images jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add objectifs field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'portfolio_projects' AND column_name = 'objectifs'
  ) THEN
    ALTER TABLE portfolio_projects ADD COLUMN objectifs text;
  END IF;
END $$;
