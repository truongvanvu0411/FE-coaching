/**
 * Original practice questions, batch 3 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-2.
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
    id: "FE-A-PRACTICE-0112", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "10進数 100 を8進数で表したものはどれか。",
    choices: ["124", "144", "154", "164"], correctIndex: 1,
    explanation: "100 ÷ 8 = 12 余り 4、12 ÷ 8 = 1 余り 4、1 ÷ 8 = 0 余り 1。余りを逆順に並べると 144(8)。",
  },
  {
    id: "FE-A-PRACTICE-0113", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "8ビットの2進数で表された符号付き整数（2の補数表現）11111011 が表す10進数の値はどれか。",
    choices: ["-5", "-4", "251", "123"], correctIndex: 0,
    explanation: "2の補数表現で負数を求めるには、全ビットを反転して1を加える。11111011を反転すると00000100（4）、これに1を加えると00000101（5）。したがって元の値は-5。",
  },
  {
    id: "FE-A-PRACTICE-0114", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "整列済みの配列に対して、先頭から順に1件ずつ比較していく単純な探索方法を何と呼ぶか。",
    choices: ["二分探索", "線形探索", "ハッシュ探索", "木構造探索"], correctIndex: 1,
    explanation: "線形探索（逐次探索）は、配列の先頭から順に1件ずつ目的の値と比較していく最も単純な探索方法である。",
  },
  {
    id: "FE-A-PRACTICE-0115", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "命題P，Qについて、Pが偽、Qが真であるとき、「P OR Q」の真理値はどれか。",
    choices: ["真", "偽", "不定", "PとQの値による"], correctIndex: 0,
    explanation: "論理和（OR）は、少なくとも一方が真であれば真になる。Qが真であるため、P OR Qは真となる。",
  },
  {
    id: "FE-A-PRACTICE-0116", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "根から葉までの深さがどのノードでもほぼ等しくなるように保たれている2分探索木がある。要素数が31個のとき、この木の高さ（根を深さ0とする）はどれか。",
    choices: ["3", "4", "5", "31"], correctIndex: 1,
    explanation: "均衡2分木で要素数nのとき、高さはおよそlog2(n+1)-1。n=31なら2^5-1=31であり、高さは4（深さ0から4までの5段で31ノード）。",
  },
  {
    id: "FE-A-PRACTICE-0117", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "データの集合を表現するとき、要素の並び順に意味をもたず、同じ要素を重複して含まない抽象データ型を何と呼ぶか。",
    choices: ["リスト", "集合（セット）", "キュー", "スタック"], correctIndex: 1,
    explanation: "集合（セット）は、要素の順序に意味を持たず、同一の要素の重複を許さない抽象データ型である。",
  },
  {
    id: "FE-A-PRACTICE-0118", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "16進数 A5 と 16進数 0F の和を16進数で表したものはどれか。",
    choices: ["A4", "B4", "AF", "B0"], correctIndex: 1,
    explanation: "A5(16)=165, 0F(16)=15。165+15=180。180を16進数に変換すると 180=11×16+4 でB4(16)となる。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0119", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "挿入ソートの説明として、適切なものはどれか。",
    choices: [
      "整列済みの部分列に対して、まだ整列していない要素を適切な位置に挿入していく方法である。",
      "隣接する要素を比較し、順序が逆であれば交換することを繰り返す方法である。",
      "配列を基準値で二つのグループに分割し、それぞれを再帰的に整列する方法である。",
      "未整列の部分から最小値を選び、先頭と交換することを繰り返す方法である。",
    ], correctIndex: 0,
    explanation: "挿入ソートは、既に整列済みの部分列に対して、未整列の要素を1つずつ適切な位置に挿入していくことで全体を整列させる手法である。",
  },
  {
    id: "FE-A-PRACTICE-0120", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "スタックを用いて実現できる処理として、適切なものはどれか。",
    choices: [
      "プリンタへの印刷ジョブを、受け付けた順番に処理する。", "括弧の対応関係（開き括弧と閉じ括弧の整合性）を検査する。",
      "銀行の窓口で、来た順に顧客を呼び出す。", "複数の処理を到着順に公平に実行する。",
    ], correctIndex: 1,
    explanation: "括弧の対応検査は、開き括弧が来るたびにスタックへpushし、閉じ括弧が来るたびにpopして対応する開き括弧かを確認する、スタックの典型的な応用例である。",
  },
  {
    id: "FE-A-PRACTICE-0121", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "クラスからインスタンス（オブジェクト）を生成する際に呼び出される、初期化を行う特別なメソッドを何と呼ぶか。",
    choices: ["デストラクタ", "コンストラクタ", "アクセサ", "イテレータ"], correctIndex: 1,
    explanation: "コンストラクタは、クラスからインスタンスを生成する際に自動的に呼び出され、初期化処理を行う特別なメソッドである。",
  },
  {
    id: "FE-A-PRACTICE-0122", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "配列やリストの各要素に対して、順番に処理を適用するための制御構造はどれか。",
    choices: ["if文", "for文（繰返し処理）", "switch文", "goto文"], correctIndex: 1,
    explanation: "for文などの繰返し処理は、配列やリストの各要素に対して順番に同じ処理を適用するために使われる制御構造である。",
  },
  {
    id: "FE-A-PRACTICE-0123", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "クイックソートにおいて、既に整列済みの配列に対して常に配列の先頭要素を基準値（ピボット）として選んだ場合に起こりやすい問題はどれか。",
    choices: [
      "計算量が最悪の場合O(n^2)まで悪化する。", "必ず正しくソートできなくなる。",
      "メモリ使用量が0になる。", "整数オーバフローが発生する。",
    ], correctIndex: 0,
    explanation: "既に整列済みの配列に対して常に先頭（または末尾）をピボットに選ぶと、分割が著しく偏り、最悪計算量がO(n^2)まで悪化する。ランダム選択や中央値選択などで回避する。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0124", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "SSD（Solid State Drive）の特徴として、適切なものはどれか。",
    choices: [
      "磁気ディスクを回転させてデータを読み書きする。", "半導体メモリを用いており、機械的な可動部分がないため衝撃に強い。",
      "電源を切ると記憶内容が失われる。", "HDDに比べて必ず記憶容量当たりの単価が安い。",
    ], correctIndex: 1,
    explanation: "SSDはフラッシュメモリなどの半導体メモリを用いた記憶装置であり、HDDのような回転する円盤や可動部分がないため、衝撃に強く高速なアクセスが可能である。",
  },
  {
    id: "FE-A-PRACTICE-0125", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの内部で、命令やデータを一時的に保持する、CPU内の高速な記憶場所を何と呼ぶか。",
    choices: ["レジスタ", "補助記憶装置", "光ディスク", "磁気テープ"], correctIndex: 0,
    explanation: "レジスタは、CPU内部にある高速な記憶場所であり、演算に使うデータや命令を一時的に保持する。",
  },
  {
    id: "FE-A-PRACTICE-0126", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "クロック周波数が3GHzのCPUで、ある命令の実行に平均4クロックを要する場合、1秒間に実行できる命令数はおよそどれか。",
    choices: ["約0.75億命令", "約7.5億命令", "約12億命令", "約75億命令"], correctIndex: 1,
    explanation: "1秒間のクロック数は3×10^9。1命令に4クロック必要なので、実行できる命令数は3×10^9÷4＝7.5×10^8＝約7.5億命令。",
  },
  {
    id: "FE-A-PRACTICE-0127", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "複数のCPUコアを1つのチップに集積し、並列処理性能を高めたプロセッサを何と呼ぶか。",
    choices: ["マルチコアプロセッサ", "シングルコアプロセッサ", "GPU", "FPGA"], correctIndex: 0,
    explanation: "マルチコアプロセッサは、複数の演算コアを1つのチップに集積し、並列に処理を行うことで性能向上を図ったプロセッサである。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0128", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "四つの装置が並列に接続され、いずれか一つでも稼働していればシステム全体が稼働しているとみなせるシステムがある。各装置の稼働率が0.5であるとき、システム全体の稼働率はどれか。",
    choices: ["0.5", "0.75", "0.9375", "0.99"], correctIndex: 2,
    explanation: "並列システムの稼働率＝1－(全て停止する確率)＝1－(1－0.5)^4＝1－0.0625＝0.9375。",
  },
  {
    id: "FE-A-PRACTICE-0129", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "システムの処理能力を、サーバの台数を増やすことによって向上させる方式を何と呼ぶか。",
    choices: ["スケールアップ", "スケールアウト", "スケールダウン", "デグレード"], correctIndex: 1,
    explanation: "スケールアウトは、サーバの台数を増やして負荷を分散させることでシステム全体の処理能力を向上させる方式である（1台の性能を強化するのはスケールアップ）。",
  },
  {
    id: "FE-A-PRACTICE-0130", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "システムの信頼性向上のために、同じ機能をもつ装置を二重に用意しておく設計の考え方を何と呼ぶか。",
    choices: ["冗長化", "簡素化", "仮想化", "標準化"], correctIndex: 0,
    explanation: "冗長化は、同じ機能をもつ装置や回線を複数用意しておくことで、一方に障害が発生しても他方で処理を継続できるようにする設計の考え方である。",
  },
  {
    id: "FE-A-PRACTICE-0131", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "MTBFが1,800時間，MTTRが200時間の装置がある。この装置の稼働率はどれか。",
    choices: ["0.1", "0.2", "0.8", "0.9"], correctIndex: 3,
    explanation: "稼働率＝MTBF÷(MTBF＋MTTR)＝1,800÷2,000＝0.9。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0132", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "複数のプロセスやスレッドが共有資源に同時にアクセスすることで、意図しない結果が生じることを防ぐために、同時に1つの処理だけが資源にアクセスできるように制御する仕組みを何と呼ぶか。",
    choices: ["排他制御", "並行処理", "多重定義", "非同期処理"], correctIndex: 0,
    explanation: "排他制御は、複数のプロセスやスレッドが共有資源へ同時にアクセスすることで生じる不整合を防ぐために、一度に1つの処理だけがアクセスできるように制御する仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0133", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "OSにおいて、実行中のプログラムの単位を何と呼ぶか。",
    choices: ["プロセス", "ファイル", "レジストリ", "ドライバ"], correctIndex: 0,
    explanation: "プロセスは、OSによって管理される実行中のプログラムの単位であり、それぞれ独立したメモリ空間などの資源が割り当てられる。",
  },
  {
    id: "FE-A-PRACTICE-0134", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "仮想記憶方式において、主記憶の内容を一定サイズのブロックに分割して管理する方式を何と呼ぶか。",
    choices: ["セグメント方式", "ページング方式", "オーバレイ方式", "スワッピング方式"], correctIndex: 1,
    explanation: "ページング方式は、主記憶と仮想記憶を「ページ」と呼ばれる一定サイズのブロックに分割して管理する仮想記憶の実現方式である。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0135", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "同じ内容のデータが複数の場所に重複して保存されることによって生じる問題として、適切でないものはどれか。",
    choices: [
      "更新時にすべての場所を漏れなく修正しないと矛盾が生じる。", "記憶容量を余分に消費する。",
      "検索処理が一切実行できなくなる。", "データの整合性を保つための管理コストが増加する。",
    ], correctIndex: 2,
    explanation: "データの重複は更新時異常や記憶容量の浪費、整合性維持コストの増加を招くが、「検索処理が一切実行できなくなる」ことはなく、これは重複の問題として適切でない。",
  },
  {
    id: "FE-A-PRACTICE-0136", section: "A", topic: "データベース", difficulty: "HARD",
    body: "複数のトランザクションを同時に実行しても矛盾が生じないようにする制御方式のうち、更新対象のデータに対して他のトランザクションからのアクセスを一時的に制限する方式はどれか。",
    choices: ["ロック方式", "レプリケーション", "シャーディング", "パーティショニング"], correctIndex: 0,
    explanation: "ロック方式は、あるトランザクションが更新中のデータに対して、他のトランザクションが同時にアクセス（読み書き）できないように制限する並行制御の方式である。",
  },
  {
    id: "FE-A-PRACTICE-0137", section: "A", topic: "データベース", difficulty: "EASY",
    body: "SQLにおいて、表に新しい行を追加するための文はどれか。",
    choices: ["SELECT", "INSERT", "UPDATE", "DELETE"], correctIndex: 1,
    explanation: "INSERT文は、表に新しい行（レコード）を追加するために使用する。",
  },
  {
    id: "FE-A-PRACTICE-0138", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "関係データベースにおいて、1つの表の列に複数の値を格納してはならないという制約を何と呼ぶか（第1正規形の要件）。",
    choices: ["繰返し項目を排除すること", "主キーを設定すること", "外部キーを設定すること", "インデックスを作成すること"], correctIndex: 0,
    explanation: "第1正規形の要件は、各列（属性）に単一の値だけを格納し、繰返し項目（1つの列に複数の値が入る状態）を排除することである。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0139", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "電子メールを受信するためのプロトコルのうち、サーバ上にメールを残したまま、複数の端末から同じメールボックスの状態を同期して閲覧できるものはどれか。",
    choices: ["POP3", "IMAP", "SMTP", "FTP"], correctIndex: 1,
    explanation: "IMAPは、メールをサーバ上に保持したまま、複数の端末から同じメールボックスへアクセスし、既読・未読などの状態を同期できるプロトコルである。",
  },
  {
    id: "FE-A-PRACTICE-0140", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "コンピュータネットワークにおいて、データの伝送単位を細かく分割し、宛先情報を付けて送る方式を何と呼ぶか。",
    choices: ["回線交換方式", "パケット交換方式", "専用線方式", "衛星通信方式"], correctIndex: 1,
    explanation: "パケット交換方式は、データを小さな単位（パケット）に分割し、それぞれに宛先情報を付けて送信する通信方式であり、インターネットの基盤技術である。",
  },
  {
    id: "FE-A-PRACTICE-0141", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "ネットワークに接続された端末に対して、IPアドレスなどのネットワーク設定情報を自動的に割り当てるプロトコルはどれか。",
    choices: ["DHCP", "ARP", "ICMP", "SNMP"], correctIndex: 0,
    explanation: "DHCP（Dynamic Host Configuration Protocol）は、ネットワークに接続した端末に対してIPアドレスなどの設定情報を自動的に割り当てるプロトコルである。",
  },
  {
    id: "FE-A-PRACTICE-0142", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "192.168.1.0/24 のネットワークにおいて、割り当て可能なホストアドレスの最大個数はどれか（ネットワークアドレスとブロードキャストアドレスを除く）。",
    choices: ["24個", "62個", "254個", "256個"], correctIndex: 2,
    explanation: "/24はホスト部が8ビットであり、2^8=256通りのアドレスがある。そこからネットワークアドレスとブロードキャストアドレスの2つを除くと254個が割り当て可能である。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0143", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "サーバに大量の通信を送り付けて処理能力を圧迫し、サービスを提供できない状態に追い込む攻撃はどれか。",
    choices: ["DoS攻撃", "フィッシング", "ソーシャルエンジニアリング", "なりすまし"], correctIndex: 0,
    explanation: "DoS（Denial of Service）攻撃は、大量の通信やリクエストを送り付けることでサーバの処理能力やネットワーク帯域を圧迫し、サービスを提供できない状態にする攻撃である。",
  },
  {
    id: "FE-A-PRACTICE-0144", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "情報セキュリティの3要素（機密性・完全性・可用性）のうち、「情報が改ざんされていないこと」を指すものはどれか。",
    choices: ["機密性", "完全性", "可用性", "真正性"], correctIndex: 1,
    explanation: "完全性（Integrity）は、情報が破壊、改ざん、消去されていない正確な状態であることを指す。",
  },
  {
    id: "FE-A-PRACTICE-0145", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "ハッシュ関数の性質として、適切なものはどれか。",
    choices: [
      "同じ入力からは常に異なる出力（ハッシュ値）が得られる。", "任意の長さの入力から固定長の出力を生成し、出力から元の入力を復元することは事実上困難である。",
      "ハッシュ値から元のデータを容易に復元できる。", "暗号化と復号に同じ鍵を使用する。",
    ], correctIndex: 1,
    explanation: "ハッシュ関数は、任意の長さの入力データから固定長のハッシュ値を生成する一方向性の関数であり、ハッシュ値から元のデータを復元することは事実上困難である。",
  },
  {
    id: "FE-A-PRACTICE-0146", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "システムやソフトウェアに存在する、未修正のセキュリティ上の欠陥を悪用した、対策が確立する前に行われる攻撃を何と呼ぶか。",
    choices: ["ゼロデイ攻撃", "標的型攻撃", "辞書攻撃", "リプレイ攻撃"], correctIndex: 0,
    explanation: "ゼロデイ攻撃は、脆弱性が発見されてから修正プログラム（パッチ）が提供されるまでの間に、その脆弱性を悪用して行われる攻撃である。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0147", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "システム開発において、利用者の目に触れる画面や操作性など、外部から見た仕様を定義する工程はどれか。",
    choices: ["外部設計", "内部設計", "プログラム設計", "運用設計"], correctIndex: 0,
    explanation: "外部設計は、利用者から見える画面や帳票、操作方法などの仕様を定義する工程であり、利用者の視点に立った設計を行う。",
  },
  {
    id: "FE-A-PRACTICE-0148", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "複数のモジュールを組み合わせて、モジュール間のインタフェースが正しく機能するかを確認するテストはどれか。",
    choices: ["単体テスト", "結合テスト", "システムテスト", "受入れテスト"], correctIndex: 1,
    explanation: "結合テストは、単体テストが完了した複数のモジュールを組み合わせ、モジュール間のインタフェースが正しく連携して動作するかを確認するテストである。",
  },
  {
    id: "FE-A-PRACTICE-0149", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "アジャイル開発において、開発チームが自律的に作業を進め、進捗や課題を短時間で共有するために毎日決まった時間に行う短いミーティングを何と呼ぶか。",
    choices: ["スプリントレビュー", "デイリースクラム", "スプリントプランニング", "レトロスペクティブ"], correctIndex: 1,
    explanation: "デイリースクラムは、開発チームが毎日決まった時間・場所で短時間行うミーティングであり、進捗状況や当面の課題を共有する。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0150", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトの各作業の開始・終了予定時期を示すと同時に、作業間の依存関係を矢印で表現できる図はどれか。",
    choices: ["ガントチャート", "アローダイアグラム（PERT図）", "特性要因図", "パレート図"], correctIndex: 1,
    explanation: "アローダイアグラム（PERT図）は、作業間の依存関係を矢印（アロー）で表現し、プロジェクト全体の所要日数やクリティカルパスを分析するために用いられる。",
  },
  {
    id: "FE-A-PRACTICE-0151", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "ITサービスマネジメントにおいて、利用者と提供者の間で合意するサービスの品質水準を定めた文書を何と呼ぶか。",
    choices: ["SLA（サービスレベル合意書）", "NDA（秘密保持契約）", "RFP（提案依頼書）", "WBS（作業分解構成図）"], correctIndex: 0,
    explanation: "SLA（Service Level Agreement）は、サービス提供者と利用者の間で、提供するサービスの品質水準（可用性や応答時間など）について合意した文書である。",
  },
  {
    id: "FE-A-PRACTICE-0152", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "プロジェクトの進捗管理において、計画された作業量に対する実際の完了作業量の割合を測定する際に用いられる指標として、適切なものはどれか。",
    choices: ["EVM（アーンドバリューマネジメント）", "SWOT分析", "ファイブフォース分析", "ベンチマーキング"], correctIndex: 0,
    explanation: "EVM（アーンドバリューマネジメント）は、計画値・出来高（アーンドバリュー）・実コストを比較することで、プロジェクトのコストと進捗のパフォーマンスを定量的に評価する手法である。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0153", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "自社製品と競合他社の製品を比較し、優れた企業の手法（ベストプラクティス）を分析して自社の改善に活かす手法を何と呼ぶか。",
    choices: ["ベンチマーキング", "アライアンス", "M&A", "リストラクチャリング"], correctIndex: 0,
    explanation: "ベンチマーキングは、業界内外の優れた企業の業務手法（ベストプラクティス）と自社を比較し、自社の改善に役立てる手法である。",
  },
  {
    id: "FE-A-PRACTICE-0154", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "商品やサービスの独自性を示す名称やマークであり、法律によって保護される権利はどれか。",
    choices: ["特許権", "商標権", "著作権", "実用新案権"], correctIndex: 1,
    explanation: "商標権は、商品やサービスに使用する名称やマーク（トレードマーク）を保護する産業財産権の一つである。",
  },
  {
    id: "FE-A-PRACTICE-0155", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある企業の製品Xの月間固定費が600,000円、1個当たりの販売価格が2,000円、1個当たりの変動費が800円であるとき、損益分岐点となる月間販売数量はどれか。",
    choices: ["300個", "375個", "500個", "750個"], correctIndex: 2,
    explanation: "1個当たりの限界利益＝2,000－800＝1,200円。損益分岐点数量＝固定費÷限界利益＝600,000÷1,200＝500個。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0027", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 findMin は，引数で与えられた要素数1以上の整数型配列 data の中の最小値を返す。\n〔プログラム〕\n○整数型: findMin(整数型の配列: data)\n　整数型: minVal ← data[1]\n　整数型: i\n　for (i を 2 から dataの要素数 まで 1 ずつ増やす)\n　　if (［　　］)\n　　　minVal ← data[i]\n　　endif\n　endfor\n　return minVal",
    choices: ["data[i] ＜ minVal", "data[i] ＞ minVal", "data[i] ＝ minVal", "i ＜ minVal"],
    correctIndex: 0,
    explanation: "現在の最小値minValより小さい要素data[i]が見つかるたびにminValを更新することで、最終的に配列全体の最小値が得られる。",
  },
  {
    id: "FE-B-PRACTICE-0028", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 sumOfSquares は，引数で与えられた整数nを受け取り，1からnまでの整数の2乗の和（1^2＋2^2＋…＋n^2）を返す。\n〔プログラム〕\n○整数型: sumOfSquares(整数型: n)\n　整数型: total ← 0\n　整数型: i\n　for (i を 1 から n まで 1 ずつ増やす)\n　　total ← total ＋ ［　　］\n　endfor\n　return total",
    choices: ["i", "i × i", "i × n", "total × i"],
    correctIndex: 1,
    explanation: "iの2乗はi×iで計算できる。各iについてi×iをtotalに加算していくことで、1からnまでの2乗の和が求まる。",
  },
  {
    id: "FE-B-PRACTICE-0029", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 contains は，引数で与えられた整数型配列 data の中に，値 target と等しい要素が存在すればtrueを，存在しなければfalseを返す。\n〔プログラム〕\n○論理型: contains(整数型の配列: data, 整数型: target)\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (data[i] が target と等しい)\n　　　return true\n　　endif\n　endfor\n　return ［　　］",
    choices: ["true", "false", "data[i]", "0"],
    correctIndex: 1,
    explanation: "ループを最後まで実行しても一致する要素が見つからなかった場合、targetは配列に存在しないため、falseを返す。",
  },
  {
    id: "FE-B-PRACTICE-0030", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 countGreaterThan は，引数で与えられた整数型配列 data の中から，引数 threshold より大きい要素の個数を数えて返す。\n〔プログラム〕\n○整数型: countGreaterThan(整数型の配列: data, 整数型: threshold)\n　整数型: count ← ［ a ］\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (data[i] ＞ threshold)\n　　　count ← ［ b ］\n　　endif\n　endfor\n　return count",
    choices: [
      "a: 0／b: count ＋ 1", "a: 1／b: count ＋ 1",
      "a: 0／b: count － 1", "a: 0／b: i",
    ],
    correctIndex: 0,
    explanation: "件数を数えるカウンタは0で初期化し（a）、条件を満たすたびに1ずつ増やす（b）のが標準的な数え上げの実装である。",
  },
  {
    id: "FE-B-PRACTICE-0031", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 concat は，引数で与えられた二つの整数型配列 a 及び b を連結した新しい配列を返す（例：a＝{1,2}，b＝{3,4}のとき，戻り値は{1,2,3,4}）。\n〔プログラム〕\n○整数型の配列: concat(整数型の配列: a, 整数型の配列: b)\n　整数型の配列: result ← {}\n　整数型: i\n　for (i を 1 から aの要素数 まで 1 ずつ増やす)\n　　resultの末尾 に a[i]の値 を追加する\n　endfor\n　for (i を 1 から ［　　］ まで 1 ずつ増やす)\n　　resultの末尾 に b[i]の値 を追加する\n　endfor\n　return result",
    choices: ["aの要素数", "bの要素数", "resultの要素数", "aの要素数 ＋ bの要素数"],
    correctIndex: 1,
    explanation: "2つ目のループはbの全要素をresultの末尾に追加する処理であるため、ループの範囲はbの要素数まででよい。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0032", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "K社は，顧客管理システムのログイン画面において，ログイン失敗時に「IDが存在しません」「パスワードが違います」のように，IDとパスワードのどちらが間違っているかを個別に表示していた。この仕様が招くセキュリティ上のリスクとして，最も適切なものはどれか。",
    choices: [
      "サーバの処理負荷が増加する。", "攻撃者が総当たりでIDの実在を確認でき，有効なIDの絞り込みに悪用される可能性がある。",
      "画面の表示速度が低下する。", "ログイン画面のデザインが複雑になる。",
    ], correctIndex: 1,
    explanation: "エラーメッセージでIDとパスワードのどちらが誤りかを区別して表示すると、攻撃者は実在するIDを効率的に特定できてしまう。一般に「IDまたはパスワードが違います」のように統一したメッセージを表示することが望ましい。",
  },
  {
    id: "FE-B-PRACTICE-0033", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "L社の情報システム部門は，社内の全サーバに対して同一のroot（管理者）パスワードを設定し，複数の担当者がそのパスワードを共有して運用していた。あるとき，設定ミスによる障害が発生したが，どの担当者の操作が原因かを特定できなかった。今後の運用改善策として，最も適切なものはどれか。",
    choices: [
      "root パスワードの文字列を長くする。", "担当者ごとに個別の管理者権限アカウントを発行し，操作ログを個人単位で記録・追跡できるようにする。",
      "サーバの台数を減らす。", "パスワードを紙に書いて金庫に保管する。",
    ], correctIndex: 1,
    explanation: "共有アカウントでは誰がどの操作を行ったかを追跡できない。個別のアカウントを発行し、操作ログを個人単位で記録・追跡できるようにすることで、原因究明や責任追跡性（アカウンタビリティ）を確保できる。",
  },
  {
    id: "FE-B-PRACTICE-0034", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "M社の従業員が，社外の無料公衆無線LANに接続し，暗号化されていない状態で社内システムへログインした。この通信が第三者に盗聴され，認証情報が漏えいするリスクを低減するための対策として，最も適切なものはどれか。",
    choices: [
      "PCの画面の明るさを下げる。", "VPN（Virtual Private Network）を利用して通信を暗号化してから社内システムに接続する。",
      "無線LANのアクセスポイント名を覚えやすいものに変更する。", "ノートPCのバッテリー残量を確認する。",
    ], correctIndex: 1,
    explanation: "公衆無線LANなどの信頼できないネットワークを経由する場合、VPNを利用して通信全体を暗号化することで、第三者による盗聴のリスクを大幅に低減できる。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 3)...`);
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
