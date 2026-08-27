/**
 * Original practice questions, batch 5 — freshly authored, not derived from any
 * official IPA exam or third-party question bank. Continues IDs from batches 1-4.
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
    id: "FE-A-PRACTICE-0197", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "16進数 2C を2進数で表したものはどれか。",
    choices: ["00101011", "00101100", "00101101", "00110100"], correctIndex: 1,
    explanation: "2は0010、Cは1100であるため、2C(16)を2進数にすると 00101100 となる。",
  },
  {
    id: "FE-A-PRACTICE-0198", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "有向グラフにおいて、始点から終点まで、辺の向きに従ってたどり着ける経路があることを何と呼ぶか。",
    choices: ["連結", "到達可能", "循環", "対称"], correctIndex: 1,
    explanation: "有向グラフにおいて、ある頂点から別の頂点へ、辺の向きに従ってたどり着けることを「到達可能」であるという。",
  },
  {
    id: "FE-A-PRACTICE-0199", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "全体集合Uの中で、集合Aに属さない要素の集合を何と呼ぶか。",
    choices: ["Aの部分集合", "Aの補集合", "Aの共通部分", "Aの和集合"], correctIndex: 1,
    explanation: "全体集合Uの中で、集合Aに属さない要素の集合をAの補集合と呼ぶ。",
  },
  {
    id: "FE-A-PRACTICE-0200", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "重み付き無向グラフにおいて、全ての頂点を含み、辺の重みの総和が最小になる木を何と呼ぶか。",
    choices: ["最小全域木", "最短経路木", "深さ優先探索木", "二分探索木"], correctIndex: 0,
    explanation: "最小全域木は、重み付き無向グラフの全ての頂点を含み、辺の重みの合計が最小になるように選んだ木構造である。",
  },
  {
    id: "FE-A-PRACTICE-0201", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "10進数 45 を2進数で表したものはどれか。",
    choices: ["101101", "101110", "101010", "110101"], correctIndex: 0,
    explanation: "45 = 32+8+4+1 = 2^5+2^3+2^2+2^0 なので、2進数では 101101 となる。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0202", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "深さ優先探索（DFS）を実装する際に、一般的に用いられるデータ構造はどれか。",
    choices: ["キュー", "スタック", "ハッシュ表", "優先度付きキューだけ"], correctIndex: 1,
    explanation: "深さ優先探索（DFS）は、再帰呼出しまたはスタックを用いて実装するのが一般的である（幅優先探索はキューを用いる）。",
  },
  {
    id: "FE-A-PRACTICE-0203", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "インタフェースの説明として、適切なものはどれか。",
    choices: [
      "クラスが実装すべきメソッドの仕様（シグネチャ）だけを定義し、実装の詳細はもたない仕組みである。",
      "変数の値を保持するためのデータ構造である。", "プログラムの実行速度を測定するためのツールである。",
      "複数のクラスを1つのファイルにまとめる仕組みである。",
    ], correctIndex: 0,
    explanation: "インタフェースは、クラスが実装すべきメソッドの名前や引数などの仕様（シグネチャ）だけを定義し、具体的な実装の詳細をもたない仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0204", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "プログラムの実行中に発生した例外的な事象（エラー）を捕捉し、適切に処理する仕組みを何と呼ぶか。",
    choices: ["例外処理", "並行処理", "分岐処理", "反復処理"], correctIndex: 0,
    explanation: "例外処理は、プログラムの実行中に発生したエラーなどの例外的な事象を捕捉し、適切な対応（エラーメッセージの表示や後処理など）を行う仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0205", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "モジュール間の結合度が最も弱く、望ましいとされる結合の形態はどれか。",
    choices: [
      "必要なデータ項目だけを引数として受け渡すデータ結合", "グローバル変数を共有するデータ結合以外の共有結合",
      "呼び出す側の論理を制御するための引数（制御フラグ）を渡す制御結合", "処理内容を制御するためにモジュールの内部構造を直接参照する内容結合",
    ], correctIndex: 0,
    explanation: "モジュール結合度は弱いほど望ましいとされ、必要なデータ項目だけを引数として受け渡す「データ結合」が最も弱い（良い）結合とされる。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0206", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "主記憶のアクセス速度と補助記憶のアクセス速度を比較した記述のうち、適切なものはどれか。",
    choices: [
      "一般に、主記憶の方が補助記憶よりもアクセス速度が速い。", "一般に、補助記憶の方が主記憶よりもアクセス速度が速い。",
      "主記憶と補助記憶のアクセス速度は常に等しい。", "アクセス速度の比較は無意味である。",
    ], correctIndex: 0,
    explanation: "一般に、DRAMなどで構成される主記憶は、HDDやSSDなどの補助記憶に比べてアクセス速度が速い。",
  },
  {
    id: "FE-A-PRACTICE-0207", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの内部で扱う情報の最小単位はどれか。",
    choices: ["バイト", "ビット", "ワード", "ブロック"], correctIndex: 1,
    explanation: "ビットは、0または1のいずれかを表す、コンピュータが扱う情報の最小単位である。",
  },
  {
    id: "FE-A-PRACTICE-0208", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "メモリのエラー検出及び訂正を行う仕組みを表す略語はどれか。",
    choices: ["ECC", "DMA", "BIOS", "GPU"], correctIndex: 0,
    explanation: "ECC（Error Correcting Code）は、メモリ上のデータ誤りを検出し、訂正する機能を提供する仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0209", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "CPUと周辺機器の間で、CPUを介さずに直接データ転送を行う方式を何と呼ぶか。",
    choices: ["DMA（ダイレクトメモリアクセス）", "パイプライン処理", "スーパースカラ", "アウトオブオーダー実行"], correctIndex: 0,
    explanation: "DMA（Direct Memory Access）は、CPUを介さずに周辺機器と主記憶の間で直接データを転送する方式であり、CPUの負荷を軽減する。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0210", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "現用系と待機系の2台のサーバで構成されるシステムがあり、現用系の稼働率が0.95、待機系への切替えが常に成功するものとする。待機系も同じ稼働率0.95であるとき、少なくとも一方が稼働している確率（システム全体の稼働率）はどれか。",
    choices: ["0.90", "0.9025", "0.9975", "1.00"], correctIndex: 2,
    explanation: "並列システムの稼働率＝1－(1－0.95)×(1－0.95)＝1－0.0025＝0.9975。",
  },
  {
    id: "FE-A-PRACTICE-0211", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "システムが正常に稼働している時間の割合を表す指標はどれか。",
    choices: ["稼働率", "応答時間", "スループット", "レイテンシ"], correctIndex: 0,
    explanation: "稼働率は、システムが正常に稼働している時間の割合を表す指標であり、MTBFとMTTRから計算される。",
  },
  {
    id: "FE-A-PRACTICE-0212", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "複数の物理サーバを1台のサーバであるかのように統合し、全体として処理能力を高める技術を何と呼ぶか。",
    choices: ["クラスタリング", "パーティショニング", "デフラグ", "キャッシング"], correctIndex: 0,
    explanation: "クラスタリングは、複数の物理サーバを連携させ、1台の高性能なシステムであるかのように統合して処理能力や可用性を高める技術である。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0213", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "複数のOSやアプリケーションが共通して利用する基盤的な機能を提供し、OSとアプリケーションの間に位置するソフトウェアを何と呼ぶか。",
    choices: ["ミドルウェア", "ファームウェア", "デバイスドライバ", "ブートローダ"], correctIndex: 0,
    explanation: "ミドルウェアは、OSとアプリケーションソフトウェアの間に位置し、データベース管理やメッセージ連携など、複数のアプリケーションが共通して利用する基盤的な機能を提供するソフトウェアである。",
  },
  {
    id: "FE-A-PRACTICE-0214", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "ソースプログラムを機械語に変換する処理のうち、実行前にプログラム全体を一括して変換する方式を何と呼ぶか。",
    choices: ["コンパイル", "インタプリタ実行", "デバッグ", "リンク"], correctIndex: 0,
    explanation: "コンパイルは、ソースプログラム全体を実行前に一括して機械語（目的プログラム）に変換する処理である。",
  },
  {
    id: "FE-A-PRACTICE-0215", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "オペレーティングシステムが提供する機能のうち、複数のプロセスが同時に主記憶を使用する際、実際の物理メモリよりも大きなアドレス空間をプロセスに提供する仕組みはどれか。",
    choices: ["仮想記憶", "キャッシュメモリ", "レジスタ割付け", "パイプライン"], correctIndex: 0,
    explanation: "仮想記憶は、補助記憶（ディスクなど）を利用することで、実際の物理メモリ容量よりも大きな仮想的なアドレス空間をプロセスに提供する仕組みである。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0216", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "二つの表に共通する行だけを取り出す関係演算はどれか。",
    choices: ["和（union）", "差（difference）", "積（intersection）", "直積（product）"], correctIndex: 2,
    explanation: "積（intersection、共通部分）は、二つの表（同じ属性構成の表）の両方に存在する行だけを取り出す関係演算である。",
  },
  {
    id: "FE-A-PRACTICE-0217", section: "A", topic: "データベース", difficulty: "EASY",
    body: "SQLにおいて、既存の行のデータを変更するための文はどれか。",
    choices: ["INSERT", "SELECT", "UPDATE", "CREATE"], correctIndex: 2,
    explanation: "UPDATE文は、表内の既存の行のデータを変更するために使用する。",
  },
  {
    id: "FE-A-PRACTICE-0218", section: "A", topic: "データベース", difficulty: "HARD",
    body: "データベースの障害からの回復方式のうち、直前のチェックポイント以降の更新後ログを用いて、正常に完了したトランザクションの内容を再現する方式はどれか。",
    choices: ["ロールバック", "ロールフォワード", "デッドロック検出", "2相コミット"], correctIndex: 1,
    explanation: "ロールフォワードは、フルバックアップやチェックポイント以降の更新後ログ（ジャーナル）を適用し、正常に完了したトランザクションの内容を復元する障害回復方式である。",
  },
  {
    id: "FE-A-PRACTICE-0219", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "ある列の値が、別の表の主キーの値のいずれかと一致していなければならないという制約を何と呼ぶか。",
    choices: ["一意性制約", "非NULL制約", "参照制約（外部キー制約）", "チェック制約"], correctIndex: 2,
    explanation: "参照制約（外部キー制約）は、ある表の列の値が、参照先の表の主キーなどに存在する値でなければならないことを強制する制約である。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0220", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "Webブラウザとサーバの間で、暗号化された通信を実現するために使用されるプロトコルの組合せとして、適切なものはどれか。",
    choices: ["HTTP と SSL/TLS", "HTTP と ARP", "FTP と DHCP", "SMTP と ICMP"], correctIndex: 0,
    explanation: "HTTPS通信は、HTTPをSSL/TLSで暗号化することによって実現される。",
  },
  {
    id: "FE-A-PRACTICE-0221", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "ネットワークに接続する機器を一意に識別するために、ネットワークインタフェースカードに製造時に割り当てられるアドレスはどれか。",
    choices: ["IPアドレス", "MACアドレス", "ポート番号", "サブネットマスク"], correctIndex: 1,
    explanation: "MACアドレスは、ネットワークインタフェースカードに製造時に割り当てられる、機器を一意に識別するためのアドレスである。",
  },
  {
    id: "FE-A-PRACTICE-0222", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "20Mビット/秒の実効速度をもつ回線を使用して、500Mバイトのファイルを転送するのに掛かる時間はおよそ何秒か。",
    choices: ["25秒", "100秒", "200秒", "400秒"], correctIndex: 2,
    explanation: "500Mバイト＝4,000Mビット。4,000÷20＝200秒。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0223", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "組織における情報セキュリティ対策のうち、技術的対策に分類されるものはどれか。",
    choices: [
      "ファイアウォールの導入", "従業員へのセキュリティ教育の実施", "情報セキュリティポリシーの策定",
      "サーバ室への入退室記録簿の設置",
    ], correctIndex: 0,
    explanation: "ファイアウォールの導入は、システムやネットワークに直接組み込む技術的対策に分類される。教育やポリシー策定は人的・組織的対策に分類される。",
  },
  {
    id: "FE-A-PRACTICE-0224", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "コンピュータウイルスなどの不正なプログラムを検出・駆除するためのソフトウェアはどれか。",
    choices: ["ウイルス対策ソフト", "コンパイラ", "デバッガ", "ブラウザ"], correctIndex: 0,
    explanation: "ウイルス対策ソフトは、コンピュータウイルスなどのマルウェアを検出し、駆除・隔離するためのソフトウェアである。",
  },
  {
    id: "FE-A-PRACTICE-0225", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "利用者が一度の認証で、複数の関連するシステムやサービスにログインできるようにする仕組みを何と呼ぶか。",
    choices: ["シングルサインオン（SSO）", "多要素認証", "ワンタイムパスワード", "二段階認証"], correctIndex: 0,
    explanation: "シングルサインオン（SSO）は、一度の認証（ログイン）によって、複数の関連するシステムやサービスを利用できるようにする仕組みである。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0226", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "ソフトウェアの開発工程のうち、プログラムの内部構造やアルゴリズムなど、実装方法を決定する工程はどれか。",
    choices: ["要件定義", "外部設計", "内部設計（詳細設計）", "運用"], correctIndex: 2,
    explanation: "内部設計（詳細設計）は、外部設計で定めた仕様を実現するために、プログラムの内部構造やアルゴリズム、モジュール分割などを決定する工程である。",
  },
  {
    id: "FE-A-PRACTICE-0227", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "プログラムを実際に実行せず、ソースコードを人間が目視で確認したり、専用ツールで解析したりして問題点を検出する手法はどれか。",
    choices: ["静的解析", "動的解析", "負荷テスト", "リグレッションテスト"], correctIndex: 0,
    explanation: "静的解析は、プログラムを実際に実行せず、ソースコードそのものを解析（目視やツールによる）して問題点を検出する手法である。",
  },
  {
    id: "FE-A-PRACTICE-0228", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "アジャイル開発における「スプリントレビュー」の主な目的はどれか。",
    choices: [
      "スプリントで完成した成果物を関係者に示し、フィードバックを得ること", "毎日の進捗状況を短時間で共有すること",
      "次のスプリントで取り組む作業計画を立てること", "チームの働き方を振り返り改善点を話し合うこと",
    ], correctIndex: 0,
    explanation: "スプリントレビューは、スプリントの終わりに、完成した成果物（プロダクトインクリメント）を関係者（ステークホルダ）に示し、フィードバックを得るためのイベントである。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0229", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトのスコープ（範囲）を明確にし、対象外の作業を除外することの主な目的はどれか。",
    choices: [
      "プロジェクトの作業範囲を明確にし、スコープクリープ（範囲の際限ない拡大）を防ぐこと", "プロジェクトメンバーの人数を減らすこと",
      "開発言語を統一すること", "テスト工程を省略すること",
    ], correctIndex: 0,
    explanation: "スコープを明確に定義することで、プロジェクトが対応すべき作業範囲を明確にし、後から際限なく要求が追加される「スコープクリープ」を防ぐことができる。",
  },
  {
    id: "FE-A-PRACTICE-0230", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "ITサービスの提供において、あらかじめ合意した水準のサービスを継続的に提供できるようにする活動を何と呼ぶか。",
    choices: ["可用性管理", "キャパシティ管理", "構成管理", "リリース管理"], correctIndex: 0,
    explanation: "可用性管理は、あらかじめ合意した水準（SLAなど）でサービスを継続的に利用可能な状態に保つための活動である。",
  },
  {
    id: "FE-A-PRACTICE-0231", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "システム監査における「予備調査」の主な目的はどれか。",
    choices: [
      "本調査に先立ち、監査対象の業務内容やシステムの概要を把握し、監査計画を具体化すること", "監査報告書を作成すること",
      "改善提案の実施状況を確認すること", "監査人を新たに採用すること",
    ], correctIndex: 0,
    explanation: "予備調査は、本調査（実地調査）に先立って、監査対象の業務内容やシステムの概要、リスクの所在などを把握し、監査計画をより具体的にするために行われる。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0232", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "企業の事業展開において、既存の市場に既存の製品で更に浸透を図る戦略を何と呼ぶか（アンゾフの成長マトリクスにおける区分）。",
    choices: ["市場浸透戦略", "新製品開発戦略", "新市場開拓戦略", "多角化戦略"], correctIndex: 0,
    explanation: "アンゾフの成長マトリクスにおいて、既存市場に既存製品でより深く浸透を図る戦略を市場浸透戦略と呼ぶ。",
  },
  {
    id: "FE-A-PRACTICE-0233", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "システム開発を発注する際に、発注者が開発ベンダーに対して具体的な提案を求めるために提示する文書はどれか。",
    choices: ["RFP（提案依頼書）", "SLA（サービスレベル合意書）", "NDA（秘密保持契約書）", "WBS（作業分解構成図）"], correctIndex: 0,
    explanation: "RFP（Request For Proposal、提案依頼書）は、発注者が開発ベンダー候補に対して、具体的な提案（システム構成や見積りなど）を求めるために提示する文書である。",
  },
  {
    id: "FE-A-PRACTICE-0234", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "ある製品の月間販売数量が2,000個、販売価格が1,500円、変動費が900円、固定費が月900,000円であるとき、月間の営業利益はどれか。",
    choices: ["300,000円", "900,000円", "1,200,000円", "1,500,000円"], correctIndex: 1,
    explanation: "限界利益＝(1,500－900)×2,000＝1,200,000円。営業利益＝限界利益－固定費＝1,200,000－900,000＝300,000円。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0042", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 sumRange は，引数で与えられた整数型配列 data の、要素番号 from から to までの範囲（両端を含む）の合計を返す。\n〔プログラム〕\n○整数型: sumRange(整数型の配列: data, 整数型: from, 整数型: to)\n　整数型: total ← 0\n　整数型: i\n　for (i を from から to まで 1 ずつ増やす)\n　　total ← total ＋ ［　　］\n　endfor\n　return total",
    choices: ["i", "data[i]", "data[from]", "data[to]"],
    correctIndex: 1,
    explanation: "要素番号iに対応する配列の値data[i]を合計に加算していくことで、指定範囲の合計が求まる。",
  },
  {
    id: "FE-B-PRACTICE-0043", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 insertSorted は，昇順に整列済みの整数型配列 data（要素数n）と，新たに挿入する値 value を受け取り，昇順を保ったまま value を適切な位置に挿入した新しい配列（要素数n＋1）を返す。\n〔プログラム〕\n○整数型の配列: insertSorted(整数型の配列: data, 整数型: value)\n　整数型: n ← dataの要素数\n　整数型の配列: result ← {}\n　整数型: i ← 1\n　論理型: inserted ← false\n　for (i を 1 から n まで 1 ずつ増やす)\n　　if (inserted が false と等しい and value ［ a ］ data[i])\n　　　resultの末尾 に value の値 を追加する\n　　　inserted ← true\n　　endif\n　　resultの末尾 に data[i]の値 を追加する\n　endfor\n　if (inserted が false と等しい)\n　　resultの末尾 に ［ b ］ を追加する\n　endif\n　return result",
    choices: [
      "a: ≦／b: value", "a: ＜／b: value",
      "a: ≦／b: data[n]", "a: ＞／b: value",
    ],
    correctIndex: 0,
    explanation: "valueがdata[i]以下（≦）になった最初の位置の直前にvalueを挿入すればよい（a）。ループを最後まで回っても挿入位置が見つからなかった場合、valueは配列中の全要素より大きいということなので、末尾にvalueを追加する（b）。",
  },
  {
    id: "FE-B-PRACTICE-0044", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 isSorted は，引数で与えられた要素数1以上の整数型配列 data が昇順に整列されていればtrueを，そうでなければfalseを返す。\n〔プログラム〕\n○論理型: isSorted(整数型の配列: data)\n　整数型: i\n　for (i を 1 から dataの要素数 － 1 まで 1 ずつ増やす)\n　　if (data[i] ＞ data[i ＋ 1])\n　　　return ［　　］\n　　endif\n　endfor\n　return true",
    choices: ["true", "false", "data[i]", "0"],
    correctIndex: 1,
    explanation: "隣接する要素の順序が逆転している箇所（data[i]＞data[i+1]）が1つでも見つかれば、配列は昇順に整列されていないため、falseを返す。",
  },
  {
    id: "FE-B-PRACTICE-0045", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 mode は，引数で与えられた整数型配列 data（値は1以上10以下）の中で最も出現回数が多い値（最頻値）を返す。同数の場合は先に見つかった方を返す。\n〔プログラム〕\n○整数型: mode(整数型の配列: data)\n　整数型の配列: counts ← {10個の0}\n　整数型: i, maxCount ← 0, result ← 1\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　counts[data[i]] ← counts[data[i]] ＋ 1\n　endfor\n　for (i を 1 から 10 まで 1 ずつ増やす)\n　　if (counts[i] ＞ maxCount)\n　　　maxCount ← counts[i]\n　　　result ← ［　　］\n　　endif\n　endfor\n　return result",
    choices: ["i", "counts[i]", "data[i]", "maxCount"],
    correctIndex: 0,
    explanation: "現在調べている値iの出現回数counts[i]がこれまでの最大出現回数maxCountを上回った場合、その値iを最頻値resultとして更新する。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0046", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "Q社は，社内で利用するクラウド会計サービスのAPIキー（外部システム連携用の認証情報）を，複数の担当者間でチャットツール上に平文で共有し，必要なときに各自コピーして使用していた。ある日，チャットツールのアカウントが乗っ取られ，過去の会話履歴からAPIキーが盗まれて不正利用される事案が発生した。この再発防止策として，最も適切なものはどれか。",
    choices: [
      "チャットツールの利用を全面的に禁止する。", "APIキーなどの認証情報は専用のシークレット管理サービスで一元管理し，チャットなどの汎用ツールに平文で残さない運用にする。",
      "チャットツールのパスワードの文字数を増やす。", "APIキーを定期的に印刷して紙で保管する。",
    ], correctIndex: 1,
    explanation: "汎用のチャットツールに認証情報を平文で残す運用は、アカウント乗っ取りなどによって過去の会話履歴ごと漏えいするリスクがある。専用のシークレット管理サービスで一元管理し、必要な担当者だけがアクセスできるようにすることが適切な対策である。",
  },
  {
    id: "FE-B-PRACTICE-0047", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "R社のWebサイトでは，利用者が入力したコメントをそのままHTMLとして他の閲覧者の画面に表示していた。ある利用者が悪意のあるスクリプトをコメントとして投稿したところ，そのスクリプトが他の閲覧者のブラウザ上で実行され，セッション情報が盗まれる被害が発生した。この脆弱性の種類と対策の組合せとして，最も適切なものはどれか。",
    choices: [
      "SQLインジェクション，プレースホルダの使用", "クロスサイトスクリプティング，入力値のエスケープ処理（HTMLタグとして解釈されないよう変換）",
      "DDoS攻撃，通信の暗号化", "総当たり攻撃，パスワードの複雑化",
    ], correctIndex: 1,
    explanation: "利用者の入力をそのままHTMLとして表示することでスクリプトが実行されてしまうのはクロスサイトスクリプティング（XSS）の典型例であり、対策としては入力値を表示する際にHTMLタグとして解釈されないようにエスケープ処理を行うことが有効である。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions (batch 5)...`);
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
