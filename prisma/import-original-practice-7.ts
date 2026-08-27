/**
 * Original practice questions, batch 7 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-6.
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
    id: "FE-A-PRACTICE-0271", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "2進数 11001 を10進数に変換したものはどれか。",
    choices: ["23", "25", "27", "29"], correctIndex: 1,
    explanation: "11001(2) = 1×16 + 1×8 + 0×4 + 0×2 + 1×1 = 16+8+1 = 25。",
  },
  {
    id: "FE-A-PRACTICE-0272", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "配列の中で、最初に格納されている要素の番号（添字）が0である言語がある。要素数が10のとき、最後の要素の番号はどれか。",
    choices: ["8", "9", "10", "11"], correctIndex: 1,
    explanation: "要素番号が0から始まる場合、要素数10の配列の番号は0,1,...,9となり、最後は9。",
  },
  {
    id: "FE-A-PRACTICE-0273", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "ある実数を単精度浮動小数点数（32ビット）で表現する際に生じる誤差の説明として、適切なものはどれか。",
    choices: [
      "全ての実数を誤差なく正確に表現できる。", "仮数部のビット数が有限であるため、表現できない値は近似値（丸め誤差を含む値）になる。",
      "整数は誤差なく表現できるが、負の数は表現できない。", "浮動小数点数は文字列としてのみ扱われる。",
    ], correctIndex: 1,
    explanation: "浮動小数点数は仮数部のビット数が有限であるため、全ての実数を正確に表現することはできず、多くの場合、丸め誤差を含む近似値として扱われる。",
  },
  {
    id: "FE-A-PRACTICE-0274", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "根から特定のノードまでの辺の本数を、そのノードの何と呼ぶか。",
    choices: ["次数", "深さ", "高さ", "幅"], correctIndex: 1,
    explanation: "根からあるノードまでの辺の本数を、そのノードの深さと呼ぶ。",
  },
  {
    id: "FE-A-PRACTICE-0275", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "スタックにおいて、要素を追加する操作を何と呼ぶか。",
    choices: ["push", "pop", "peek", "poll"], correctIndex: 0,
    explanation: "スタックに要素を追加する操作をpush、取り出す操作をpopと呼ぶ。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0276", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "ヒープソートで使用されるデータ構造「ヒープ」の性質として、適切なものはどれか（最大ヒープの場合）。",
    choices: [
      "親ノードの値は、常に子ノードの値以上である。", "親ノードの値は、常に子ノードの値以下である。",
      "全てのノードが同じ値をもつ。", "葉ノードだけが値をもつ。",
    ], correctIndex: 0,
    explanation: "最大ヒープでは、親ノードの値が常に子ノードの値以上であるという性質（ヒープ条件）が保たれる。",
  },
  {
    id: "FE-A-PRACTICE-0277", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "問題をより小さな同種の部分問題に分割し、それぞれを再帰的に解いてから結果を統合する設計技法を何と呼ぶか。",
    choices: ["分割統治法", "動的計画法", "貪欲法", "バックトラック法"], correctIndex: 0,
    explanation: "分割統治法は、問題を複数のより小さな同種の部分問題に分割し、それぞれを再帰的に解決してから、その結果を統合して元の問題の解を得る設計技法である（マージソートやクイックソートなどに使われる）。",
  },
  {
    id: "FE-A-PRACTICE-0278", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "プログラム中で、複数の関連するデータをひとまとめにして扱うために定義する、独自のデータ型を何と呼ぶか（オブジェクト指向以前の一般的な用語）。",
    choices: ["構造体", "定数", "演算子", "コメント"], correctIndex: 0,
    explanation: "構造体は、複数の異なる型のデータをひとまとめにして扱うために定義する、複合的なデータ型である。",
  },
  {
    id: "FE-A-PRACTICE-0279", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "コンパイル時ではなく、プログラムの実行時に、呼び出すべきメソッドの実装が決定される仕組みを何と呼ぶか。",
    choices: ["静的束縛", "動的束縛（実行時多相性）", "定数畳み込み", "静的解析"], correctIndex: 1,
    explanation: "動的束縛は、プログラムの実行時に、オブジェクトの実際の型に応じて呼び出すべきメソッドの実装が決定される仕組みであり、多相性（ポリモーフィズム）を実現する基盤となる。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0280", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "コンピュータの記憶装置のうち、最も容量当たりの単価が安く、大容量のデータの長期保存に適した装置はどれか。",
    choices: ["レジスタ", "キャッシュメモリ", "主記憶（DRAM）", "HDD（ハードディスク）"], correctIndex: 3,
    explanation: "HDD（ハードディスク）は、レジスタやキャッシュメモリ、主記憶と比べてアクセス速度は遅いが、容量当たりの単価が安く、大容量データの長期保存に適している。",
  },
  {
    id: "FE-A-PRACTICE-0281", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの処理装置が、命令を「取出し→解読→実行」という一連の手順で処理するサイクルを何と呼ぶか。",
    choices: ["命令サイクル", "リフレッシュサイクル", "クロックサイクルの逆数", "アクセスサイクル"], correctIndex: 0,
    explanation: "命令サイクルは、CPUが1つの命令を「取出し（フェッチ）→解読（デコード）→実行（エグゼキュート）」という一連の手順で処理する周期である。",
  },
  {
    id: "FE-A-PRACTICE-0282", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "組込みシステムなどで用いられる、製造後にユーザが論理回路の構成を書き換えられる集積回路はどれか。",
    choices: ["ASIC", "FPGA", "DRAM", "ROM"], correctIndex: 1,
    explanation: "FPGA（Field-Programmable Gate Array）は、製造後にユーザが内部の論理回路の構成を自由に書き換えられる集積回路である。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0283", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "システムのキャパシティ（処理能力）を、将来の需要増加を見込んであらかじめ計画する活動を何と呼ぶか。",
    choices: ["キャパシティプランニング", "インシデント管理", "変更管理", "リリース管理"], correctIndex: 0,
    explanation: "キャパシティプランニングは、将来の需要増加を見込んで、システムの処理能力（キャパシティ）を計画的に確保する活動である。",
  },
  {
    id: "FE-A-PRACTICE-0284", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "複数の企業や部門で共同利用するために構築されたクラウド環境の形態を何と呼ぶか。",
    choices: ["パブリッククラウド", "プライベートクラウド", "コミュニティクラウド", "オンプレミス"], correctIndex: 2,
    explanation: "コミュニティクラウドは、共通の目的や関心をもつ複数の組織が共同で利用するために構築・運用されるクラウド環境の形態である。",
  },
  {
    id: "FE-A-PRACTICE-0285", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "二つの装置が並列に接続されたシステムがある。システム全体の稼働率を0.99以上にしたい。各装置の稼働率が等しいとき、必要な各装置の最小稼働率はおよそどれか。",
    choices: ["約0.80", "約0.90", "約0.95", "約0.99"], correctIndex: 1,
    explanation: "並列システムの稼働率は1－(1－p)^2で表される。1－(1－p)^2≧0.99を解くと、(1－p)^2≦0.01、1－p≦0.1、p≧0.9となる。よって各装置の稼働率は約0.90以上必要である。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0286", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "OSのプロセススケジューリングにおいて、あらかじめ定めた時間（タイムスライス）が経過すると、実行中のプロセスを一時中断し、他のプロセスに実行権を渡す方式を何と呼ぶか。",
    choices: ["ラウンドロビン方式", "先着順方式（FCFS）", "優先度順方式のみ", "一括処理方式"], correctIndex: 0,
    explanation: "ラウンドロビン方式は、各プロセスに一定時間（タイムスライス）ずつCPUの使用権を順番に割り当てるスケジューリング方式であり、時間が経過すると次のプロセスに実行権を渡す。",
  },
  {
    id: "FE-A-PRACTICE-0287", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "コンピュータに新しいソフトウェアを導入することを何と呼ぶか。",
    choices: ["インストール", "アンインストール", "フォーマット", "デフラグ"], correctIndex: 0,
    explanation: "インストールは、コンピュータに新しいソフトウェアを導入し、使用可能な状態にする作業である。",
  },
  {
    id: "FE-A-PRACTICE-0288", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "コンテナ型の仮想化技術の特徴として、適切なものはどれか。",
    choices: [
      "ホストOSのカーネルを共有しつつ、アプリケーションの実行環境を分離するため、仮想マシン方式に比べて軽量に動作する。",
      "必ず専用の物理ハードウェアを必要とする。", "OSを含めた環境全体を仮想化するため、仮想マシン方式より起動が遅い。",
      "ネットワーク通信を一切行えない。",
    ], correctIndex: 0,
    explanation: "コンテナ型仮想化は、ホストOSのカーネルを複数のコンテナで共有しつつ、アプリケーションの実行環境（ライブラリなど）を分離する方式であり、独立したOSを必要とする仮想マシン方式に比べて軽量かつ高速に起動できる。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0289", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "関係データベースにおいて、まだ正規化されていない表を第1正規形にする操作として、適切なものはどれか。",
    choices: [
      "繰返し項目を排除し、各列に単一の値だけが入るようにする。", "全ての表を1つに統合する。",
      "主キーを削除する。", "インデックスを全て削除する。",
    ], correctIndex: 0,
    explanation: "第1正規形にするためには、1つの列に複数の値が入る「繰返し項目」を排除し、各列に単一の値だけが格納されるようにする必要がある。",
  },
  {
    id: "FE-A-PRACTICE-0290", section: "A", topic: "データベース", difficulty: "EASY",
    body: "SQLにおいて、条件を満たす行の件数を数えるための集計関数はどれか。",
    choices: ["COUNT", "SUM", "AVG", "MAX"], correctIndex: 0,
    explanation: "COUNT関数は、指定した条件を満たす行の件数を数えるための集計関数である。",
  },
  {
    id: "FE-A-PRACTICE-0291", section: "A", topic: "データベース", difficulty: "HARD",
    body: "分散データベースにおいて、あるデータの更新が全てのレプリカ（複製）に反映されるまでの間、一時的に古いデータを参照してしまう可能性がある整合性のモデルを何と呼ぶか。",
    choices: ["強整合性", "結果整合性（最終的整合性）", "排他制御", "正規化"], correctIndex: 1,
    explanation: "結果整合性（最終的整合性、eventual consistency）は、更新が即座に全レプリカへ反映されることは保証しないが、一定時間が経過すれば最終的に全てのレプリカが同じ内容になることを保証する整合性モデルである。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0292", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "ネットワークを流れるパケットを収集し、その内容を解析するためのソフトウェアやツールを何と呼ぶか。",
    choices: ["パケットキャプチャツール（プロトコルアナライザ）", "ファイアウォール", "ルータ", "スイッチングハブ"], correctIndex: 0,
    explanation: "パケットキャプチャツール（プロトコルアナライザ）は、ネットワークを流れるパケットを収集し、その内容（ヘッダやペイロード）を解析するためのソフトウェア・ツールである。",
  },
  {
    id: "FE-A-PRACTICE-0293", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "IPv4アドレスは何ビットで構成されるか。",
    choices: ["16ビット", "32ビット", "64ビット", "128ビット"], correctIndex: 1,
    explanation: "IPv4アドレスは32ビットで構成される（IPv6アドレスは128ビット）。",
  },
  {
    id: "FE-A-PRACTICE-0294", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "複数の物理LANを、あたかも1つのLANであるかのように、あるいは1つの物理LANを複数の独立した論理LANであるかのように分割・統合する技術を何と呼ぶか。",
    choices: ["VLAN", "NAT", "DNS", "DHCP"], correctIndex: 0,
    explanation: "VLAN（Virtual LAN）は、物理的な接続構成に関わらず、論理的にネットワークを分割・統合する技術である。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0295", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "ネットワークやシステムに対する不正アクセスや異常な通信を検知し、管理者に通知する仕組みを何と呼ぶか。",
    choices: ["IDS（侵入検知システム）", "VPN", "NAT", "プロキシサーバ"], correctIndex: 0,
    explanation: "IDS（Intrusion Detection System、侵入検知システム）は、ネットワークやシステムに対する不正アクセスや異常な通信を検知し、管理者に通知する仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0296", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "利用者のキー入力を記録し、パスワードなどの機密情報を盗み取るマルウェアを何と呼ぶか。",
    choices: ["キーロガー", "ワーム", "アドウェア", "ランサムウェア"], correctIndex: 0,
    explanation: "キーロガーは、利用者のキーボード入力を記録し、パスワードなどの機密情報を盗み取ることを目的としたマルウェア（またはハードウェア機器）である。",
  },
  {
    id: "FE-A-PRACTICE-0297", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "情報セキュリティマネジメントシステム（ISMS）の国際規格はどれか。",
    choices: ["ISO/IEC 27001", "ISO 9001", "ISO 14001", "ISO/IEC 20000"], correctIndex: 0,
    explanation: "ISO/IEC 27001は、情報セキュリティマネジメントシステム（ISMS）に関する国際規格であり、組織が情報資産を適切に管理するための要求事項を定めている。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0298", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "テスト工程において、テスト対象のプログラムに意図的にバグを埋め込み、そのバグがテストで検出される割合から、テストの網羅性を評価する手法はどれか。",
    choices: ["エラー埋込み法", "ブラックボックステスト", "ホワイトボックステスト", "静的解析"], correctIndex: 0,
    explanation: "エラー埋込み法は、既知のバグを意図的にプログラムへ埋め込み、それがテストで検出される割合を測定することで、テストケースの網羅性（残存バグの推定）を評価する手法である。",
  },
  {
    id: "FE-A-PRACTICE-0299", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "システム開発におけるプロトタイピングモデルの特徴として、適切なものはどれか。",
    choices: [
      "開発の初期段階で試作品（プロトタイプ）を作成し、利用者に確認してもらいながら要求を明確化していく。",
      "要件定義から運用まで一切後戻りせずに進める。", "テスト工程を実施しない。",
      "ドキュメントの作成を一切行わない。",
    ], correctIndex: 0,
    explanation: "プロトタイピングモデルは、開発の初期段階で試作品（プロトタイプ）を作成して利用者に確認してもらい、フィードバックを反映しながら要求を明確化していく開発モデルである。",
  },
  {
    id: "FE-A-PRACTICE-0300", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "ソフトウェアの品質特性のうち、システムが要求された機能を、指定された条件下で正しく実行できる度合いを表すものはどれか。",
    choices: ["機能適合性", "移植性", "保守性", "使用性"], correctIndex: 0,
    explanation: "機能適合性は、ソフトウェア製品が明示的・暗黙的なニーズを満たす機能を、指定された条件下で提供できる度合いを表す品質特性である（ISO/IEC 25010などで定義される）。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0301", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトの完了後に、実施した内容や得られた教訓を整理し、今後のプロジェクトに活かすための活動を何と呼ぶか。",
    choices: ["プロジェクト完了報告（教訓の記録）", "要件定義", "リスク受容", "スコープ管理"], correctIndex: 0,
    explanation: "プロジェクト完了時には、実施内容の振り返りや得られた教訓（レッスンズラーンド）を整理し、今後のプロジェクトに活かすための報告・記録を行うことが重要である。",
  },
  {
    id: "FE-A-PRACTICE-0302", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "ITサービスマネジメントの国際規格として広く知られているものはどれか。",
    choices: ["ISO/IEC 20000", "ISO/IEC 27001", "ISO 9001", "ISO 14001"], correctIndex: 0,
    explanation: "ISO/IEC 20000は、ITサービスマネジメントに関する国際規格であり、サービス提供者がサービスを効果的に管理・提供するための要求事項を定めている。",
  },
  {
    id: "FE-A-PRACTICE-0303", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "システム監査人が監査の過程で収集した記録や証拠のうち、監査意見の根拠となる資料を総称して何と呼ぶか。",
    choices: ["監査証拠", "監査計画書", "監査契約書", "監査対象システム仕様書"], correctIndex: 0,
    explanation: "監査証拠は、システム監査人が監査の過程で収集した記録やインタビュー結果など、監査意見（結論）の根拠となる資料を総称する用語である。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0304", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "企業が既存事業とは異なる新しい分野に進出し、事業の多角化を図る戦略について、既存の技術や顧客基盤を活かして進出する場合を特に何と呼ぶか。",
    choices: ["関連型多角化", "垂直統合", "水平統合", "M&A"], correctIndex: 0,
    explanation: "関連型多角化は、既存事業で培った技術やノウハウ、顧客基盤などを活かして、関連する新しい分野に進出する多角化戦略である。",
  },
  {
    id: "FE-A-PRACTICE-0305", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "企業が特定の顧客層に対象を絞り込み、その中で独自の地位を築こうとする経営戦略を何と呼ぶか。",
    choices: ["集中戦略（ニッチ戦略）", "コストリーダーシップ戦略", "差別化戦略のみ", "多角化戦略"], correctIndex: 0,
    explanation: "集中戦略（ニッチ戦略）は、特定の顧客層や市場セグメントに経営資源を集中させ、その中で独自の地位を築こうとする経営戦略である。",
  },
  {
    id: "FE-A-PRACTICE-0306", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある企業が新しいシステムに500万円を投資し、その結果、年間150万円のコスト削減効果が見込める場合、単純な投資回収年数はどれか。",
    choices: ["約2.3年", "約3.3年", "約4.3年", "約5.3年"], correctIndex: 1,
    explanation: "投資回収年数＝投資額÷年間効果額＝500÷150＝約3.33年。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0054", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 lastIndexOf は，引数で与えられた整数型配列 data の中から，値 target と等しい最後の要素の番号を返す。見つからない場合は0を返す。\n〔プログラム〕\n○整数型: lastIndexOf(整数型の配列: data, 整数型: target)\n　整数型: result ← 0\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (data[i] が target と等しい)\n　　　［　　］\n　　endif\n　endfor\n　return result",
    choices: ["result ← i", "return i", "result ← target", "i ← result"],
    correctIndex: 0,
    explanation: "先頭から末尾まで全てを走査し、一致するたびにresultを更新（result←i）することで、ループ終了時には最後に一致した要素番号がresultに残る（途中でreturnしてしまうと最初の一致で終了してしまい、最後の一致にならない）。",
  },
  {
    id: "FE-B-PRACTICE-0055", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 median は，昇順に整列済みの整数型配列 data（要素数nは奇数）の中央値を返す。\n〔プログラム〕\n○整数型: median(整数型の配列: data)\n　整数型: n ← dataの要素数\n　整数型: midIndex ← ［ a ］\n　return ［ b ］",
    choices: [
      "a: n ÷ 2 の商 ＋ 1／b: data[midIndex]", "a: n ÷ 2 の商／b: data[midIndex]",
      "a: (n ＋ 1) ÷ 2 の商／b: midIndex", "a: n ÷ 2 の商 ＋ 1／b: midIndex",
    ],
    correctIndex: 0,
    explanation: "要素数nが奇数のとき、中央値の要素番号は(n+1)÷2、すなわちn÷2の商＋1である（例：n=5のとき、中央値は3番目＝5÷2の商(2)＋1＝3）。中央値そのものはdata[midIndex]で得られる。",
  },
  {
    id: "FE-B-PRACTICE-0056", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 isAnagram は，同じ文字数の文字列型引数 s1 と s2 を受け取り，s1を並び替えるとs2に一致する場合（アナグラムである場合）にtrueを返す。ここで，関数 sortChars は文字列を構成する文字を並び替えて（ソートして）返す関数として定義済みとする。\n〔プログラム〕\n○論理型: isAnagram(文字列型: s1, 文字列型: s2)\n　return ［　　］",
    choices: [
      "sortChars(s1) が sortChars(s2) と等しい", "s1 が s2 と等しい",
      "s1の文字数 が s2の文字数 と等しい", "sortChars(s1) が s2 と等しくない",
    ], correctIndex: 0,
    explanation: "アナグラムであるかどうかは、両方の文字列を構成する文字を並び替え（ソート）た結果が一致するかどうかで判定できる。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0057", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "U社では，退職者が発生した際のアカウント無効化の手続きが，情報システム部門への申請書提出から実際の無効化まで平均2週間かかっていた。ある退職者が，退職後1週間の間，会社支給のノートPCとVPNアカウントを使って社内システムにアクセスできる状態が続いていたことが，後日の監査で発覚した。この状況に対する改善策として，最も適切なものはどれか。",
    choices: [
      "退職者の人数を減らす。", "退職手続きのプロセスにアカウント無効化を組み込み，退職日当日（またはそれ以前）に確実にアカウントを無効化する運用にする。",
      "VPNの回線速度を向上させる。", "全従業員のパスワードを毎月変更する。",
    ], correctIndex: 1,
    explanation: "退職者のアカウントが長期間有効なまま残ることは重大なセキュリティリスクである。退職手続き（人事プロセス）とアカウント無効化（ITプロセス）を連携させ、退職日当日には確実に無効化される運用にすることが適切な改善策である。",
  },
  {
    id: "FE-B-PRACTICE-0058", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "V社の従業員が，社内会議で使用したホワイトボードの内容を写真に撮り，自分のクラウドストレージ（私用アカウント）にバックアップとして保存していた。このホワイトボードには，未公開の新製品の仕様や価格戦略が記載されていた。この行為が引き起こす主なリスクはどれか。",
    choices: [
      "写真のファイルサイズが大きくなること", "会社が管理していない私用のクラウド環境に機密情報が保存され，情報管理者の統制が及ばない状態で情報が漏えいするリスクが生じること",
      "ホワイトボードのインクが消費されること", "会議の進行が遅れること",
    ], correctIndex: 1,
    explanation: "会社が管理・統制していない私用のクラウドストレージに機密情報を保存すると、アクセス権限の管理や退職時の削除などが会社側でコントロールできなくなり、情報漏えいのリスクが高まる。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 7)...`);
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
