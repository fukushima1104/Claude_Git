import type {
  Advice,
  Goal,
  LearningRecord,
  PrivacySettings,
  SelfReview,
  TranscriptLine,
  UserProfile,
  ReflectionAnswers,
} from './types';

/** プロトタイプ内での「今日」。モックデータの基準日。 */
export const TODAY = '2026-09-20';

export const USER: UserProfile = {
  name: '田中 悠介',
  department: '営業推進部',
  joinedYear: 2021,
  managerName: '森本 理恵',
};

/**
 * 文字起こしを回答から組み立てる。
 * 実物では音声認識の結果が入るが、プロトタイプでは
 * 「ナビの質問 → 本人の回答」の往復として再現する。
 */
function buildTranscript(
  answers: ReflectionAnswers,
  followUps: Partial<Record<keyof ReflectionAnswers, [string, string]>> = {},
): TranscriptLine[] {
  const prompts: Record<keyof ReflectionAnswers, string> = {
    learning: '今日の学びのなかで、いちばん心に残ったことは何ですか。',
    apply: 'その学びは、ご自分の仕事のどこで活かせそうですか。',
    action: 'では、次にやってみることをひとつだけ決めるとしたら何にしますか。',
  };
  const lines: TranscriptLine[] = [];
  let at = 4;
  (['learning', 'apply', 'action'] as const).forEach((q) => {
    lines.push({ at, speaker: 'navi', text: prompts[q], question: q });
    at += 8;
    lines.push({ at, speaker: 'me', text: answers[q], question: q });
    at += Math.max(30, Math.round(answers[q].length / 2.6));
    const fu = followUps[q];
    if (fu) {
      lines.push({
        at,
        speaker: 'navi',
        text: fu[0],
        question: q,
        isFollowUp: true,
      });
      at += 7;
      lines.push({ at, speaker: 'me', text: fu[1], question: q });
      at += Math.max(25, Math.round(fu[1].length / 2.6));
    }
  });
  return lines;
}

type Seed = {
  id: string;
  kind: LearningRecord['kind'];
  title: string;
  date: string;
  organizer: string;
  memo: string;
  tags: string[];
  answers: ReflectionAnswers;
  followUps?: Partial<Record<keyof ReflectionAnswers, [string, string]>>;
  durationSec: number;
  /** 受講日から何日後に振り返ったか */
  reflectedAfterDays?: number;
  visibility?: LearningRecord['visibility'];
  laterNotes?: LearningRecord['laterNotes'];
};

