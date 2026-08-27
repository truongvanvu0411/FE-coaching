/**
 * Original practice questions, batch 4 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-3.
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
    id: "FE-A-PRACTICE-0156", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "負数を2の補数で表現する体系において、8ビットで表現できる符号付き整数の範囲はどれか。",
    choices: ["-127～127", "-128～127", "-128～128", "0～255"], correctIndex: 1,
    explanation: "8ビットの2の補数表現では、-2^7（-128）から2^7-1（127）までの範囲を表現できる。",
  },
  {
    id: "FE-A-PRACTICE-0157", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "木構造において、子をもたないノードを何と呼ぶか。",
    choices: ["根（ルート）", "葉（リーフ）", "節（ノード）", "枝（エッジ）"], correctIndex: 1,
    explanation: "葉（リーフ）は、木構造において子をもたない末端のノードである。",
  },
  {
    id: "FE-A-PRACTICE-0158", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "ある標本化周波数44,100Hzのステレオ（2チャネル）音声を1標本当たり16ビットで量子化するとき、1秒間のデータ量はおよそ何バイトか。",
    choices: ["約44Kバイト", "約88Kバイト", "約176Kバイト", "約352Kバイト"], correctIndex: 2,
    explanation: "44,100標本/秒×2バイト（16ビット）×2チャネル＝176,400バイト、約176Kバイト。",
  },
  {
    id: "FE-A-PRACTICE-0159", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "命題「PならばQ」の対偶はどれか。",
    choices: ["QならばP", "PでないならばQでない", "QでないならばPでない", "PでないならばQ"], correctIndex: 2,
    explanation: "「PならばQ」の対偶は「QでないならばPでない」であり、元の命題と対偶は常に真偽が一致する。",
  },
  {
    id: "FE-A-PRACTICE-0160", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "グラフ理論において、全ての頂点間に辺が存在するグラフを何と呼ぶか。",
    choices: ["完全グラフ", "有向グラフ", "木", "森"], correctIndex: 0,
    explanation: "完全グラフは、任意の2頂点間に必ず辺が存在するグラフである。",
  },
  {
    id: "FE-A-PRACTICE-0161", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "2進数 1010 と 2進数 0011 の積を2進数で表したものはどれか。",
    choices: ["11000", "11110", "11011", "11100"], correctIndex: 1,
    explanation: "1010(2)=10, 0011(2)=3。10×3=30。30を2進数にすると11110(2)。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0162", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "整数nに対して、n以下の全ての自然数の合計を求める処理を、繰返し処理（ループ）を使わずに定数時間で計算する式はどれか。",
    choices: ["n × (n ＋ 1)", "n × (n ＋ 1) ÷ 2", "n × n", "n ÷ 2"], correctIndex: 1,
    explanation: "1からnまでの自然数の総和は、等差数列の和の公式 n(n+1)/2 で定数時間で計算できる。",
  },
  {
    id: "FE-A-PRACTICE-0163", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "貪欲法（グリーディ法）の説明として、適切なものはどれか。",
    choices: [
      "各段階で、その時点で最も良いと判断される選択を積み重ねていくことで解を求める手法である。",
      "全ての可能な組合せを漏れなく調べることで最適解を保証する手法である。",
      "乱数を用いて解の候補をランダムに生成する手法である。",
      "問題を部分問題に分割し、計算結果を全て記憶しながら解く手法である。",
    ], correctIndex: 0,
    explanation: "貪欲法（グリーディ法）は、各段階で局所的に最も良いと思われる選択を行い、それを積み重ねて解を構築する手法である。必ずしも大域的な最適解が得られるとは限らない。",
  },
  {
    id: "FE-A-PRACTICE-0164", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "プログラミングにおいて、変数の有効範囲（参照可能な範囲）のことを何と呼ぶか。",
    choices: ["スコープ", "ポインタ", "リテラル", "キャスト"], correctIndex: 0,
    explanation: "スコープは、プログラム中で変数が参照可能な範囲（有効範囲）を指す用語である。",
  },
  {
    id: "FE-A-PRACTICE-0165", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "配列とリスト（連結リスト）を比較した記述のうち、適切なものはどれか。",
    choices: [
      "配列は要素の追加・削除が常に高速だが、連結リストは要素番号での直接アクセスが遅い。",
      "配列は要素番号による直接アクセスが高速だが、途中への挿入・削除にはデータの移動が必要になる。連結リストは直接アクセスに時間がかかるが、途中への挿入・削除は前後のポインタの変更だけで済む。",
      "配列と連結リストの性能特性は全く同じである。",
      "連結リストは必ず固定長のメモリ領域に格納しなければならない。",
    ], correctIndex: 1,
    explanation: "配列は要素番号によるランダムアクセスが高速な一方、途中への挿入・削除には後続要素の移動が必要になる。連結リストはランダムアクセスに時間がかかるが、挿入・削除はポインタの繋ぎ替えだけで済む。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0166", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "デュアルコアCPUの説明として、適切なものはどれか。",
    choices: [
      "1つの演算コアの動作クロックを2倍にしたCPUである。", "1つのチップの中に2つの独立した演算コアを集積したCPUである。",
      "2つの独立したCPUチップを1つのソケットに搭載したものである。", "2種類の異なる命令セットを実行できるCPUである。",
    ], correctIndex: 1,
    explanation: "デュアルコアCPUは、1つのチップ（ダイ）の中に2つの独立した演算コアを集積し、並列処理を可能にしたプロセッサである。",
  },
  {
    id: "FE-A-PRACTICE-0167", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの起動時に最初に実行される、ハードウェアの初期化などを行うプログラムが格納されている、書換え不可（または限定的にのみ書換え可能）な記憶装置はどれか。",
    choices: ["RAM", "ROM", "HDD", "キャッシュメモリ"], correctIndex: 1,
    explanation: "ROM（Read Only Memory）は、電源を切っても内容が保持される不揮発性メモリであり、起動時に実行されるファームウェア（BIOS/UEFIなど）の格納に使われる。",
  },
  {
    id: "FE-A-PRACTICE-0168", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "命令の実行過程を「取出し」「解読」「実行」「書込み」などの段階に分割し、各段階を専用の回路が並行して処理することで、全体のスループットを高める技術はどれか。",
    choices: ["パイプライン処理", "マルチキャスト", "デフラグメンテーション", "ガベージコレクション"], correctIndex: 0,
    explanation: "パイプライン処理は、命令の実行過程を複数の段階に分割し、各段階を並行して処理することで、単位時間当たりに処理できる命令数（スループット）を向上させる技術である。",
  },
  {
    id: "FE-A-PRACTICE-0169", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "USBなどのシリアルインタフェースの特徴として、適切なものはどれか。",
    choices: [
      "データを1ビットずつ順番に送る方式であり、配線がシンプルで高速伝送にも対応しやすい。",
      "複数ビットを同時に並行して送る方式であり、短距離であれば必ずシリアルより高速である。",
      "無線通信専用のインタフェースである。",
      "電源供給を一切行うことができない規格である。",
    ], correctIndex: 0,
    explanation: "シリアルインタフェースは、データを1ビットずつ順番に伝送する方式であり、配線がシンプルで、高速なクロックにも対応しやすいため、USBなど現在の多くの周辺機器接続規格で採用されている。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0170", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "ある業務システムにおいて、毎日100件の処理が発生し、1件当たりの平均処理時間が3分であるとき、8時間（480分）の営業時間内に処理を終えるために最低限必要な並列処理数はどれか（余裕は考慮しないものとする）。",
    choices: ["1", "2", "3", "4"], correctIndex: 0,
    explanation: "100件×3分＝300分の総処理時間が必要であり、480分の営業時間内に収まるため、並列処理は1系統で足りる（300分≦480分）。",
  },
  {
    id: "FE-A-PRACTICE-0171", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "クラウドサービスのうち、電子メールやオフィスソフトなどのアプリケーションそのものを、インターネット経由で利用できる形態はどれか。",
    choices: ["SaaS", "PaaS", "IaaS", "オンプレミス"], correctIndex: 0,
    explanation: "SaaS（Software as a Service）は、電子メールやオフィスソフトなど、完成されたアプリケーションをインターネット経由でそのまま利用できる形態である。",
  },
  {
    id: "FE-A-PRACTICE-0172", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "システムが要求された処理を予定の時間内に完了する能力を何と呼ぶか。",
    choices: ["可用性", "応答性能", "保守性", "移植性"], correctIndex: 1,
    explanation: "応答性能（レスポンスタイム）は、システムが要求を受けてから処理を完了するまでの時間に関する性能を指す。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0173", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "OSが、実行中の複数のプロセスにCPU時間を割り当てる処理を何と呼ぶか。",
    choices: ["スケジューリング", "スワッピング", "キャッシング", "バッファリング"], correctIndex: 0,
    explanation: "スケジューリングは、OSが複数のプロセスに対してCPU時間をどのような順序・配分で割り当てるかを決定する処理である。",
  },
  {
    id: "FE-A-PRACTICE-0174", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "コンピュータに接続された周辺機器を制御するために、OSと機器の間を仲介するソフトウェアを何と呼ぶか。",
    choices: ["デバイスドライバ", "コンパイラ", "ミドルウェア", "ファームウェア"], correctIndex: 0,
    explanation: "デバイスドライバは、OSと周辺機器（プリンタやディスプレイなど）の間を仲介し、機器を制御するためのソフトウェアである。",
  },
  {
    id: "FE-A-PRACTICE-0175", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "ガベージコレクションの説明として、適切なものはどれか。",
    choices: [
      "プログラムが使用しなくなったメモリ領域を自動的に検出し解放する仕組みである。",
      "ディスクの断片化を解消し、ファイルアクセスを高速化する処理である。",
      "ネットワーク上の不要なパケットを削除する処理である。",
      "ログファイルを定期的に削除する処理である。",
    ], correctIndex: 0,
    explanation: "ガベージコレクションは、プログラムが動的に確保したメモリのうち、もはや参照されなくなった（不要になった）領域を自動的に検出して解放する仕組みである。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0176", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "SQLにおいて、表の特定の行を削除するための文はどれか。",
    choices: ["DROP", "DELETE", "TRUNCATE", "REMOVE"], correctIndex: 1,
    explanation: "DELETE文は、WHERE句で指定した条件に一致する行を表から削除するために使用する（表そのものを削除するのはDROP文）。",
  },
  {
    id: "FE-A-PRACTICE-0177", section: "A", topic: "データベース", difficulty: "EASY",
    body: "実際のデータを保持せず、SELECT文の定義に基づいて仮想的に表のように扱えるものを何と呼ぶか。",
    choices: ["ビュー", "インデックス", "トリガ", "パーティション"], correctIndex: 0,
    explanation: "ビューは、実データを保持せず、あらかじめ定義したSELECT文の結果を、あたかも1つの表のように扱えるようにする仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0178", section: "A", topic: "データベース", difficulty: "HARD",
    body: "3層クライアントサーバシステムにおいて、業務ロジックを担当する層はどれか。",
    choices: ["プレゼンテーション層", "アプリケーション層（ビジネスロジック層）", "データ層", "ネットワーク層"], correctIndex: 1,
    explanation: "3層クライアントサーバシステムでは、画面表示を担うプレゼンテーション層、業務処理を担うアプリケーション層（ビジネスロジック層）、データの永続化を担うデータ層に分離される。",
  },
  {
    id: "FE-A-PRACTICE-0179", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "関係データベースにおける表の行を、一般に何と呼ぶか。",
    choices: ["タプル（レコード）", "属性（アトリビュート）", "ドメイン", "スキーマ"], correctIndex: 0,
    explanation: "関係データベースにおいて、表の1行はタプル（レコード）と呼ばれ、1列は属性（アトリビュート）と呼ばれる。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0180", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "OSI基本参照モデルにおいて、通信の信頼性を確保するための順序制御や再送制御を担う層はどれか。",
    choices: ["物理層", "ネットワーク層", "トランスポート層", "アプリケーション層"], correctIndex: 2,
    explanation: "トランスポート層は、通信の信頼性を確保するための順序制御・再送制御・フロー制御などを担う層であり、代表的なプロトコルはTCPである。",
  },
  {
    id: "FE-A-PRACTICE-0181", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "無線通信の一種で、数メートル程度の近距離でスマートフォンとイヤホンなどの周辺機器を接続するために使われる規格はどれか。",
    choices: ["Bluetooth", "Wi-Fi", "5G", "衛星回線"], correctIndex: 0,
    explanation: "Bluetoothは、数メートル程度の近距離無線通信規格であり、スマートフォンと周辺機器（イヤホンなど）の接続によく使われる。",
  },
  {
    id: "FE-A-PRACTICE-0182", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "50Mビット/秒の伝送路を用いて、200Mバイトのファイルを転送するのに理論上必要な最短時間はどれか（伝送効率100％とする）。",
    choices: ["4秒", "16秒", "32秒", "64秒"], correctIndex: 2,
    explanation: "200Mバイト＝1,600Mビット。1,600÷50＝32秒。",
  },
  {
    id: "FE-A-PRACTICE-0183", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "電子メールの宛先アドレスのうち、他の受信者に見えない状態でコピーを送信する際に指定する欄はどれか。",
    choices: ["To", "Cc", "Bcc", "From"], correctIndex: 2,
    explanation: "Bcc（Blind Carbon Copy）は、指定した宛先が他の受信者からは見えない状態でメールのコピーを送信するための欄である。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0184", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "ソフトウェアが想定していない大量または不正な形式のデータを入力し、その挙動を観察して脆弱性を見つけ出す手法はどれか。",
    choices: ["ファジング", "ペネトレーションテスト", "ソーシャルエンジニアリング", "サンドボックス解析"], correctIndex: 0,
    explanation: "ファジングは、ソフトウェアに問題を引き起こしそうな多様なデータ（不正な形式や極端な値など）を入力し、その挙動を監視して脆弱性を発見する手法である。",
  },
  {
    id: "FE-A-PRACTICE-0185", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "パスワードの代わりに、指紋や虹彩など身体的特徴を用いて本人確認を行う認証方式を何と呼ぶか。",
    choices: ["生体認証", "多要素認証", "シングルサインオン", "二段階認証"], correctIndex: 0,
    explanation: "生体認証（バイオメトリクス認証）は、指紋や虹彩、静脈など身体的特徴を用いて本人確認を行う認証方式である。",
  },
  {
    id: "FE-A-PRACTICE-0186", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "認証局（CA）が発行するデジタル証明書の主な役割はどれか。",
    choices: [
      "公開鍵の所有者が本人であることを第三者機関が保証すること", "パスワードを暗号化して保存すること",
      "通信速度を向上させること", "ウイルスの感染を検知すること",
    ], correctIndex: 0,
    explanation: "デジタル証明書は、認証局（CA）が発行し、ある公開鍵が特定の個人・組織のものであることを第三者機関として保証する役割を果たす。",
  },
  {
    id: "FE-A-PRACTICE-0187", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "特定の組織や個人を狙って、業務に関連する内容を装った電子メールなどで攻撃を仕掛ける手法を何と呼ぶか。",
    choices: ["標的型攻撃", "ばらまき型攻撃", "総当たり攻撃", "水飲み場型攻撃"], correctIndex: 0,
    explanation: "標的型攻撃は、特定の組織や個人を狙い、業務に関連する内容を装った巧妙なメールなどを送りつけて情報窃取などを行う攻撃である。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0188", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "プログラム中の全ての分岐（if文の真偽両方など）を少なくとも1回は実行するように設計されたテストケースの網羅基準はどれか。",
    choices: ["命令網羅", "分岐（判定条件）網羅", "条件網羅", "パス網羅"], correctIndex: 1,
    explanation: "分岐網羅（判定条件網羅）は、プログラム中の各分岐（真・偽の両方）を少なくとも1回は実行するようにテストケースを設計する基準である。",
  },
  {
    id: "FE-A-PRACTICE-0189", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "システム開発において、実際に利用者が使用する本番に近い環境で、業務が問題なく行えるかを確認するテストはどれか。",
    choices: ["単体テスト", "結合テスト", "運用テスト（受入れテスト）", "静的解析"], correctIndex: 2,
    explanation: "運用テスト（受入れテスト）は、実際の利用者が本番に近い環境でシステムを操作し、業務が問題なく行えるかを最終確認するテストである。",
  },
  {
    id: "FE-A-PRACTICE-0190", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "システム開発の見積り手法のうち、過去の類似システムの開発実績データを基に、規模や工数を類推する方法はどれか。",
    choices: ["ファンクションポイント法", "類推見積法", "積み上げ法（ボトムアップ見積法）", "パラメトリック見積法"], correctIndex: 1,
    explanation: "類推見積法は、過去に開発した類似システムの実績データと比較することで、新規プロジェクトの規模や工数を類推する見積り手法である。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0191", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトで発生したリスクについて、発生確率と影響度を分析し、対応の優先順位を決定する活動を何と呼ぶか。",
    choices: ["リスクアセスメント", "リスクファイナンス", "リスクトランスファー", "リスクアボイダンス"], correctIndex: 0,
    explanation: "リスクアセスメントは、想定されるリスクについて発生確率や影響度を分析・評価し、対応の優先順位を決定する活動である。",
  },
  {
    id: "FE-A-PRACTICE-0192", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "ITサービスマネジメントにおいて、稼働中のシステムに変更（パッチ適用や設定変更など）を加える際の管理プロセスを何と呼ぶか。",
    choices: ["変更管理", "インシデント管理", "キャパシティ管理", "可用性管理"], correctIndex: 0,
    explanation: "変更管理は、稼働中のシステムへの変更（パッチ適用、設定変更など）を計画的かつ統制された方法で実施するための管理プロセスである。",
  },
  {
    id: "FE-A-PRACTICE-0193", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "プロジェクトのステークホルダ（利害関係者）の説明として、適切なものはどれか。",
    choices: [
      "プロジェクトチームのメンバーだけを指す。", "プロジェクトの実行や結果によって影響を受ける、または影響を与える全ての個人・組織を指す。",
      "プロジェクトの発注者だけを指す。", "システムの開発言語を決定する専門家だけを指す。",
    ], correctIndex: 1,
    explanation: "ステークホルダ（利害関係者）は、プロジェクトの実行や結果によって影響を受ける、または影響を与える可能性のある全ての個人・組織（顧客、経営者、開発チーム、利用部門など）を指す。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0194", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "企業が自社の事業活動を通じて社会的責任を果たすことを表す略語はどれか。",
    choices: ["CSR", "CRM", "ERP", "KGI"], correctIndex: 0,
    explanation: "CSR（Corporate Social Responsibility）は、企業が利益の追求だけでなく、社会的責任を果たすべきであるという考え方・活動を指す。",
  },
  {
    id: "FE-A-PRACTICE-0195", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "顧客に関する情報を一元的に管理し、顧客との関係を強化するための経営手法・システムを表す略語はどれか。",
    choices: ["CRM", "SCM", "ERP", "BPR"], correctIndex: 0,
    explanation: "CRM（Customer Relationship Management）は、顧客情報を一元管理し、顧客との関係を強化することで売上や満足度の向上を図る経営手法・システムである。",
  },
  {
    id: "FE-A-PRACTICE-0196", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある投資案件の初期投資額が500万円、1年目から3年目までの各年の利益がそれぞれ200万円であるとき、単純な合計利益ベースでの投資回収期間はどれか（割引率は考慮しない）。",
    choices: ["1.5年", "2.0年", "2.5年", "3.0年"], correctIndex: 2,
    explanation: "1年目・2年目で合計400万円、3年目の200万円のうち100万円（500万円－400万円）を回収すればよいので、3年目の半分（0.5年）を加えて2.5年で回収できる。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0035", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 isPrime は，2以上の整数nを受け取り，nが素数であればtrueを，そうでなければfalseを返す。演算子modは剰余算を表す。\n〔プログラム〕\n○論理型: isPrime(整数型: n)\n　整数型: i\n　for (i を 2 から n － 1 まで 1 ずつ増やす)\n　　if (［　　］)\n　　　return false\n　　endif\n　endfor\n　return true",
    choices: ["(n mod i) ＝ 0", "(n mod i) ≠ 0", "(i mod n) ＝ 0", "n ＝ i"],
    correctIndex: 0,
    explanation: "nが2からn-1までのいずれかで割り切れる（余りが0になる）場合、nは素数ではないためfalseを返す。",
  },
  {
    id: "FE-B-PRACTICE-0036", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 bubbleSortStep は，引数で与えられた整数型配列 data に対して，バブルソートの1パス分（隣接要素の比較・交換を1回ずつ、末尾まで）を実行する（戻り値はなく、dataを直接書き換える）。\n〔プログラム〕\n○bubbleSortStep(整数型の配列: data)\n　整数型: i, temp\n　for (i を 1 から dataの要素数 － 1 まで 1 ずつ増やす)\n　　if (data[i] ［ a ］ data[i ＋ 1])\n　　　temp ← data[i]\n　　　data[i] ← data[i ＋ 1]\n　　　［ b ］ ← temp\n　　endif\n　endfor",
    choices: [
      "a: ＞／b: data[i ＋ 1]", "a: ＜／b: data[i ＋ 1]",
      "a: ＞／b: data[i]", "a: ＜／b: data[i]",
    ],
    correctIndex: 0,
    explanation: "昇順に整列するバブルソートでは、隣接する要素data[i]がdata[i+1]より大きい場合に交換する（a：＞）。交換後、一時保存していたtempの値をdata[i+1]に代入することで交換が完了する（b：data[i+1]）。",
  },
  {
    id: "FE-B-PRACTICE-0037", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 toUpperFlags は，引数で与えられた文字列型配列 chars の各文字について，大文字（'A'～'Z'）であるかどうかを表す論理型配列を返す。ここで、比較演算子は文字コード順で大小比較ができるものとする。\n〔プログラム〕\n○論理型の配列: toUpperFlags(文字列型の配列: chars)\n　論理型の配列: result ← {}\n　整数型: i\n　for (i を 1 から charsの要素数 まで 1 ずつ増やす)\n　　if (chars[i] ≧ 'A' and chars[i] ≦ 'Z')\n　　　resultの末尾 に ［　　］ を追加する\n　　else\n　　　resultの末尾 に false を追加する\n　　endif\n　endfor\n　return result",
    choices: ["true", "false", "chars[i]", "i"],
    correctIndex: 0,
    explanation: "if条件（chars[i]がA～Zの範囲内、すなわち大文字）が真の場合の処理であるため、resultにはtrueを追加する。",
  },
  {
    id: "FE-B-PRACTICE-0038", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 rotateLeft は，引数で与えられた整数型配列 data の全要素を1つ左に循環シフトする（先頭要素は末尾に移動する）（例：{1,2,3,4}→{2,3,4,1}）（戻り値はなく、dataを直接書き換える）。\n〔プログラム〕\n○rotateLeft(整数型の配列: data)\n　整数型: n ← dataの要素数\n　整数型: first ← data[1]\n　整数型: i\n　for (i を 1 から n － 1 まで 1 ずつ増やす)\n　　data[i] ← data[i ＋ 1]\n　endfor\n　data[n] ← ［　　］",
    choices: ["first", "data[1]", "data[n]", "data[n － 1]"],
    correctIndex: 0,
    explanation: "先頭要素は書き換えループの前にfirstとして保存してあるため、末尾の要素にはこのfirstを設定する。data[1]はループ内で既に上書きされているため使えない。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0039", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "N社は，社外の取引先とファイルをやり取りする際，メールに添付したパスワード付きZIPファイルと，そのパスワードを記載した別のメールを続けて同一の宛先に送信する運用（いわゆるPPAP）を長年続けていた。この運用が抱えるセキュリティ上の問題点として，最も適切なものはどれか。",
    choices: [
      "添付ファイルのサイズが大きくなりすぎる。", "メールが盗聴された場合，暗号化ファイルとパスワードの両方が同一経路で送られるため，暗号化の効果が実質的に失われる。",
      "取引先がZIPファイルを解凍できない。", "メールの送信に時間が掛かるようになる。",
    ], correctIndex: 1,
    explanation: "PPAPと呼ばれるこの運用は、暗号化ファイルとパスワードを同じ経路（メール）で送るため、メールが盗聴・傍受された場合には両方とも同時に入手されてしまい、暗号化の意味が実質的になくなるという問題が指摘されている。",
  },
  {
    id: "FE-B-PRACTICE-0040", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "O社の開発チームは，本番リリース前の最終テストとして，複数の開発者が本番データベースの複製に直接アクセスできる共有の検証環境を用意していた。この検証環境には，顧客の氏名・住所・電話番号などの実データがそのまま複製されていた。この運用のセキュリティ上の問題点として，最も適切なものはどれか。",
    choices: [
      "検証環境のサーバスペックが不足すること", "実際の個人情報が本番同様のアクセス制御なしに複数人からアクセス可能な環境に置かれ，情報漏えいのリスクが高まること",
      "テストの実行時間が長くなること", "開発者の人数が多すぎること",
    ], correctIndex: 1,
    explanation: "検証環境に本番の実データ（個人情報を含む）をそのまま複製すると、本番環境と同等のアクセス制御が敷かれていない場合、情報漏えいのリスクが高まる。マスキングや仮名化を行ったテストデータを使用することが望ましい。",
  },
  {
    id: "FE-B-PRACTICE-0041", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "P社の従業員が，社内の重要な会議の内容を記録したノートを，カフェのテーブルに置き忘れて紛失した。このノートには顧客名や契約条件などの機密情報が手書きで記載されていた。この事案から学ぶべき教訓として，最も適切なものはどれか。",
    choices: [
      "情報セキュリティ対策は電子データだけでなく、紙媒体などの非電子的な情報にも同様に必要である。",
      "会議の実施そのものをやめるべきである。", "ノートのメーカーを変更するべきである。",
      "カフェでの会議を禁止すれば十分である。",
    ], correctIndex: 0,
    explanation: "情報セキュリティ対策はサーバやPCなどの電子データだけでなく、紙媒体に記載された情報の管理（社外持出しルール、置き忘れ防止など）にも同様に必要である。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 4)...`);
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
