/**
 * Original practice questions, batch 10 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-9.
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
    id: "FE-A-PRACTICE-0379", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "10進数 500 を16進数で表したものはどれか。",
    choices: ["1E4", "1F4", "204", "1D4"], correctIndex: 1,
    explanation: "500 ÷ 16 = 31 余り 4、31 ÷ 16 = 1 余り 15（F）。よって500(10)＝1F4(16)。",
  },
  {
    id: "FE-A-PRACTICE-0380", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "ある根付き木において、直接の子をもたないノードを何と呼ぶか（再掲・別表現）。",
    choices: ["内部ノード", "葉ノード", "根ノード", "兄弟ノード"], correctIndex: 1,
    explanation: "子をもたないノードは葉ノードと呼ばれる。子をもつノードは内部ノードと呼ばれる。",
  },
  {
    id: "FE-A-PRACTICE-0381", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "サイコロを1回振ったとき、出る目が偶数であるという事象と、出る目が3の倍数であるという事象がある。両方の事象が同時に起こる確率はどれか。",
    choices: ["1/6", "1/3", "1/2", "2/3"], correctIndex: 0,
    explanation: "1～6の目のうち、偶数かつ3の倍数であるのは6のみ。したがって確率は1/6。",
  },
  {
    id: "FE-A-PRACTICE-0382", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "命題「P OR Q」の否定として、ド・モルガンの法則に基づき正しいものはどれか。",
    choices: ["(NOT P) OR (NOT Q)", "(NOT P) AND (NOT Q)", "P AND Q", "P OR (NOT Q)"], correctIndex: 1,
    explanation: "ド・モルガンの法則により、「P OR Q」の否定は「(NOT P) AND (NOT Q)」となる。",
  },
  {
    id: "FE-A-PRACTICE-0383", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "2つの集合A，Bについて、AとBの両方に属する要素からなる集合を何と呼ぶか。",
    choices: ["和集合", "積集合（共通部分）", "補集合", "差集合"], correctIndex: 1,
    explanation: "積集合（共通部分）は、集合Aと集合Bの両方に属する要素からなる集合である。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0384", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "整列アルゴリズムのうち、要素数nに対して常にO(n log n)の計算量を保証できるものはどれか。",
    choices: ["バブルソート", "マージソート", "挿入ソート", "選択ソート"], correctIndex: 1,
    explanation: "マージソートは、最良・平均・最悪のいずれの場合でも計算量がO(n log n)であることが保証されているアルゴリズムである。",
  },
  {
    id: "FE-A-PRACTICE-0385", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "デザインパターンのうち、あるクラスのインスタンスがシステム全体で常に1つだけになることを保証するパターンを何と呼ぶか。",
    choices: ["シングルトンパターン", "ファクトリパターン", "オブザーバパターン", "デコレータパターン"], correctIndex: 0,
    explanation: "シングルトンパターンは、あるクラスのインスタンスがアプリケーション全体で常に1つだけになることを保証するデザインパターンである。",
  },
  {
    id: "FE-A-PRACTICE-0386", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "プログラムにおいて、値が変更されない（定数として扱われる）ことを明示するために使われるキーワードや宣言を何と呼ぶか（言語によらず一般的な概念）。",
    choices: ["定数宣言", "変数宣言", "関数宣言", "配列宣言"], correctIndex: 0,
    explanation: "定数宣言は、一度値を設定したら変更できない（不変の）値を宣言するための仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0387", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "デザインパターンのうち、オブジェクトの状態が変化したときに、それに依存する複数のオブジェクトへ自動的に通知する仕組みを提供するパターンを何と呼ぶか。",
    choices: ["オブザーバパターン", "シングルトンパターン", "ストラテジパターン", "アダプタパターン"], correctIndex: 0,
    explanation: "オブザーバパターンは、あるオブジェクト（主体）の状態が変化したときに、それを観察している複数のオブジェクト（観察者）へ自動的に変化を通知する仕組みを提供するデザインパターンである。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0388", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "組込みシステムなどで用いられる、決められた時間内に処理を完了させることが求められるシステムを何と呼ぶか。",
    choices: ["リアルタイムシステム", "バッチシステム", "汎用システム", "分散システム"], correctIndex: 0,
    explanation: "リアルタイムシステムは、外部からの入力に対して、あらかじめ決められた時間内に処理を完了させることが求められるシステムである。",
  },
  {
    id: "FE-A-PRACTICE-0389", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの電源が入っている間、実行中のプログラムやデータを一時的に保持する、揮発性の記憶装置はどれか。",
    choices: ["主記憶（RAM）", "ROM", "HDD", "SSD"], correctIndex: 0,
    explanation: "主記憶（RAM）は、電源が入っている間、実行中のプログラムやデータを一時的に保持する揮発性の記憶装置である。",
  },
  {
    id: "FE-A-PRACTICE-0390", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "CPUが分岐命令の結果を実行前に予測し、パイプラインの乱れを最小限にしようとする技術を何と呼ぶか。",
    choices: ["分岐予測", "アウトオブオーダー実行", "投機的実行のみ", "マイクロコード"], correctIndex: 0,
    explanation: "分岐予測は、CPUが条件分岐命令の結果（分岐するかどうか）を実行前に予測し、パイプライン処理の乱れ（ストール）を最小限に抑えようとする技術である。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0391", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "クラウドサービス事業者が提供するサービスの障害や性能について、利用者と合意する水準を定めた文書を何と呼ぶか（再掲）。",
    choices: ["SLA", "NDA", "RFP", "WBS"], correctIndex: 0,
    explanation: "SLA（Service Level Agreement）は、サービスの品質水準について、提供者と利用者の間で合意する文書である。",
  },
  {
    id: "FE-A-PRACTICE-0392", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "システムの規模や利用者数の増加に応じて、サーバ1台の性能（CPUやメモリ）を強化する方式を何と呼ぶか。",
    choices: ["スケールアップ", "スケールアウト", "スケールイン", "スケールダウン"], correctIndex: 0,
    explanation: "スケールアップは、サーバ1台のCPUやメモリなどの性能を強化することで処理能力を向上させる方式である（台数を増やすのはスケールアウト）。",
  },
  {
    id: "FE-A-PRACTICE-0393", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "2台の装置が直列に接続され、両方が稼働している必要があるシステムの稼働率を0.81以上にしたい。各装置の稼働率が等しいとき、必要な最小の稼働率はどれか。",
    choices: ["0.85", "0.90", "0.95", "0.99"], correctIndex: 1,
    explanation: "直列システムの稼働率はp^2で表される。p^2≧0.81を解くと、p≧0.9となる。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0394", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "アプリケーションソフトウェアを、OSの違いを問わず様々な環境で動作させるための実行環境を提供する技術を何と呼ぶか（例：JavaのJVMなど）。",
    choices: ["仮想マシン（言語処理系の実行環境）", "コンパイラだけ", "ファイルシステム", "レジストリ"], correctIndex: 0,
    explanation: "仮想マシン（言語処理系の実行環境、例：JavaのJVM）は、コンパイルされた中間コードを、実際のハードウェアやOSの違いを吸収して実行できるようにする仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0395", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "OSが提供する機能のうち、ファイルやディレクトリを階層的に管理し、作成・削除・読み書きなどの操作を可能にする仕組みを何と呼ぶか。",
    choices: ["ファイルシステム", "プロセススケジューラ", "デバイスドライバ", "メモリマネージャ"], correctIndex: 0,
    explanation: "ファイルシステムは、OSがファイルやディレクトリを階層的に管理し、作成・削除・読み書きなどの操作を可能にする仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0396", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "複数のプロセス間で、同時にアクセスできる資源の数を制限し、排他制御を実現するための仕組みを何と呼ぶか。",
    choices: ["セマフォ", "パイプ", "ソケット", "シグナル"], correctIndex: 0,
    explanation: "セマフォは、複数のプロセスやスレッドが共有資源に同時にアクセスできる数を制限することで、排他制御や同期を実現するための仕組みである。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0397", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "関係データベースにおいて、複数の列を組み合わせて初めて一意性が保証されるキーを何と呼ぶか。",
    choices: ["複合キー", "単純キー", "外部キー", "サロゲートキー"], correctIndex: 0,
    explanation: "複合キーは、単独の列だけでは一意性を保証できず、複数の列を組み合わせることで初めて各行を一意に識別できるキーである。",
  },
  {
    id: "FE-A-PRACTICE-0398", section: "A", topic: "データベース", difficulty: "EASY",
    body: "SQLにおいて、集計結果をグループごとにまとめるために使用する句はどれか。",
    choices: ["GROUP BY", "ORDER BY", "WHERE", "HAVING のみ"], correctIndex: 0,
    explanation: "GROUP BY句は、指定した列の値ごとに行をグループ化し、グループ単位で集計（COUNTやSUMなど）を行うために使用する。",
  },
  {
    id: "FE-A-PRACTICE-0399", section: "A", topic: "データベース", difficulty: "HARD",
    body: "NoSQLデータベースの一種で、キーと値の組合せでデータを格納する、シンプルで高速なデータストア形式はどれか。",
    choices: ["キーバリューストア", "リレーショナルデータベース", "グラフデータベースだけ", "OLAPキューブ"], correctIndex: 0,
    explanation: "キーバリューストアは、一意のキーとそれに対応する値の組合せでデータを格納する、シンプルで高速なNoSQLデータベースの一形式である。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0400", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "自社のネットワークとインターネットの境界に設置し、内部ネットワークへの不正なアクセスを防ぐ機器・仕組みを総称して何と呼ぶか。",
    choices: ["ファイアウォール", "スイッチングハブ", "リピータ", "モデム"], correctIndex: 0,
    explanation: "ファイアウォールは、内部ネットワークとインターネットなどの外部ネットワークの境界に設置され、あらかじめ定めた規則に基づいて不正なアクセスを防ぐ機器・仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0401", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "インターネットに接続する機器に一時的に割り当てられ、接続のたびに変わる可能性があるIPアドレスの割当て方式はどれか。",
    choices: ["動的IPアドレス", "固定IPアドレス（静的IPアドレス）", "プライベートIPアドレスだけ", "ループバックアドレス"], correctIndex: 0,
    explanation: "動的IPアドレスは、DHCPなどによって接続のたびに変わる可能性のあるIPアドレスの割当て方式である（常に同じアドレスを使うのは固定IPアドレス）。",
  },
  {
    id: "FE-A-PRACTICE-0402", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "組織内から外部のインターネットへのアクセスを中継し、キャッシュによる高速化やアクセス制限を行うサーバを何と呼ぶか。",
    choices: ["プロキシサーバ", "DNSサーバ", "メールサーバ", "ファイルサーバ"], correctIndex: 0,
    explanation: "プロキシサーバは、組織内の端末からインターネットへのアクセスを代理で中継し、キャッシュによる高速化やアクセス制限（フィルタリング）などを行うサーバである。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0403", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "取得したパスワードのハッシュ値に対し、あらかじめ計算しておいた大量のハッシュ値と平文の対応表を用いて、元のパスワードを高速に特定しようとする攻撃はどれか。",
    choices: ["レインボーテーブル攻撃", "SQLインジェクション", "クロスサイトリクエストフォージェリ", "セッションハイジャック"], correctIndex: 0,
    explanation: "レインボーテーブル攻撃は、あらかじめ計算しておいた大量の平文とハッシュ値の対応表（レインボーテーブル）を用いて、盗んだハッシュ値から元のパスワードを高速に特定しようとする攻撃である。",
  },
  {
    id: "FE-A-PRACTICE-0404", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "情報資産に対して、リスクが発生する可能性とその影響の大きさを評価し、対策の優先順位を決定するプロセスを総称して何と呼ぶか。",
    choices: ["リスクマネジメント", "構成管理", "変更管理", "リリース管理"], correctIndex: 0,
    explanation: "リスクマネジメントは、情報資産に対するリスクを特定・分析・評価し、適切な対策を選択・実施する一連のプロセスの総称である。",
  },
  {
    id: "FE-A-PRACTICE-0405", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "利用者が本人であることを確認する認証方式のうち、「知識情報」に分類されるものはどれか。",
    choices: ["パスワード", "ICカード", "指紋", "スマートフォンの所持"], correctIndex: 0,
    explanation: "認証の3要素のうち、パスワードや秘密の質問などの「本人だけが知っている情報」は知識情報に分類される（ICカードやスマートフォンは所持情報、指紋は生体情報）。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0406", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "システム開発の見積りにおいて、複数の専門家に匿名でアンケートを行い、その結果を集約・フィードバックすることを繰り返して見積り値の合意を図る手法を何と呼ぶか。",
    choices: ["デルファイ法", "ファンクションポイント法", "類推見積法", "積み上げ法"], correctIndex: 0,
    explanation: "デルファイ法は、複数の専門家に匿名でアンケートを行い、その結果を集約してフィードバックすることを繰り返しながら、見積りなどの意見の収束・合意を図る手法である。",
  },
  {
    id: "FE-A-PRACTICE-0407", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "システムの本番稼働後に、業務環境の変化や新たな要求に応じてソフトウェアを改良する保守活動を何と呼ぶか。",
    choices: ["適応保守", "是正保守", "予防保守", "完全化保守のみ"], correctIndex: 0,
    explanation: "適応保守は、業務環境や法制度の変化など、外部環境の変化に対応するためにソフトウェアを改良する保守活動である。",
  },
  {
    id: "FE-A-PRACTICE-0408", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "テストにおいて、境界値の直前・直後・境界値そのものに着目してテストケースを設計する技法を何と呼ぶか。",
    choices: ["境界値分析", "同値分割", "デシジョンテーブル", "状態遷移テスト"], correctIndex: 0,
    explanation: "境界値分析は、入力値の有効範囲の境界（最小値、最大値、その前後）に着目してテストケースを設計する技法であり、境界付近でのバグが発見されやすいことに基づいている。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0409", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトの品質を高めるために、成果物のレビューを開発の早い段階から繰り返し実施する考え方を何と呼ぶか。",
    choices: ["早期発見・早期対応（シフトレフト）", "先送り", "一括検証", "後工程確認省略"], correctIndex: 0,
    explanation: "シフトレフト（早期発見・早期対応）は、品質保証やテストの活動を開発ライフサイクルのできるだけ早い段階（左側）に移し、問題を早期に発見・修正しようとする考え方である。",
  },
  {
    id: "FE-A-PRACTICE-0410", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "システムの本番リリースに際して、新しいバージョンのソフトウェアを計画的に展開・導入する管理プロセスを何と呼ぶか。",
    choices: ["リリース管理", "インシデント管理", "問題管理", "可用性管理"], correctIndex: 0,
    explanation: "リリース管理は、新しいバージョンのソフトウェアやシステムを、計画的かつ統制された方法で本番環境へ展開・導入するための管理プロセスである。",
  },
  {
    id: "FE-A-PRACTICE-0411", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "システム監査の実施形態のうち、監査対象部門と直接の利害関係をもたない組織内の独立した部門が実施する監査を何と呼ぶか。",
    choices: ["内部監査", "外部監査", "自己点検", "第三者認証審査のみ"], correctIndex: 0,
    explanation: "内部監査は、監査対象部門と直接の利害関係をもたない組織内の独立した監査部門（内部監査部門）が実施する監査である（組織外の監査法人などが実施するのは外部監査）。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0412", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "企業が、他社との競争優位を確立するための基本戦略として、マイケル・ポーターが提唱した3つの基本戦略に該当しないものはどれか。",
    choices: ["コストリーダーシップ戦略", "差別化戦略", "集中戦略", "多角化戦略"], correctIndex: 3,
    explanation: "マイケル・ポーターが提唱した3つの基本戦略は、コストリーダーシップ戦略、差別化戦略、集中戦略である。多角化戦略はアンゾフの成長マトリクスに関連する概念であり、この3つには含まれない。",
  },
  {
    id: "FE-A-PRACTICE-0413", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "企業が、他社の製品やサービスをそのまま自社ブランドとして販売する委託製造の形態を表す略語はどれか。",
    choices: ["OEM", "ODM", "M&A", "IPO"], correctIndex: 0,
    explanation: "OEM（Original Equipment Manufacturer）は、委託元のブランド名で製品を製造することを指す用語であり、委託先企業（またはその製造形態）を指して使われる。",
  },
  {
    id: "FE-A-PRACTICE-0414", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある企業が新システムに1,000万円を投資し、5年間にわたって毎年300万円の効果（割引率は考慮しない）を得られる場合、単純合計での投資利益率（ROI）はどれか（ROI＝(効果合計－投資額)÷投資額）。",
    choices: ["20%", "50%", "100%", "150%"], correctIndex: 1,
    explanation: "効果合計＝300万円×5年＝1,500万円。ROI＝(1,500－1,000)÷1,000＝500÷1,000＝0.5＝50%。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0069", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 productOfArray は，引数で与えられた要素数1以上の整数型配列 data の全要素の積を返す。\n〔プログラム〕\n○整数型: productOfArray(整数型の配列: data)\n　整数型: total ← 1\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　total ← ［　　］\n　endfor\n　return total",
    choices: ["total ＋ data[i]", "total × data[i]", "total × i", "data[i]"],
    correctIndex: 1,
    explanation: "全要素の積を求めるには、初期値1のtotalに各要素を掛け合わせていけばよい。",
  },
  {
    id: "FE-B-PRACTICE-0070", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 countVowels は，引数で与えられた文字列型配列 chars（1文字ずつ格納）の中から、母音（'a','e','i','o','u'のいずれか）の個数を数えて返す。ここで、関数 isVowel(c) は文字cが母音であればtrueを返す関数として定義済みとする。\n〔プログラム〕\n○整数型: countVowels(文字列型の配列: chars)\n　整数型: count ← 0\n　整数型: i\n　for (i を 1 から charsの要素数 まで 1 ずつ増やす)\n　　if (isVowel(chars[i]))\n　　　［　　］\n　　endif\n　endfor\n　return count",
    choices: ["count ← count ＋ 1", "count ← i", "return count", "count ← 0"],
    correctIndex: 0,
    explanation: "母音である文字が見つかるたびにcountを1ずつ増やしていくことで、母音の総数を数えることができる。",
  },
  {
    id: "FE-B-PRACTICE-0071", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 hasDuplicates は，引数で与えられた整数型配列 data の中に，同じ値が2回以上現れる要素があればtrueを，なければfalseを返す。単純な二重ループで実装する。\n〔プログラム〕\n○論理型: hasDuplicates(整数型の配列: data)\n　整数型: i, j\n　for (i を 1 から dataの要素数 － 1 まで 1 ずつ増やす)\n　　for (j を i ＋ 1 から dataの要素数 まで 1 ずつ増やす)\n　　　if (data[i] が data[j] と等しい)\n　　　　return ［　　］\n　　　endif\n　　endfor\n　endfor\n　return false",
    choices: ["true", "false", "data[i]", "i"],
    correctIndex: 0,
    explanation: "data[i]とdata[j]（i≠j）が一致する組合せが1つでも見つかれば、重複する要素が存在することになるため、trueを返す。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0072", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "AA社は，社内の全PCに対して自動でセキュリティパッチを適用する設定にしていたが，一部の古い業務システムとの互換性の問題から，その部門のPCだけは自動更新を無効にし，手動での適用を担当者に任せていた。しかし，その担当者が異動した後，後任者への引継ぎが行われず，半年以上パッチが適用されない状態が続いていた。この事案の根本的な原因はどれか。",
    choices: [
      "業務システムが古かったこと", "特定の運用を担当者個人に依存させ，属人化した状態のまま引継ぎの手続きが確立されていなかったこと",
      "PCの台数が多かったこと", "セキュリティパッチの容量が大きかったこと",
    ], correctIndex: 1,
    explanation: "特定の作業を特定の担当者個人に依存させる「属人化」は、異動や退職時に引継ぎが漏れるリスクを伴う。手順書の整備や複数名での分担、引継ぎプロセスの確立によって属人化を防ぐことが重要である。",
  },
  {
    id: "FE-B-PRACTICE-0073", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "BB社のカスタマーサポート部門では，問合せ対応のために顧客の氏名・電話番号・購入履歴を閲覧できるシステムを利用している。ある担当者が，私的な目的で，友人の購入履歴を業務上の必要がないのに閲覧していたことが，後日のアクセスログ監査で発覚した。この事案から得られる教訓として，最も適切なものはどれか。",
    choices: [
      "顧客データの閲覧を全面的に禁止する。",
      "アクセスログを取得・監査する仕組みに加え，業務上必要な範囲を超えたアクセスを検知・抑止する仕組み（アラートや定期監査）が重要であることを再確認する必要がある。",
      "カスタマーサポート部門を廃止する。", "全顧客に個人情報の提供を控えるよう依頼する。",
    ], correctIndex: 1,
    explanation: "アクセス権限が付与されていても、業務上の必要性なく個人情報を閲覧する行為は不適切な利用である。アクセスログの取得・監査に加え、異常なアクセスパターンを検知する仕組みを整備することが重要な教訓となる。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 10)...`);
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