function addDays(date: string, days: number): string {
  const d = new Date(`${date}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 振り返り済みの記録。直近1年分。新しい順に並べている。 */
const DONE_SEEDS: Seed[] = [
  {
    id: 'r-2609-01',
    kind: 'internal',
    title: '提案書レビュー会(下期キックオフ)',
    date: '2026-09-08',
    organizer: '営業推進部',
    memo: '自分の提案書を題材にしてもらった。指摘が多くて少し落ち込んだ。',
    tags: ['提案力', '伝え方', 'フィードバック'],
    answers: {
      learning:
        '提案書の「課題設定」が弱いと、そのあとの解決策がどれだけ丁寧でも読み手に届かない、ということが分かりました。自分では解決策のページに一番時間をかけていたのですが、レビューではほとんどが最初の2ページへの指摘でした。お客様の言葉をそのまま使わずに、自分の言葉で言い換えてしまっていたのも原因だと言われて、確かにと思いました。',
      apply:
        '担当している製造業のお客様への提案が来月にあるので、まず課題設定のページだけを先に書いて、先輩にレビューしてもらう進め方に変えます。これまでは全部書き上げてから見せていたので、直す量が多くなりすぎていました。ヒアリングのメモから、お客様が実際に使った言葉を抜き出して使うようにします。',
      action:
        '次の提案書は、課題設定の1枚だけを先に作って、10月上旬に先輩の鈴木さんにレビューしてもらいます。',
    },
    followUps: {
      learning: [
        'もう少しだけ伺わせてください。「そうか」と思えた瞬間は、どんな場面でしたか。',
        '鈴木さんが「この提案書、誰の課題なの?」と聞いたときです。自分で答えられなくて、そこで初めて自分が書いていたのは会社の課題ではなく、業界一般の話だったと気づきました。',
      ],
    },
    durationSec: 412,
    reflectedAfterDays: 0,
    laterNotes: [
      {
        date: '2026-09-15',
        text: '課題設定の1枚だけ持っていったら、レビューが15分で終わった。早く見せるほうが楽だった。',
      },
    ],
  },
  {
    id: 'r-2608-01',
    kind: 'external',
    title: 'データドリブン営業 実践講座',
    date: '2026-08-21',
    organizer: '日本ビジネス研修センター',
    memo: '2日間。SQLの基礎とダッシュボードの読み方。',
    tags: ['データ活用', '分析', '営業'],
    answers: {
      learning:
        '数字を「見る」ことと「読む」ことは違う、という話が印象的でした。これまでは受注率や商談数をダッシュボードで眺めていただけでしたが、講師の方が「その数字が動いた理由を3つ挙げられますか」と問いかけたときに、自分が何も説明できないことに気づきました。数字は結論ではなく、質問のきっかけなのだと理解しました。',
      apply:
        '週次の営業会議で、自分の担当領域の数字を報告する場面があります。いまは「今週は商談が5件でした」と事実を言うだけになっているので、そこに「なぜそうなったと考えているか」を必ず1つ添えるようにします。間違っていてもいいので、仮説を口に出すところから始めます。',
      action:
        '毎週の営業会議で、担当数字の変化について仮説を1つ添えて報告します。まず10月末まで続けてみます。',
    },
    durationSec: 496,
    reflectedAfterDays: 1,
    visibility: 'manager',
  },
  {
    id: 'r-2607-01',
    kind: 'study',
    title: '社内勉強会「生成AIを日々の業務でどう使うか」',
    date: '2026-07-16',
    organizer: '有志(DX推進室)',
    memo: '昼休みの1時間。実際の使用例の共有がメイン。',
    tags: ['生成AI', '業務改善', '学び合い'],
    answers: {
      learning:
        '他の部署の方が、議事録の要約だけでなく「反対意見を出させる」使い方をしていたのが面白かったです。自分は文章を作らせることばかり考えていましたが、考えを壁打ちする相手として使うという発想がありませんでした。',
      apply:
        '提案書を作るとき、自分ひとりで考えていると視点が偏るので、書いたものに対して反対意見を挙げてもらう使い方を試します。先輩の時間を取る前の、下ごしらえとして使えそうです。',
      action:
        '次の提案書の草案ができた段階で、反対意見を10個出させて、そのうち自分が答えられないものを整理します。',
    },
    followUps: {
      apply: [
        'ありがとうございます。いま抱えている仕事のなかで、いちばん近いものはどれでしょうか。',
        '製造業向けの提案です。自分が業界に詳しくないので、思い込みで書いてしまっている部分が多いと思っていて、そこを突いてもらいたいです。',
      ],
    },
    durationSec: 318,
    reflectedAfterDays: 0,
  },
  {
    id: 'r-2606-01',
    kind: 'internal',
    title: '中堅社員向け リーダーシップ研修',
    date: '2026-06-25',
    organizer: '人事部',
    memo: '入社5〜7年目が対象。ケーススタディ中心。',
    tags: ['リーダーシップ', '対話', '育成'],
    answers: {
      learning:
        'リーダーシップは役職ではなく、場に対する働きかけだという定義が腑に落ちました。ケーススタディで、自分が発言しない側に回っていたことに気づき、指摘されて初めて「黙っていることも場への影響なのだ」と分かりました。自分は後輩より経験があるのに、会議では遠慮して意見を言わないことが多いです。',
      apply:
        '来月から後輩の山田さんの指導担当になるので、まず自分が会議で発言する姿を見せることから始めます。あと、山田さんに指示を出すときに、答えを先に言わずに「どうしたらいいと思う?」と聞く形に変えてみます。',
      action:
        '山田さんとの週1回の面談で、こちらから答えを言う前に必ず本人の考えを先に聞きます。7月から始めます。',
    },
    durationSec: 534,
    reflectedAfterDays: 2,
    visibility: 'manager',
    laterNotes: [
      {
        date: '2026-08-03',
        text: '最初の3回はつい答えを言ってしまった。4回目から我慢できるようになった。沈黙が10秒続くと苦しいが、待つと出てくる。',
      },
    ],
  },
  {
    id: 'r-2605-02',
    kind: 'external',
    title: 'ファシリテーション基礎',
    date: '2026-05-28',
    organizer: 'コミュニケーション研究所',
    memo: '1日。ロールプレイが多め。',
    tags: ['対話', 'ファシリテーション', '会議'],
    answers: {
      learning:
        '会議で意見が出ないのは参加者のせいではなく、問いの立て方の問題だと学びました。「何か意見はありますか」という問いは答えにくく、「このやり方でうまくいかないとしたら、どこが原因になりそうですか」のように具体的に聞くと、途端に発言が増えることをロールプレイで体験しました。',
      apply:
        '自分が進行役をする定例会議で、議題ごとに問いを事前に用意しておくようにします。いまはアジェンダに項目名しか書いていないので、そこに問いの形で書き直します。',
      action:
        '次回から定例会議のアジェンダを、項目名ではなく問いの形で書きます。',
    },
    durationSec: 385,
    reflectedAfterDays: 0,
  },
  {
    id: 'r-2605-01',
    kind: 'study',
    title: '読書会「イシューからはじめよ」',
    date: '2026-05-13',
    organizer: '有志(営業推進部)',
    memo: '月1回の読書会。今回は第2章まで。',
    tags: ['課題設定', '思考法', '学び合い'],
    answers: {
      learning:
        '解くべき問題を選ぶことに時間をかけるべきで、解き方を磨くのはその後だという主張が、いまの自分に刺さりました。自分は資料を作る速さや見栄えを気にしていましたが、そもそも作るべき資料だったのかを考えていませんでした。',
      apply:
        '依頼された作業をすぐ始める前に、「これは何のためか」を一度確認する時間を取ります。特に上司から頼まれた資料作成は、目的を聞き返すようにします。',
      action:
        '依頼を受けたとき、着手前に目的と使われ方を確認する。まず2週間、意識して続けます。',
    },
    durationSec: 296,
    reflectedAfterDays: 1,
  },
  {
    id: 'r-2604-01',
    kind: 'internal',
    title: '新年度 コンプライアンス研修',
    date: '2026-04-09',
    organizer: '法務部',
    memo: '全社必須。eラーニング形式。',
    tags: ['コンプライアンス', '基礎知識'],
    answers: {
      learning:
        '個人情報の「持ち出し」は、USBメモリのような分かりやすい形だけでなく、自分の個人端末にメールを転送する行為も含まれると知りました。自宅で作業するために転送したことがあったので、危ないところでした。',
      apply:
        '在宅で作業したいときは、転送ではなく会社のリモート環境を使います。手間はかかりますが、判断に迷わなくて済みます。',
      action:
        '個人端末へのメール転送をやめ、リモート環境の使い方を今週中に確認します。',
    },
    durationSec: 214,
    reflectedAfterDays: 0,
  },
  {
    id: 'r-2603-01',
    kind: 'external',
    title: '提案書デザイン講座(伝わる資料のつくり方)',
    date: '2026-03-19',
    organizer: 'ビジュアルデザイン協会',
    memo: '半日。実際の資料を持ち込んで添削してもらった。',
    tags: ['伝え方', '提案力', '資料作成'],
    answers: {
      learning:
        '1枚のスライドで言いたいことは1つだけ、という原則を、自分の資料で実演されて納得しました。持ち込んだ資料は1枚に3つの主張が入っていて、講師の方に「どれが一番大事ですか」と聞かれて即答できませんでした。情報を減らすことが、相手への配慮になると理解しました。',
      apply:
        '提案書を作るとき、スライドごとに「このページで言いたいこと」を先に1行で書いてから中身を作る順番に変えます。作りながら考えるとどうしても盛り込みすぎてしまうので。',
      action:
        '次の提案書から、各ページの見出しを1行の主張として先に書き出す進め方を試します。',
    },
    durationSec: 358,
    reflectedAfterDays: 1,
  },
  {
    id: 'r-2602-01',
    kind: 'study',
    title: '社内勉強会「顧客インタビューの聞き方」',
    date: '2026-02-24',
    organizer: '有志(商品企画部)',
    memo: 'インタビューの録音を聞きながら、質問を分析した。',
    tags: ['対話', 'ヒアリング', '顧客理解'],
    answers: {
      learning:
        '自分の質問が「はい・いいえ」で終わる形になっていることが多い、と録音を聞いて分かりました。相手が話し始めたところで、自分が次の質問に移ってしまっているのも気になりました。沈黙を怖がっているのだと思います。',
      apply:
        'お客様との打ち合わせで、相手が話し終わったあとに3秒待つことを意識します。あと、質問リストを埋めることを目的にしないようにします。',
      action:
        '次回の顧客打ち合わせで、相手の発言のあとに3秒待つことを試します。',
    },
    durationSec: 272,
    reflectedAfterDays: 3,
  },
  {
    id: 'r-2601-01',
    kind: 'external',
    title: '業界動向セミナー(製造業のDX投資)',
    date: '2026-01-29',
    organizer: '産業経済リサーチ',
    memo: 'オンライン。2時間。',
    tags: ['業界知識', 'データ活用', '営業'],
    answers: {
      learning:
        '製造業のDX投資は、現場の省人化よりも「技能の継承」を目的にしたものが増えているという話が意外でした。自分は効率化の文脈でしか提案を考えていなかったので、視点が足りていませんでした。',
      apply:
        '担当している製造業のお客様に、効率化以外の切り口で話を聞いてみます。ベテランの方の退職が近い現場があると聞いていたので、そこから話を広げられそうです。',
      action:
        '次回の訪問で、技能継承についての困りごとを聞いてみます。2月中に。',
    },
    durationSec: 301,
    reflectedAfterDays: 1,
  },
  {
    id: 'r-2512-01',
    kind: 'internal',
    title: '下期振り返り会(部内共有)',
    date: '2025-12-17',
    organizer: '営業推進部',
    memo: '各自が半期の学びを5分で共有。',
    tags: ['振り返り', '伝え方', '学び合い'],
    answers: {
      learning:
        '他のメンバーの発表を聞いて、失敗をそのまま共有している人の話がいちばん参考になりました。自分の発表は、うまくいったことばかり並べていて、聞いている人には役に立たなかったと思います。',
      apply:
        '次に共有する機会があれば、うまくいかなかったことを1つは必ず入れます。チームの中で、失敗を話せる人が増えたほうが全体のためになると思いました。',
      action:
        '次回の共有では、失敗した事例を1つ入れて話します。',
    },
    durationSec: 243,
    reflectedAfterDays: 0,
  },
  {
    id: 'r-2511-01',
    kind: 'external',
    title: 'ロジカルシンキング研修',
    date: '2025-11-20',
    organizer: '日本ビジネス研修センター',
    memo: '1日。演習中心。',
    tags: ['思考法', '課題設定', '伝え方'],
    answers: {
      learning:
        '話が伝わらないのは、結論と根拠の関係があいまいだからだと分かりました。演習で自分の説明を図にしてみたら、根拠のつもりで話していたことが、実は結論の言い換えになっていました。',
      apply:
        '上司への報告のとき、結論を最初に言ってから根拠を3つ並べる形を徹底します。話しながら考えるのをやめます。',
      action:
        '報告の前に、結論と根拠3つをメモに書いてから話すようにします。12月いっぱい続けます。',
    },
    durationSec: 332,
    reflectedAfterDays: 2,
  },
  {
    id: 'r-2510-02',
    kind: 'study',
    title: '社内勉強会「SQLではじめるデータ確認」',
    date: '2025-10-30',
    organizer: '有志(DX推進室)',
    memo: '手を動かす回。SELECT文まで。',
    tags: ['データ活用', '分析', '学び合い'],
    answers: {
      learning:
        '自分でデータを見に行けると、人に依頼して待つ時間がなくなることを実感しました。これまで分析チームに依頼していた簡単な集計が、その場で出せたのが驚きでした。',
      apply:
        '営業会議の前に、自分の担当分の数字は自分で出すようにします。依頼の手間も減りますし、数字に触る回数が増えると思います。',
      action:
        '来月の営業会議の資料は、自分でデータを取得して作ります。',
    },
    durationSec: 261,
    reflectedAfterDays: 1,
  },
  {
    id: 'r-2510-01',
    kind: 'internal',
    title: '新人指導 基礎講座',
    date: '2025-10-08',
    organizer: '人事部',
    memo: '来年度の指導担当候補向け。',
    tags: ['育成', '対話', 'リーダーシップ'],
    answers: {
      learning:
        '教えることと、考えさせることは違うと学びました。自分は聞かれたらすぐ答えてしまうタイプなので、それだと相手が育たないという話が印象に残りました。',
      apply:
        '後輩から質問されたとき、すぐに答えずに「どこまで調べた?」と聞く癖をつけます。',
      action:
        '後輩からの質問に、まず質問で返すことを試します。',
    },
    durationSec: 228,
    reflectedAfterDays: 4,
  },
  {
    id: 'r-2509-01',
    kind: 'external',
    title: 'DX基礎研修(全社共通プログラム)',
    date: '2025-09-25',
    organizer: 'テクノロジー教育センター',
    memo: '入社5年目以降が対象。用語の整理が中心。',
    tags: ['データ活用', '基礎知識', '業務改善'],
    answers: {
      learning:
        'DXという言葉が、システムを入れることではなく、仕事の進め方そのものを変えることだと分かりました。用語は知っていたつもりでしたが、説明してくださいと言われると何も言えませんでした。',
      apply:
        '自分の担当業務で、紙とExcelで回している部分があるので、そこを見直す提案を考えてみます。',
      action:
        '担当業務のうち、手作業になっている工程を書き出してみます。',
    },
    durationSec: 198,
    reflectedAfterDays: 2,
  },
];

/** これから振り返る / 途中まで進んだ記録。 */
const OPEN_RECORDS: LearningRecord[] = [
  {
    id: 'r-2609-03',
    kind: 'external',
    title: '交渉力ワークショップ',
    date: '2026-09-18',
    organizer: 'ネゴシエーション・ラボ',
    memo: '1日。ロールプレイ中心で、録画を見ながらの振り返りがあった。',
    status: 'awaiting',
    tags: ['交渉', '対話'],
    visibility: 'self',
    laterNotes: [],
  },
  {
    id: 'r-2609-02',
    kind: 'study',
    title: '社内勉強会「チームの心理的安全性」',
    date: '2026-09-11',
    organizer: '有志(人事部)',
    memo: '事例の共有と、グループでの話し合い。',
    status: 'draft',
    tags: ['対話', 'チーム', '学び合い'],
    answers: {
      learning:
        '心理的安全性は「仲が良いこと」ではなく、言いにくいことを言える状態だと聞いて、自分の理解が違っていたと気づきました。うちのチームは雰囲気は良いですが、反対意見はあまり出ません。',
      apply: '',
      action: '',
    },
    transcript: [
      {
        at: 4,
        speaker: 'navi',
        text: '今日の学びのなかで、いちばん心に残ったことは何ですか。',
        question: 'learning',
      },
      {
        at: 12,
        speaker: 'me',
        text: '心理的安全性は「仲が良いこと」ではなく、言いにくいことを言える状態だと聞いて、自分の理解が違っていたと気づきました。うちのチームは雰囲気は良いですが、反対意見はあまり出ません。',
        question: 'learning',
      },
    ],
    durationSec: 61,
    visibility: 'self',
    laterNotes: [],
  },
];

function seedToRecord(seed: Seed): LearningRecord {
  return {
    id: seed.id,
    kind: seed.kind,
    title: seed.title,
    date: seed.date,
    organizer: seed.organizer,
    memo: seed.memo,
    status: 'done',
    tags: seed.tags,
    answers: seed.answers,
    transcript: buildTranscript(seed.answers, seed.followUps),
    durationSec: seed.durationSec,
    reflectedOn: addDays(seed.date, seed.reflectedAfterDays ?? 0),
    visibility: seed.visibility ?? 'self',
    laterNotes: seed.laterNotes ?? [],
  };
}

/** 全記録。新しい順。 */
export const RECORDS: LearningRecord[] = [
  ...OPEN_RECORDS,
  ...DONE_SEEDS.map(seedToRecord),
].sort((a, b) => (a.date < b.date ? 1 : -1));

export const GOALS: Goal[] = [
  {
    id: 'g-01',
    recordId: 'r-2609-01',
    title: '次の提案書は、課題設定の1枚だけを先に鈴木さんにレビューしてもらう',
    dueDate: '2026-10-09',
    status: 'inProgress',
    updates: [
      { date: '2026-09-15', note: '1枚だけ持っていった。15分で終わった。' },
    ],
  },
  {
    id: 'g-02',
    recordId: 'r-2608-01',
    title: '週次の営業会議で、担当数字の変化について仮説を1つ添えて報告する',
    dueDate: '2026-10-31',
    status: 'inProgress',
    updates: [
      { date: '2026-08-28', note: '1回目。仮説が外れていたが、その場で議論になった。' },
      { date: '2026-09-11', note: '3週続いた。数字を見る時間が自然と増えた。' },
    ],
  },
  {
    id: 'g-03',
    recordId: 'r-2607-01',
    title: '提案書の草案に対して反対意見を10個出させ、答えられないものを整理する',
    dueDate: '2026-09-30',
    status: 'notStarted',
    updates: [],
  },
  {
    id: 'g-04',
    recordId: 'r-2606-01',
    title: '山田さんとの面談で、答えを言う前に必ず本人の考えを先に聞く',
    dueDate: '2026-09-30',
    status: 'inProgress',
    updates: [
      { date: '2026-07-10', note: '初回。つい答えを言ってしまった。' },
      { date: '2026-08-03', note: '4回目から待てるようになった。沈黙10秒は苦しい。' },
      { date: '2026-09-04', note: '山田さんから先に案が出てくる回が増えた。' },
    ],
  },
  {
    id: 'g-05',
    recordId: 'r-2605-02',
    title: '定例会議のアジェンダを、項目名ではなく問いの形で書く',
    dueDate: '2026-06-30',
    status: 'achieved',
    updates: [
      { date: '2026-06-05', note: '3回続けた。最初の発言までの時間が明らかに短い。' },
      { date: '2026-06-26', note: '他のメンバーも同じ書き方をするようになった。' },
    ],
  },
  {
    id: 'g-06',
    recordId: 'r-2605-01',
    title: '依頼を受けたとき、着手前に目的と使われ方を確認する',
    dueDate: '2026-05-27',
    status: 'achieved',
    updates: [
      { date: '2026-05-27', note: '2週間続けた。作り直しが減ったので、そのまま習慣にする。' },
    ],
  },
  {
    id: 'g-07',
    recordId: 'r-2604-01',
    title: '個人端末へのメール転送をやめ、リモート環境の使い方を確認する',
    dueDate: '2026-04-17',
    status: 'achieved',
    updates: [{ date: '2026-04-15', note: '設定完了。転送はしていない。' }],
  },
  {
    id: 'g-08',
    recordId: 'r-2603-01',
    title: '提案書の各ページの見出しを、1行の主張として先に書き出す',
    dueDate: '2026-04-30',
    status: 'achieved',
    updates: [
      { date: '2026-04-02', note: '1本目。書き出しに時間はかかるが、後半が速い。' },
      { date: '2026-04-24', note: '3本目でだいぶ慣れた。' },
    ],
  },
  {
    id: 'g-09',
    recordId: 'r-2602-01',
    title: '顧客との打ち合わせで、相手の発言のあとに3秒待つ',
    dueDate: '2026-03-31',
    status: 'achieved',
    updates: [
      { date: '2026-03-10', note: '待つと、補足の情報が出てくることが多い。' },
    ],
  },
  {
    id: 'g-10',
    recordId: 'r-2601-01',
    title: '担当のお客様に、技能継承の困りごとを聞いてみる',
    dueDate: '2026-02-27',
    status: 'achieved',
    updates: [
      {
        date: '2026-02-19',
        note: 'ベテランの退職が2件あると分かった。別の提案につながりそう。',
      },
    ],
  },
  {
    id: 'g-11',
    recordId: 'r-2512-01',
    title: '次回の部内共有では、失敗した事例を1つ入れて話す',
    dueDate: '2026-06-30',
    status: 'revising',
    updates: [
      {
        date: '2026-06-30',
        note: '共有の場自体が下期に延期になった。時期を見直す。',
      },
    ],
  },
  {
    id: 'g-12',
    recordId: 'r-2511-01',
    title: '報告の前に、結論と根拠3つをメモに書いてから話す',
    dueDate: '2025-12-31',
    status: 'achieved',
    updates: [
      { date: '2025-12-12', note: 'メモなしだと話が長くなるのが自分でも分かる。' },
      { date: '2025-12-26', note: '1か月続いた。メモは1分で書けるようになった。' },
    ],
  },
  {
    id: 'g-13',
    recordId: 'r-2510-02',
    title: '営業会議の資料を、自分でデータを取得して作る',
    dueDate: '2025-11-28',
    status: 'achieved',
    updates: [
      { date: '2025-11-21', note: '2時間かかったが自力でできた。次はもっと速い。' },
    ],
  },
  {
    id: 'g-14',
    recordId: 'r-2510-01',
    title: '後輩からの質問に、まず質問で返す',
    dueDate: '2025-11-30',
    status: 'revising',
    updates: [
      {
        date: '2025-11-30',
        note: '急ぎの質問にまで質問で返して、かえって迷惑をかけた。場面を選ぶ形に見直す。',
      },
    ],
  },
  {
    id: 'g-15',
    recordId: 'r-2509-01',
    title: '担当業務のうち、手作業になっている工程を書き出す',
    dueDate: '2025-10-10',
    status: 'achieved',
    updates: [{ date: '2025-10-07', note: '11工程あった。うち4つは自動化できそう。' }],
  },
  {
    id: 'g-16',
    recordId: 'r-2608-01',
    title: 'ダッシュボードを週1回は自分で開いて、気になった数字をメモする',
    dueDate: '2026-10-31',
    status: 'inProgress',
    updates: [{ date: '2026-09-05', note: '習慣になりつつある。金曜の朝に見ている。' }],
  },
  {
    id: 'g-17',
    recordId: 'r-2606-01',
    title: '会議で、最初の5分以内に一度は発言する',
    dueDate: '2026-09-30',
    status: 'inProgress',
    updates: [
      { date: '2026-07-24', note: '意識しないと後半まで黙ってしまう。' },
      { date: '2026-09-02', note: '質問の形でなら言いやすいと分かった。' },
    ],
  },
  {
    id: 'g-18',
    recordId: 'r-2605-02',
    title: '進行役をした会議のあとに、参加者ひとりに感想を聞く',
    dueDate: '2026-07-31',
    status: 'notStarted',
    updates: [],
  },
  {
    id: 'g-19',
    recordId: 'r-2603-01',
    title: '過去の提案書を3本読み返して、伝わりにくい箇所を洗い出す',
    dueDate: '2026-05-15',
    status: 'notStarted',
    updates: [],
  },
  {
    id: 'g-20',
    recordId: 'r-2602-01',
    title: '打ち合わせの録音を聞き返して、自分の質問の型を確認する',
    dueDate: '2026-04-10',
    status: 'notStarted',
    updates: [],
  },
  {
    id: 'g-21',
    recordId: 'r-2511-01',
    title: 'メールの書き出しも、結論から書く形に変える',
    dueDate: '2026-01-31',
    status: 'achieved',
    updates: [{ date: '2026-01-23', note: '返信が速く返ってくるようになった気がする。' }],
  },
  {
    id: 'g-22',
    recordId: 'r-2510-01',
    title: '指導担当になる前に、山田さんの得意なことを3つ挙げられるようにする',
    dueDate: '2026-06-30',
    status: 'achieved',
    updates: [
      { date: '2026-06-18', note: '本人に聞いてみたら、自分の見立てと2つずれていた。' },
    ],
  },
];

export const SELF_REVIEWS: SelfReview[] = [
  {
    id: 'sr-01',
    from: '2025-09-01',
    to: '2026-03-31',
    label: '2025年度 下期',
    attainment: 'starting',
    grew:
      '人に伝えるときの組み立てが変わりました。結論から話す、根拠を3つ用意する、といったことが、意識しなくてもできる場面が増えました。データを自分で取りに行けるようになったのも、この半年の変化です。',
    next:
      '伝え方は良くなりましたが、そもそも何を伝えるべきかを見極める力が足りていません。課題設定のところを鍛えたいです。',
    createdOn: '2026-04-03',
  },
];

export const ADVICE: Advice[] = [
  {
    id: 'a-01',
    category: 'strength',
    headline: '「聞く」ことを、行動に変えて続けられています',
    body:
      '対話に関する学びが、そのつど具体的な行動に変わっています。3秒待つ、答えを言う前に聞く、問いの形でアジェンダを書く。どれも小さな行動ですが、半年以上にわたって別々の学びから同じ方向に積み上がっています。これは意識してできることではなく、あなたの関心がそこにあることの表れだと思います。',
    evidenceRecordIds: ['r-2602-01', 'r-2605-02', 'r-2606-01'],
    evidenceGoalIds: ['g-04', 'g-05', 'g-09'],
  },
  {
    id: 'a-02',
    category: 'potential',
    headline: '「課題を決める」ところに、同じ気づきが3回出てきています',
    body:
      '読書会、ロジカルシンキング研修、提案書レビュー会。時期も種類も違う3つの記録で、「解き方より、解くべきことを決めるほうが大事だった」という趣旨の言葉が出ています。同じ気づきが繰り返し出るのは、そこがまだ手応えになっていないからかもしれません。次に立てる行動目標を、この一点に絞ってみるのはどうでしょうか。',
    evidenceRecordIds: ['r-2605-01', 'r-2511-01', 'r-2609-01'],
    evidenceGoalIds: ['g-06'],
  },
  {
    id: 'a-03',
    category: 'next',
    headline: 'データの学びが、まだ行動の幅につながっていません',
    body:
      'データ活用の記録は3件あり、自分で数字を出せるようになるところまでは進んでいます。一方で、そこから生まれた行動目標は「数字を見る」「仮説を添える」にとどまっています。次は、その数字をお客様との会話にどう持ち込むかを学ぶと、営業の場面で効いてきそうです。社内の勉強会よりも、事例を扱う外部研修のほうが近いかもしれません。',
    evidenceRecordIds: ['r-2608-01', 'r-2510-02', 'r-2509-01'],
    evidenceGoalIds: ['g-02', 'g-16'],
  },
];

/** ホーム画面に出す「今週のひとこと」。 */
export const WEEKLY_NOTE =
  '先週は、山田さんとの面談で「先に聞く」を3回とも続けられていましたね。7月の自分と比べると、待てる時間が長くなっています。';

export const DEFAULT_PRIVACY: PrivacySettings = {
  retentionYears: 3,
  defaultVisibility: 'self',
  transcriptOnly: false,
  remindReflection: true,
  remindGoals: true,
};

/** タグの一覧(絞り込み用)。出現回数の多い順。 */
export const ALL_TAGS: string[] = Array.from(
  RECORDS.flatMap((r) => r.tags).reduce((m, t) => {
    m.set(t, (m.get(t) ?? 0) + 1);
    return m;
  }, new Map<string, number>()),
)
  .sort((a, b) => b[1] - a[1])
  .map(([tag]) => tag);
