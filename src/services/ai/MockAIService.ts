import type { AssistantMode } from '@/types';
import type { AIRequest, AIResponse, AIService } from './AIService';

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

interface TopicEntry {
  keywords: string[];
  topic: string;
  answer: string;
  summary: string[];
  explain: string;
  review: string[];
}

// Түлхүүр үгээр сэдэв таних энгийн mock мэдлэгийн сан
const TOPICS: TopicEntry[] = [
  {
    keywords: ['sql', 'join', 'өгөгдлийн сан', 'database', 'хүснэгт', 'query'],
    topic: 'SQL ба өгөгдлийн сан',
    answer: 'SQL нь хамааралтай өгөгдлийн сантай ажиллах хэл. SELECT-ээр унших, INSERT/UPDATE/DELETE-ээр өөрчлөх, JOIN-оор хүснэгтүүдийг холбоно.',
    summary: ['Хүснэгт бүр primary key-тэй', 'Foreign key хүснэгтүүдийг холбоно', 'JOIN төрлүүд: INNER, LEFT, RIGHT, FULL', 'GROUP BY + HAVING агрегат шүүлт'],
    explain: 'JOIN-ыг хоёр жагсаалтыг "холбох түлхүүрээр" нийлүүлэх гэж төсөөл: оюутны жагсаалт ба дүнгийн жагсаалтыг оюутны кодоор нь тааруулна.',
    review: ['INNER ба LEFT JOIN-ийн ялгааг жишээгээр бич', '3 хүснэгт холбосон query бич', 'WHERE ба HAVING-ийн ялгааг тайлбарла'],
  },
  {
    keywords: ['react', 'native', 'expo', 'component', 'state', 'hook', 'мобайл'],
    topic: 'React Native',
    answer: 'React Native нь JavaScript/TypeScript ашиглан Android ба iOS апп хөгжүүлэх framework. UI-г component-уудаас бүтээж, төлөвийг hook-оор удирдана.',
    summary: ['Component = UI-ийн дахин ашиглагдах хэсэг', 'useState — дотоод төлөв', 'useEffect — side effect', 'Expo Router — file-based navigation'],
    explain: 'Component-ийг LEGO шоо гэж бод: жижиг хэсгүүдийг (Button, Card) нийлүүлж том дэлгэц угсарна.',
    review: ['useState ба useEffect-ийг ашигласан жишээ бич', 'FlatList ба ScrollView-ийн ялгаа', 'Props ба state-ийн ялгаа'],
  },
  {
    keywords: ['hci', 'ux', 'ui', 'usability', 'хэрэглэгч', 'nielsen', 'дизайн', 'prototype'],
    topic: 'Хүн-компьютерын харилцаа',
    answer: 'HCI нь хэрэглэгч системтэй хэрхэн харилцдагийг судалж, хэрэглэхэд хялбар интерфейс зохиоход чиглэдэг.',
    summary: ['Nielsen-ийн 10 зарчим', 'Хэрэглэгч төвтэй дизайн (UCD)', 'Usability test — 5 хэрэглэгч', 'Lo-fi → Hi-fi prototype'],
    explain: 'Сайн интерфейс бол сайн хаалганы бариул шиг — заавар уншихгүйгээр яаж ашиглахаа ойлгодог.',
    review: ['Nielsen-ийн 5 зарчмыг жишээтэй нэрлэ', 'Өөрийн ашигладаг аппын нэг UX алдааг шинжил', 'Fitts-ийн хуулийг тайлбарла'],
  },
  {
    keywords: ['data mining', 'олборлолт', 'decision tree', 'cluster', 'rapidminer', 'model', 'загвар', 'classification'],
    topic: 'Өгөгдөл олборлолт',
    answer: 'Өгөгдөл олборлолт нь их хэмжээний өгөгдлөөс зүй тогтол, загвар илрүүлэх процесс. Classification, clustering, association rule гол аргууд.',
    summary: ['CRISP-DM үе шатууд', 'Classification — ангилал таамаглах', 'Clustering — бүлэглэх', 'Accuracy, precision, recall үнэлгээ'],
    explain: 'Decision tree-г "20 асуулт" тоглоом шиг төсөөл: асуулт бүрээр өгөгдлийг хувааж эцэст нь ангилалд хүрнэ.',
    review: ['Overfitting гэж юу вэ?', 'Confusion matrix-ээс precision тооцоол', 'Feature selection яагаад хэрэгтэй вэ?'],
  },
];

const FALLBACK: TopicEntry = {
  keywords: [],
  topic: 'ерөнхий сэдэв',
  answer: 'Энэ асуултад зориулсан бэлэн mock хариулт алга. Бодит AI холбогдсон үед энд дэлгэрэнгүй хариулт гарна.',
  summary: ['Гол ойлголтуудаа жагсаа', 'Тодорхойлолт бүрт жишээ олоорой', 'Өөрийн үгээр тайлбарлаж бич'],
  explain: 'Сэдвээ 5 настай хүүхдэд тайлбарлах мэт энгийнээр бичиж үзээрэй (Feynman техник).',
  review: ['Сэдвийн 3 гол ойлголтыг бич', '1 өдрийн дараа дахин давт', 'Өөрөөсөө 3 асуулт асуу'],
};

function detect(prompt: string): TopicEntry {
  const p = prompt.toLowerCase();
  return TOPICS.find((t) => t.keywords.some((k) => p.includes(k))) ?? FALLBACK;
}

function build(mode: AssistantMode, t: TopicEntry, prompt: string): string {
  switch (mode) {
    case 'summary':
      return `📝 Хураангуй — ${t.topic}\n\n${t.summary.map((s) => `• ${s}`).join('\n')}`;
    case 'explain':
      return `💡 Энгийн тайлбар — ${t.topic}\n\n${t.explain}`;
    case 'review':
      return `🔁 Давтлагын санал — ${t.topic}\n\n${t.review.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nЗөвлөмж: 1, 3, 7 хоногийн дараа давтаарай.`;
    default:
      return `${t.answer}\n\nТаны асуулт: “${prompt.trim()}”`;
  }
}

export class MockAIService implements AIService {
  async ask(req: AIRequest): Promise<AIResponse> {
    await wait(700 + Math.random() * 600); // сүлжээний хүлээлтийг дуурайна
    return { text: build(req.mode, detect(req.prompt), req.prompt), isMock: true };
  }
}
