/**
 * Original practice questions, batch 9 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-8.
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
    id: "FE-A-PRACTICE-0343", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "10進数 63 を2進数で表したものはどれか。",
    choices: ["111110", "111111", "011111", "110111"], correctIndex: 1,
    explanation: "63 = 32+16+8+4+2+1 = 2^5+2^4+2^3+2^2+2^1+2^0 なので、2進数では 111111 となる。",
  },
  {
    id: "FE-A-PRACTICE-0344", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "1つの親ノードが複数の子ノードをもてる木構造において、各ノードがもてる子の数に制限がない一般的な木を何と呼ぶか（2分木と対比して）。",
    choices: ["多分木", "2分探索木", "平衡木", "赤黒木"], correctIndex: 0,
    explanation: "多分木は、各ノードが2個より多くの子をもてる、一般的な木構造である。",
  },
  {
    id: "FE-A-PRACTICE-0345", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "10個の異なる要素を1列に並べる場合の並べ方（順列）の総数はどれか。",
    choices: ["10", "45", "100", "3,628,800"], correctIndex: 3,
    explanation: "10個の異なる要素の順列の総数は10の階乗（10!）で求まる。10!＝3,628,800。",
  },
  {
    id: "FE-A-PRACTICE-0346", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "5個の要素の中から3個を選ぶ組合せ（順序を考慮しない）の総数はどれか。",
    choices: ["10", "15", "20", "60"], correctIndex: 0,
    explanation: "組合せの数は 5!／(3!×2!)＝(5×4)／(2×1)＝10。",
  },
  {
    id: "FE-A-PRACTICE-0347", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "配列やリストの要素を、キーの値に基づいて特定の順序に並べ替える処理を何と呼ぶか。",
    choices: ["整列（ソート）", "探索（サーチ）", "圧縮", "暗号化"], correctIndex: 0,
    explanation: "整列（ソート）は、配列やリストの要素をキーの値に基づいて昇順や降順などの特定の順序に並べ替える処理である。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0348", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "オブジェクト指向における「集約（アグリゲーション）」と「コンポジション」の違いに関する記述のうち、適切なものはどれか。",
    choices: [
      "集約は部分オブジェクトが全体オブジェクトと独立して存在できるが、コンポジションでは全体オブジェクトが破棄されると部分オブジェクトも破棄される、より強い所有関係を表す。",
      "集約とコンポジションに違いはなく、同じ意味である。", "集約は継承の一種であり、コンポジションとは無関係である。",
      "コンポジションは必ずインタフェースを介して実現される。",
    ], correctIndex: 0,
    explanation: "集約は部分オブジェクトが全体オブジェクトから独立して存在できる比較的弱い関係であるのに対し、コンポジションは全体オブジェクトが破棄されると部分オブジェクトも一緒に破棄される、より強い所有関係を表す。",
  },
  {
    id: "FE-A-PRACTICE-0349", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "配列の中から、指定した値と一致する要素が存在するかどうかだけを高速に判定したい場合に、あらかじめデータをハッシュ表に格納しておくことの利点はどれか。",
    choices: [
      "平均的にO(1)に近い時間で存在判定ができる。", "常にO(n^2)の時間が掛かるようになる。",
      "メモリを一切使用しなくなる。", "整列済みである必要がなくなる代わりに、探索時間がO(n)に固定される。",
    ], correctIndex: 0,
    explanation: "ハッシュ表を用いると、ハッシュ値の計算によって格納位置を直接特定できるため、平均的にO(1)に近い時間で要素の存在判定や検索が可能になる。",
  },
  {
    id: "FE-A-PRACTICE-0350", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "プログラム中で、同じ処理を何度も記述せずに済むように、ひとまとまりの処理に名前を付けて定義したものを何と呼ぶか。",
    choices: ["関数（サブルーチン）", "変数", "リテラル", "コメント"], correctIndex: 0,
    explanation: "関数（サブルーチン）は、ひとまとまりの処理に名前を付けて定義し、必要なときに呼び出して再利用できるようにする仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0351", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "再帰関数を用いて実装されたアルゴリズムを、繰返し処理（ループ）と明示的なスタックを用いて書き換えることの一般的な利点はどれか。",
    choices: [
      "関数呼出しのオーバーヘッドやスタックオーバーフローのリスクを避けられる場合がある。", "アルゴリズムの計算量が必ず改善される。",
      "プログラムが必ず短くなる。", "バグが完全になくなる。",
    ], correctIndex: 0,
    explanation: "再帰は可読性に優れるが、呼出しごとにスタックを消費するため、深い再帰ではスタックオーバーフローのリスクがある。反復に書き換えることでこのリスクや関数呼出しのオーバーヘッドを避けられる場合がある。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0352", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "コンピュータの記憶装置を、アクセス速度が速い順に並べたものとして、適切なものはどれか。",
    choices: [
      "レジスタ → キャッシュメモリ → 主記憶 → 補助記憶", "補助記憶 → 主記憶 → キャッシュメモリ → レジスタ",
      "主記憶 → レジスタ → 補助記憶 → キャッシュメモリ", "キャッシュメモリ → 補助記憶 → レジスタ → 主記憶",
    ], correctIndex: 0,
    explanation: "コンピュータの記憶階層は、一般にアクセス速度の速い順に レジスタ → キャッシュメモリ → 主記憶 → 補助記憶 となる。",
  },
  {
    id: "FE-A-PRACTICE-0353", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "ディスプレイやプリンタなど、コンピュータの処理結果を人間が認識できる形式で出力する装置を総称して何と呼ぶか。",
    choices: ["入力装置", "出力装置", "記憶装置", "演算装置"], correctIndex: 1,
    explanation: "出力装置は、ディスプレイやプリンタなど、コンピュータの処理結果を人間が認識できる形式（画面表示や印刷など）で出力する装置の総称である。",
  },
  {
    id: "FE-A-PRACTICE-0354", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "スーパーコンピュータなどで用いられる、多数の演算装置が同じ命令を異なるデータに対して同時に実行する並列処理方式を表す分類（フリンの分類）はどれか。",
    choices: ["SISD", "SIMD", "MISD", "MIMD"], correctIndex: 1,
    explanation: "SIMD（Single Instruction Multiple Data）は、フリンの分類における並列処理方式の一つで、単一の命令を複数の異なるデータに対して同時に実行する方式である。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0355", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "サーバの負荷状況に応じて、仮想マシンの数を自動的に増減させる仕組みを何と呼ぶか。",
    choices: ["オートスケーリング", "オートコンプリート", "ホットスワップ", "ロールバック"], correctIndex: 0,
    explanation: "オートスケーリングは、サーバやサービスの負荷状況（CPU使用率など）に応じて、仮想マシンやコンテナの数を自動的に増減させる仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0356", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "システムを開発する側の環境（会社が保有する設備）で自社運用する形態を何と呼ぶか（クラウドサービスと対比して）。",
    choices: ["オンプレミス", "SaaS", "PaaS", "IaaS"], correctIndex: 0,
    explanation: "オンプレミスは、クラウドサービスを利用せず、自社内に設置したサーバなどの設備でシステムを運用する形態である。",
  },
  {
    id: "FE-A-PRACTICE-0357", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "あるシステムのMTBFが2,850時間、MTTRが150時間であるとき、このシステムの稼働率はどれか。",
    choices: ["0.05", "0.19", "0.95", "0.99"], correctIndex: 2,
    explanation: "稼働率＝MTBF÷(MTBF＋MTTR)＝2,850÷3,000＝0.95。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0358", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "アプリケーションソフトウェアが、OSの機能（ファイル操作やネットワーク通信など）を呼び出すために使用する、あらかじめ定義されたインタフェースを何と呼ぶか。",
    choices: ["システムコール（API）", "コンパイラ", "デバイスドライバのソースコード", "レジストリ"], correctIndex: 0,
    explanation: "システムコール（API）は、アプリケーションがOSの提供する機能（ファイル操作やネットワーク通信など）を呼び出すために使用する、あらかじめ定義されたインタフェースである。",
  },
  {
    id: "FE-A-PRACTICE-0359", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "ソフトウェアの一部を修正するために配布される、更新用の小さなプログラムを何と呼ぶか。",
    choices: ["パッチ", "ドライバ", "カーネル", "シェル"], correctIndex: 0,
    explanation: "パッチは、既存のソフトウェアの不具合修正やセキュリティ対策のために配布される、更新用の小さなプログラムである。",
  },
  {
    id: "FE-A-PRACTICE-0360", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "OSのカーネルの機能のうち、プロセスやファイル、デバイスなどのシステム資源を管理する中核的な役割を担う部分の説明として、適切なものはどれか。",
    choices: [
      "OSの中核部分であり、ハードウェア資源の管理やプロセス間の調整など、システム全体を制御する役割を担う。",
      "利用者が直接操作するアプリケーション画面のことである。", "ネットワークケーブルの物理的な規格を指す。",
      "印刷専用のソフトウェアである。",
    ], correctIndex: 0,
    explanation: "カーネルは、OSの中核部分であり、プロセス管理、メモリ管理、ファイルシステム管理、デバイス制御など、ハードウェア資源を管理しシステム全体を制御する役割を担う。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0361", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "複数のトランザクションを並行して実行する際に、互いに相手の確保しているロックの解放を待ち続けて処理が進まなくなる状態を何と呼ぶか。",
    choices: ["デッドロック", "ロールフォワード", "コミット", "正規化"], correctIndex: 0,
    explanation: "デッドロックは、複数のトランザクションが互いに相手の確保しているロック（資源）の解放を待ち合い、いずれも処理を進められなくなる状態である。",
  },
  {
    id: "FE-A-PRACTICE-0362", section: "A", topic: "データベース", difficulty: "EASY",
    body: "表の中で、値が格納されていない状態を表す特殊な値を何と呼ぶか。",
    choices: ["NULL", "ゼロ", "空文字列だけ", "無限大"], correctIndex: 0,
    explanation: "NULLは、関係データベースにおいて、値が未定義または不明であることを表す特殊な値である（ゼロや空文字列とは異なる概念）。",
  },
  {
    id: "FE-A-PRACTICE-0363", section: "A", topic: "データベース", difficulty: "HARD",
    body: "分散システムにおいて、ネットワーク分断が発生した場合に、一貫性（Consistency）と可用性（Availability）の両方を完全に満たすことはできないという定理を何と呼ぶか。",
    choices: ["CAP定理", "ACID特性", "BASE特性", "アムダールの法則"], correctIndex: 0,
    explanation: "CAP定理は、分散システムにおいて、一貫性（Consistency）、可用性（Availability）、分断耐性（Partition tolerance）の3つを同時に完全には満たせないという定理である。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0364", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "インターネットに接続する際、契約している通信事業者（プロバイダ）を表す略語はどれか。",
    choices: ["ISP", "LAN", "WAN", "SSID"], correctIndex: 0,
    explanation: "ISP（Internet Service Provider）は、インターネットへの接続サービスを提供する通信事業者を指す。",
  },
  {
    id: "FE-A-PRACTICE-0365", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "サーバやサービスを識別するために、IPアドレスに付加して通信の宛先を細分化する番号を何と呼ぶか。",
    choices: ["ポート番号", "サブネットマスク", "MACアドレス", "ドメイン名"], correctIndex: 0,
    explanation: "ポート番号は、同一のIPアドレスを持つコンピュータ上で動作する複数のサービス（アプリケーション）を識別するために使われる番号である。",
  },
  {
    id: "FE-A-PRACTICE-0366", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "IoT機器などで用いられる、消費電力を抑えつつ広い範囲をカバーできる低消費電力広域無線通信の総称はどれか。",
    choices: ["LPWA", "5G", "Bluetooth", "NFC"], correctIndex: 0,
    explanation: "LPWA（Low Power Wide Area）は、低消費電力でありながら広い範囲をカバーできる無線通信技術の総称であり、IoT機器などで活用されている。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0367", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "組織の情報セキュリティ対策のうち、サーバ室への入退室を、ICカードや生体認証で制限する対策は何に分類されるか。",
    choices: ["物理的対策", "技術的対策のみ", "人的対策のみ", "組織的対策のみ"], correctIndex: 0,
    explanation: "サーバ室への入退室制限（施錠、ICカード、生体認証など）は、情報資産を物理的に保護するための「物理的対策」に分類される。",
  },
  {
    id: "FE-A-PRACTICE-0368", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "一定期間ごとにパスワードを変更するよう促す運用ルールの主な目的はどれか。",
    choices: [
      "パスワードが漏えいしていた場合の被害期間や影響を限定すること", "パスワードを覚えやすくすること",
      "システムの処理速度を向上させること", "パスワードの文字数を減らすこと",
    ], correctIndex: 0,
    explanation: "定期的なパスワード変更は、万が一パスワードが漏えいしていた場合でも、悪用される期間や影響を限定することを主な目的とする（ただし近年は変更頻度よりも強度や多要素認証が重視される傾向もある）。",
  },
  {
    id: "FE-A-PRACTICE-0369", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "暗号化アルゴリズムの安全性が、鍵の秘匿性にのみ依存し、アルゴリズム自体の詳細が公開されても安全性が損なわれないという原則を何と呼ぶか。",
    choices: ["ケルクホフスの原則", "最小権限の原則", "多層防御の原則", "職務分掌の原則"], correctIndex: 0,
    explanation: "ケルクホフスの原則は、暗号方式の安全性はアルゴリズムの秘匿ではなく鍵の秘匿性にのみ依存すべきであるという、暗号設計における基本原則である。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0370", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "システム開発における「非機能要件」に該当するものはどれか。",
    choices: [
      "システムが応答を返すまでの時間（性能要件）", "顧客が商品を注文する機能",
      "在庫を検索する機能", "請求書を印刷する機能",
    ], correctIndex: 0,
    explanation: "非機能要件は、性能、可用性、セキュリティ、保守性など、システムが「何をするか」（機能要件）以外の品質面の要件を指す。応答時間はその代表例である。",
  },
  {
    id: "FE-A-PRACTICE-0371", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "システム開発において、開発済みのソースコードや設計書などの変更履歴を管理するためのツールを何と呼ぶか。",
    choices: ["バージョン管理システム", "画像編集ソフト", "表計算ソフト", "メールソフト"], correctIndex: 0,
    explanation: "バージョン管理システム（GitやSVNなど）は、ソースコードや設計書などの変更履歴を記録・管理し、複数人での共同開発を支援するツールである。",
  },
  {
    id: "FE-A-PRACTICE-0372", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "継続的インテグレーション（CI）の説明として、適切なものはどれか。",
    choices: [
      "開発者がコードの変更を頻繁にリポジトリへ統合し、そのたびに自動ビルドやテストを実行して問題を早期に発見する手法である。",
      "年に一度だけソフトウェアをリリースする方式である。", "テストを一切自動化しない開発方針である。",
      "複数のプロジェクトを同時に管理する手法である。",
    ], correctIndex: 0,
    explanation: "継続的インテグレーション（CI）は、開発者がコードの変更を頻繁にリポジトリへ統合し、そのたびに自動的にビルドやテストを実行することで、不具合を早期に発見・修正する開発手法である。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0373", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトの予算超過や納期遅延などのリスクに備え、あらかじめ確保しておく時間や予算の余裕を何と呼ぶか。",
    choices: ["バッファ（予備）", "スコープ", "マイルストーン", "ベースライン"], correctIndex: 0,
    explanation: "バッファ（予備）は、リスクの顕在化に備えて、プロジェクトの日程や予算にあらかじめ組み込んでおく余裕分である。",
  },
  {
    id: "FE-A-PRACTICE-0374", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "システムの利用者からの問合せや障害報告を一元的に受け付ける窓口を何と呼ぶか。",
    choices: ["サービスデスク（ヘルプデスク）", "開発チーム", "経営会議", "監査部門"], correctIndex: 0,
    explanation: "サービスデスク（ヘルプデスク）は、システムの利用者からの問合せや障害報告などを一元的に受け付ける窓口である。",
  },
  {
    id: "FE-A-PRACTICE-0375", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "プロジェクトが完了した後、成果物や活動内容が契約や要求仕様どおりであったかを最終的に確認し、正式に受け入れる手続きを何と呼ぶか。",
    choices: ["検収", "予備調査", "リスクアセスメント", "構成管理"], correctIndex: 0,
    explanation: "検収は、プロジェクトの成果物が契約内容や要求仕様どおりに完成しているかを確認し、正式に受け入れる手続きである。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0376", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "企業が、社会・環境・経済の持続可能性に配慮した経営を行うことを重視する近年の潮流を表す略語として、投資家の判断基準にもなっているものはどれか。",
    choices: ["ESG", "CRM", "SFA", "BPR"], correctIndex: 0,
    explanation: "ESG（Environment, Social, Governance）は、環境・社会・企業統治に配慮した経営を重視する考え方であり、近年は投資判断の基準としても重視されている。",
  },
  {
    id: "FE-A-PRACTICE-0377", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "顧客の購買履歴などのデータを分析し、一人ひとりに合わせた商品やサービスを提案する手法・仕組みを何と呼ぶか。",
    choices: ["パーソナライゼーション", "コモディティ化", "マスマーケティング", "OEM"], correctIndex: 0,
    explanation: "パーソナライゼーションは、顧客の属性や購買履歴などのデータを分析し、一人ひとりの嗜好に合わせた商品やサービス、情報を提供する手法・仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0378", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある企業の製品の年間販売数量が10,000個、1個当たりの利益が500円であるとき、年間の総利益はどれか。",
    choices: ["500,000円", "5,000,000円", "50,000,000円", "500,000,000円"], correctIndex: 1,
    explanation: "総利益＝1個当たりの利益×販売数量＝500円×10,000個＝5,000,000円。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0064", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 average2D は，行数と列数が等しい実数型の二次元配列 data（正方行列）を受け取り、全要素の平均値を返す。\n〔プログラム〕\n○実数型: average2D(実数型の二次元配列: data)\n　実数型: total ← 0\n　整数型: n ← dataの行数\n　整数型: i, j\n　for (i を 1 から n まで 1 ずつ増やす)\n　　for (j を 1 から n まで 1 ずつ増やす)\n　　　total ← total ＋ data[i, j]\n　　endfor\n　endfor\n　return total ÷ ［　　］",
    choices: ["n", "n × n", "n ＋ n", "total"],
    correctIndex: 1,
    explanation: "n行n列の正方行列の要素数はn×nであるため、平均値は合計をn×nで割ることで求まる。",
  },
  {
    id: "FE-B-PRACTICE-0065", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 isSubset は，整数型配列 a と b を受け取り、aの全ての要素がbの中に含まれていればtrueを、そうでなければfalseを返す（要素の重複は考慮しない）。ここで、関数 contains(array, value) はarrayにvalueが含まれていればtrueを返す関数として定義済みとする。\n〔プログラム〕\n○論理型: isSubset(整数型の配列: a, 整数型の配列: b)\n　整数型: i\n　for (i を 1 から aの要素数 まで 1 ずつ増やす)\n　　if (contains(b, a[i]) が false と等しい)\n　　　return ［　　］\n　　endif\n　endfor\n　return true",
    choices: ["true", "false", "a[i]", "0"],
    correctIndex: 1,
    explanation: "aの要素の中に、bに含まれないものが1つでも見つかった場合、aはbの部分集合とは言えないため、falseを返す。",
  },
  {
    id: "FE-B-PRACTICE-0066", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 clamp は，整数型の引数 value，min，max（min≦max）を受け取り，valueがminより小さければminを，maxより大きければmaxを，それ以外はvalueをそのまま返す。\n〔プログラム〕\n○整数型: clamp(整数型: value, 整数型: min, 整数型: max)\n　if (value ＜ min)\n　　return min\n　elseif (value ＞ max)\n　　return max\n　else\n　　return ［　　］\n　endif",
    choices: ["value", "min", "max", "0"],
    correctIndex: 0,
    explanation: "valueがmin以上max以下の範囲内にある場合は、valueをそのまま返す。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0067", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "Y社は，社外の業務委託先に開発を委託したシステムの本番リリース直前に，委託先の開発者が使用していたノートPCがマルウェアに感染していたことが判明した。調査の結果，このPCから納品物のソースコード一式が外部の攻撃者に送信されていた可能性が示唆された。この事案を踏まえ，今後の業務委託契約において盛り込むべき対策として，最も適切なものはどれか。",
    choices: [
      "委託先の従業員数を制限する契約条項を設ける。",
      "委託先に対して、セキュリティ対策（ウイルス対策ソフトの導入・更新、開発環境の分離など）の実施状況を契約で義務付け、定期的に監査・報告を求める条項を設ける。",
      "委託費用を減額する条項を設ける。", "開発言語を指定する条項だけを設ける。",
    ], correctIndex: 1,
    explanation: "業務委託先のセキュリティ対策が不十分だと、委託元の情報資産（ソースコードなど）が漏えいするリスクがある。契約でセキュリティ対策の実施を義務付け、定期的に監査・報告を求めることが有効な対策となる。",
  },
  {
    id: "FE-B-PRACTICE-0068", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "Z社の情報システム部門は，サーバのOSやミドルウェアに公開された脆弱性情報を定期的に確認しているが，実際のパッチ適用は「サービスへの影響が心配」という理由で長期間先送りにされることが多かった。ある日，既に半年以上前に修正パッチが公開されていた脆弱性を悪用され，サーバに不正アクセスされる事案が発生した。この事案の根本的な原因として，最も適切なものはどれか。",
    choices: [
      "サーバの台数が多すぎたこと", "既知の脆弱性に対する修正パッチの適用が長期間放置されており，パッチ管理のプロセスが機能していなかったこと",
      "OSのベンダーが悪いこと", "攻撃者の技術力が高すぎたこと",
    ], correctIndex: 1,
    explanation: "既知の脆弱性に対して公開済みのパッチが長期間適用されないまま放置されることは、パッチ管理プロセスが機能していないことを意味し、既知の攻撃手法による侵害を招く直接的な原因となる。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 9)...`);
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
