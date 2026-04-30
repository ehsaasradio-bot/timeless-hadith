export interface Hadith {
  id:           string;
  hadith_number: string;
  in_book_ref:  string;
  text_en:      string;
  text_ar:      string;
  urdu:         string;
  narrator:     string;
  book_name_en: string;
  chapter_en:   string;
  quick_read:   string;
}

export interface ReadState {
  isRead:    boolean;
  isLoading: boolean;
  result:    {
    pointsEarned:    number;
    coinsEarned:     number;
    currentLevel:    number;
    trophiesCount:   number;
  } | null;
}
