export interface UserProfile {
  display_name: string;
  avatar_url:   string | null;
  company_name: string | null;
  team_name:    string | null;
}

export interface UserStats {
  total_hadith_read: number;
  total_points:      number;
  virtual_coins:     number;
  trophies_count:    number;
  current_level:     number;
  current_streak:    number;
  longest_streak:    number;
  daily_goal:        number;
}

export interface Achievement {
  unlocked_at: string;
  achievements: {
    badge_key:         string;
    badge_name:        string;
    badge_description: string;
    icon:              string;
  };
}

export interface DailyActivity {
  reading_date:     string;
  hadith_read_count: number;
  points_earned:    number;
}

export interface CollectionProgress {
  collection_name: string;
  read_count:      number;
}

export interface DashboardData {
  profile:            UserProfile;
  stats:              UserStats;
  recent:             Array<Record<string, unknown>>;
  achievements:       Achievement[];
  collectionProgress: CollectionProgress[];
  weeklyActivity:     DailyActivity[];
}
