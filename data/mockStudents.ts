// data/mockStudents.ts
export interface Student {
  id: string;
  name: string;
  group: string;
}

export const mockStudents: Student[] = [
  { id: 's1', name: 'Aliyev Bobur', group: '101-A' },
  { id: 's2', name: 'Karimova Dilnoza', group: '101-A' },
  { id: 's3', name: 'Rahimov Sardor', group: '101-A' },
  { id: 's4', name: 'Toshmatova Nodira', group: '101-A' },
  { id: 's5', name: 'Yusupov Jasur', group: '101-A' },
  { id: 's6', name: 'Abdullayeva Malika', group: '102-B' },
  { id: 's7', name: 'Hamidov Akbar', group: '102-B' },
  { id: 's8', name: 'Nurmatova Zilola', group: '102-B' },
  { id: 's9', name: 'Sharipov Otabek', group: '103-C' },
  { id: 's10', name: 'Ibragimova Sevara', group: '103-C' },
  { id: 's11', name: 'Qodirov Aziz', group: '101-A' },
  { id: 's12', name: 'Salimova Laylo', group: '101-A' },
];

export const mockTopics: Record<string, string[]> = {
  'Matematika': [
    'Limit va uzluksizlik',
    'Hosilalar va differensiallar',
    'Integrallar',
    'Differensial tenglamalar',
  ],
  'Ingliz tili': [
    'Present Simple tense',
    'Past Simple tense',
    'Future Simple tense',
    'Present Continuous',
  ],
  'Fizika': [
    'Mexanika asoslari',
    'Termodinamika',
    'Elektr va magnetizm',
    'Optika',
  ],
  'Tarix': [
    'O\'rta Osiyo tarixi',
    'Jadid harakati',
    'Mustaqillik davri',
    'Zamonaviy tarix',
  ],
  'Iqtisodiyot': [
    'Mikroiqtisodiyot',
    'Makroiqtisodiyot',
    'Bozor mexanizmlari',
    'Moliya asoslari',
  ],
};