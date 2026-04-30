export interface LeaderboardEntry {
  user_id:          string;
  display_name:     string | null;
  avatar_url:       string | null;
  company_name:     string | null;
  team_name:        string | null;
  total_hadith_read: number;
  total_points:     number;
  virtual_coins:    number;
  trophies_count:   number;
  current_level:    number;
  current_streak:   number;
  rank:             number;
}

export interface CompanyLeaderboardEntry {
  company_name:     string;
  total_users:      number;
  total_hadith_read: number;
  total_points:     number;
  virtual_coins:    number;
  trophies_count:   number;
  rank:             number;
}
