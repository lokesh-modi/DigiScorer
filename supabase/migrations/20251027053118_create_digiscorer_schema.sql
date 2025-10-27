/*
  # DigiScorer Database Schema

  ## Overview
  Complete database schema for DigiScorer cricket scoring and tournament management app.
  Supports offline-first architecture with comprehensive match tracking, player statistics,
  and tournament management.

  ## New Tables

  ### 1. `users`
  - `id` (uuid, primary key) - User identifier linked to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `avatar_url` (text, nullable) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. `teams`
  - `id` (uuid, primary key) - Team identifier
  - `user_id` (uuid, foreign key) - Owner of the team
  - `name` (text) - Team name
  - `short_name` (text, nullable) - Team abbreviation (3-4 chars)
  - `logo_url` (text, nullable) - Team logo URL
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `players`
  - `id` (uuid, primary key) - Player identifier
  - `user_id` (uuid, foreign key) - Owner of the player record
  - `team_id` (uuid, foreign key, nullable) - Associated team
  - `name` (text) - Player name
  - `role` (text) - Batsman, Bowler, All-rounder, Wicket-keeper
  - `batting_style` (text, nullable) - Right-hand, Left-hand
  - `bowling_style` (text, nullable) - Fast, Medium, Spin, etc.
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `tournaments`
  - `id` (uuid, primary key) - Tournament identifier
  - `user_id` (uuid, foreign key) - Tournament organizer
  - `name` (text) - Tournament name
  - `format` (text) - League or Knockout
  - `match_type` (text) - T20, One-day
  - `status` (text) - Upcoming, Ongoing, Completed
  - `start_date` (date, nullable) - Tournament start date
  - `end_date` (date, nullable) - Tournament end date
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 5. `tournament_teams`
  - `id` (uuid, primary key) - Record identifier
  - `tournament_id` (uuid, foreign key) - Associated tournament
  - `team_id` (uuid, foreign key) - Participating team
  - `points` (integer) - Points in league format
  - `matches_played` (integer) - Number of matches played
  - `matches_won` (integer) - Number of matches won
  - `matches_lost` (integer) - Number of matches lost
  - `matches_tied` (integer) - Number of tied matches
  - `net_run_rate` (decimal) - Net run rate for standings
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. `matches`
  - `id` (uuid, primary key) - Match identifier
  - `user_id` (uuid, foreign key) - Match scorer/creator
  - `tournament_id` (uuid, foreign key, nullable) - Associated tournament
  - `team1_id` (uuid, foreign key) - First team
  - `team2_id` (uuid, foreign key) - Second team
  - `match_type` (text) - T20, One-day
  - `overs` (integer) - Total overs per innings
  - `venue` (text, nullable) - Match venue
  - `match_date` (date) - Match date
  - `toss_winner_id` (uuid, foreign key, nullable) - Team that won toss
  - `toss_decision` (text, nullable) - Bat or Bowl
  - `status` (text) - Not Started, In Progress, Completed, Abandoned
  - `current_innings` (integer) - Current innings number (1 or 2)
  - `batting_team_id` (uuid, nullable) - Currently batting team
  - `bowling_team_id` (uuid, nullable) - Currently bowling team
  - `winner_id` (uuid, foreign key, nullable) - Winning team
  - `result_text` (text, nullable) - Match result description
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. `innings`
  - `id` (uuid, primary key) - Innings identifier
  - `match_id` (uuid, foreign key) - Associated match
  - `batting_team_id` (uuid, foreign key) - Batting team
  - `bowling_team_id` (uuid, foreign key) - Bowling team
  - `innings_number` (integer) - 1 or 2
  - `total_runs` (integer) - Total runs scored
  - `total_wickets` (integer) - Total wickets lost
  - `total_overs` (decimal) - Total overs bowled
  - `extras` (integer) - Total extras
  - `is_completed` (boolean) - Innings completion status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 8. `batting_scores`
  - `id` (uuid, primary key) - Record identifier
  - `innings_id` (uuid, foreign key) - Associated innings
  - `player_id` (uuid, foreign key) - Batsman
  - `runs` (integer) - Runs scored
  - `balls_faced` (integer) - Balls faced
  - `fours` (integer) - Number of fours
  - `sixes` (integer) - Number of sixes
  - `strike_rate` (decimal) - Strike rate
  - `dismissal_type` (text, nullable) - How out (Bowled, Caught, LBW, etc.)
  - `bowler_id` (uuid, foreign key, nullable) - Bowler who got wicket
  - `fielder_id` (uuid, foreign key, nullable) - Fielder involved
  - `is_out` (boolean) - Whether batsman is out
  - `batting_position` (integer) - Batting order position
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 9. `bowling_figures`
  - `id` (uuid, primary key) - Record identifier
  - `innings_id` (uuid, foreign key) - Associated innings
  - `player_id` (uuid, foreign key) - Bowler
  - `overs` (decimal) - Overs bowled
  - `runs_conceded` (integer) - Runs conceded
  - `wickets` (integer) - Wickets taken
  - `maidens` (integer) - Maiden overs
  - `wides` (integer) - Wides bowled
  - `no_balls` (integer) - No balls bowled
  - `economy_rate` (decimal) - Economy rate
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 10. `ball_by_ball`
  - `id` (uuid, primary key) - Ball identifier
  - `innings_id` (uuid, foreign key) - Associated innings
  - `over_number` (integer) - Over number
  - `ball_number` (integer) - Ball number in over (1-6)
  - `bowler_id` (uuid, foreign key) - Bowler
  - `batsman_id` (uuid, foreign key) - Striker
  - `non_striker_id` (uuid, foreign key) - Non-striker
  - `runs` (integer) - Runs scored off this ball
  - `extras_type` (text, nullable) - Wide, No-ball, Bye, Leg-bye
  - `extras_runs` (integer) - Extra runs
  - `is_wicket` (boolean) - Whether wicket fell
  - `dismissal_type` (text, nullable) - Type of dismissal
  - `fielder_id` (uuid, foreign key, nullable) - Fielder involved
  - `created_at` (timestamptz) - Ball timestamp
  - `sequence_number` (integer) - Sequential order for undo

  ### 11. `partnerships`
  - `id` (uuid, primary key) - Partnership identifier
  - `innings_id` (uuid, foreign key) - Associated innings
  - `batsman1_id` (uuid, foreign key) - First batsman
  - `batsman2_id` (uuid, foreign key) - Second batsman
  - `runs` (integer) - Partnership runs
  - `balls` (integer) - Balls faced in partnership
  - `wicket_number` (integer) - Wicket for which partnership was formed
  - `created_at` (timestamptz) - Creation timestamp

  ### 12. `fall_of_wickets`
  - `id` (uuid, primary key) - Record identifier
  - `innings_id` (uuid, foreign key) - Associated innings
  - `wicket_number` (integer) - Wicket number (1-10)
  - `player_id` (uuid, foreign key) - Batsman out
  - `runs` (integer) - Team total when wicket fell
  - `overs` (decimal) - Overs when wicket fell
  - `created_at` (timestamptz) - Creation timestamp

  ## Security

  All tables have Row Level Security (RLS) enabled with policies that:
  - Allow users to read their own data
  - Allow users to create, update, and delete their own records
  - Prevent unauthorized access to other users' data

  ## Indexes

  Indexes are created on foreign keys and frequently queried columns to optimize performance.
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  short_name text,
  logo_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create players table
CREATE TABLE IF NOT EXISTS players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text DEFAULT 'Batsman',
  batting_style text,
  bowling_style text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS tournaments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  format text DEFAULT 'League',
  match_type text DEFAULT 'T20',
  status text DEFAULT 'Upcoming',
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tournament_teams table
CREATE TABLE IF NOT EXISTS tournament_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id uuid NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  points integer DEFAULT 0,
  matches_played integer DEFAULT 0,
  matches_won integer DEFAULT 0,
  matches_lost integer DEFAULT 0,
  matches_tied integer DEFAULT 0,
  net_run_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(tournament_id, team_id)
);

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tournament_id uuid REFERENCES tournaments(id) ON DELETE SET NULL,
  team1_id uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  team2_id uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  match_type text DEFAULT 'T20',
  overs integer DEFAULT 20,
  venue text,
  match_date date DEFAULT CURRENT_DATE,
  toss_winner_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  toss_decision text,
  status text DEFAULT 'Not Started',
  current_innings integer DEFAULT 1,
  batting_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  bowling_team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  winner_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  result_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create innings table
CREATE TABLE IF NOT EXISTS innings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  batting_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  bowling_team_id uuid NOT NULL REFERENCES teams(id) ON DELETE RESTRICT,
  innings_number integer NOT NULL,
  total_runs integer DEFAULT 0,
  total_wickets integer DEFAULT 0,
  total_overs decimal(3,1) DEFAULT 0,
  extras integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(match_id, innings_number)
);

-- Create batting_scores table
CREATE TABLE IF NOT EXISTS batting_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id uuid NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  runs integer DEFAULT 0,
  balls_faced integer DEFAULT 0,
  fours integer DEFAULT 0,
  sixes integer DEFAULT 0,
  strike_rate decimal(5,2) DEFAULT 0,
  dismissal_type text,
  bowler_id uuid REFERENCES players(id) ON DELETE SET NULL,
  fielder_id uuid REFERENCES players(id) ON DELETE SET NULL,
  is_out boolean DEFAULT false,
  batting_position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(innings_id, player_id)
);

-- Create bowling_figures table
CREATE TABLE IF NOT EXISTS bowling_figures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id uuid NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  overs decimal(3,1) DEFAULT 0,
  runs_conceded integer DEFAULT 0,
  wickets integer DEFAULT 0,
  maidens integer DEFAULT 0,
  wides integer DEFAULT 0,
  no_balls integer DEFAULT 0,
  economy_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(innings_id, player_id)
);

-- Create ball_by_ball table
CREATE TABLE IF NOT EXISTS ball_by_ball (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id uuid NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  over_number integer NOT NULL,
  ball_number integer NOT NULL,
  bowler_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  batsman_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  non_striker_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  runs integer DEFAULT 0,
  extras_type text,
  extras_runs integer DEFAULT 0,
  is_wicket boolean DEFAULT false,
  dismissal_type text,
  fielder_id uuid REFERENCES players(id) ON DELETE SET NULL,
  sequence_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create partnerships table
CREATE TABLE IF NOT EXISTS partnerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id uuid NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  batsman1_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  batsman2_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  runs integer DEFAULT 0,
  balls integer DEFAULT 0,
  wicket_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create fall_of_wickets table
CREATE TABLE IF NOT EXISTS fall_of_wickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  innings_id uuid NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  wicket_number integer NOT NULL,
  player_id uuid NOT NULL REFERENCES players(id) ON DELETE RESTRICT,
  runs integer NOT NULL,
  overs decimal(3,1) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);
CREATE INDEX IF NOT EXISTS idx_players_user_id ON players(user_id);
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_user_id ON tournaments(user_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_tournament_id ON tournament_teams(tournament_id);
CREATE INDEX IF NOT EXISTS idx_tournament_teams_team_id ON tournament_teams(team_id);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_tournament_id ON matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_team1_id ON matches(team1_id);
CREATE INDEX IF NOT EXISTS idx_matches_team2_id ON matches(team2_id);
CREATE INDEX IF NOT EXISTS idx_innings_match_id ON innings(match_id);
CREATE INDEX IF NOT EXISTS idx_batting_scores_innings_id ON batting_scores(innings_id);
CREATE INDEX IF NOT EXISTS idx_batting_scores_player_id ON batting_scores(player_id);
CREATE INDEX IF NOT EXISTS idx_bowling_figures_innings_id ON bowling_figures(innings_id);
CREATE INDEX IF NOT EXISTS idx_bowling_figures_player_id ON bowling_figures(player_id);
CREATE INDEX IF NOT EXISTS idx_ball_by_ball_innings_id ON ball_by_ball(innings_id);
CREATE INDEX IF NOT EXISTS idx_ball_by_ball_sequence ON ball_by_ball(innings_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_partnerships_innings_id ON partnerships(innings_id);
CREATE INDEX IF NOT EXISTS idx_fall_of_wickets_innings_id ON fall_of_wickets(innings_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE batting_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowling_figures ENABLE ROW LEVEL SECURITY;
ALTER TABLE ball_by_ball ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE fall_of_wickets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can read own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- RLS Policies for teams table
CREATE POLICY "Users can view own teams"
  ON teams FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own teams"
  ON teams FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for players table
CREATE POLICY "Users can view own players"
  ON players FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own players"
  ON players FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own players"
  ON players FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for tournaments table
CREATE POLICY "Users can view own tournaments"
  ON tournaments FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own tournaments"
  ON tournaments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for tournament_teams table
CREATE POLICY "Users can view tournament teams"
  ON tournament_teams FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_teams.tournament_id
      AND tournaments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create tournament teams"
  ON tournament_teams FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_teams.tournament_id
      AND tournaments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tournament teams"
  ON tournament_teams FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_teams.tournament_id
      AND tournaments.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_teams.tournament_id
      AND tournaments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tournament teams"
  ON tournament_teams FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tournaments
      WHERE tournaments.id = tournament_teams.tournament_id
      AND tournaments.user_id = auth.uid()
    )
  );

-- RLS Policies for matches table
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own matches"
  ON matches FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for innings table
CREATE POLICY "Users can view innings from own matches"
  ON innings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = innings.match_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create innings for own matches"
  ON innings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = innings.match_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update innings from own matches"
  ON innings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = innings.match_id
      AND matches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = innings.match_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete innings from own matches"
  ON innings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM matches
      WHERE matches.id = innings.match_id
      AND matches.user_id = auth.uid()
    )
  );

-- RLS Policies for batting_scores table
CREATE POLICY "Users can view batting scores from own matches"
  ON batting_scores FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = batting_scores.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create batting scores for own matches"
  ON batting_scores FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = batting_scores.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update batting scores from own matches"
  ON batting_scores FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = batting_scores.innings_id
      AND matches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = batting_scores.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete batting scores from own matches"
  ON batting_scores FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = batting_scores.innings_id
      AND matches.user_id = auth.uid()
    )
  );

-- RLS Policies for bowling_figures table
CREATE POLICY "Users can view bowling figures from own matches"
  ON bowling_figures FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = bowling_figures.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create bowling figures for own matches"
  ON bowling_figures FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = bowling_figures.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update bowling figures from own matches"
  ON bowling_figures FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = bowling_figures.innings_id
      AND matches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = bowling_figures.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete bowling figures from own matches"
  ON bowling_figures FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = bowling_figures.innings_id
      AND matches.user_id = auth.uid()
    )
  );

-- RLS Policies for ball_by_ball table
CREATE POLICY "Users can view ball by ball from own matches"
  ON ball_by_ball FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = ball_by_ball.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create ball by ball for own matches"
  ON ball_by_ball FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = ball_by_ball.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update ball by ball from own matches"
  ON ball_by_ball FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = ball_by_ball.innings_id
      AND matches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = ball_by_ball.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete ball by ball from own matches"
  ON ball_by_ball FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = ball_by_ball.innings_id
      AND matches.user_id = auth.uid()
    )
  );

-- RLS Policies for partnerships table
CREATE POLICY "Users can view partnerships from own matches"
  ON partnerships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = partnerships.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create partnerships for own matches"
  ON partnerships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = partnerships.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update partnerships from own matches"
  ON partnerships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = partnerships.innings_id
      AND matches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = partnerships.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete partnerships from own matches"
  ON partnerships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = partnerships.innings_id
      AND matches.user_id = auth.uid()
    )
  );

-- RLS Policies for fall_of_wickets table
CREATE POLICY "Users can view fall of wickets from own matches"
  ON fall_of_wickets FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = fall_of_wickets.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create fall of wickets for own matches"
  ON fall_of_wickets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = fall_of_wickets.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update fall of wickets from own matches"
  ON fall_of_wickets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = fall_of_wickets.innings_id
      AND matches.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = fall_of_wickets.innings_id
      AND matches.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete fall of wickets from own matches"
  ON fall_of_wickets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM innings
      JOIN matches ON matches.id = innings.match_id
      WHERE innings.id = fall_of_wickets.innings_id
      AND matches.user_id = auth.uid()
    )
  );