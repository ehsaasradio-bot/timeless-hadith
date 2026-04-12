/* ─────────────────────────────────────────────────────────────
   Timeless Hadith — Content Database
   Extend this file to add categories and hadiths.
───────────────────────────────────────────────────────────── */

const TH = {

  /* ── Categories ─────────────────────────────────────────── */
  categories: [
    { slug:'faith-belief', title:'Faith & Belief',            desc:'Strengthen your connection with Allah.',                  count:5  },
    { slug:'character-conduct', title:'Character & Conduct',        desc:'Live with purpose and excellent character.',              count:4  },
    { slug:'prayer-worship', title:'Prayer & Worship',           desc:'Deepen devotion through consistent worship.',             count:4  },
    { slug:'family-relations', title:'Family & Relations',         desc:'Build a home rooted in mercy and love.',                 count:3  },
    { slug:'knowledge-learning', title:'Knowledge & Learning',       desc:'Seek knowledge from the cradle to the grave.',            count:3  },
    { slug:'patience-gratitude', title:'Patience & Gratitude',       desc:'Find strength in patience and thankfulness.',             count:3  },
    { slug:'charity-generosity', title:'Charity & Generosity',       desc:'Give freely and watch blessings multiply.',               count:3  },
    { slug:'honesty-truthfulness', title:'Honesty & Truthfulness',     desc:'Let your word be your bond.',                            count:2  },
    { slug:'repentance-forgiveness', title:'Repentance & Forgiveness',   desc:'Turn back to Allah at any moment.',                       count:3  },
    { slug:'health-body', title:'Health & Body',              desc:'Your body has rights over you.',                         count:2  },
    { slug:'neighbours-community', title:'Neighbours & Community',     desc:'Be the best neighbour on your street.',                  count:2  },
    { slug:'death-afterlife', title:'Death & Afterlife',          desc:'Prepare today for what comes after.',                    count:2  },
    { slug:'remembrance-allah', title:'Remembrance of Allah',       desc:'Keep your tongue moist with dhikr.',                     count:3  },
    { slug:'wealth-livelihood', title:'Wealth & Livelihood',        desc:'Earn lawfully and spend wisely.',                        count:2  },
    { slug:'justice-fairness', title:'Justice & Fairness',         desc:'Stand firmly for what is right.',                        count:2  },
    { slug:'intentions-actions', title:'Intentions & Actions',       desc:'Actions are judged by intentions.',                      count:2  },
    { slug:'fasting-ramadan', title:'Fasting & Ramadan',          desc:'Fast with your whole being.',                            count:3  },
    { slug:'humility-pride', title:'Humility & Pride',           desc:'True greatness lies in humility.',                       count:2  },
    { slug:'love-brotherhood', title:'Love & Brotherhood',         desc:'You are not a believer until you love for others.',      count:3  },
    { slug:'supplication-dua', title:'Supplication & Dua',         desc:'Call upon Allah — He is always listening.',              count:3  },
    { slug:'trust-allah', title:'Trust & Reliance on Allah',  desc:'Tie your camel, then put your trust in Allah.',         count:2  },
  ],

  /* ── Narrators (for filter) ──────────────────────────────── */
  narrators: [
    'Abu Huraira (RA)', 'Umar ibn al-Khattab (RA)', 'Anas ibn Malik (RA)',
    'Aisha (RA)', 'Ibn Abbas (RA)', 'Ibn Umar (RA)', 'Abdullah ibn Masud (RA)',
    'Uthman ibn Affan (RA)', 'Abu Dharr (RA)', 'Suhayb (RA)',
    'Abu Musa (RA)', 'Malik ibn al-Huwairith (RA)',
  ],

  /* ── Hadiths ─────────────────────────────────────────────── */
  hadiths: {

    'faith-belief': [
      {
        id:'fb-001',
        arabic:'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
        english:'Actions are judged by intentions, and each person will have what they intended.',
        narrator:'Umar ibn al-Khattab (RA)', source:'Sahih al-Bukhari', number:'1', urdu:'اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو وہی ملتا ہے جس کی اس نے نیت کی۔',
        authenticity:'Sahih', subcategory:'Iman', urdu:'اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو وہی ملتا ہے جس کی اس نے نیت کی۔'
      },
      {
        id:'fb-002',
        arabic:'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ',
        english:'Islam is built on five pillars: testifying that there is no god but Allah and that Muhammad is the messenger of Allah, establishing prayer, paying Zakat, performing Hajj, and fasting Ramadan.',
        narrator:'Ibn Umar (RA)', source:'Sahih al-Bukhari', number:'8',
        authenticity:'Sahih', subcategory:'Pillars of Islam'
      },
      {
        id:'fb-003',
        arabic:'الإِيمَانُ أَنْ تُؤْمِنَ بِاللَّهِ، وَمَلاَئِكَتِهِ، وَكُتُبِهِ، وَرُسُلِهِ، وَالْيَوْمِ الآخِرِ، وَتُؤْمِنَ بِالْقَدَرِ خَيْرِهِ وَشَرِّهِ',
        english:'Faith is to believe in Allah, His angels, His Books, His Messengers, the Last Day, and to believe in divine decree — both the good and the evil of it.',
        narrator:'Umar ibn al-Khattab (RA)', source:'Sahih Muslim', number:'8',
        authenticity:'Sahih', subcategory:'Iman', urdu:'اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو وہی ملتا ہے جس کی اس نے نیت کی۔'
      },
      {
        id:'fb-004',
        arabic:'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى أَكُونَ أَحَبَّ إِلَيْهِ مِنْ وَالِدِهِ وَوَلَدِهِ وَالنَّاسِ أَجْمَعِينَ',
        english:'None of you truly believes until I am more beloved to him than his father, his son, and all of mankind.',
        narrator:'Anas ibn Malik (RA)', source:'Sahih al-Bukhari', number:'15',
        authenticity:'Sahih', subcategory:'Iman', urdu:'اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو وہی ملتا ہے جس کی اس نے نیت کی۔'
      },
      {
        id:'fb-005',
        arabic:'الإِيمَانُ بِضْعٌ وَسَبْعُونَ شُعْبَةً، فَأَفْضَلُهَا قَوْلُ لاَ إِلَهَ إِلاَّ اللَّهُ، وَأَدْنَاهَا إِمَاطَةُ الأَذَى عَنِ الطَّرِيقِ',
        english:'Faith has seventy-odd branches. The highest is the statement "There is no god but Allah," and the lowest is removing something harmful from the road.',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'9',
        authenticity:'Sahih', subcategory:'Iman', urdu:'اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو وہی ملتا ہے جس کی اس نے نیت کی۔'
      },
    ],

    'character-conduct': [
      {
        id:'cc-001',
        arabic:'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ مَكَارِمَ الأَخْلاَقِ',
        english:'I was sent only to perfect good character.',
        narrator:'Abu Huraira (RA)', source:'Al-Muwatta', number:'1614',
        authenticity:'Sahih', subcategory:'Manners'
      },
      {
        id:'cc-002',
        arabic:'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
        english:'A Muslim is the one from whose tongue and hands the Muslims are safe.',
        narrator:'Abdullah ibn Amr (RA)', source:'Sahih al-Bukhari', number:'10',
        authenticity:'Sahih', subcategory:'Manners'
      },
      {
        id:'cc-003',
        arabic:'أَكْمَلُ الْمُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
        english:'The most complete of the believers in faith are those with the best character.',
        narrator:'Abu Huraira (RA)', source:'Sunan Abi Dawud', number:'4682',
        authenticity:'Sahih', subcategory:'Manners'
      },
      {
        id:'cc-004',
        arabic:'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
        english:'Fear Allah wherever you are, follow a bad deed with a good deed and it will erase it, and treat people with good character.',
        narrator:'Abu Dharr (RA)', source:'Jami at-Tirmidhi', number:'1987',
        authenticity:'Hasan', subcategory:'Manners'
      },
    ],

    'prayer-worship': [
      {
        id:'pw-001',
        arabic:'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي',
        english:'Pray as you have seen me pray.',
        narrator:'Malik ibn al-Huwairith (RA)', source:'Sahih al-Bukhari', number:'631',
        authenticity:'Sahih', subcategory:'Salah'
      },
      {
        id:'pw-002',
        arabic:'أَوَّلُ مَا يُحَاسَبُ بِهِ الْعَبْدُ يَوْمَ الْقِيَامَةِ صَلاَتُهُ',
        english:'The first thing a person will be called to account for on the Day of Judgment is the prayer.',
        narrator:'Abu Huraira (RA)', source:'Sunan an-Nasai', number:'466',
        authenticity:'Sahih', subcategory:'Salah'
      },
      {
        id:'pw-003',
        arabic:'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ فَأَكْثِرُوا الدُّعَاءَ',
        english:'The closest a servant is to his Lord is when he is in prostration, so make plenty of supplication.',
        narrator:'Abu Huraira (RA)', source:'Sahih Muslim', number:'482',
        authenticity:'Sahih', subcategory:'Salah'
      },
      {
        id:'pw-004',
        arabic:'الصَّلَاةُ نُورٌ، وَالصَّدَقَةُ بُرْهَانٌ، وَالصَّبْرُ ضِيَاءٌ',
        english:'Prayer is a light, charity is a proof, and patience is a radiance.',
        narrator:'Abu Malik al-Ashari (RA)', source:'Sahih Muslim', number:'223',
        authenticity:'Sahih', subcategory:'Salah'
      },
    ],

    'family-relations': [
      {
        id:'fa-001',
        arabic:'خَيْرُكُمْ خَيْرُكُمْ لأَهْلِهِ وَأَنَا خَيْرُكُمْ لأَهْلِي',
        english:'The best of you is the one who is best to his family, and I am the best of you to my family.',
        narrator:'Aisha (RA)', source:'Jami at-Tirmidhi', number:'3895',
        authenticity:'Sahih', subcategory:'Marriage'
      },
      {
        id:'fa-002',
        arabic:'الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ',
        english:'Paradise lies under the feet of mothers.',
        narrator:'Muawiyah ibn Jahimah (RA)', source:'Sunan an-Nasai', number:'3104',
        authenticity:'Hasan', subcategory:'Parents Rights'
      },
      {
        id:'fa-003',
        arabic:'مَنْ أَحَبَّ أَنْ يُبْسَطَ لَهُ فِي رِزْقِهِ وَيُنْسَأَ لَهُ فِي أَجَلِهِ فَلْيَصِلْ رَحِمَهُ',
        english:'Whoever wishes to have his provision expanded and his lifespan extended, let him maintain ties of kinship.',
        narrator:'Anas ibn Malik (RA)', source:'Sahih al-Bukhari', number:'5986',
        authenticity:'Sahih', subcategory:'Kinship'
      },
    ],

    'knowledge-learning': [
      {
        id:'kl-001',
        arabic:'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
        english:'Seeking knowledge is an obligation upon every Muslim.',
        narrator:'Anas ibn Malik (RA)', source:'Sunan Ibn Majah', number:'224',
        authenticity:'Sahih', subcategory:'Seeking Knowledge'
      },
      {
        id:'kl-002',
        arabic:'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
        english:'The best of you are those who learn the Quran and teach it.',
        narrator:'Uthman ibn Affan (RA)', source:'Sahih al-Bukhari', number:'5027',
        authenticity:'Sahih', subcategory:'Teaching'
      },
      {
        id:'kl-003',
        arabic:'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ',
        english:'Whoever treads a path seeking knowledge, Allah will make easy for him a path to Paradise.',
        narrator:'Abu Huraira (RA)', source:'Sahih Muslim', number:'2699',
        authenticity:'Sahih', subcategory:'Seeking Knowledge'
      },
    ],

    'patience-gratitude': [
      {
        id:'pg-001',
        arabic:'عَجَبًا لأَمْرِ الْمُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ',
        english:'How wonderful is the affair of the believer — his affair is all good. If something good happens to him, he gives thanks and that is good for him. If something bad happens to him, he bears it with patience and that is good for him.',
        narrator:'Suhayb (RA)', source:'Sahih Muslim', number:'2999',
        authenticity:'Sahih', subcategory:'Sabr'
      },
      {
        id:'pg-002',
        arabic:'مَا يُصِيبُ الْمُسْلِمَ مِنْ نَصَبٍ وَلاَ وَصَبٍ وَلاَ هَمٍّ وَلاَ حُزْنٍ وَلاَ أَذًى وَلاَ غَمٍّ، حَتَّى الشَّوْكَةِ يُشَاكُهَا، إِلاَّ كَفَّرَ اللَّهُ بِهَا مِنْ خَطَايَاهُ',
        english:'No fatigue, illness, sorrow, grief, harm, or distress befalls a Muslim — not even a thorn that pricks him — except that Allah expiates some of his sins by it.',
        narrator:'Abu Said and Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'5641',
        authenticity:'Sahih', subcategory:'Sabr'
      },
      {
        id:'pg-003',
        arabic:'مَنْ لاَ يَشْكُرِ النَّاسَ لاَ يَشْكُرِ اللَّهَ',
        english:'Whoever does not thank people does not thank Allah.',
        narrator:'Abu Huraira (RA)', source:'Sunan Abi Dawud', number:'4811',
        authenticity:'Sahih', subcategory:'Shukr'
      },
    ],

    'charity-generosity': [
      {
        id:'cg-001',
        arabic:'مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ',
        english:'Charity does not decrease wealth.',
        narrator:'Abu Huraira (RA)', source:'Sahih Muslim', number:'2588',
        authenticity:'Sahih', subcategory:'Sadaqah'
      },
      {
        id:'cg-002',
        arabic:'اتَّقُوا النَّارَ وَلَوْ بِشِقِّ تَمْرَةٍ',
        english:'Protect yourselves from the Fire even by giving half a date in charity.',
        narrator:'Adi ibn Hatim (RA)', source:'Sahih al-Bukhari', number:'1417',
        authenticity:'Sahih', subcategory:'Sadaqah'
      },
      {
        id:'cg-003',
        arabic:'أَفْضَلُ الصَّدَقَةِ أَنْ تَصَّدَّقَ وَأَنْتَ صَحِيحٌ شَحِيحٌ تَأْمُلُ الْغِنَى وَتَخْشَى الْفَقْرَ',
        english:'The best charity is that which you give when you are in good health, when you desire wealth and fear poverty.',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'1419',
        authenticity:'Sahih', subcategory:'Sadaqah'
      },
    ],

    'honesty-truthfulness': [
      {
        id:'ht-001',
        arabic:'عَلَيْكُمْ بِالصِّدْقِ فَإِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ، وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ',
        english:'Hold fast to honesty, for honesty leads to righteousness, and righteousness leads to Paradise.',
        narrator:'Abdullah ibn Masud (RA)', source:'Sahih al-Bukhari', number:'6094',
        authenticity:'Sahih', subcategory:'Truthfulness'
      },
      {
        id:'ht-002',
        arabic:'عَلَيْكُمْ بِالصِّدْقِ وَإِيَّاكُمْ وَالْكَذِبَ فَإِنَّ الْكَذِبَ يَهْدِي إِلَى الْفُجُورِ، وَإِنَّ الْفُجُورَ يَهْدِي إِلَى النَّارِ',
        english:'You must be truthful, and beware of lying, for lying leads to wickedness, and wickedness leads to the Fire.',
        narrator:'Abdullah ibn Masud (RA)', source:'Sahih al-Bukhari', number:'6094',
        authenticity:'Sahih', subcategory:'Truthfulness'
      },
    ],

    'repentance-forgiveness': [
      {
        id:'rf-001',
        arabic:'إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ، وَيَبْسُطُ يَدَهُ بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ',
        english:'Allah extends His hand at night so that the one who sinned during the day may repent, and He extends His hand during the day so that the one who sinned during the night may repent.',
        narrator:'Abu Musa al-Ashari (RA)', source:'Sahih Muslim', number:'2759',
        authenticity:'Sahih', subcategory:'Tawbah'
      },
      {
        id:'rf-002',
        arabic:'كُلُّ ابْنِ آدَمَ خَطَّاءٌ، وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ',
        english:'Every son of Adam makes mistakes, and the best of those who make mistakes are those who repent.',
        narrator:'Anas ibn Malik (RA)', source:'Sunan Ibn Majah', number:'4251',
        authenticity:'Hasan', subcategory:'Tawbah'
      },
      {
        id:'rf-003',
        arabic:'التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لاَ ذَنْبَ لَهُ',
        english:'The one who repents from sin is like the one who has no sin.',
        narrator:'Ibn Majah (RA)', source:'Sunan Ibn Majah', number:'4250',
        authenticity:'Hasan', subcategory:'Tawbah'
      },
    ],

    'health-body': [
      {
        id:'hb-001',
        arabic:'نِعْمَتَانِ مَغْبُونٌ فِيهِمَا كَثِيرٌ مِنَ النَّاسِ: الصِّحَّةُ وَالْفَرَاغُ',
        english:'Two blessings many people are deceived into taking for granted — health and free time.',
        narrator:'Ibn Abbas (RA)', source:'Sahih al-Bukhari', number:'6412',
        authenticity:'Sahih', subcategory:'Wellbeing'
      },
      {
        id:'hb-002',
        arabic:'إِنَّ لِجَسَدِكَ عَلَيْكَ حَقًّا',
        english:'Your body has a right over you.',
        narrator:'Abdullah ibn Amr (RA)', source:'Sahih al-Bukhari', number:'1975',
        authenticity:'Sahih', subcategory:'Wellbeing'
      },
    ],

    'neighbours-community': [
      {
        id:'nc-001',
        arabic:'مَا زَالَ جِبْرِيلُ يُوصِينِي بِالْجَارِ حَتَّى ظَنَنْتُ أَنَّهُ سَيُوَرِّثُهُ',
        english:'Jibril kept advising me to treat neighbours well until I thought he would make them heirs.',
        narrator:'Aisha (RA)', source:'Sahih al-Bukhari', number:'6014',
        authenticity:'Sahih', subcategory:'Rights of Neighbours'
      },
      {
        id:'nc-002',
        arabic:'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ جَارَهُ',
        english:'Whoever believes in Allah and the Last Day, let him honour his neighbour.',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'6019',
        authenticity:'Sahih', subcategory:'Rights of Neighbours'
      },
    ],

    'death-afterlife': [
      {
        id:'da-001',
        arabic:'أَكْثِرُوا ذِكْرَ هَاذِمِ اللَّذَّاتِ — يَعْنِي الْمَوْتَ',
        english:'Frequently remember the destroyer of pleasures — meaning death.',
        narrator:'Abu Huraira (RA)', source:'Jami at-Tirmidhi', number:'2307',
        authenticity:'Hasan', subcategory:'The Grave'
      },
      {
        id:'da-002',
        arabic:'الدُّنْيَا سِجْنُ الْمُؤْمِنِ وَجَنَّةُ الْكَافِرِ',
        english:'This world is a prison for the believer and a paradise for the disbeliever.',
        narrator:'Abu Huraira (RA)', source:'Sahih Muslim', number:'2956',
        authenticity:'Sahih', subcategory:'Hereafter'
      },
    ],

    'remembrance-allah': [
      {
        id:'ra-001',
        arabic:'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
        english:'Two words are light on the tongue, heavy on the scale, and beloved to the Most Merciful: "Glory be to Allah and His praise" and "Glory be to Allah, the Mighty."',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'6406',
        authenticity:'Sahih', subcategory:'Tasbeeh'
      },
      {
        id:'ra-002',
        arabic:'مَثَلُ الَّذِي يَذْكُرُ رَبَّهُ وَالَّذِي لاَ يَذْكُرُ رَبَّهُ مَثَلُ الْحَيِّ وَالْمَيِّتِ',
        english:'The likeness of the one who remembers his Lord and the one who does not remember his Lord is like the living and the dead.',
        narrator:'Abu Musa (RA)', source:'Sahih al-Bukhari', number:'6407',
        authenticity:'Sahih', subcategory:'Dhikr'
      },
      {
        id:'ra-003',
        arabic:'أَفْضَلُ الذِّكْرِ لاَ إِلَهَ إِلاَّ اللَّهُ',
        english:'The best remembrance is "There is no god but Allah."',
        narrator:'Jabir (RA)', source:'Jami at-Tirmidhi', number:'3383',
        authenticity:'Sahih', subcategory:'Dhikr'
      },
    ],

    'wealth-livelihood': [
      {
        id:'wl-001',
        arabic:'لَيْسَ الْغِنَى عَنْ كَثْرَةِ الْعَرَضِ، وَلَكِنَّ الْغِنَى غِنَى النَّفْسِ',
        english:'Wealth is not in having many possessions — true wealth is the richness of the soul.',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'6446',
        authenticity:'Sahih', subcategory:'Contentment'
      },
      {
        id:'wl-002',
        arabic:'مَا أَكَلَ أَحَدٌ طَعَامًا قَطُّ خَيْرًا مِنْ أَنْ يَأْكُلَ مِنْ عَمَلِ يَدِهِ',
        english:'No one has ever eaten better food than that which he earned by the work of his own hands.',
        narrator:'Miqdad (RA)', source:'Sahih al-Bukhari', number:'2072',
        authenticity:'Sahih', subcategory:'Halal Earnings'
      },
    ],

    'justice-fairness': [
      {
        id:'jf-001',
        arabic:'إِنَّ الْمُقْسِطِينَ عِنْدَ اللَّهِ عَلَى مَنَابِرَ مِنْ نُورٍ',
        english:'Those who are just will be on pulpits of light before Allah.',
        narrator:'Abdullah ibn Amr (RA)', source:'Sahih Muslim', number:'1827',
        authenticity:'Sahih', subcategory:'Equality'
      },
      {
        id:'jf-002',
        arabic:'انْصُرْ أَخَاكَ ظَالِمًا أَوْ مَظْلُومًا',
        english:'Help your brother, whether he is the oppressor or the oppressed.',
        narrator:'Anas ibn Malik (RA)', source:'Sahih al-Bukhari', number:'2444',
        authenticity:'Sahih', subcategory:'Rights'
      },
    ],

    'intentions-actions': [
      {
        id:'ia-001',
        arabic:'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
        english:'Actions are judged by intentions, and each person will have what they intended.',
        narrator:'Umar ibn al-Khattab (RA)', source:'Sahih al-Bukhari', number:'1', urdu:'اعمال کا دارومدار نیتوں پر ہے، اور ہر شخص کو وہی ملتا ہے جس کی اس نے نیت کی۔',
        authenticity:'Sahih', subcategory:'Niyyah'
      },
      {
        id:'ia-002',
        arabic:'إِنَّ اللَّهَ لاَ يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
        english:'Allah does not look at your forms or your wealth, but He looks at your hearts and your deeds.',
        narrator:'Abu Huraira (RA)', source:'Sahih Muslim', number:'2564',
        authenticity:'Sahih', subcategory:'Sincerity'
      },
    ],

    'fasting-ramadan': [
      {
        id:'fr-001',
        arabic:'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
        english:'Whoever fasts Ramadan out of faith and hoping for reward, his past sins will be forgiven.',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'38',
        authenticity:'Sahih', subcategory:'Ramadan'
      },
      {
        id:'fr-002',
        arabic:'الصَّوْمُ جُنَّةٌ فَلاَ يَرْفُثْ وَلاَ يَجْهَلْ',
        english:'Fasting is a shield, so let him not commit immorality or act in an ignorant manner.',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'1904',
        authenticity:'Sahih', subcategory:'Ramadan'
      },
      {
        id:'fr-003',
        arabic:'إِذَا جَاءَ رَمَضَانُ فُتِّحَتْ أَبْوَابُ الْجَنَّةِ، وَغُلِّقَتْ أَبْوَابُ النَّارِ، وَصُفِّدَتِ الشَّيَاطِينُ',
        english:'When Ramadan comes, the gates of Paradise are opened, the gates of Hellfire are closed, and the devils are chained.',
        narrator:'Abu Huraira (RA)', source:'Sahih al-Bukhari', number:'1899',
        authenticity:'Sahih', subcategory:'Ramadan'
      },
    ],

    'humility-pride': [
      {
        id:'hp-001',
        arabic:'مَنْ تَوَاضَعَ لِلَّهِ رَفَعَهُ اللَّهُ',
        english:'Whoever humbles himself for Allah, Allah will elevate him.',
        narrator:'Abu Huraira (RA)', source:'Sahih Muslim', number:'2588',
        authenticity:'Sahih', subcategory:'Avoiding Arrogance'
      },
      {
        id:'hp-002',
        arabic:'لاَ يَدْخُلُ الْجَنَّةَ مَنْ كَانَ فِي قَلْبِهِ مِثْقَالُ ذَرَّةٍ مِنْ كِبْرٍ',
        english:'No one who has even an atom of arrogance in his heart will enter Paradise.',
        narrator:'Abdullah ibn Masud (RA)', source:'Sahih Muslim', number:'91',
        authenticity:'Sahih', subcategory:'Avoiding Arrogance'
      },
    ],

    'love-brotherhood': [
      {
        id:'lb-001',
        arabic:'لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
        english:'None of you will have faith until he loves for his brother what he loves for himself.',
        narrator:'Anas ibn Malik (RA)', source:'Sahih al-Bukhari', number:'13',
        authenticity:'Sahih', subcategory:'Brotherhood'
      },
      {
        id:'lb-002',
        arabic:'الْمُؤْمِنُ لِلْمُؤْمِنِ كَالْبُنْيَانِ يَشُدُّ بَعْضُهُ بَعْضًا',
        english:'A believer to another believer is like a building — each part strengthens the other.',
        narrator:'Abu Musa (RA)', source:'Sahih al-Bukhari', number:'481',
        authenticity:'Sahih', subcategory:'Brotherhood'
      },
      {
        id:'lb-003',
        arabic:'أَفْشُوا السَّلاَمَ بَيْنَكُمْ',
        english:'Spread greetings of peace among yourselves.',
        narrator:'Abu Huraira (RA)', source:'Sahih Muslim', number:'54',
        authenticity:'Sahih', subcategory:'Salam'
      },
    ],

    'supplication-dua': [
      {
        id:'sd-001',
        arabic:'الدُّعَاءُ هُوَ الْعِبَادَةُ',
        english:'Supplication is worship.',
        narrator:'Nu\'man ibn Bashir (RA)', source:'Sunan Abi Dawud', number:'1479',
        authenticity:'Sahih', subcategory:'Etiquette of Dua'
      },
      {
        id:'sd-002',
        arabic:'إِنَّ اللَّهَ حَيِيٌّ كَرِيمٌ يَسْتَحِي إِذَا رَفَعَ الرَّجُلُ إِلَيْهِ يَدَيْهِ أَنْ يَرُدَّهُمَا صِفْرًا خَائِبَتَيْنِ',
        english:'Allah is Shy and Generous. He is shy, when a person raises his hands to Him, to return them empty and disappointed.',
        narrator:'Salman al-Farisi (RA)', source:'Sunan Abi Dawud', number:'1488',
        authenticity:'Sahih', subcategory:'Etiquette of Dua'
      },
      {
        id:'sd-003',
        arabic:'ادْعُوا اللَّهَ وَأَنْتُمْ مُوقِنُونَ بِالإِجَابَةِ',
        english:'Call upon Allah while being certain of His response.',
        narrator:'Abu Huraira (RA)', source:'Jami at-Tirmidhi', number:'3479',
        authenticity:'Hasan', subcategory:'Etiquette of Dua'
      },
    ],

    'trust-allah': [
      {
        id:'ta-001',
        arabic:'لَوْ أَنَّكُمْ كُنْتُمْ تَوَكَّلُونَ عَلَى اللَّهِ حَقَّ تَوَكُّلِهِ لَرَزَقَكُمْ كَمَا يَرْزُقُ الطَّيْرَ تَغْدُو خِمَاصًا وَتَرُوحُ بِطَانًا',
        english:'If you were to rely upon Allah with the reliance He deserves, He would provide for you as He provides for the birds — they leave in the morning hungry and return in the evening full.',
        narrator:'Umar ibn al-Khattab (RA)', source:'Jami at-Tirmidhi', number:'2344',
        authenticity:'Sahih', subcategory:'Tawakkul'
      },
      {
        id:'ta-002',
        arabic:'احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ',
        english:'Preserve Allah and He will preserve you. Preserve Allah and you will find Him before you.',
        narrator:'Ibn Abbas (RA)', source:'Jami at-Tirmidhi', number:'2516',
        authenticity:'Sahih', subcategory:'Tawakkul'
      },
    ],
  },

  /* ── Helper: get category by slug ── */
  getCat: slug => TH.categories.find(c => c.slug === slug),

  /* ── Helper: get hadiths for a slug ── */
  getHadiths: slug => TH.hadiths[slug] || [],

  /* ── Helper: find a hadith by id across all categories ── */
  findHadith: id => {
    for (const slug of Object.keys(TH.hadiths)) {
      const h = TH.hadiths[slug].find(h => h.id === id);
      if (h) return { hadith: h, slug, cat: TH.getCat(slug) };
    }
    return null;
  },
};
