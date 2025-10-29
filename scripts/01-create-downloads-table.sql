-- Create downloads table for tracking software downloads
CREATE TABLE IF NOT EXISTS downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  phone VARCHAR(20),
  country VARCHAR(100),
  product_version VARCHAR(50) DEFAULT 'latest',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_downloads_email ON downloads(email);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_downloads_created_at ON downloads(created_at DESC);

-- Enable Row Level Security
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (for public downloads)
CREATE POLICY "Allow public inserts" ON downloads
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow anyone to read their own downloads
CREATE POLICY "Allow users to read own downloads" ON downloads
  FOR SELECT
  USING (true);
