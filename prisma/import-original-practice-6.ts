/**
 * Original practice questions, batch 6 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-5.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const KEY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;

type Q = {
  id: string;
  section: "A" | "B";
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  body: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
};

const QUESTIONS: Q[] = [
  // ===== 基礎理論 =====
  {
    id: "FE-A-PRACTICE-0235", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "10進数 200 を16進数で表したものはどれか。",
    choices: ["A8", "B8", "C8", "D8"], correctIndex: 2,
    explanation: "200 ÷ 16 = 12 余り 8。12は16進数でCであるため、200(10)＝C8(16)。",
  },
  {
    id: "FE-A-PRACTICE-0236", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "ある事象が必ず発生する確率はどれか。",
    choices: ["0", "0.5", "1", "定義できない"], correctIndex: 2,
    explanation: "必ず発生する事象（全事象）の確率は1である。",
  },
  {
    id: "FE-A-PRACTICE-0237", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "配列を使わずにポインタ（参照）でデータをつなぐことで実現される、要素の追加・削除が容易なデータ構造はどれか。",
    choices: ["連結リスト", "静的配列", "2次元配列", "定数"], correctIndex: 0,
    explanation: "連結リストは、各要素が次の要素へのポインタ（参照）をもつことでデータをつなぐデータ構造であり、配列と異なり要素の追加・削除がポインタの繋ぎ替えだけで済む。",
  },
  {
    id: "FE-A-PRACTICE-0238", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "命題「P AND Q」が偽であり、Pが真であるとき、Qの真理値はどれか。",
    choices: ["真", "偽", "不定", "Pの値による"], correctIndex: 1,
    explanation: "AND（論理積）は両方が真のときだけ真になる。Pが真でP AND Qが偽であるためには、Qが偽でなければならない。",
  },
  {
    id: "FE-A-PRACTICE-0239", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "2分探索木において、あるノードの左部分木に格納されている値の条件として、適切なものはどれか。",
    choices: [
      "そのノードの値より全て大きい。", "そのノードの値より全て小さい。",
      "そのノードの値と全て等しい。", "値の大小関係に制約はない。",
    ], correctIndex: 1,
    explanation: "2分探索木では、あるノードの左部分木に含まれる全ての値はそのノードの値より小さく、右部分木に含まれる全ての値はそのノードの値より大きいという性質をもつ。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0240", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "同じ名前のメソッドを、引数の型や個数を変えて複数定義できる仕組みを何と呼ぶか。",
    choices: ["オーバロード（多重定義）", "オーバライド（再定義）", "継承", "カプセル化"], correctIndex: 0,
    explanation: "オーバロード（多重定義）は、同じ名前のメソッドを、引数の型や個数（シグネチャ）を変えて複数定義できる仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0241", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "サブクラスが、スーパークラスで定義されたメソッドを、自分自身の実装で上書きすることを何と呼ぶか。",
    choices: ["オーバロード", "オーバライド（メソッドの再定義）", "キャスト", "多重継承"], correctIndex: 1,
    explanation: "オーバライドは、サブクラスがスーパークラスで定義されたメソッドと同じシグネチャのメソッドを、独自の実装で上書き（再定義）することである。",
  },
  {
    id: "FE-A-PRACTICE-0242", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "配列やリストの各要素をキーにして値を対応付け、高速な検索を可能にするデータ構造はどれか。",
    choices: ["ハッシュ表（連想配列）", "スタック", "キュー", "2分木"], correctIndex: 0,
    explanation: "ハッシュ表（連想配列）は、キーに対応するハッシュ値を計算して格納位置を決めることで、キーによる高速な検索・格納を実現するデータ構造である。",
  },
  {
    id: "FE-A-PRACTICE-0243", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "ソートアルゴリズムのうち、整列前と整列後で同じ値をもつ要素の相対的な順序が保たれる性質を何と呼ぶか。",
    choices: ["安定性", "再帰性", "冪等性", "可逆性"], correctIndex: 0,
    explanation: "安定性（安定ソート）は、同じ値をもつ要素同士の元の相対的な順序が、整列後も保たれる性質である。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0244", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "コンピュータの処理性能を示す指標のうち、1秒間に実行できる命令の数を表す単位はどれか。",
    choices: ["MIPS", "bps", "dpi", "fps"], correctIndex: 0,
    explanation: "MIPS（Million Instructions Per Second）は、1秒間に実行できる命令数を百万単位で表す、CPUの処理性能の指標である。",
  },
  {
    id: "FE-A-PRACTICE-0245", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの記憶階層において、一般にアクセス速度が最も速いものはどれか。",
    choices: ["レジスタ", "主記憶（メインメモリ）", "SSD", "HDD"], correctIndex: 0,
    explanation: "記憶階層の中で、CPU内部にあるレジスタが最もアクセス速度が速く、主記憶、SSD、HDDの順に遅くなるのが一般的である。",
  },
  {
    id: "FE-A-PRACTICE-0246", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "半導体の集積回路の集積度が、およそ18～24か月ごとに倍増するという経験則を何と呼ぶか。",
    choices: ["ムーアの法則", "アムダールの法則", "リトルの法則", "ジップの法則"], correctIndex: 0,
    explanation: "ムーアの法則は、半導体の集積回路上のトランジスタ数（集積度）が、おおよそ18～24か月ごとに倍増するという経験則である。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0247", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "システムの信頼性を表す指標のうち、故障が発生してから修理が完了するまでの平均時間を表すものはどれか。",
    choices: ["MTBF", "MTTR", "稼働率", "スループット"], correctIndex: 1,
    explanation: "MTTR（Mean Time To Repair）は、故障が発生してから修理が完了し復旧するまでの平均時間を表す指標である。",
  },
  {
    id: "FE-A-PRACTICE-0248", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "システムの信頼性を表す指標のうち、故障と故障の間の平均動作時間を表すものはどれか。",
    choices: ["MTBF", "MTTR", "RTO", "RPO"], correctIndex: 0,
    explanation: "MTBF（Mean Time Between Failures）は、故障と故障の間の平均動作時間（平均故障間隔）を表す指標である。",
  },
  {
    id: "FE-A-PRACTICE-0249", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "障害発生時に許容できるデータ損失の最大時間（どの時点まで遡ってデータを復旧できればよいか）を表す指標はどれか。",
    choices: ["RTO（目標復旧時間）", "RPO（目標復旧時点）", "SLA", "MTBF"], correctIndex: 1,
    explanation: "RPO（Recovery Point Objective、目標復旧時点）は、障害発生時に許容できるデータ損失の範囲を、どの時点のデータまで復旧できればよいかで表す指標である。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0250", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "複数のアプリケーションが同一のファイルに同時に書き込もうとした場合に生じる問題を防ぐため、ファイルへのアクセスを制限する仕組みを何と呼ぶか。",
    choices: ["ファイルロック", "ファイル圧縮", "ファイル分割", "ファイル暗号化"], correctIndex: 0,
    explanation: "ファイルロックは、複数のプロセスが同一のファイルへ同時にアクセス（特に書き込み）することによる不整合を防ぐため、一時的にアクセスを制限する仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0251", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "複数の異なるOS上で同じアプリケーションを動作させられるようにする性質を何と呼ぶか。",
    choices: ["移植性", "保守性", "効率性", "機密性"], correctIndex: 0,
    explanation: "移植性は、あるソフトウェアが異なる環境（OSやハードウェアなど）でも動作させられる性質を指す。",
  },
  {
    id: "FE-A-PRACTICE-0252", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "プロセス間でデータをやり取りするための仕組みのうち、一方が書き込んだデータを他方が読み出す、先入れ先出しの一時的な通信路を何と呼ぶか。",
    choices: ["パイプ", "ソケット", "セマフォ", "共有メモリ"], correctIndex: 0,
    explanation: "パイプは、あるプロセスの出力を別のプロセスの入力に直接接続する、先入れ先出し（FIFO）のプロセス間通信の仕組みである。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0253", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "ACID特性のうち、トランザクションが正常に完了した場合、その結果はシステム障害が起きても失われないことを保証する特性はどれか。",
    choices: ["原子性", "一貫性", "独立性", "耐久性"], correctIndex: 3,
    explanation: "耐久性（Durability）は、コミット（完了）したトランザクションの結果が、その後にシステム障害が発生しても失われないことを保証する特性である。",
  },
  {
    id: "FE-A-PRACTICE-0254", section: "A", topic: "データベース", difficulty: "EASY",
    body: "複数の表の関係を図で表現し、データベースの構造を設計するために用いられる図はどれか。",
    choices: ["ER図（実体関連図）", "フローチャート", "アローダイアグラム", "状態遷移図"], correctIndex: 0,
    explanation: "ER図（Entity-Relationship Diagram、実体関連図）は、データベースに登場する実体（エンティティ）とその間の関連を図で表現し、データベース設計に用いられる。",
  },
  {
    id: "FE-A-PRACTICE-0255", section: "A", topic: "データベース", difficulty: "HARD",
    body: "データウェアハウスなどにおいて、大量のデータを様々な視点（次元）から多角的に分析する手法を何と呼ぶか。",
    choices: ["OLAP（オンライン分析処理）", "OLTP（オンライントランザクション処理）", "ETL", "バッチ処理"], correctIndex: 0,
    explanation: "OLAP（Online Analytical Processing）は、蓄積された大量のデータを、複数の視点（次元）から多角的に集計・分析する処理・手法である。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0256", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "電子メールの本文や添付ファイルに、テキスト以外の画像や音声などのデータを含められるようにする規格はどれか。",
    choices: ["MIME", "IMAP", "SMTP", "POP3"], correctIndex: 0,
    explanation: "MIME（Multipurpose Internet Mail Extensions）は、電子メールで画像や音声などのテキスト以外のデータを扱えるようにする規格である。",
  },
  {
    id: "FE-A-PRACTICE-0257", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "インターネットにおいて、Webページの取得に使われる標準的な通信プロトコルはどれか。",
    choices: ["HTTP", "FTP", "SMTP", "SNMP"], correctIndex: 0,
    explanation: "HTTP（HyperText Transfer Protocol）は、Webブラウザがサーバから Webページを取得するために使われる標準的な通信プロトコルである。",
  },
  {
    id: "FE-A-PRACTICE-0258", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "無線LANの暗号化方式のうち、現在最も強固とされ推奨されているものはどれか。",
    choices: ["WEP", "WPA2/WPA3", "なし（暗号化しない）", "Bluetooth"], correctIndex: 1,
    explanation: "WEPは脆弱性が明らかになっており、現在はWPA2やより新しいWPA3の使用が推奨されている。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0259", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "企業などが実施する、外部からの侵入を実際に試みることでセキュリティ上の弱点を発見するテストを何と呼ぶか。",
    choices: ["ペネトレーションテスト", "ユーザビリティテスト", "回帰テスト", "性能テスト"], correctIndex: 0,
    explanation: "ペネトレーションテストは、実際に外部からの侵入を試みることで、システムのセキュリティ上の弱点（脆弱性）を発見するテストである。",
  },
  {
    id: "FE-A-PRACTICE-0260", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "組織の情報資産を守るために策定される、基本方針や行動指針を定めた文書を何と呼ぶか。",
    choices: ["情報セキュリティポリシー", "サービスレベル合意書", "業務マニュアル", "見積書"], correctIndex: 0,
    explanation: "情報セキュリティポリシーは、組織の情報資産を守るための基本方針や行動指針を明文化した文書である。",
  },
  {
    id: "FE-A-PRACTICE-0261", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "マルウェアの解析手法のうち、検体を実際に動作させずにコードやファイル構造を調べる手法を何と呼ぶか。",
    choices: ["静的解析", "動的解析", "総当たり解析", "辞書解析"], correctIndex: 0,
    explanation: "静的解析は、マルウェアの検体を実際に実行せず、コードやファイル構造を調べることで特徴や機能を分析する解析手法である（実際に動作させて観察するのは動的解析）。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0262", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "アジャイル開発の考え方をまとめた「アジャイルソフトウェア開発宣言」が重視する価値観として、適切なものはどれか。",
    choices: [
      "包括的なドキュメントよりも、動くソフトウェアを重視する。", "個人との対話よりも、プロセスやツールを重視する。",
      "顧客との協調よりも、契約交渉を重視する。", "変化への対応よりも、計画に従うことを重視する。",
    ], correctIndex: 0,
    explanation: "アジャイルソフトウェア開発宣言では、「包括的なドキュメントよりも動くソフトウェアを」「契約交渉よりも顧客との協調を」「計画に従うことよりも変化への対応を」といった価値観が重視される。",
  },
  {
    id: "FE-A-PRACTICE-0263", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "ソフトウェアの保守作業のうち、稼働中に発見された不具合（バグ）を修正する保守を何と呼ぶか。",
    choices: ["是正保守", "予防保守", "適応保守", "完全化保守"], correctIndex: 0,
    explanation: "是正保守は、稼働中のソフトウェアで発見された不具合（バグ）を修正するための保守活動である。",
  },
  {
    id: "FE-A-PRACTICE-0264", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "システム開発において、あるモジュールを、実際に呼び出す上位モジュールの代わりとして使い、下位モジュールを単体でテストするためのダミーモジュールを何と呼ぶか。",
    choices: ["スタブ", "ドライバ", "シミュレータ", "モニタ"], correctIndex: 1,
    explanation: "ドライバは、テスト対象モジュールを呼び出す上位モジュールの代替として使うダミーモジュールである（下位モジュールの代替はスタブ）。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0265", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトの実行中に発生した変更要求について、影響範囲を評価し承認するかどうかを審議する組織・会議体を何と呼ぶか。",
    choices: ["変更管理委員会（CCB）", "品質保証部門", "開発チーム全体会議", "経営会議"], correctIndex: 0,
    explanation: "変更管理委員会（CCB：Change Control Board）は、プロジェクトへの変更要求について、影響範囲を評価し、承認するかどうかを審議する組織・会議体である。",
  },
  {
    id: "FE-A-PRACTICE-0266", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "システムの構成情報（ハードウェア、ソフトウェア、バージョンなど）を正確に把握し、管理する活動を何と呼ぶか。",
    choices: ["構成管理", "問題管理", "インシデント管理", "リリース管理"], correctIndex: 0,
    explanation: "構成管理は、システムを構成するハードウェアやソフトウェア、バージョンなどの情報を正確に把握し、記録・管理する活動である。",
  },
  {
    id: "FE-A-PRACTICE-0267", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "システム監査の実施後、監査人が指摘した改善事項について、被監査部門がその後どのように対応したかを確認する活動を何と呼ぶか。",
    choices: ["フォローアップ", "予備調査", "本調査", "監査計画の策定"], correctIndex: 0,
    explanation: "フォローアップは、監査報告書で指摘した改善事項について、被監査部門がその後どのように対応・改善したかを確認する活動である。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0268", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "企業が自社の製品・サービスの原材料調達から製造、販売に至る一連の活動を、価値を生み出す連鎖として分析する手法を何と呼ぶか。",
    choices: ["バリューチェーン分析", "SWOT分析", "PPM分析", "5フォース分析"], correctIndex: 0,
    explanation: "バリューチェーン分析は、原材料調達から製造、物流、販売、サービスに至る一連の企業活動を「価値を生み出す連鎖」として捉え、どこで付加価値が生まれているかを分析する手法である。",
  },
  {
    id: "FE-A-PRACTICE-0269", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "システムの企画・開発・運用・保守にわたる全工程の総費用を表す概念を何と呼ぶか。",
    choices: ["TCO（総所有費用）", "ROI（投資利益率）", "KPI（重要業績評価指標）", "NPV（正味現在価値）"], correctIndex: 0,
    explanation: "TCO（Total Cost of Ownership、総所有費用）は、システムの導入費用だけでなく、運用・保守など全工程にわたる総費用を表す概念である。",
  },
  {
    id: "FE-A-PRACTICE-0270", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある投資案件に300万円を投資し、1年後に330万円が得られる場合、年利率（単純に計算した投資利益率）はどれか。",
    choices: ["3%", "10%", "30%", "33%"], correctIndex: 1,
    explanation: "利益＝330－300＝30万円。利益率＝30÷300＝0.1＝10%。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0048", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 collatzSteps は，1より大きい整数nを受け取り，コラッツ数列（nが偶数ならn÷2，奇数なら3n+1を繰り返し，1になるまでの操作回数）のステップ数を返す。\n〔プログラム〕\n○整数型: collatzSteps(整数型: n)\n　整数型: steps ← 0\n　while (n ≠ 1)\n　　if ((n mod 2) ＝ 0)\n　　　n ← n ÷ 2 の商\n　　else\n　　　n ← ［　　］\n　　endif\n　　steps ← steps ＋ 1\n　endwhile\n　return steps",
    choices: ["n ÷ 2 の商", "3 × n ＋ 1", "n － 1", "n × n"],
    correctIndex: 1,
    explanation: "コラッツ数列の定義に基づき、nが奇数の場合は3n+1を次の値とする。",
  },
  {
    id: "FE-B-PRACTICE-0049", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 countInRange は，引数で与えられた整数型配列 data の中から，low以上high以下の範囲に含まれる要素の個数を数えて返す。\n〔プログラム〕\n○整数型: countInRange(整数型の配列: data, 整数型: low, 整数型: high)\n　整数型: count ← 0\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (data[i] ≧ low and ［　　］)\n　　　count ← count ＋ 1\n　　endif\n　endfor\n　return count",
    choices: ["data[i] ≦ high", "data[i] ≧ high", "data[i] ＜ low", "i ≦ high"],
    correctIndex: 0,
    explanation: "指定範囲（low以上high以下）に含まれるかどうかを判定するには、data[i]≧low かつ data[i]≦high の両方を満たす必要がある。",
  },
  {
    id: "FE-B-PRACTICE-0050", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 repeatString は，文字列型の引数 s と整数型の引数 n（n≧0）を受け取り、s を n 回繰り返して連結した文字列を返す（例：repeatString(\"ab\", 3) → \"ababab\"）。演算子＋は文字列の連結を表す。\n〔プログラム〕\n○文字列型: repeatString(文字列型: s, 整数型: n)\n　文字列型: result ← \"\"\n　整数型: i\n　for (i を 1 から n まで 1 ずつ増やす)\n　　result ← ［　　］\n　endfor\n　return result",
    choices: ["result ＋ s", "s ＋ result", "result ＋ i", "s"],
    correctIndex: 0,
    explanation: "既存のresultの末尾に文字列sを連結していくことで、sをn回繰り返した文字列が得られる。",
  },
  {
    id: "FE-B-PRACTICE-0051", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 twoSum は，整数型配列 data（要素数2以上）と整数 target を受け取り、data の中から合計がtargetと等しくなる二つの要素の組合せの要素番号（小さい方から順に）を配列で返す。見つからない場合は要素数0の配列を返す。単純な二重ループで実装する。\n〔プログラム〕\n○整数型の配列: twoSum(整数型の配列: data, 整数型: target)\n　整数型: i, j\n　for (i を 1 から dataの要素数 － 1 まで 1 ずつ増やす)\n　　for (j を ［ a ］ から dataの要素数 まで 1 ずつ増やす)\n　　　if (data[i] ＋ data[j] ＝ target)\n　　　　return ［ b ］\n　　　endif\n　　endfor\n　endfor\n　return {}",
    choices: [
      "a: i ＋ 1／b: {i, j}", "a: 1／b: {i, j}",
      "a: i／b: {i, j}", "a: i ＋ 1／b: {j, i}",
    ],
    correctIndex: 0,
    explanation: "同じ要素を2回使わず、また同じ組合せを重複して調べないようにするため、内側ループのjはi+1から開始する（a）。見つかった組合せは要素番号の小さい順にi, jとして返す（b）。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0052", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "S社は，従業員が私物のスマートフォンを業務に利用するBYOD（Bring Your Own Device）を許可しているが，業務アプリのインストール以外には特に制限を設けていなかった。ある従業員のスマートフォンがマルウェアに感染し，そこから社内システムの認証情報が漏えいする事案が発生した。この再発防止策として，最も適切なものはどれか。",
    choices: [
      "BYODを全面的に禁止し，従業員全員に会社支給の端末のみを利用させる。",
      "MDM（モバイルデバイス管理）を導入し，業務利用する私物端末に対してセキュリティ設定の統一やアプリ制限，リモートワイプなどの管理を行えるようにする。",
      "従業員のスマートフォンの機種を統一する。", "スマートフォンの画面サイズを制限する。",
    ], correctIndex: 1,
    explanation: "BYODを継続しつつセキュリティを確保するには、MDM（モバイルデバイス管理）を導入し、業務利用端末に対して一定のセキュリティ設定やアプリ制限、紛失・盗難時のリモートワイプなどを統一的に管理することが有効な対策となる。",
  },
  {
    id: "FE-B-PRACTICE-0053", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "T社のシステム管理者は，本番サーバのOSアップデートを深夜のメンテナンス時間帯に手順書に従って実施していたが，ある回は手順書の一部を省略して作業を急いだ結果，重要な設定ファイルを誤って上書きしてしまい，翌朝からサービスが停止する障害が発生した。この事案の再発防止策として，最も適切なものはどれか。",
    choices: [
      "メンテナンス作業を深夜ではなく昼間に実施する。", "作業前に必ず設定ファイルなどのバックアップを取得し，手順書どおりに作業を実施したことをダブルチェックする体制を整える。",
      "OSのアップデートを永久に行わない。", "システム管理者の人数を減らす。",
    ], correctIndex: 1,
    explanation: "手順の省略によるヒューマンエラーを防ぐには、作業前のバックアップ取得の徹底と、手順書どおりに作業が行われたかを確認するダブルチェック体制（レビューや承認プロセス）を整えることが有効である。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 6)...`);
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
        sourceType: "ORIGINAL_PRACTICE",
        topicId: tId,
        difficulty: q.difficulty,
        bodyJa: q.body,
        correctAnswer: KEY_LETTERS[q.correctIndex],
        explanationJa: q.explanation,
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
