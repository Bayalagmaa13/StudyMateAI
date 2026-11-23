# StudyMate AI 📚

Оюутанд хичээлээ төлөвлөх, даалгаврын хугацааг хянах, шалгалтад бэлтгэх, хичээлийн агуулгыг давтахад туслах **Android mobile application**.

> Mobile Programming · Project Challenge · Эхний хувилбар (mock AI)

## Ашигласан технологи

| Технологи | Зориулалт |
|---|---|
| React Native 0.88 + Expo SDK 58 | Android апп хөгжүүлэлт |
| TypeScript (strict) | Төрлийн алдааг эрт илрүүлэх |
| Expo Router | File-based navigation (5 tab + stack дэлгэцүүд) |
| Zustand + AsyncStorage | Төлөвийн удирдлага, өгөгдлийг төхөөрөмж дээр хадгалах |
| Supabase (PostgreSQL) | Schema + RLS бэлтгэсэн, `.env`-ээр холбогдоно |
| Mock AI service | `AIService` interface → дараа нь бодит API-аар солих боломжтой |
| expo-keep-awake | Pomodoro таймерын үед дэлгэц унтрахаас сэргийлэх |

## Суулгах, ажиллуулах

Шаардлага: **Node.js 20+**, Android утсан дээр **Expo Go** апп (Play Store), эсвэл Android Studio emulator.

```bash
cd StudyMateAI
npm install
npx expo start
```

- Утас: Expo Go апп-аар терминал дээрх **QR кодыг** уншуулна (компьютер, утас нэг Wi-Fi-д байх ёстой).
  Нэг сүлжээнд холбогдохгүй бол: `npx expo start --tunnel`
- Emulator: терминал дээр **`a`** товч дарна.
- Төрлийн шалгалт: `npm run typecheck`

### Supabase холбох (сонголттой)
1. supabase.com дээр төсөл үүсгэнэ.
2. SQL Editor дээр `supabase/schema.sql`-ийг ажиллуулна (5 хүснэгт + RLS policy + trigger).
3. `.env.example`-ийг `.env` нэрээр хуулж URL ба anon key-г бичнэ.
4. Аппыг дахин эхлүүлнэ. Профайл → Системийн төлөв хэсэгт "Тохируулсан" гэж гарна.

API түлхүүрийг кодонд шууд бичээгүй. `.env` файл `.gitignore`-д орсон.

## Хэрэгжүүлсэн функцууд

| Код | Модуль | Хэрэгжилт |
|---|---|---|
| FR-01 | Нүүр хуудас | Өнөөдрийн даалгавар, ойртож буй хугацаа, чухал ажлын тоолуур, гүйцэтгэлийн %, streak, хурдан үйлдэл |
| FR-02 | Хичээлийн удирдлага | Нэмэх / харах / засах / устгах, өнгө сонгох, давхардсан нэрийн шалгалт |
| FR-03 | Даалгаврын төлөвлөгч | Нэмэх, засах, устгах (баталгаажуулалттай), хугацаа, ач холбогдол, дууссан төлөв, 5 шүүлтүүр + хичээлээр шүүх |
| FR-04 | AI Study Assistant | Чат, 4 горим (асуулт / хураангуй / тайлбар / давтлага), **"DEMO · Mock хариулт"** шошго |
| FR-05 | Quiz | 3 quiz × 5 асуулт, сонголт, шууд feedback, тайлбар, оноо, үр дүнгийн дэлгэц, хариултын тойм |
| FR-06 | Ахицын мэдээлэл | Дууссан даалгавар, quiz дундаж, 7 хоногийн график, 28 хоногийн идэвхийн календарь, хичээл тус бүрийн ахиц |
| FR-07 | Профайл | Нэр, и-мэйл засах (validation), суралцах тохиргоо, системийн төлөв, demo өгөгдөл сэргээх |

### Нэмэлт функцууд
1. **Pomodoro төвлөрөх таймер.** Хичээл сонгож 25/5 минутын циклээр ажиллана. Дууссан session `study_sessions`-д бүртгэгдэнэ.
2. **Өдөр тутмын зорилго ба streak .** Дараалсан идэвхтэй өдрүүдийг тоолж, өдрийн минутын зорилгыг Нүүр дэлгэцэд харуулна.
3. **Идэвхийн heatmap календарь.** Сүүлийн 28 хоногийн суралцалтыг өнгөөр харуулна.
4. **Алдааны давтлага.** Quiz-д буруу хариулсан асуултууд автоматаар цугларч, тусдаа давтлагын quiz болно. Зөв хариулсан асуулт жагсаалтаас хасагдана.

Эдгээр функц бүгд хоорондоо холбоотой: Pomodoro → study_sessions → Ахицын график, heatmap, streak, Нүүрийн зорилго.

## Төслийн бүтэц

```
src/
  app/                    ← Expo Router дэлгэцүүд
    (tabs)/               ← Нүүр, Төлөвлөгч, AI Tutor, Quiz, Ахиц
    task/[id].tsx         ← Даалгавар нэмэх/засах форм
    subject/[id].tsx      ← Хичээл нэмэх/засах форм
    quiz/[id].tsx         ← Quiz ажиллуулах (+ "mistakes" горим)
    quiz/result.tsx       ← Үр дүн
    pomodoro.tsx          ← Бонус: Pomodoro
    profile.tsx           ← Профайл ба тохиргоо
  components/             ← Дахин ашиглагдах UI (Card, Button, Chip, TaskItem, Screen…)
  store/useAppStore.ts    ← Zustand store (CRUD үйлдлүүд + AsyncStorage persist)
  services/ai/            ← AIService interface + MockAIService
  services/db/            ← Supabase repository (дараагийн шатанд бэлтгэсэн)
  lib/supabase.ts         ← Supabase client (.env-ээс)
  data/                   ← Mock өгөгдөл, quiz-ийн асуултууд
  types/                  ← TypeScript төрлүүд (DB schema-тай ижил)
  utils/                  ← Огноо, статистик тооцоолол
supabase/schema.sql       ← Хүснэгтүүд, RLS policy, trigger
```

## Mock AI-г бодит API-аар солих
`src/services/ai/AIService.ts` дахь interface-ийг хэрэгжүүлсэн класс бичээд `src/services/ai/index.ts`-ийн нэг мөрийг солино:
```ts
export const aiService: AIService = new RealAIService();
```
Дэлгэцийн кодыг өөрчлөх шаардлагагүй.

## Цаашдын сайжруулалт
- Supabase Auth (нэвтрэх/бүртгүүлэх) болон өгөгдлийг үүлэнд синк хийх
- Бодит AI API (хураангуй, quiz автоматаар үүсгэх)
- Push notification: даалгаврын хугацаа дуусахаас өмнө сануулах
- Dark mode, олон хэлний дэмжлэг
