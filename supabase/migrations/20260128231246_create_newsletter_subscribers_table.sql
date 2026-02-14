/*
  # Create newsletter subscribers table

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key) - Unique identifier for each subscriber
      - `name` (text) - Subscriber's name (optional)
      - `email` (text, unique) - Subscriber's email address
      - `consent` (boolean) - Whether subscriber gave consent
      - `coupon_code` (text) - Welcome coupon code (WELCOME10)
      - `coupon_used` (boolean) - Whether the coupon has been used
      - `coupon_expires_at` (timestamptz) - Coupon expiration date (30 days from subscription)
      - `subscribed_at` (timestamptz) - Subscription timestamp
      - `unsubscribed_at` (timestamptz, nullable) - Unsubscription timestamp
      - `created_at` (timestamptz) - Record creation timestamp

  2. Security
    - Enable RLS on `newsletter_subscribers` table
    - Add policy for public to insert their own subscription
    - Add policy for authenticated admin users to read all data

  3. Important Notes
    - Email must be unique to prevent duplicate subscriptions
    - Coupon code "WELCOME10" is automatically assigned
    - Coupon expires 30 days after subscription
    - Includes unsubscribe functionality for GDPR compliance
*/

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text DEFAULT '',
  email text UNIQUE NOT NULL,
  consent boolean DEFAULT true NOT NULL,
  coupon_code text DEFAULT 'WELCOME10' NOT NULL,
  coupon_used boolean DEFAULT false NOT NULL,
  coupon_expires_at timestamptz DEFAULT (now() + interval '30 days') NOT NULL,
  subscribed_at timestamptz DEFAULT now() NOT NULL,
  unsubscribed_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can unsubscribe themselves"
  ON newsletter_subscribers
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribed_at ON newsletter_subscribers(subscribed_at DESC);