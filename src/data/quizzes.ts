import type { Quiz, QuizQuestion } from '@/types';

export const QUIZZES: Quiz[] = [
  {
    id: 'rn-basics',
    title: 'React Native үндэс',
    subjectName: 'Мобайл програмчлал',
    questions: [
      {
        id: 'rn1',
        question: 'React Native-д жагсаалтыг хамгийн үр ашигтай харуулах component аль нь вэ?',
        options: ['ScrollView', 'FlatList', 'View', 'Text'],
        correctIndex: 1,
        explanation: 'FlatList нь зөвхөн дэлгэцэд харагдаж буй мөрүүдийг render хийдэг тул урт жагсаалтад тохиромжтой.',
      },
      {
        id: 'rn2',
        question: 'Expo Router-т дэлгэц хэрхэн тодорхойлогддог вэ?',
        options: ['App.tsx дотор бүртгэнэ', 'app/ хавтас дахь файл бүр нэг дэлгэц', 'Redux store-оор', 'AndroidManifest.xml-ээр'],
        correctIndex: 1,
        explanation: 'Expo Router бол file-based routing: app/ хавтас дахь файл бүр route болно.',
      },
      {
        id: 'rn3',
        question: 'Component-ийн дотоод төлөвийг хадгалах React hook аль нь вэ?',
        options: ['useEffect', 'useMemo', 'useState', 'useRef'],
        correctIndex: 2,
        explanation: 'useState нь төлөв болон түүнийг өөрчлөх функцийг буцаана.',
      },
      {
        id: 'rn4',
        question: 'TypeScript ашиглах гол давуу тал юу вэ?',
        options: ['Апп хурдан ажиллана', 'Төрлийн алдааг ажиллуулахаас өмнө илрүүлнэ', 'Native код шаардлагагүй болно', 'Зураг шахна'],
        correctIndex: 1,
        explanation: 'TypeScript нь compile хийх үед төрлийн алдааг илрүүлж, кодыг ойлгомжтой болгоно.',
      },
      {
        id: 'rn5',
        question: 'React Native-д style-ыг юугаар бичдэг вэ?',
        options: ['CSS файлаар', 'StyleSheet.create объектоор', 'XML layout-оор', 'SASS-аар'],
        correctIndex: 1,
        explanation: 'StyleSheet.create нь JavaScript объект хэлбэрээр style тодорхойлно (flexbox дээр суурилсан).',
      },
    ],
  },
  {
    id: 'db-sql',
    title: 'Өгөгдлийн сан ба SQL',
    subjectName: 'Өгөгдлийн сан',
    questions: [
      {
        id: 'db1',
        question: 'Primary key-ийн гол шинж чанар юу вэ?',
        options: ['NULL байж болно', 'Давхардсан утгатай байж болно', 'Мөр бүрийг давтагдашгүй ялгана', 'Зөвхөн текст байна'],
        correctIndex: 2,
        explanation: 'Primary key нь UNIQUE ба NOT NULL байж, мөр бүрийг өвөрмөц тодорхойлно.',
      },
      {
        id: 'db2',
        question: 'Хоёр хүснэгтийн зөвхөн тохирох мөрүүдийг буцаах JOIN аль нь вэ?',
        options: ['LEFT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN'],
        correctIndex: 1,
        explanation: 'INNER JOIN нь хоёр талд нөхцөл биелсэн мөрүүдийг л буцаана.',
      },
      {
        id: 'db3',
        question: 'Supabase-ийн Row Level Security (RLS) юунд хэрэгтэй вэ?',
        options: ['Query хурдасгах', 'Хэрэглэгч зөвхөн өөрийн мөрийг харах/засах эрх', 'Backup хийх', 'Индекс үүсгэх'],
        correctIndex: 1,
        explanation: 'RLS policy (жишээ нь auth.uid() = user_id) нь мөр түвшний хандалтыг хязгаарлана.',
      },
      {
        id: 'db4',
        question: 'Бүлэглэсэн өгөгдөл дээр нөхцөл тавих түлхүүр үг аль нь вэ?',
        options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
        correctIndex: 1,
        explanation: 'HAVING нь GROUP BY-ийн дараах агрегат үр дүнг шүүнэ; WHERE нь бүлэглэхээс өмнө шүүнэ.',
      },
      {
        id: 'db5',
        question: '3NF-ийн гол шаардлага юу вэ?',
        options: ['Давхардсан хүснэгт байх', 'Transitive dependency байхгүй', 'Бүх багана текст', 'Foreign key хэрэглэхгүй'],
        correctIndex: 1,
        explanation: '3NF: 2NF-д байх ба key биш атрибут бусад key биш атрибутаас хамаарахгүй.',
      },
    ],
  },
  {
    id: 'hci',
    title: 'HCI зарчмууд',
    subjectName: 'Хүн-компьютерын харилцаа',
    questions: [
      {
        id: 'h1',
        question: 'Nielsen-ийн зарчмуудын нэг "Visibility of system status" юуг хэлдэг вэ?',
        options: ['Системийн өнгө тод байх', 'Систем юу хийж буйгаа хэрэглэгчид мэдэгдэх', 'Бүх цэс нээлттэй байх', 'Нууц үг харагдах'],
        correctIndex: 1,
        explanation: 'Систем хэрэглэгчид тохирох хугацаанд эргэх мэдээлэл (loading, амжилттай гэх мэт) өгөх ёстой.',
      },
      {
        id: 'h2',
        question: 'Fitts-ийн хууль юуг тайлбарладаг вэ?',
        options: ['Өнгөний ялгарал', 'Зорилтот объект руу хүрэх хугацаа нь зай ба хэмжээнээс хамаарна', 'Санах ойн багтаамж', 'Уншах хурд'],
        correctIndex: 1,
        explanation: 'Том, ойр товчлуурыг дарахад хурдан — иймээс mobile-д товчлуурыг хангалттай том хийнэ.',
      },
      {
        id: 'h3',
        question: 'Usability test-д хамгийн багадаа хэдэн хэрэглэгч ихэнх асуудлыг илрүүлдэг гэж Nielsen үзсэн бэ?',
        options: ['1', '5', '50', '100'],
        correctIndex: 1,
        explanation: '5 хэрэглэгч ойролцоогоор 85% асуудлыг илрүүлдэг гэсэн алдартай дүгнэлт бий.',
      },
      {
        id: 'h4',
        question: 'Mobile дээр хүрэлтийн (touch target) зөвлөмжит хамгийн бага хэмжээ?',
        options: ['12dp', '24dp', '48dp', '96dp'],
        correctIndex: 2,
        explanation: 'Material Design 48×48dp хамгийн бага touch target зөвлөдөг.',
      },
      {
        id: 'h5',
        question: 'Lo-fi prototype-ийн гол давуу тал?',
        options: ['Бэлэн бүтээгдэхүүн болно', 'Хурдан, хямд, санааг эрт турших', 'Код автоматаар үүснэ', 'Анимэйшн сайн'],
        correctIndex: 1,
        explanation: 'Цаасан/энгийн загвар нь хөгжүүлэлтээс өмнө санааг хямдаар шалгах боломж өгнө.',
      },
    ],
  },
];

export function findQuiz(id: string): Quiz | undefined {
  return QUIZZES.find((q) => q.id === id);
}

export function findQuestion(questionId: string): { quiz: Quiz; question: QuizQuestion } | undefined {
  for (const quiz of QUIZZES) {
    const question = quiz.questions.find((q) => q.id === questionId);
    if (question) return { quiz, question };
  }
  return undefined;
}
