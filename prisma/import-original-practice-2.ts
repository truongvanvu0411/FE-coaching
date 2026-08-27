/**
 * Original practice questions, batch 2 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batch 1
 * (prisma/import-original-practice.ts).
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
    id: "FE-A-PRACTICE-0059", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "2進数 1101 と 2進数 0110 の和を2進数で表したものはどれか。",
    choices: ["10001", "10011", "11001", "10111"], correctIndex: 1,
    explanation: "1101(2)=13, 0110(2)=6。13+6=19=10011(2)。",
  },
  {
    id: "FE-A-PRACTICE-0060", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "浮動小数点数の演算において、絶対値がほぼ等しい二つの数値を減算したときに、上位の有効桁が失われて生じる誤差を何と呼ぶか。",
    choices: ["丸め誤差", "桁落ち", "情報落ち", "オーバフロー"], correctIndex: 1,
    explanation: "桁落ちは、絶対値がほぼ等しい数値同士の減算（または符号の異なる数値の加算）で、上位の有効桁が打ち消し合い、有効桁数が大きく減少する現象である。",
  },
  {
    id: "FE-A-PRACTICE-0061", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "根から葉に向かって、各ノードが高々二つの子をもつ木構造を何と呼ぶか。",
    choices: ["2分木", "有向グラフ", "線形リスト", "ハッシュ表"], correctIndex: 0,
    explanation: "2分木（バイナリツリー）は、各ノードが高々二つの子ノード（左の子・右の子）をもつ木構造である。",
  },
  {
    id: "FE-A-PRACTICE-0062", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "10進小数 0.625 を2進小数で表したものはどれか。",
    choices: ["0.101", "0.011", "0.110", "0.100"], correctIndex: 0,
    explanation: "0.625 = 0.5 + 0.125 = 2^-1 + 2^-3 なので、2進表記では 0.101 となる。",
  },
  {
    id: "FE-A-PRACTICE-0063", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "ある事象Aと事象Bが独立であり、Aの発生確率が0.4、Bの発生確率が0.5であるとき、AとBが両方とも発生する確率はどれか。",
    choices: ["0.1", "0.2", "0.45", "0.9"], correctIndex: 1,
    explanation: "AとBが独立であるとき、両方が発生する確率は積で求まる。0.4×0.5＝0.2。",
  },
  {
    id: "FE-A-PRACTICE-0064", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "有向グラフにおいて、あるノードから出ている辺の数を何と呼ぶか。",
    choices: ["入次数", "出次数", "深さ", "階層"], correctIndex: 1,
    explanation: "有向グラフにおいて、あるノードから出ている辺の本数を出次数、入ってくる辺の本数を入次数と呼ぶ。",
  },
  {
    id: "FE-A-PRACTICE-0065", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "文字コードのうち、1文字を可変長（1～4バイト）で表現でき、多言語に対応した国際標準の文字符号化方式はどれか。",
    choices: ["ASCII", "Shift_JIS", "UTF-8", "EBCDIC"], correctIndex: 2,
    explanation: "UTF-8は、Unicodeの文字を1～4バイトの可変長で符号化する方式であり、多言語対応の国際標準として広く使われている。",
  },
  {
    id: "FE-A-PRACTICE-0066", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "キュー（先入れ先出し）にA，B，C，Dの順にenqueueした直後にdequeueを2回行った場合、キューに残っている要素を先頭から順に並べたものはどれか。",
    choices: ["A，B", "B，C", "C，D", "D，C"], correctIndex: 2,
    explanation: "先入れ先出しのため、最初にAが、次にBがdequeueされる。残るのはC，Dであり、先頭（次に取り出される順）はCである。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0067", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "バブルソートの最悪計算量はどれか。",
    choices: ["O(1)", "O(n log n)", "O(n)", "O(n^2)"], correctIndex: 3,
    explanation: "バブルソートは隣接要素の比較・交換をn回×n回程度繰り返すため、最悪計算量はO(n^2)となる。",
  },
  {
    id: "FE-A-PRACTICE-0068", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "オブジェクト指向における「多相性（ポリモーフィズム）」の説明として、適切なものはどれか。",
    choices: [
      "同じ操作（メソッド呼出し）に対して、オブジェクトの型に応じて異なる処理が実行される性質",
      "一つのクラスから複数のインスタンスを生成できる性質",
      "クラスの内部データを外部から隠蔽する性質",
      "複数のクラスを1つのファイルにまとめる性質",
    ], correctIndex: 0,
    explanation: "多相性（ポリモーフィズム）は、同一のインタフェース（メソッド呼出し）に対して、実際のオブジェクトの型に応じて異なる振る舞いをする性質である。",
  },
  {
    id: "FE-A-PRACTICE-0069", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "ある処理を行う関数が自分自身を呼び出すことを何と呼ぶか。",
    choices: ["オーバロード", "オーバライド", "再帰", "多重継承"], correctIndex: 2,
    explanation: "関数が自分自身を呼び出す仕組みを再帰（recursion）と呼ぶ。階乗計算やフィボナッチ数列などに用いられる。",
  },
  {
    id: "FE-A-PRACTICE-0070", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "整列済みの配列に対して二分探索を行う場合の最悪計算量はどれか。",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correctIndex: 1,
    explanation: "二分探索は探索範囲を毎回半分に絞り込むため、最悪計算量はO(log n)となる。",
  },
  {
    id: "FE-A-PRACTICE-0071", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "抽象データ型のうち、後入れ先出し（LIFO）の特性をもつものはどれか。",
    choices: ["キュー", "スタック", "木構造", "グラフ"], correctIndex: 1,
    explanation: "スタックは、最後に入れたデータを最初に取り出す後入れ先出し（LIFO）の特性をもつデータ構造である。",
  },
  {
    id: "FE-A-PRACTICE-0072", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "動的計画法（DP）の説明として、適切なものはどれか。",
    choices: [
      "問題を部分問題に分割し、その結果を記憶しながら再利用することで、重複計算を避けて効率的に解く手法",
      "乱数を用いて近似的な解を求める手法",
      "全ての可能な組合せを漏れなく試す網羅的探索の別名",
      "並列処理によって複数のCPUで同時に計算する手法",
    ], correctIndex: 0,
    explanation: "動的計画法は、問題を部分問題に分割し、一度計算した部分問題の結果を記憶（メモ化）して再利用することで、重複した計算を避けて効率化する手法である。",
  },
  {
    id: "FE-A-PRACTICE-0073", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "クラスの設計において、あるクラスが別のクラスのインスタンスを自身のメンバとして保持する関係を何と呼ぶか。",
    choices: ["継承", "コンポジション（集約）", "多相性", "カプセル化"], correctIndex: 1,
    explanation: "コンポジション（集約）は、あるクラスが別のクラスのインスタンスを自身のメンバ（部品）として保持する「has-a」の関係を表す。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0074", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "CPU内のレジスタのうち、次に実行する命令のアドレスを保持するものはどれか。",
    choices: ["プログラムカウンタ", "アキュムレータ", "命令レジスタ", "汎用レジスタ"], correctIndex: 0,
    explanation: "プログラムカウンタ（PC）は、次に実行する命令が格納されている主記憶上のアドレスを保持するレジスタである。",
  },
  {
    id: "FE-A-PRACTICE-0075", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "電源を切っても記憶内容が保持される不揮発性の半導体メモリはどれか。",
    choices: ["DRAM", "SRAM", "フラッシュメモリ", "レジスタ"], correctIndex: 2,
    explanation: "フラッシュメモリは、電源を切っても記憶内容が保持される不揮発性の半導体メモリであり、SSDやUSBメモリなどに使われる。",
  },
  {
    id: "FE-A-PRACTICE-0076", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "主記憶と補助記憶の間で、頻繁に使うデータを一時的に高速な記憶装置に保持し、アクセス速度の差を緩和する仕組みを何と呼ぶか。",
    choices: ["キャッシュ", "スワッピング", "ミラーリング", "ストライピング"], correctIndex: 0,
    explanation: "キャッシュは、アクセス速度の異なる記憶階層の間で、よく使われるデータを高速な記憶装置に一時的に保持し、全体のアクセス速度を向上させる仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0077", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "同一の回路や装置を複数用意し、一方が故障してももう一方で処理を継続できるようにする設計思想はどれか。",
    choices: ["フェールセーフ", "フォールトトレランス", "フールプルーフ", "フェールソフト"], correctIndex: 1,
    explanation: "フォールトトレランスは、装置を冗長化（二重化など）することで、一部が故障してもシステム全体としては正常に動作し続けられるようにする設計思想である。",
  },
  {
    id: "FE-A-PRACTICE-0078", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの入出力装置に該当しないものはどれか。",
    choices: ["キーボード", "ディスプレイ", "プリンタ", "CPU"], correctIndex: 3,
    explanation: "CPUは演算・制御を担う中央処理装置であり、入出力装置には該当しない。キーボードは入力装置、ディスプレイ・プリンタは出力装置である。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0079", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "災害などによって主拠点が使用できなくなった場合に備え、別の場所にバックアップの拠点をあらかじめ用意しておく対策を何と呼ぶか。",
    choices: ["ディザスタリカバリ", "ロードバランシング", "キャパシティプランニング", "サンドボックス"], correctIndex: 0,
    explanation: "ディザスタリカバリ（災害復旧）は、災害などで主拠点が使用不能になった場合に備え、代替拠点や仕組みをあらかじめ準備しておく対策である。",
  },
  {
    id: "FE-A-PRACTICE-0080", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "クラウドサービスの提供形態のうち、OSやミドルウェアまでを利用者が管理し、アプリケーションの実行環境（仮想サーバなど）だけを提供するものはどれか。",
    choices: ["SaaS", "PaaS", "IaaS", "DaaS"], correctIndex: 2,
    explanation: "IaaS（Infrastructure as a Service）は、仮想サーバやストレージなどのインフラ基盤を提供し、その上のOSやミドルウェアの管理は利用者が行う形態である。",
  },
  {
    id: "FE-A-PRACTICE-0081", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "1台のサーバに障害が発生した場合に備え、普段は待機させておく予備のサーバに処理を引き継ぐ運用方式はどれか。",
    choices: ["ホットスタンバイ／コールドスタンバイ方式", "ロードシェアリング方式", "スケールアウト", "垂直分散処理"], correctIndex: 0,
    explanation: "待機系サーバをあらかじめ準備しておき、主系の障害時に処理を引き継ぐ方式をスタンバイ方式と呼び、即座に切替可能な状態のものをホットスタンバイという。",
  },
  {
    id: "FE-A-PRACTICE-0082", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "三つの装置が直列に接続され、全てが稼働している必要があるシステムがある。各装置の稼働率がそれぞれ0.9，0.9，0.8であるとき、システム全体の稼働率はおよそどれか。",
    choices: ["0.58", "0.65", "0.72", "0.81"], correctIndex: 1,
    explanation: "直列システムの稼働率は各装置の稼働率の積で求まる。0.9×0.9×0.8＝0.648となり、選択肢の中で最も近い値は0.65である。",
  },
  {
    id: "FE-A-PRACTICE-0083", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "複数のディスク装置を組み合わせて、性能や信頼性を高める技術の総称はどれか。",
    choices: ["RAID", "RAM", "ROM", "LAN"], correctIndex: 0,
    explanation: "RAID（Redundant Arrays of Inexpensive Disks）は、複数のディスクを組み合わせて性能向上や耐障害性を実現する技術の総称である。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0084", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "複数のプロセスが互いに相手の確保している資源の解放を待ち続け、処理が先に進まなくなる状態を何と呼ぶか。",
    choices: ["デッドロック", "スラッシング", "ページフォールト", "セマフォ"], correctIndex: 0,
    explanation: "デッドロックは、複数のプロセスがお互いに相手の保持する資源の解放を待ち合い、いずれも処理を進められなくなる状態である。",
  },
  {
    id: "FE-A-PRACTICE-0085", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "OSがCPUの使用権を短い時間ごとに複数のプロセスへ順に割り当てることで、あたかも同時に複数のプログラムが実行されているように見せる方式はどれか。",
    choices: ["マルチスレッド", "タイムシェアリング", "パイプライン", "デュアルコア"], correctIndex: 1,
    explanation: "タイムシェアリング（時分割）方式は、CPUの使用権を短い時間単位で複数のプロセスに順に割り当てることで、擬似的な同時実行を実現する方式である。",
  },
  {
    id: "FE-A-PRACTICE-0086", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "OSSに関する記述のうち、適切なものはどれか。",
    choices: [
      "ソースコードが公開されており、ライセンス条件に従えば自由に利用・改変・再配布できるソフトウェアである。",
      "無料で配布されているが、ソースコードは非公開のソフトウェアである。",
      "特定の企業だけが改変を許可されているソフトウェアである。",
      "実行ファイルのみが配布され、改変は一切禁止されているソフトウェアである。",
    ], correctIndex: 0,
    explanation: "OSS（オープンソースソフトウェア）は、ソースコードが公開され、規定されたライセンスに従うことで誰でも利用・改変・再配布ができるソフトウェアである。",
  },
  {
    id: "FE-A-PRACTICE-0087", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "ファイルの拡張子に関する一般的な記述として、適切なものはどれか。",
    choices: [
      "拡張子はファイルの内容を保証するものであり、改ざんすることはできない。",
      "拡張子は一般にファイル名の一部として付与され、ファイルの種類を推測する手がかりとして使われる。",
      "拡張子はOSが自動生成する暗号鍵である。",
      "拡張子はネットワークアドレスの一種である。",
    ], correctIndex: 1,
    explanation: "拡張子は、ファイル名の末尾に付与され、そのファイルの種類（形式）を推測する手がかりとして一般的に使われる。ただし拡張子は任意に変更可能であり、内容を保証するものではない。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0088", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "表の中から特定の条件を満たす行だけを取り出す関係演算はどれか。",
    choices: ["選択（selection）", "射影（projection）", "結合（join）", "差（difference）"], correctIndex: 0,
    explanation: "選択（selection）は、指定した条件を満たす行だけを表から取り出す関係演算である。",
  },
  {
    id: "FE-A-PRACTICE-0089", section: "A", topic: "データベース", difficulty: "HARD",
    body: "トランザクションの処理途中で障害が発生した場合、更新前の状態に戻す処理を何と呼ぶか。",
    choices: ["コミット", "ロールバック", "デッドロック", "チェックポイント"], correctIndex: 1,
    explanation: "ロールバックは、トランザクションが正常に完了できなかった場合に、そのトランザクションによる更新を取り消し、開始前の状態に戻す処理である。",
  },
  {
    id: "FE-A-PRACTICE-0090", section: "A", topic: "データベース", difficulty: "EASY",
    body: "表の中で、各行を一意に識別するための列（または列の組）を何と呼ぶか。",
    choices: ["外部キー", "主キー", "候補キー", "インデックス"], correctIndex: 1,
    explanation: "主キーは、表の各行を一意に識別するために指定される列（または列の組）であり、NULLや重複が許されない。",
  },
  {
    id: "FE-A-PRACTICE-0091", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "複数の表を特定の列の値で結び付けて、一つの表として取り出す関係演算はどれか。",
    choices: ["選択", "射影", "結合", "和"], correctIndex: 2,
    explanation: "結合（join）は、複数の表を共通の列（キー）の値に基づいて結び付け、一つの表として扱えるようにする関係演算である。",
  },
  {
    id: "FE-A-PRACTICE-0092", section: "A", topic: "データベース", difficulty: "HARD",
    body: "検索性能を向上させるために、表の特定の列に対して作成するデータ構造はどれか。",
    choices: ["ビュー", "インデックス", "トリガ", "ストアドプロシージャ"], correctIndex: 1,
    explanation: "インデックスは、表の特定の列に対して作成される検索用のデータ構造であり、検索処理の高速化に利用される。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0093", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "OSI基本参照モデルにおいて、IPアドレスによる経路制御（ルーティング）を担う層はどれか。",
    choices: ["物理層", "データリンク層", "ネットワーク層", "トランスポート層"], correctIndex: 2,
    explanation: "ネットワーク層は、IPアドレスに基づく経路選択（ルーティング）を担う層であり、代表的なプロトコルはIPである。",
  },
  {
    id: "FE-A-PRACTICE-0094", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "無線LANのアクセスポイントを識別するための名前はどれか。",
    choices: ["SSID", "URL", "MACアドレス", "ポート番号"], correctIndex: 0,
    explanation: "SSID（Service Set Identifier）は、無線LANのアクセスポイントを識別するための名前である。",
  },
  {
    id: "FE-A-PRACTICE-0095", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "プライベートIPアドレスを割り当てられた端末が、インターネット上のグローバルIPアドレスと相互変換して通信できるようにする技術はどれか。",
    choices: ["NAT", "DHCP", "DNS", "VPN"], correctIndex: 0,
    explanation: "NAT（Network Address Translation）は、プライベートIPアドレスとグローバルIPアドレスを相互に変換し、限られたグローバルIPアドレスを複数端末で共有できるようにする技術である。",
  },
  {
    id: "FE-A-PRACTICE-0096", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "TCPの特徴として、適切なものはどれか。",
    choices: [
      "コネクションレス型であり、到達確認を行わない。", "コネクション型であり、パケットの到達確認や再送制御を行う，信頼性の高い通信を実現する。",
      "動画配信など、リアルタイム性を最優先し信頼性を犠牲にするために使われる。", "MACアドレスに基づいてフレームを中継する。",
    ], correctIndex: 1,
    explanation: "TCPはコネクション型のプロトコルであり、パケットの到達確認・再送制御・順序保証などを行うことで信頼性の高い通信を実現する。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0097", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "利用者のシステムに気付かれないように潜伏し、外部からの指令を受けて不正な動作を行うマルウェアの総称に近いものはどれか。",
    choices: ["ボット", "アダプタ", "コンパイラ", "ドライバ"], correctIndex: 0,
    explanation: "ボットは、感染したコンピュータに潜伏し、外部の攻撃者（C&Cサーバ）からの指令に従って不正な動作を行うマルウェアである。",
  },
  {
    id: "FE-A-PRACTICE-0098", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "情報セキュリティの3要素（機密性・完全性・可用性）のうち、「許可された者だけが情報にアクセスできること」を指すものはどれか。",
    choices: ["機密性", "完全性", "可用性", "責任追跡性"], correctIndex: 0,
    explanation: "機密性（Confidentiality）は、許可された者だけが情報にアクセスできる状態を確保することを指す。",
  },
  {
    id: "FE-A-PRACTICE-0099", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "公開鍵暗号方式を用いてAさんがBさんに機密のメッセージを送る場合、Aさんが暗号化に使用すべき鍵はどれか。",
    choices: ["Aさんの公開鍵", "Aさんの秘密鍵", "Bさんの公開鍵", "Bさんの秘密鍵"], correctIndex: 2,
    explanation: "公開鍵暗号方式で機密性を確保するには、受信者（Bさん）の公開鍵で暗号化する。復号はBさんの秘密鍵でのみ可能なため、Bさん以外は内容を読めない。",
  },
  {
    id: "FE-A-PRACTICE-0100", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "利用者になりすまして、Webサイトの脆弱性を悪用し、他の利用者のブラウザ上で悪意のあるスクリプトを実行させる攻撃はどれか。",
    choices: ["クロスサイトスクリプティング（XSS）", "SQLインジェクション", "DNSキャッシュポイズニング", "ブルートフォース攻撃"], correctIndex: 0,
    explanation: "クロスサイトスクリプティング（XSS）は、Webサイトの脆弱性を利用して悪意のあるスクリプトを埋め込み、他の利用者のブラウザ上で実行させる攻撃である。",
  },
  {
    id: "FE-A-PRACTICE-0101", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "情報セキュリティにおけるリスク対応のうち、「保険への加入」のように損失発生時の負担を第三者に移す対応を何と呼ぶか。",
    choices: ["リスク回避", "リスク低減", "リスク移転", "リスク受容"], correctIndex: 2,
    explanation: "リスク移転は、保険への加入や外部委託などによって、リスクが顕在化した場合の損失負担を第三者に移す対応である。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0102", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "ソフトウェアの内部構造（ロジック）に着目し、命令やパスが漏れなく実行されるかを検証するテスト手法はどれか。",
    choices: ["ブラックボックステスト", "ホワイトボックステスト", "運用テスト", "受入れテスト"], correctIndex: 1,
    explanation: "ホワイトボックステストは、プログラムの内部構造（ロジックや分岐）に着目し、命令網羅やパスの網羅性を確認するテスト手法である。",
  },
  {
    id: "FE-A-PRACTICE-0103", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "システムの機能追加や修正を行った際、既存の機能に影響が出ていないかを確認するために行うテストはどれか。",
    choices: ["回帰テスト（リグレッションテスト）", "負荷テスト", "単体テスト", "静的解析"], correctIndex: 0,
    explanation: "回帰テスト（リグレッションテスト）は、プログラムの変更によって既存の機能に予期しない影響（デグレード）が生じていないかを確認するために行うテストである。",
  },
  {
    id: "FE-A-PRACTICE-0104", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "要件定義工程で主に行うこととして、適切なものはどれか。",
    choices: [
      "利用者や関係者の要求を明確にし、システムに実装すべき機能や性能を定義する。",
      "プログラムのソースコードを記述する。", "完成したシステムを本番環境へ展開する。",
      "テストケースの実行結果を記録する。",
    ], correctIndex: 0,
    explanation: "要件定義工程では、利用者や関係者へのヒアリングなどを通じて要求を整理し、システムが満たすべき機能・性能要件を明確化する。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0105", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトの作業を細分化し、階層構造で管理するための手法・図はどれか。",
    choices: ["WBS（作業分解構成図）", "ER図", "DFD", "UML"], correctIndex: 0,
    explanation: "WBS（Work Breakdown Structure）は、プロジェクトの作業を階層的に分解し、管理しやすい単位に整理するための手法・図である。",
  },
  {
    id: "FE-A-PRACTICE-0106", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "システム運用におけるインシデント管理の主な目的はどれか。",
    choices: [
      "発生したサービス障害を可能な限り迅速に復旧させ、業務への影響を最小限にすること",
      "新しいシステムを新規に開発すること", "ソフトウェアライセンスの契約内容を管理すること",
      "従業員の勤怠を管理すること",
    ], correctIndex: 0,
    explanation: "インシデント管理は、発生したサービス障害（インシデント）を迅速に復旧させ、業務への影響を最小限に抑えることを主な目的とする。",
  },
  {
    id: "FE-A-PRACTICE-0107", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "システム監査において、監査の独立性を確保するために最も重要なことはどれか。",
    choices: [
      "監査人が被監査部門から指揮命令を受けない体制にすること", "監査人が被監査部門の業務に精通していること",
      "監査人がプログラミングスキルをもつこと", "監査報告書を経営者に提出しないこと",
    ], correctIndex: 0,
    explanation: "システム監査の独立性を確保するためには、監査人が被監査部門から指揮命令を受けない、独立した立場で監査を行える体制が最も重要である。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0108", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "既存の商品やサービスと組み合わせて新たな価値を生み出す、他社サービスと連携するための公開されたインタフェースを何と呼ぶか。",
    choices: ["API", "CRM", "ERP", "SFA"], correctIndex: 0,
    explanation: "API（Application Programming Interface）は、他のソフトウェアやサービスと連携するために公開されたインタフェースであり、外部サービスとの機能連携に用いられる。",
  },
  {
    id: "FE-A-PRACTICE-0109", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "企業が自社の業務プロセスの一部を外部の専門業者に委託することを何と呼ぶか。",
    choices: ["アウトソーシング", "インソーシング", "リストラクチャリング", "ベンチマーキング"], correctIndex: 0,
    explanation: "アウトソーシングは、自社の業務プロセスの一部を外部の専門業者に委託することである。",
  },
  {
    id: "FE-A-PRACTICE-0110", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある製品の月間販売価格が1,000円、変動費が600円、月間固定費が800,000円であるとき、月間利益200,000円を達成するために必要な販売数量はどれか。",
    choices: ["2,000個", "2,500個", "3,000個", "5,000個"], correctIndex: 1,
    explanation: "1個当たりの限界利益＝1,000－600＝400円。必要販売数量＝（固定費＋目標利益）÷限界利益＝(800,000＋200,000)÷400＝2,500個。",
  },
  {
    id: "FE-A-PRACTICE-0111", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "企業が発売する新製品・新技術に対する消費者の採用時期を、早い順に分類したイノベータ理論の区分のうち、最も早く採用する層はどれか。",
    choices: ["イノベータ", "アーリーマジョリティ", "レイトマジョリティ", "ラガード"], correctIndex: 0,
    explanation: "イノベータ理論では、採用が最も早い層から順に「イノベータ」「アーリーアダプタ」「アーリーマジョリティ」「レイトマジョリティ」「ラガード」と分類される。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0017", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 average は，引数で与えられた要素数1以上の実数型配列 data の平均値を返す。\n〔プログラム〕\n○実数型: average(実数型の配列: data)\n　実数型: total ← 0\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　total ← total ＋ data[i]\n　endfor\n　return ［　　］",
    choices: ["total", "total ÷ dataの要素数", "total × dataの要素数", "data[1]"],
    correctIndex: 1,
    explanation: "平均値は合計値を要素数で割ることで求められる。",
  },
  {
    id: "FE-B-PRACTICE-0018", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 countOdd は，引数で与えられた整数型配列 data の中の奇数の個数を数えて返す。演算子modは剰余算を表す。\n〔プログラム〕\n○整数型: countOdd(整数型の配列: data)\n　整数型: count ← 0\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (［　　］)\n　　　count ← count ＋ 1\n　　endif\n　endfor\n　return count",
    choices: ["(data[i] mod 2) ＝ 0", "(data[i] mod 2) ＝ 1", "data[i] ＞ 0", "i mod 2 ＝ 1"],
    correctIndex: 1,
    explanation: "ある数を2で割った余りが1であれば奇数である。よって(data[i] mod 2)＝1の場合をカウントすればよい。",
  },
  {
    id: "FE-B-PRACTICE-0019", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 power は，引数で与えられた整数base及び0以上の整数expを受け取り、base の exp乗を返す。\n〔プログラム〕\n○整数型: power(整数型: base, 整数型: exp)\n　if (exp ＝ 0)\n　　return 1\n　endif\n　return base × ［　　］",
    choices: ["power(base, exp)", "power(base, exp － 1)", "power(base － 1, exp)", "power(base, exp ＋ 1)"],
    correctIndex: 1,
    explanation: "べき乗の再帰的な定義は base^exp = base × base^(exp-1) であるため、power(base, exp-1)を再帰的に呼び出す。",
  },
  {
    id: "FE-B-PRACTICE-0020", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 findFirstIndex は，引数で与えられた整数型配列 data の中から，値 target と等しい最初の要素の番号を返す。見つからない場合は0を返す。\n〔プログラム〕\n○整数型: findFirstIndex(整数型の配列: data, 整数型: target)\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (data[i] が target と等しい)\n　　　［ a ］\n　　endif\n　endfor\n　［ b ］",
    choices: [
      "a: return i／b: return 0", "a: return 0／b: return i",
      "a: return target／b: return 0", "a: i ← i ＋ 1／b: return i",
    ],
    correctIndex: 0,
    explanation: "一致した時点でその要素番号iを直ちに返す（a）。ループを最後まで抜けても見つからなければ、ループ後に0を返す（b）。",
  },
  {
    id: "FE-B-PRACTICE-0021", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 removeDuplicates は，昇順に整列済みの整数型配列 data から，隣接する重複要素を取り除いた新しい配列を返す（例：{1,1,2,3,3,3}→{1,2,3}）。\n〔プログラム〕\n○整数型の配列: removeDuplicates(整数型の配列: data)\n　整数型の配列: result ← {}\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (resultの要素数 ＝ 0 または ［　　］)\n　　　resultの末尾 に data[i]の値 を追加する\n　　endif\n　endfor\n　return result",
    choices: [
      "data[i] が resultの末尾の値 と等しくない", "data[i] が data[i － 1] と等しい",
      "i ＝ 1", "resultの要素数 ＞ 0",
    ],
    correctIndex: 0,
    explanation: "resultが空、または直前にresultへ追加した値（＝resultの末尾の値）とdata[i]が異なる場合にだけ追加することで、隣接する重複を除去できる。",
  },
  {
    id: "FE-B-PRACTICE-0022", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 fibonacci は，0以上の整数nを受け取り，フィボナッチ数列のn番目の値を返す（fibonacci(0)＝0，fibonacci(1)＝1，fibonacci(n)＝fibonacci(n-1)＋fibonacci(n-2)）。次の反復（非再帰）版のプログラムを完成させる。\n〔プログラム〕\n○整数型: fibonacci(整数型: n)\n　整数型の配列: data ← {0, 1}\n　整数型: i\n　if (n ≦ 1)\n　　return data[n ＋ 1]\n　endif\n　for (i を 2 から n まで 1 ずつ増やす)\n　　整数型: next ← ［　　］\n　　data[1] ← data[2]\n　　data[2] ← next\n　endfor\n　return data[2]",
    choices: [
      "data[1] ＋ data[2]", "data[2] － data[1]", "data[1] × data[2]", "data[2] ＋ 1",
    ],
    correctIndex: 0,
    explanation: "フィボナッチ数列の各項は直前の2項の和であるため、next ← data[1] ＋ data[2] として次の値を計算し、ウィンドウをスライドさせていく。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0023", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "G社は，社内システムへのリモートアクセスに，従業員全員が同じ固定パスワードを使い回すVPNアカウントを利用していた。ある元従業員がそのパスワードを退職後も知っていたことを悪用し，社内システムへ不正アクセスする事案が発生した。この再発防止策として，最も適切なものはどれか。",
    choices: [
      "VPN回線の帯域を増強する。", "従業員ごとに個別のアカウントを発行し，退職時には速やかに無効化する運用にする。",
      "社内ネットワークの物理的な配線を見直す。", "全社員に同じ新しい固定パスワードを再度配布する。",
    ], correctIndex: 1,
    explanation: "共有アカウントは退職者などのアクセス権を個別に無効化できないという根本的な問題がある。個別アカウントの発行と、退職時の速やかな無効化が適切な再発防止策となる。",
  },
  {
    id: "FE-B-PRACTICE-0024", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "H社の開発チームは，本番環境のデータベースの認証情報（ID・パスワード）を，ソースコード管理システム上のプログラム内に直接記述して管理していた。あるとき，このソースコードが誤って外部に公開されるリポジトリへ登録され，認証情報が第三者に閲覧可能な状態になっていたことが判明した。この事案の根本的な原因として，最も適切なものはどれか。",
    choices: [
      "ソースコード管理システムの利用そのもの", "認証情報をソースコードに直接埋め込み，環境変数やシークレット管理の仕組みを利用していなかったこと",
      "開発チームの人数が多かったこと", "本番環境のサーバの性能が不足していたこと",
    ], correctIndex: 1,
    explanation: "認証情報をソースコードに直接埋め込む運用は、リポジトリの公開範囲を誤るなどした際に情報漏えいへ直結する。環境変数やシークレット管理サービスを用いて認証情報をコードから分離することが根本的な対策となる。",
  },
  {
    id: "FE-B-PRACTICE-0025", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "I社では，社内無線LANのアクセスポイントに，出荷時のまま変更されていない管理者パスワードが設定されていた。この状況によって生じる主なリスクはどれか。",
    choices: [
      "電波の到達範囲が狭くなる。", "第三者が容易に管理画面へアクセスし，設定を不正に変更される可能性がある。",
      "通信速度が低下する。", "対応する周波数帯が制限される。",
    ], correctIndex: 1,
    explanation: "出荷時のデフォルトパスワードは製品マニュアルなどで公開されていることが多く、変更せずに使用すると第三者が容易に管理画面へアクセスして設定を不正に変更できてしまう。",
  },
  {
    id: "FE-B-PRACTICE-0026", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "J社は，取引先とのファイル共有に，リンクを知っている人なら誰でもアクセスできる設定のクラウドストレージを利用していた。共有した見積書のリンクがSNSに誤って投稿・拡散され，第三者が機密情報を閲覧できる状態になった。この事案の再発防止策として，最も適切なものはどれか。",
    choices: [
      "見積書のファイル名を変更する。", "共有設定を，特定の利用者（取引先の担当者）だけがアクセスできるように限定し，必要に応じてパスワードや有効期限を設定する。",
      "クラウドストレージの契約容量を増やす。", "見積書の作成日をファイル名から削除する。",
    ], correctIndex: 1,
    explanation: "「リンクを知っていれば誰でもアクセス可能」という共有設定は、リンクが意図せず拡散した場合に情報漏えいの直接原因となる。アクセス可能な利用者を限定し、パスワードや有効期限を設定することが適切な対策である。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 2)...`);
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
