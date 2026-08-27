/**
 * Imports the officially published FE 令和6年度 (2024) 公開問題 sets — 科目A (20 released
 * of 60) and 科目B (6 released of 20). Source:
 * https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/2024r06.html
 *
 * Excluded (diagram/graph structure not reliably recoverable from PDF text):
 * 科目A: Q13 (PERT/arrow diagram), Q19 (scatter plot).
 * 科目B: Q4 excluded — hand-tracing the merge() algorithm exactly as extracted from the
 * PDF (confirmed by running it programmatically) gives the α line executing once, which
 * contradicts the official answer key's "3 times" (エ). This is an unresolved discrepancy
 * that can't be reconciled from text alone, so it is deliberately left out rather than
 * guessed at.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const YEAR = 2024;
const KEY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"] as const;

type Q = {
  id: string;
  section: "A" | "B";
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  sourceUrl: string;
  sourcePage: string;
  questionNumber: string;
  body: string;
  choices: string[];
  correctIndex: number;
};

const BASE = "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att";
const A_URL = `${BASE}/2024r06_fe_kamoku_a_qs.pdf`;
const B_URL = `${BASE}/2024r06_fe_kamoku_b_qs.pdf`;

const QUESTIONS: Q[] = [
  {
    id: "FE-A-IPA-2024-Q01", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "2", questionNumber: "問1",
    body: "X及びYはそれぞれ0又は1の値をとる変数である。X□YをXとYの論理演算としたとき，次の真理値表が得られた。X□Yの真理値表はどれか。\n\n| X | Y | X AND (X□Y) | X OR (X□Y) |\n|---|---|---|---|\n| 0 | 0 | 0 | 1 |\n| 0 | 1 | 0 | 1 |\n| 1 | 0 | 0 | 1 |\n| 1 | 1 | 1 | 1 |",
    choices: [
      "(X,Y,X□Y) = (0,0,0),(0,1,0),(1,0,0),(1,1,1)",
      "(X,Y,X□Y) = (0,0,0),(0,1,1),(1,0,0),(1,1,1)",
      "(X,Y,X□Y) = (0,0,1),(0,1,1),(1,0,0),(1,1,1)",
      "(X,Y,X□Y) = (0,0,1),(0,1,1),(1,0,1),(1,1,0)",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2024-Q02", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "2", questionNumber: "問2",
    body: "キーが小文字のアルファベット1文字（a，b，…，zのいずれか）であるデータを，大きさが10のハッシュ表に格納する。ハッシュ関数として，アルファベットのASCIIコードを10進表記法で表したときの1の位の数を用いることにする。衝突が起こるキーの組合せはどれか。ASCIIコードでは，昇順に連続した2進数が，アルファベット順にコードとして割り当てられている。",
    choices: ["aとi", "bとr", "cとl", "dとx"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2024-Q03", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "3", questionNumber: "問3",
    body: "図に示す構成（CPU－キャッシュメモリ256kバイト－主記憶256Mバイト）で，表に示すようにキャッシュメモリと主記憶のアクセス時間だけが異なり，他の条件は同じ2種類のCPU XとYがある。\nCPU X：キャッシュメモリのアクセス時間40ナノ秒，主記憶のアクセス時間400ナノ秒\nCPU Y：キャッシュメモリのアクセス時間20ナノ秒，主記憶のアクセス時間580ナノ秒\nあるプログラムをCPU XとYとでそれぞれ実行したところ，両者の処理時間が等しかった。このとき，キャッシュメモリのヒット率は幾らか。ここで，CPU以外の処理による影響はないものとする。",
    choices: ["0.75", "0.90", "0.95", "0.96"], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2024-Q04", section: "A", topic: "システム構成要素", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "3", questionNumber: "問4",
    body: "あるシステムの今年度のMTBFは3,000時間，MTTRは1,000時間である。翌年度はMTBFについて今年度の20％分の改善，MTTRについて今年度の10％分の改善を図ると，翌年度の稼働率は何％になるか。",
    choices: ["69", "73", "77", "80"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2024-Q05", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問5",
    body: "複数のWebサービスの入出力処理を連結させて新たなサービスを提供する，「ロジックマッシュアップ」の例はどれか。",
    choices: [
      "利用者が選択した飲食店情報のページを表示する際に，他のWebサービスが提供する地図コンテンツをアクセスマップとして表示する。",
      "利用者が選択した投資商品の情報を表示する際に，関連する経済指標のデータを複数のWebサービスから取得し，グラフに加工して表示する。",
      "利用者が入力した予算の範囲で宿泊可能な施設のリストを他のWebサービスから取得し，それらの宿泊施設の空室状況を別のWebサービスから取得して表示する。",
      "利用者がマウスのドラッグで地図を操作した際に，Webページ全体ではなく一部を読み直すことによって地図をスクロールして表示する。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2024-Q06", section: "A", topic: "基礎理論", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問6",
    body: "液晶ディスプレイなどの表示装置において，傾いた直線の境界を滑らかに表示する手法はどれか。",
    choices: ["アンチエイリアシング", "シェーディング", "テクスチャマッピング", "バンプマッピング"], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2024-Q07", section: "A", topic: "データベース", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問7",
    body: "DBMSに実装すべき原子性（atomicity）を説明したものはどれか。",
    choices: [
      "同一データベースに対する同一処理は，何度実行しても結果は同じである。",
      "トランザクション完了後にハードウェア障害が発生しても，更新されたデータベースの内容は保証される。",
      "トランザクション内の処理は，全てが実行されるか，全てが取り消されるかのいずれかである。",
      "一つのトランザクションの処理結果は，他のトランザクション処理の影響を受けない。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2024-Q08", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問8",
    body: "LAN間接続装置に関する記述のうち，適切なものはどれか。",
    choices: [
      "ゲートウェイは，OSI基本参照モデルにおける第1～3層だけのプロトコルを変換する。",
      "ブリッジは，IPアドレスを基にしてフレームを中継する。",
      "リピータは，同種のセグメント間で信号を増幅することによって伝送距離を延長する。",
      "ルータは，MACアドレスを基にしてフレームを中継する。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2024-Q09", section: "A", topic: "セキュリティ", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問9",
    body: "ペネトレーションテストに該当するものはどれか。",
    choices: [
      "検査対象の実行プログラムの設計書，ソースコードに着目し，開発プロセスの各工程にセキュリティ上の問題がないかどうかをツールや目視で確認する。",
      "公開Webサーバの各コンテンツファイルのハッシュ値を管理し，定期的に各ファイルから生成したハッシュ値と一致するかどうかを確認する。",
      "公開Webサーバや組織のネットワークの脆弱性を探索し，サーバに実際に侵入できるかどうかを確認する。",
      "内部ネットワークのサーバやネットワーク機器のIPFIX情報から，各PCの通信に異常な振る舞いがないかどうかを確認する。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2024-Q10", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問10",
    body: "SQLインジェクションの対策として，有効なものはどれか。",
    choices: [
      "URLをWebページに出力するときは，「http://」や「https://」で始まるURLだけを許可する。",
      "外部からのパラメータでWebサーバ内のファイル名を直接指定しない。",
      "スタイルシートを任意のWebサイトから取り込めるようにしない。",
      "プレースホルダを使って命令文を組み立てる。",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2024-Q11", section: "A", topic: "システム開発技術", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "6", questionNumber: "問11",
    body: "階層構造のモジュール群から成るソフトウェアの結合テストを，上位のモジュールから行う。この場合に使用する，下位のモジュールの代替となるテスト用のモジュールはどれか。",
    choices: ["エミュレータ", "シミュレータ", "スタブ", "ドライバ"], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2024-Q12", section: "A", topic: "システム開発技術", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "6", questionNumber: "問12",
    body: "アジャイル開発手法の一つであるスクラムで定義され，スプリントで実施するイベントのうち，毎日決まった時間に決まった場所で行い，開発チームの全員が前回からの進捗状況や今後の作業計画を共有するものはどれか。",
    choices: ["スプリントプランニング", "スプリントレトロスペクティブ", "スプリントレビュー", "デイリースクラム"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2024-Q13", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問14",
    body: "システムの開発部門と運用部門が別々に組織化されているとき，システム開発を伴う新規サービスの設計及び移行を円滑かつ効果的に進めるための方法のうち，適切なものはどれか。",
    choices: [
      "運用テストの完了後に，開発部門がシステム仕様と運用方法を運用部門に説明する。",
      "運用テストは，開発部門の支援を受けずに，運用部門だけで実施する。",
      "運用部門からもシステムの運用に関わる要件の抽出に積極的に参加する。",
      "開発部門は運用テストを実施して，運用マニュアルを作成し，運用部門に引き渡す。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2024-Q14", section: "A", topic: "データベース", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問15",
    body: "ビッグデータ分析の前段階として，非構造化データを構造化データに加工する処理を記述している事例はどれか。",
    choices: [
      "関係データベースに蓄積された大量の財務データから必要な条件に合致するデータを抽出し，利用者が扱いやすい表計算ソフトウェアデータに加工する。",
      "個人情報を含むビッグデータを更に利活用するために，特定の個人を識別することができないように匿名化加工する。",
      "住所データ項目の中にある，「ヶ」と「が」の混在や，丁番地の表記不統一を，標準化された表記へ統一するために加工する。",
      "ソーシャルメディアの口コミを機械学習によって単語ごとに分解し，要約を作り，分析可能なデータに加工し，関係データベースに保管する。",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2024-Q15", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問16",
    body: "コアコンピタンスを説明したものはどれか。",
    choices: [
      "経営活動における基本精神や行動指針", "事業戦略の遂行によって達成すべき到達目標",
      "自社を取り巻く環境に関するビジネス上の機会と脅威", "他社との競争優位の源泉となる経営資源及び企業能力",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2024-Q16", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問17",
    body: "マーケティング戦略におけるブルーオーシャンの説明として，適切なものはどれか。",
    choices: [
      "競争が存在していない未知の市場", "コモディティ化が進んだ既存の市場",
      "新事業のアイディアを実際のビジネスに育成するまでの期間", "製品開発したものを市場化する過程に横たわっている障壁",
    ], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2024-Q17", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問18",
    body: "HRテックの説明はどれか。",
    choices: [
      "ICTを活用して，住宅内のエネルギー使用状況の監視，機器の遠隔操作や自動制御などを可能にし，家庭におけるエネルギー管理を支援するソリューション",
      "既存のビジネスモデルによる業界秩序や既得権益を破壊してしまうほど大きな影響を与える新しいICTやビジネスモデル",
      "個人の資金に関わる情報を統合的に管理するサービスやマーケットプレイス・レンディングなどの金融サービスを実現するための新しい情報技術",
      "採用，育成，評価，配属などの人事領域の業務を対象に，ビッグデータ解析やAIなどの最新ICTを活用して，業務改善と社員満足度向上を図るソリューション",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2024-Q18", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問20",
    body: "日本において，産業財産権と総称される四つの権利はどれか。",
    choices: [
      "意匠権，実用新案権，商標権，特許権", "意匠権，実用新案権，著作権，特許権",
      "意匠権，商標権，著作権，特許権", "実用新案権，商標権，著作権，特許権",
    ], correctIndex: 0,
  },

  // ---- 科目B ----
  {
    id: "FE-B-IPA-2024-Q01", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    sourceUrl: B_URL, sourcePage: "4", questionNumber: "問1",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 maximum は，異なる三つの整数を引数で受け取り，そのうちの最大値を返す。\n〔プログラム〕\n○整数型: maximum(整数型: x, 整数型: y, 整数型: z)\n　if (［　　］)\n　　return x\n　elseif (y ＞ z)\n　　return y\n　else\n　　return z\n　endif",
    choices: ["x ＞ y", "x ＞ y and x ＞ z", "x ＞ y and y ＞ z", "x ＞ z", "x ＞ z and z ＞ y", "z ＞ y"],
    correctIndex: 1,
  },
  {
    id: "FE-B-IPA-2024-Q02", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    sourceUrl: B_URL, sourcePage: "5", questionNumber: "問2",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 convDecimal は，引数として与えられた，「0」と「1」だけから成る，1文字以上の文字列を，符号なしの2進数と解釈したときの整数値を返す。例えば，引数として「10010」を与えると18が返る。\n関数 convDecimal が利用する関数 int は，引数で与えられた文字が「0」なら整数値0を返し，「1」なら整数値1を返す。\n〔プログラム〕\n○整数型: convDecimal(文字列型: binary)\n　整数型: i, length, result ← 0\n　length ← binaryの文字数\n　for (i を 1 から length まで 1 ずつ増やす)\n　　result ← ［　　］\n　endfor\n　return result",
    choices: [
      "result ＋ int(binary の (length － i ＋ 1)文字目の文字)",
      "result ＋ int(binary の i文字目の文字)",
      "result × 2 ＋ int(binary の (length － i ＋ 1)文字目の文字)",
      "result × 2 ＋ int(binary の i文字目の文字)",
    ], correctIndex: 3,
  },
  {
    id: "FE-B-IPA-2024-Q03", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "6", questionNumber: "問3",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\nグラフの頂点には，1から順に整数で番号が付けられている。グラフは無向グラフであり，各頂点間には高々一つの辺がある。一つの辺は両端の頂点の番号を要素にもつ要素数2の整数型の配列で表現できる。グラフ全体は，グラフに含まれる辺を表す要素数2の配列を全て格納した配列（以下，辺の配列という）で表現できる。\n関数 edgesToMatrix は，辺の配列を隣接行列に変換する。隣接行列とは，グラフに含まれる頂点の個数と等しい行数及び列数の正方行列で，i行j列の成分は頂点iと頂点jを結ぶ辺があるときに1となり，それ以外は0となる。行列の対角成分は全て0で，無向グラフの場合は対称行列になる。\n関数 edgesToMatrix は，引数 edgeList で辺の配列を，引数 nodeNum でグラフの頂点の個数をそれぞれ受け取り，隣接行列を表す整数型の二次元配列を返す。\n〔プログラム〕\n○整数型の二次元配列: edgesToMatrix(整数型配列の配列: edgeList, 整数型: nodeNum)\n　整数型の二次元配列: adjMatrix ← {nodeNum行nodeNum列の 0}\n　整数型: i, u, v\n　for (i を 1 から edgeListの要素数 まで 1 ずつ増やす)\n　　u ← edgeList[i][1]\n　　v ← edgeList[i][2]\n　　［　　］\n　endfor\n　return adjMatrix",
    choices: [
      "adjMatrix[u, u] ← 1",
      "adjMatrix[u, u] ← 1 ／ adjMatrix[v, v] ← 1",
      "adjMatrix[u, v] ← 1",
      "adjMatrix[u, v] ← 1 ／ adjMatrix[v, u] ← 1",
      "adjMatrix[v, u] ← 1",
      "adjMatrix[v, v] ← 1",
    ], correctIndex: 3,
  },
  {
    id: "FE-B-IPA-2024-Q04", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "10", questionNumber: "問5",
    body: "次のプログラム中の［ a ］～［ c ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n一度の注文で購入された商品のリストを，注文ごとに記録した注文データがある。\n表 注文データの例\n注文番号1: A, B, D／注文番号2: A, D／注文番号3: A／注文番号4: A, B, E／注文番号5: B／注文番号6: C, E\n注文データから，商品xと商品yとが同一の注文で購入されやすい傾向を示す関連度Lxyを，次の式で計算する。\nLxy ＝ (Mxy × 全注文数) ÷ (Kx × Ky)\nここで，Mxyは商品xと商品yとが同一の注文で購入された注文数，Kxは商品xが購入された注文数，Kyは商品yが購入された注文数を表す。表の例では，MABが2，全注文数が6，KAが4，KBが3であるので，商品Aと商品Bの関連度LABは，(2 × 6) ／ (4 × 3) ＝ 1.0 である。\n手続 putRelatedItem は，大域変数 orders に格納された注文データを基に，引数で与えられた商品との関連度が最も大きい商品のうちの一つと，その関連度を出力する。\n〔プログラム〕\n// 注文データ（ここでは表の例を与えている）\n大域: 文字列型配列の配列: orders ← {{\"A\", \"B\", \"D\"}, {\"A\", \"D\"}, {\"A\"}, {\"A\", \"B\", \"E\"}, {\"B\"}, {\"C\", \"E\"}}\n○putRelatedItem(文字列型: item)\n　文字列型の配列: allItems ← ordersに含まれる文字列を重複なく辞書順に格納した配列 // 表の例では {\"A\", \"B\", \"C\", \"D\", \"E\"}\n　文字列型の配列: otherItems ← allItemsの複製から値がitemである要素を除いた配列\n　整数型: i, itemCount ← 0\n　整数型の配列: arrayK ← {otherItemsの要素数個の0}\n　整数型の配列: arrayM ← {otherItemsの要素数個の0}\n　実数型: valueL, maxL ← －∞\n　文字列型の配列: order\n　文字列型: relatedItem\n　for (orderにordersの要素を順に代入する)\n　　if (orderのいずれかの要素の値がitemの値と等しい)\n　　　itemCountの値を1増やす\n　　endif\n　　for (iを1からotherItemsの要素数まで1ずつ増やす)\n　　　if (orderのいずれかの要素の値がotherItems[i]の値と等しい)\n　　　　if (orderのいずれかの要素の値がitemの値と等しい)\n　　　　　［ a ］の値を1増やす\n　　　　endif\n　　　　［ b ］の値を1増やす\n　　　endif\n　　endfor\n　endfor\n　for (iを1からotherItemsの要素数まで1ずつ増やす)\n　　valueL ← (arrayM[i] × ［ c ］) ÷ (itemCount × arrayK[i])\n　　/* 実数として計算する */\n　　if (valueLがmaxLより大きい)\n　　　maxL ← valueL\n　　　relatedItem ← otherItems[i]\n　　endif\n　endfor\n　relatedItemの値とmaxLの値をこの順にコンマ区切りで出力する",
    choices: [
      "a: arrayK[i]／b: arrayM[i]／c: allItemsの要素数",
      "a: arrayK[i]／b: arrayM[i]／c: ordersの要素数",
      "a: arrayK[i]／b: arrayM[i]／c: otherItemsの要素数",
      "a: arrayM[i]／b: arrayK[i]／c: allItemsの要素数",
      "a: arrayM[i]／b: arrayK[i]／c: ordersの要素数",
      "a: arrayM[i]／b: arrayK[i]／c: otherItemsの要素数",
    ], correctIndex: 4,
  },
  {
    id: "FE-B-IPA-2024-Q05", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    sourceUrl: B_URL, sourcePage: "14", questionNumber: "問6",
    body: "A社は従業員450名の商社であり，昨年から働き方改革の一環として，在宅でのテレワークを推進している。\n・従業員には，一人に1台デスクトップPC（社内PC）を貸与している。\n・従業員が利用するシステムには，自社の業務システムのほかに，メール・チャット・クラウドストレージ機能をもつグループウェア（A社利用グループウェア）とオンライン会議サービスの2つのSaaS（A社利用クラウドサービス）がある。\n・テレワークでは，従業員の個人所有PC（私有PC）の業務利用（BYOD）を許可しており，社内PC及び私有PCのそれぞれに専用アプリを導入し，社内PCのデスクトップから私有PCに画面転送を行うリモートデスクトップ方式を採用している。\n・専用アプリには，リモートデスクトップからPCへのファイルのダウンロード及びファイル，文字列，画像などのコピー＆ペーストを禁止する機能（保存禁止機能）があり，私有PCに対して有効にしている。\n・A社利用クラウドサービスへのログインは，サービス側の設定によってA社の社内ネットワークからだけ可能になるように制限している。\nテレワークの定着が進むにつれて，社内PCからインターネットへの接続が極端に遅くなり，業務に支障をきたしているので改善できないかと，従業員から問合せがあった。調査の結果，社内ネットワークとインターネットとの間の通信量が，テレワーク導入前に比べ業務時間帯で顕著に増加していることが判明した。そのため，情報システム部では，テレワークでA社利用クラウドサービスに接続する場合には，A社の社内ネットワークも社内PCも介さずに直接接続することを可能にするネットワークの設定変更を実施することにした。\n設定変更に当たり検討したところ，A社利用クラウドサービスへの不正アクセスのリスクが増加することが分かった。次の対策のうち，リスクを低減するために情報システム部に依頼することにしたものはどれか。",
    choices: [
      "A社の社内ネットワークからA社利用クラウドサービスへの通信を監視する。",
      "A社の社内ネットワークとA社利用クラウドサービスとの間の通信速度を制限する。",
      "A社利用クラウドサービスにA社外から接続する際の認証に2要素認証を導入する。",
      "A社利用クラウドサービスのうち，A社利用グループウェアだけを直接接続の対象とする。",
      "専用アプリの保存禁止機能を無効にする。",
    ], correctIndex: 2,
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} IPA R6(2024) public questions...`);
  const topics = await prisma.topic.findMany();
  const topicId = new Map(topics.map((t) => [t.nameJa, t.id]));

  for (const q of QUESTIONS) {
    const tId = topicId.get(q.topic);
    if (!tId) throw new Error(`Unknown topic: ${q.topic}`);

    await prisma.question.upsert({
      where: { id: q.id },
      update: {},
      create: {
        id: q.id,
        section: q.section,
        year: YEAR,
        sourceType: "IPA_PUBLIC",
        sourceUrl: q.sourceUrl,
        sourcePage: q.sourcePage,
        questionNumber: q.questionNumber,
        topicId: tId,
        difficulty: q.difficulty,
        bodyJa: q.body,
        correctAnswer: KEY_LETTERS[q.correctIndex],
        verified: true,
        reviewStatus: "VERIFIED",
        choices: {
          create: q.choices.map((text, i) => ({
            key: KEY_LETTERS[i],
            textJa: text,
            order: i,
          })),
        },
      },
    });
  }

  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
