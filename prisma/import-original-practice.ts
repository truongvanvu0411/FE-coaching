/**
 * Original practice questions (Priority 4 in the spec) — freshly authored, not derived
 * from any official IPA exam or third-party question bank. Always displayed with the
 * "not an official IPA question" notice per the source-footer component.
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
    id: "FE-A-PRACTICE-0001", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "8ビットで表現できる符号なし2進数の最大値はどれか。",
    choices: ["127", "128", "255", "256"], correctIndex: 2,
    explanation: "8ビットは2^8=256通りの値を表現でき、0から255までの範囲になる。よって最大値は255。",
  },
  {
    id: "FE-A-PRACTICE-0002", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "10進数の 27 を2進数で表したものはどれか。",
    choices: ["11010", "11011", "11101", "10111"], correctIndex: 1,
    explanation: "27 = 16+8+2+1 = 2^4+2^3+2^1+2^0 なので、2進数では 11011 となる。",
  },
  {
    id: "FE-A-PRACTICE-0003", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "命題P，Qについて、Pが真、Qが偽であるとき、「P AND (NOT Q)」の真理値はどれか。",
    choices: ["真", "偽", "PとQの値により変わる", "定義できない"], correctIndex: 0,
    explanation: "NOT Qは真（Qが偽のため）。P（真）AND NOT Q（真）= 真。",
  },
  {
    id: "FE-A-PRACTICE-0004", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "16進数 3F を10進数に変換したものはどれか。",
    choices: ["61", "62", "63", "64"], correctIndex: 2,
    explanation: "3F(16) = 3×16 + 15 = 48+15 = 63。",
  },
  {
    id: "FE-A-PRACTICE-0005", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "標本化周波数が8,000Hzの音声信号を1標本当たり8ビットで量子化して10秒間記録した場合のデータ量はおよそ何バイトか。",
    choices: ["8,000バイト", "40,000バイト", "80,000バイト", "800,000バイト"], correctIndex: 2,
    explanation: "8,000標本/秒×10秒=80,000標本。1標本1バイト（8ビット）なので、80,000バイト。",
  },
  {
    id: "FE-A-PRACTICE-0006", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "スタック（後入れ先出し）にA，B，Cの順にpushした直後にpopを2回行った場合、取り出される順序はどれか。",
    choices: ["A，B", "B，C", "C，B", "C，A"], correctIndex: 2,
    explanation: "最後にpushしたCが最初に取り出され、次にBが取り出される。よってC，Bの順。",
  },
  {
    id: "FE-A-PRACTICE-0007", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    body: "ある事象Xの発生確率が0.25であるとき、Xが発生しない確率はどれか。",
    choices: ["0.25", "0.5", "0.75", "1.25"], correctIndex: 2,
    explanation: "余事象の確率は 1 － 0.25 ＝ 0.75。",
  },
  {
    id: "FE-A-PRACTICE-0008", section: "A", topic: "基礎理論", difficulty: "HARD",
    body: "二分探索木において、要素数が15個で完全に均衡している場合、探索に必要な最大比較回数はどれか。",
    choices: ["3回", "4回", "7回", "15回"], correctIndex: 1,
    explanation: "均衡二分探索木の高さはlog2(n+1)で、n=15なら高さ4（log2(16)=4）。最大比較回数は木の高さに等しく4回。",
  },
  {
    id: "FE-A-PRACTICE-0009", section: "A", topic: "基礎理論", difficulty: "EASY",
    body: "キューの操作のうち、要素を末尾に追加する操作を何と呼ぶか。",
    choices: ["push", "pop", "enqueue", "dequeue"], correctIndex: 2,
    explanation: "キュー（先入れ先出し）では、末尾に追加する操作をenqueue、先頭から取り出す操作をdequeueと呼ぶ。",
  },

  // ===== アルゴリズムとプログラミング =====
  {
    id: "FE-A-PRACTICE-0010", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "要素数nの配列に対して、単純な線形探索を行う場合の最悪計算量はどれか。",
    choices: ["O(1)", "O(log n)", "O(n)", "O(n^2)"], correctIndex: 2,
    explanation: "線形探索は先頭から順に比較するため、最悪の場合は全要素n個を確認する必要があり、O(n)となる。",
  },
  {
    id: "FE-A-PRACTICE-0011", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "マージソートの平均計算量はどれか。",
    choices: ["O(n)", "O(n log n)", "O(n^2)", "O(2^n)"], correctIndex: 1,
    explanation: "マージソートは分割統治法を用いており、分割にlog n段階、各段階の併合にO(n)かかるため、全体でO(n log n)となる。",
  },
  {
    id: "FE-A-PRACTICE-0012", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "再帰関数が無限に呼び出され続けることを防ぐために必ず必要な要素はどれか。",
    choices: ["ループ変数", "基底条件（終了条件）", "グローバル変数", "戻り値の型"], correctIndex: 1,
    explanation: "再帰関数には、再帰呼出しを止めるための基底条件が必要である。基底条件がないと無限再帰に陥る。",
  },
  {
    id: "FE-A-PRACTICE-0013", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "オブジェクト指向におけるカプセル化の主な目的はどれか。",
    choices: [
      "処理速度を向上させること", "内部データと実装の詳細を外部から隠蔽し、意図しない変更を防ぐこと",
      "メモリ使用量を削減すること", "複数のクラスを同時に実行すること",
    ], correctIndex: 1,
    explanation: "カプセル化は、オブジェクトの内部状態を隠蔽し、決められたインタフェースを通じてのみアクセスさせることで、安全性と保守性を高める仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0014", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "HARD",
    body: "ハッシュ表において、異なるキーが同じハッシュ値になることを何と呼ぶか。",
    choices: ["オーバフロー", "衝突（コリジョン）", "デッドロック", "オーバライド"], correctIndex: 1,
    explanation: "異なるキーが同一のハッシュ値を持つ状態を衝突（コリジョン）と呼び、チェイン法やオープンアドレス法で対処する。",
  },
  {
    id: "FE-A-PRACTICE-0015", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    body: "クラスの継承の説明として、適切なものはどれか。",
    choices: [
      "あるクラスが別のクラスのインスタンスを内部に保持すること",
      "既存のクラスの属性やメソッドを引き継いだ新しいクラスを定義すること",
      "複数のインタフェースを一つのクラスにまとめること",
      "同じ名前のメソッドを異なる型に対して定義すること",
    ], correctIndex: 1,
    explanation: "継承は、既存のクラス（スーパークラス）の性質を引き継いで新しいクラス（サブクラス）を定義する仕組みである。",
  },
  {
    id: "FE-A-PRACTICE-0016", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "EASY",
    body: "配列の要素番号が1から始まる言語で、要素数5の配列の最後の要素の番号はどれか。",
    choices: ["4", "5", "6", "配列の宣言による"], correctIndex: 1,
    explanation: "要素番号が1から始まる場合、要素数5の配列の要素番号は1,2,3,4,5となり、最後は5。",
  },

  // ===== コンピュータ構成要素 =====
  {
    id: "FE-A-PRACTICE-0017", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "CPUのクロック周波数が2GHzであるとき、1クロックの時間はどれか。",
    choices: ["0.5ナノ秒", "0.5マイクロ秒", "2ナノ秒", "2マイクロ秒"], correctIndex: 0,
    explanation: "周期＝1／周波数。1／(2×10^9)＝0.5×10^-9秒＝0.5ナノ秒。",
  },
  {
    id: "FE-A-PRACTICE-0018", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "揮発性であり、電源を切ると記憶内容が失われる主記憶装置はどれか。",
    choices: ["ROM", "DRAM", "SSD", "HDD"], correctIndex: 1,
    explanation: "DRAM（動的RAM）は電源が切れると内容が失われる揮発性メモリであり、主記憶装置として広く使われる。",
  },
  {
    id: "FE-A-PRACTICE-0019", section: "A", topic: "コンピュータ構成要素", difficulty: "HARD",
    body: "パイプライン処理の説明として、適切なものはどれか。",
    choices: [
      "複数の命令の実行過程を段階に分け、各段階を並行して処理することで処理能力を高める方式",
      "複数のCPUコアで全く同じ処理を同時に実行し結果を比較する方式",
      "主記憶とキャッシュメモリの間でデータを一括転送する方式",
      "電源が切れても記憶内容を保持する方式",
    ], correctIndex: 0,
    explanation: "パイプライン処理は、命令の実行を「取出し」「解読」「実行」などの段階に分割し、複数の命令の各段階を重ねて並行処理することでスループットを向上させる。",
  },
  {
    id: "FE-A-PRACTICE-0020", section: "A", topic: "コンピュータ構成要素", difficulty: "MEDIUM",
    body: "キャッシュメモリのヒット率が90%、キャッシュアクセス時間が10ナノ秒、主記憶アクセス時間が100ナノ秒であるとき、平均アクセス時間はどれか（ヒット時はキャッシュのみアクセスし、ミス時は主記憶のみアクセスするものとする）。",
    choices: ["19ナノ秒", "20ナノ秒", "90ナノ秒", "100ナノ秒"], correctIndex: 0,
    explanation: "平均アクセス時間＝0.9×10＋0.1×100＝9＋10＝19ナノ秒。",
  },
  {
    id: "FE-A-PRACTICE-0021", section: "A", topic: "コンピュータ構成要素", difficulty: "EASY",
    body: "コンピュータの5大装置に含まれないものはどれか。",
    choices: ["制御装置", "演算装置", "記憶装置", "コンパイラ"], correctIndex: 3,
    explanation: "コンピュータの5大装置は、入力装置、出力装置、記憶装置、演算装置、制御装置である。コンパイラはソフトウェアであり装置ではない。",
  },

  // ===== システム構成要素 =====
  {
    id: "FE-A-PRACTICE-0022", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "二つの装置が並列に接続され、どちらか一方が稼働していればよいシステムがある。各装置の稼働率が0.9であるとき、このシステム全体の稼働率はどれか。",
    choices: ["0.81", "0.9", "0.95", "0.99"], correctIndex: 3,
    explanation: "並列システムの稼働率＝1－(1－0.9)×(1－0.9)＝1－0.01＝0.99。",
  },
  {
    id: "FE-A-PRACTICE-0023", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "直列に接続された二つの装置がともに稼働している必要があるシステムがある。各装置の稼働率が0.8であるとき、このシステム全体の稼働率はどれか。",
    choices: ["0.16", "0.36", "0.64", "0.96"], correctIndex: 2,
    explanation: "直列システムの稼働率は各装置の稼働率の積で求まる。0.8×0.8＝0.64。",
  },
  {
    id: "FE-A-PRACTICE-0024", section: "A", topic: "システム構成要素", difficulty: "EASY",
    body: "複数のサーバに処理を分散させ、システム全体の処理能力や可用性を高める技術はどれか。",
    choices: ["ロードバランシング", "デフラグメンテーション", "マイグレーション", "キャッシング"], correctIndex: 0,
    explanation: "ロードバランシング（負荷分散）は、複数のサーバにリクエストを振り分けることで、処理能力と可用性を向上させる技術である。",
  },
  {
    id: "FE-A-PRACTICE-0025", section: "A", topic: "システム構成要素", difficulty: "MEDIUM",
    body: "MTBFが950時間、MTTRが50時間の装置がある。この装置の稼働率はどれか。",
    choices: ["0.05", "0.5", "0.95", "0.99"], correctIndex: 2,
    explanation: "稼働率＝MTBF／(MTBF＋MTTR)＝950／1000＝0.95。",
  },
  {
    id: "FE-A-PRACTICE-0026", section: "A", topic: "システム構成要素", difficulty: "HARD",
    body: "サーバの仮想化に関する記述のうち、適切なものはどれか。",
    choices: [
      "1台の物理サーバ上で複数の独立した仮想マシンを動作させ、ハードウェア資源を効率的に共有する技術である。",
      "複数の物理サーバを1台のサーバのように見せかけるが、実際には処理能力の向上は見込めない。",
      "仮想化は必ずネットワークを介した外部サービスとして提供される。",
      "仮想マシンはホストOSと全く同じOSしか動作させることができない。",
    ], correctIndex: 0,
    explanation: "サーバ仮想化は、ハイパーバイザーなどを用いて1台の物理サーバ上に複数の独立した仮想マシンを構築し、ハードウェア資源を効率的に共有・分割する技術である。",
  },

  // ===== ソフトウェア =====
  {
    id: "FE-A-PRACTICE-0027", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "OSの主な役割として、適切でないものはどれか。",
    choices: ["プロセス管理", "メモリ管理", "ファイルシステム管理", "アプリケーションの業務ロジックの実装"], correctIndex: 3,
    explanation: "OSはプロセス・メモリ・ファイルシステムなどの資源管理を担うが、個々のアプリケーションの業務ロジックはアプリケーション側の責務である。",
  },
  {
    id: "FE-A-PRACTICE-0028", section: "A", topic: "ソフトウェア", difficulty: "MEDIUM",
    body: "コンパイラ方式とインタプリタ方式の違いに関する記述のうち、適切なものはどれか。",
    choices: [
      "コンパイラは実行時に1行ずつ解釈しながら実行し、インタプリタは事前に機械語に変換する。",
      "コンパイラは事前にソースプログラム全体を機械語に変換し、インタプリタは実行時に逐次解釈しながら実行する。",
      "コンパイラとインタプリタは処理方式が全く同じである。",
      "インタプリタ方式では実行可能ファイルが生成され、再配布が容易である。",
    ], correctIndex: 1,
    explanation: "コンパイラは事前にソースプログラム全体を目的プログラム（機械語）に変換してから実行し、インタプリタは実行時にソースを逐次解釈しながら実行する。",
  },
  {
    id: "FE-A-PRACTICE-0029", section: "A", topic: "ソフトウェア", difficulty: "HARD",
    body: "ページング方式の仮想記憶において、必要なページが主記憶上にない場合に発生する事象はどれか。",
    choices: ["ページフォールト", "デッドロック", "スラッシング", "セグメンテーション違反"], correctIndex: 0,
    explanation: "必要なページが主記憶にない状態でアクセスが発生するとページフォールトが起こり、OSが該当ページを補助記憶からロードする。",
  },
  {
    id: "FE-A-PRACTICE-0030", section: "A", topic: "ソフトウェア", difficulty: "EASY",
    body: "ファイルの絶対パスの説明として、適切なものはどれか。",
    choices: [
      "カレントディレクトリを起点として対象ファイルに至る経路", "ルートディレクトリを起点として対象ファイルに至る経路",
      "ファイル名だけを表す文字列", "ファイルの作成日時を含む識別子",
    ], correctIndex: 1,
    explanation: "絶対パスは、ファイルシステムの最上位であるルートディレクトリを起点として対象ファイルまでの経路を表す。",
  },

  // ===== データベース =====
  {
    id: "FE-A-PRACTICE-0031", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "関係データベースにおいて、表から特定の列だけを取り出す操作はどれか。",
    choices: ["選択（selection）", "射影（projection）", "結合（join）", "和（union）"], correctIndex: 1,
    explanation: "射影（projection）は、表から指定した列だけを取り出す操作である。行を条件で絞り込むのは選択（selection）。",
  },
  {
    id: "FE-A-PRACTICE-0032", section: "A", topic: "データベース", difficulty: "EASY",
    body: "SQLにおいて、表からデータを検索するための文はどれか。",
    choices: ["INSERT", "UPDATE", "DELETE", "SELECT"], correctIndex: 3,
    explanation: "SELECT文は、表からデータを検索・抽出するために使用する。",
  },
  {
    id: "FE-A-PRACTICE-0033", section: "A", topic: "データベース", difficulty: "HARD",
    body: "トランザクションのACID特性のうち、複数のトランザクションを並行して実行しても、それぞれが単独で実行された場合と同じ結果になることを保証する特性はどれか。",
    choices: ["原子性（Atomicity）", "一貫性（Consistency）", "独立性（Isolation）", "耐久性（Durability）"], correctIndex: 2,
    explanation: "独立性（Isolation）は、並行実行される複数のトランザクションが互いに干渉せず、単独実行時と同じ結果になることを保証する特性である。",
  },
  {
    id: "FE-A-PRACTICE-0034", section: "A", topic: "データベース", difficulty: "MEDIUM",
    body: "正規化の主な目的として、適切なものはどれか。",
    choices: [
      "データの重複を排除し、更新時異常を防ぐこと", "検索速度を必ず向上させること",
      "全てのデータを一つの表にまとめること", "バックアップの頻度を減らすこと",
    ], correctIndex: 0,
    explanation: "正規化は、データの重複を排除し、挿入・更新・削除時に生じる不整合（更新時異常）を防ぐことを主な目的とする。",
  },
  {
    id: "FE-A-PRACTICE-0035", section: "A", topic: "データベース", difficulty: "HARD",
    body: "外部キー制約の役割として、適切なものはどれか。",
    choices: [
      "表内の各行を一意に識別する。", "参照先の表に存在しない値が登録されることを防ぎ、参照整合性を維持する。",
      "列のデータ型を自動的に変換する。", "表の物理的な格納順序を決定する。",
    ], correctIndex: 1,
    explanation: "外部キー制約は、ある表の列の値が別の表（参照先）の主キーなどに存在する値でなければならないことを強制し、参照整合性を維持する。",
  },

  // ===== ネットワーク =====
  {
    id: "FE-A-PRACTICE-0036", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "URLにおいて、暗号化された通信であることを示すスキームはどれか。",
    choices: ["http", "https", "ftp", "smtp"], correctIndex: 1,
    explanation: "httpsは、HTTP通信をSSL/TLSで暗号化していることを示すスキームである。",
  },
  {
    id: "FE-A-PRACTICE-0037", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "IPアドレスをMACアドレスに変換するためのプロトコルはどれか。",
    choices: ["ARP", "DNS", "DHCP", "ICMP"], correctIndex: 0,
    explanation: "ARP（Address Resolution Protocol）は、IPアドレスから対応するMACアドレスを取得するためのプロトコルである。",
  },
  {
    id: "FE-A-PRACTICE-0038", section: "A", topic: "ネットワーク", difficulty: "HARD",
    body: "100Mビット/秒の回線を使用して、実効伝送効率50％で1,000Mバイトのデータを転送するのに掛かる時間はおよそ何秒か。",
    choices: ["16秒", "80秒", "160秒", "800秒"], correctIndex: 2,
    explanation: "1,000Mバイト＝8,000Mビット。実効速度＝100×0.5＝50Mビット/秒。時間＝8,000÷50＝160秒。",
  },
  {
    id: "FE-A-PRACTICE-0039", section: "A", topic: "ネットワーク", difficulty: "MEDIUM",
    body: "電子メールの送信に一般的に使用されるプロトコルはどれか。",
    choices: ["POP3", "IMAP", "SMTP", "FTP"], correctIndex: 2,
    explanation: "SMTP（Simple Mail Transfer Protocol）は電子メールの送信に使用される。受信にはPOP3やIMAPが使われる。",
  },
  {
    id: "FE-A-PRACTICE-0040", section: "A", topic: "ネットワーク", difficulty: "EASY",
    body: "ネットワークにおいて、ドメイン名とIPアドレスを対応付ける仕組みはどれか。",
    choices: ["DNS", "NAT", "VPN", "VLAN"], correctIndex: 0,
    explanation: "DNS（Domain Name System）は、人間が読めるドメイン名とIPアドレスを対応付ける仕組みである。",
  },

  // ===== セキュリティ =====
  {
    id: "FE-A-PRACTICE-0041", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "第三者になりすまして、正規の利用者からパスワードなどの機密情報をだまし取る攻撃手法はどれか。",
    choices: ["フィッシング", "ポートスキャン", "バッファオーバフロー", "総当たり攻撃"], correctIndex: 0,
    explanation: "フィッシングは、実在する組織になりすましたメールやWebサイトを用いて、利用者から機密情報をだまし取る攻撃である。",
  },
  {
    id: "FE-A-PRACTICE-0042", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "共通鍵暗号方式の特徴として、適切なものはどれか。",
    choices: [
      "暗号化と復号に異なる鍵を使用する。", "暗号化と復号に同じ鍵を使用するため、鍵の安全な配送が課題となる。",
      "鍵の配送問題が原理的に発生しない。", "デジタル署名の作成に必ず使用される。",
    ], correctIndex: 1,
    explanation: "共通鍵暗号方式は暗号化と復号に同一の鍵を使うため、通信相手に鍵を安全に届ける「鍵配送問題」が課題となる。",
  },
  {
    id: "FE-A-PRACTICE-0043", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "デジタル署名の目的として、適切なものはどれか。",
    choices: [
      "通信内容を第三者から秘匿すること", "送信者の否認防止とデータの改ざん検知を実現すること",
      "通信速度を向上させること", "パスワードを暗号化して保存すること",
    ], correctIndex: 1,
    explanation: "デジタル署名は、送信者の秘密鍵で署名することで、送信者本人であることの証明（否認防止）とデータが改ざんされていないことの検証を可能にする。",
  },
  {
    id: "FE-A-PRACTICE-0044", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    body: "利用者になりすましてシステムへの不正アクセスを試みる際、辞書に載っている単語を次々と試すパスワード解析手法はどれか。",
    choices: ["辞書攻撃", "SQLインジェクション", "クロスサイトスクリプティング", "DDoS攻撃"], correctIndex: 0,
    explanation: "辞書攻撃は、辞書に載っている単語やよく使われるパスワードを順に試してパスワードを解析する攻撃手法である。",
  },
  {
    id: "FE-A-PRACTICE-0045", section: "A", topic: "セキュリティ", difficulty: "EASY",
    body: "ファイアウォールの主な役割はどれか。",
    choices: [
      "ネットワークの通信を監視し、あらかじめ定めた規則に基づいて通過させる通信を制御すること",
      "ハードディスクの内容を暗号化すること", "プログラムのバグを自動的に修正すること",
      "ネットワークの速度を向上させること",
    ], correctIndex: 0,
    explanation: "ファイアウォールは、内部ネットワークと外部ネットワークの境界に設置され、あらかじめ定めた規則に基づいて通信を許可・遮断するアクセス制御を行う。",
  },
  {
    id: "FE-A-PRACTICE-0046", section: "A", topic: "セキュリティ", difficulty: "HARD",
    body: "多要素認証の説明として、適切なものはどれか。",
    choices: [
      "同じ種類の要素（例えばパスワードを二つ）を組み合わせて認証すること",
      "「知識情報」「所持情報」「生体情報」のうち異なる種類の要素を組み合わせて認証すること",
      "一度認証すれば二度と認証が不要になる仕組み",
      "生体情報だけを用いる認証方式の別名",
    ], correctIndex: 1,
    explanation: "多要素認証は、知識情報（パスワードなど）、所持情報（ICカードなど）、生体情報（指紋など）のうち異なる種類を組み合わせることで安全性を高める。",
  },

  // ===== システム開発技術 =====
  {
    id: "FE-A-PRACTICE-0047", section: "A", topic: "システム開発技術", difficulty: "EASY",
    body: "ソフトウェアの内部構造を考慮せず、仕様書に基づいて入出力の振る舞いだけを検証するテスト手法はどれか。",
    choices: ["ホワイトボックステスト", "ブラックボックステスト", "回帰テスト", "負荷テスト"], correctIndex: 1,
    explanation: "ブラックボックステストは、内部構造を意識せず、仕様に対して正しい入出力が得られるかを検証する手法である。",
  },
  {
    id: "FE-A-PRACTICE-0048", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "ウォーターフォールモデルの特徴として、適切なものはどれか。",
    choices: [
      "要件定義から順に工程を進め、前の工程が完了してから次の工程に着手する。",
      "短い期間（イテレーション）を繰り返して段階的に開発を進める。",
      "顧客の要求を最優先し、仕様書を作成せずに開発を進める。",
      "テスト工程を最初に実施し、その後で設計を行う。",
    ], correctIndex: 0,
    explanation: "ウォーターフォールモデルは、要件定義・設計・実装・テストなどの工程を順番に進め、原則として前工程の完了を前提に次工程へ進む開発モデルである。",
  },
  {
    id: "FE-A-PRACTICE-0049", section: "A", topic: "システム開発技術", difficulty: "HARD",
    body: "単体テストにおいて、まだ実装されていない下位モジュールの代わりに用いるテスト用のダミーモジュールはどれか。",
    choices: ["ドライバ", "スタブ", "シミュレータ", "エミュレータ"], correctIndex: 1,
    explanation: "スタブは、テスト対象モジュールが呼び出す下位モジュールの代替として使うダミーモジュールである。上位モジュールの代替はドライバと呼ばれる。",
  },
  {
    id: "FE-A-PRACTICE-0050", section: "A", topic: "システム開発技術", difficulty: "MEDIUM",
    body: "アジャイル開発におけるスクラムで、1～4週間程度の短い開発サイクルを何と呼ぶか。",
    choices: ["スプリント", "マイルストーン", "レトロスペクティブ", "バックログ"], correctIndex: 0,
    explanation: "スクラムでは、1～4週間程度の固定された期間の開発サイクルをスプリントと呼び、その中で計画・実装・レビューを行う。",
  },

  // ===== マネジメント系 =====
  {
    id: "FE-A-PRACTICE-0051", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "プロジェクトの各作業の開始・終了予定を横棒で示し、全体の日程を視覚的に把握するための図はどれか。",
    choices: ["ガントチャート", "アローダイアグラム", "特性要因図", "散布図"], correctIndex: 0,
    explanation: "ガントチャートは、各作業の開始・終了時期を横棒グラフで表し、プロジェクト全体のスケジュールを視覚化する図である。",
  },
  {
    id: "FE-A-PRACTICE-0052", section: "A", topic: "マネジメント系", difficulty: "HARD",
    body: "プロジェクトマネジメントにおいて、開始から終了までの経路のうち、余裕（フロート）が最も少なく、遅延がそのままプロジェクト全体の遅延につながる経路を何と呼ぶか。",
    choices: ["クリティカルパス", "サブパス", "デッドパス", "ボトルネックパス"], correctIndex: 0,
    explanation: "クリティカルパスは、プロジェクトの開始から終了までの経路のうち最も所要日数が長く、余裕（フロート）がゼロの経路であり、遅延がそのまま全体の遅延に直結する。",
  },
  {
    id: "FE-A-PRACTICE-0053", section: "A", topic: "マネジメント系", difficulty: "EASY",
    body: "システム開発プロジェクトにおいて、要求される品質・コスト・納期の三つをまとめて表す略語はどれか。",
    choices: ["QCD", "PDCA", "SLA", "KPI"], correctIndex: 0,
    explanation: "QCDは品質（Quality）、コスト（Cost）、納期（Delivery）の頭文字であり、プロジェクト管理の基本的な評価軸として使われる。",
  },
  {
    id: "FE-A-PRACTICE-0054", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    body: "サービスマネジメントにおいて、インシデントの根本原因を特定し、再発を防止するための一連の活動を何と呼ぶか。",
    choices: ["インシデント管理", "問題管理", "変更管理", "リリース管理"], correctIndex: 1,
    explanation: "問題管理は、インシデントの根本原因（既知の誤りなど）を特定し、恒久的な対策を講じることで再発を防止する活動である。",
  },

  // ===== ストラテジ系 =====
  {
    id: "FE-A-PRACTICE-0055", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    body: "自社の強み・弱みと、外部環境の機会・脅威を分析するためのフレームワークはどれか。",
    choices: ["SWOT分析", "5フォース分析", "PPM分析", "バリューチェーン分析"], correctIndex: 0,
    explanation: "SWOT分析は、Strength（強み）、Weakness（弱み）、Opportunity（機会）、Threat（脅威）の4つの観点から自社の状況を分析するフレームワークである。",
  },
  {
    id: "FE-A-PRACTICE-0056", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "ある製品の販売価格が800円、変動費が500円、固定費が月900,000円であるとき、損益分岐点となる月間販売数量はどれか。",
    choices: ["1,125個", "1,800個", "3,000個", "4,500個"], correctIndex: 2,
    explanation: "1個当たりの限界利益＝800－500＝300円。損益分岐点数量＝固定費÷限界利益＝900,000÷300＝3,000個。",
  },
  {
    id: "FE-A-PRACTICE-0057", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    body: "他社が容易にまねできない、企業独自の中核的な技術や能力のことを何と呼ぶか。",
    choices: ["コアコンピタンス", "アウトソーシング", "ベンチマーキング", "コモディティ化"], correctIndex: 0,
    explanation: "コアコンピタンスは、競合他社が容易に模倣できない、企業独自の中核的な強み・技術・能力を指す用語である。",
  },
  {
    id: "FE-A-PRACTICE-0058", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    body: "特許権や著作権など、知的創作物を保護する権利を総称して何と呼ぶか。",
    choices: ["知的財産権", "産業財産権", "肖像権", "パブリシティ権"], correctIndex: 0,
    explanation: "知的財産権は、特許権・実用新案権・意匠権・商標権・著作権などを含む、知的創作物を保護する権利の総称である（産業財産権はそのうち特許・実用新案・意匠・商標の4つを指す）。",
  },

  // ===== B: アルゴリズム（擬似言語） =====
  {
    id: "FE-B-PRACTICE-0001", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 sumArray は，引数で与えられた整数型の配列 data の全要素の合計を返す。\n〔プログラム〕\n○整数型: sumArray(整数型の配列: data)\n　整数型: total ← 0\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　total ← ［　　］\n　endfor\n　return total",
    choices: ["total ＋ i", "total ＋ data[i]", "data[i] ＋ 1", "total ＋ dataの要素数"],
    correctIndex: 1,
    explanation: "各要素data[i]をtotalに加算していくことで、全要素の合計を計算できる。",
  },
  {
    id: "FE-B-PRACTICE-0002", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 findMax は，引数で与えられた要素数1以上の整数型の配列 data の中の最大値を返す。\n〔プログラム〕\n○整数型: findMax(整数型の配列: data)\n　整数型: maxVal ← data[1]\n　整数型: i\n　for (i を 2 から dataの要素数 まで 1 ずつ増やす)\n　　if (［　　］)\n　　　maxVal ← data[i]\n　　endif\n　endfor\n　return maxVal",
    choices: ["data[i] ＜ maxVal", "data[i] ＞ maxVal", "data[i] ＝ maxVal", "i ＞ maxVal"],
    correctIndex: 1,
    explanation: "現在の最大値maxValより大きい要素data[i]が見つかった場合にmaxValを更新することで、最終的に配列全体の最大値が得られる。",
  },
  {
    id: "FE-B-PRACTICE-0003", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 isEven は，引数で与えられた整数nが偶数であればtrueを、奇数であればfalseを返す。演算子modは剰余算を表す。\n〔プログラム〕\n○論理型: isEven(整数型: n)\n　return ［　　］",
    choices: ["(n mod 2) ＝ 0", "(n mod 2) ＝ 1", "n ÷ 2 が整数", "n ＝ 0"],
    correctIndex: 0,
    explanation: "nを2で割った余りが0であれば偶数である。よって(n mod 2)＝0を返せばよい。",
  },
  {
    id: "FE-B-PRACTICE-0004", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 countMatches は，引数で与えられた文字列型の配列 data の中から，引数 target と等しい値の個数を数えて返す。\n〔プログラム〕\n○整数型: countMatches(文字列型の配列: data, 文字列型: target)\n　整数型: count ← 0\n　整数型: i\n　for (i を 1 から dataの要素数 まで 1 ずつ増やす)\n　　if (data[i] が target と等しい)\n　　　［　　］\n　　endif\n　endfor\n　return count",
    choices: ["count ← count ＋ 1", "count ← i", "count ← count － 1", "i ← i ＋ 1"],
    correctIndex: 0,
    explanation: "一致した要素が見つかるたびにcountを1ずつ増やしていくことで、一致した個数を数えられる。",
  },
  {
    id: "FE-B-PRACTICE-0005", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 reverseArray は，引数で与えられた整数型の配列 data の要素の並びを逆順にする（戻り値はなく、dataを直接書き換える）。\n〔プログラム〕\n○reverseArray(整数型の配列: data)\n　整数型: i, temp\n　整数型: n ← dataの要素数\n　for (i を 1 から n ÷ 2 の商 まで 1 ずつ増やす)\n　　temp ← data[i]\n　　data[i] ← ［ a ］\n　　［ b ］ ← temp\n　endfor",
    choices: [
      "a: data[n － i ＋ 1]／b: data[n － i ＋ 1]",
      "a: data[n － i]／b: data[n － i]",
      "a: data[n － i ＋ 1]／b: data[i]",
      "a: data[i ＋ 1]／b: data[n － i]",
    ],
    correctIndex: 0,
    explanation: "配列を逆順にするには、先頭からi番目の要素と末尾からi番目の要素（要素番号n－i＋1）を入れ替える。data[i]を一時保存してからdata[n－i＋1]の値をdata[i]に代入し、保存しておいた値をdata[n－i＋1]に代入することで交換が完成する。",
  },
  {
    id: "FE-B-PRACTICE-0006", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 factorial は，引数で与えられた0以上の整数nの階乗（n!）を返す。ここで、0! ＝ 1 とする。\n〔プログラム〕\n○整数型: factorial(整数型: n)\n　if (n ＝ 0)\n　　return 1\n　endif\n　return n × ［　　］",
    choices: ["factorial(n)", "factorial(n － 1)", "factorial(n ＋ 1)", "n － 1"],
    correctIndex: 1,
    explanation: "階乗の再帰的定義はn! = n × (n-1)!であるため、factorial(n-1)を再帰的に呼び出す。",
  },
  {
    id: "FE-B-PRACTICE-0007", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 binarySearch は，昇順に整列された整数型の配列 data から，値 target と等しい要素の番号を探して返す。見つからない場合は0を返す。\n〔プログラム〕\n○整数型: binarySearch(整数型の配列: data, 整数型: target)\n　整数型: low ← 1\n　整数型: high ← dataの要素数\n　整数型: mid\n　while (low ≦ high)\n　　mid ← (low ＋ high) ÷ 2 の商\n　　if (data[mid] ＝ target)\n　　　return mid\n　　elseif (data[mid] ＜ target)\n　　　low ← mid ＋ 1\n　　else\n　　　［　　］\n　　endif\n　endwhile\n　return 0",
    choices: ["high ← mid － 1", "high ← mid", "low ← mid － 1", "low ← low ＋ 1"],
    correctIndex: 0,
    explanation: "data[mid]がtargetより大きい場合、探索範囲を左半分に絞る必要があるため、high（探索範囲の上限）をmid－1に更新する。",
  },
  {
    id: "FE-B-PRACTICE-0008", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 gcd は，二つの正の整数 a，b の最大公約数を、ユークリッドの互除法を用いて求めて返す。演算子modは剰余算を表す。\n〔プログラム〕\n○整数型: gcd(整数型: a, 整数型: b)\n　if (b ＝ 0)\n　　return a\n　endif\n　return gcd(b, ［　　］)",
    choices: ["a mod b", "b mod a", "a － b", "a ÷ b の商"],
    correctIndex: 0,
    explanation: "ユークリッドの互除法では、gcd(a,b) = gcd(b, a mod b) という関係を利用して再帰的に最大公約数を求める。",
  },
  {
    id: "FE-B-PRACTICE-0009", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    body: "次の記述中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n次のプログラムは、要素数5の整数型配列 data ← {5, 3, 8, 1, 9} に対して、単純選択法（選択ソート）で昇順に整列する。1回目の外側ループ終了時点（i＝1の処理が終わった直後）のdataの内容は［　　］となる。\n〔プログラム〕\n○整数型の配列: data ← {5, 3, 8, 1, 9}\n○selectionSort(整数型の配列: data)\n　整数型: i, j, minIndex, temp\n　整数型: n ← dataの要素数\n　for (i を 1 から n － 1 まで 1 ずつ増やす)\n　　minIndex ← i\n　　for (j を i ＋ 1 から n まで 1 ずつ増やす)\n　　　if (data[j] ＜ data[minIndex])\n　　　　minIndex ← j\n　　　endif\n　　endfor\n　　temp ← data[i]\n　　data[i] ← data[minIndex]\n　　data[minIndex] ← temp\n　endfor",
    choices: ["{1, 3, 8, 5, 9}", "{1, 5, 8, 3, 9}", "{1, 3, 5, 8, 9}", "{5, 3, 8, 1, 9}"],
    correctIndex: 0,
    explanation: "初期状態{5,3,8,1,9}のうち最小値は1（要素番号4）。i=1の処理でdata[1]とdata[4]を交換し、{1,3,8,5,9}となる。",
  },
  {
    id: "FE-B-PRACTICE-0010", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "MEDIUM",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 isPalindrome は，引数で与えられた文字列型の配列 chars（1文字ずつ格納）が、前から読んでも後ろから読んでも同じ並び（回文）であればtrueを、そうでなければfalseを返す。\n〔プログラム〕\n○論理型: isPalindrome(文字列型の配列: chars)\n　整数型: i\n　整数型: n ← charsの要素数\n　for (i を 1 から n ÷ 2 の商 まで 1 ずつ増やす)\n　　if (chars[i] が ［　　］ と等しくない)\n　　　return false\n　　endif\n　endfor\n　return true",
    choices: ["chars[n － i]", "chars[n － i ＋ 1]", "chars[i ＋ 1]", "chars[n]"],
    correctIndex: 1,
    explanation: "回文判定では、先頭からi番目の文字と末尾からi番目の文字（要素番号n－i＋1）を比較する必要がある。1つでも一致しなければ回文ではない。",
  },

  // ===== B: 情報セキュリティ =====
  {
    id: "FE-B-PRACTICE-0011", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "A社は，従業員が利用するノートPCについて，社外への持出しを許可している。ある日，営業担当者が電車内にノートPCを置き忘れ，紛失する事故が発生した。当該PCのハードディスクは暗号化されておらず，ログインパスワードも設定されていなかった。この事故によって最も懸念されるリスクはどれか。",
    choices: [
      "PCの再購入費用が発生すること", "PC内に保存されていた顧客の個人情報や機密情報が第三者に閲覧されること",
      "従業員の業務が一時的に滞ること", "PCの保証期間が短縮されること",
    ], correctIndex: 1,
    explanation: "暗号化やログインパスワードによる保護がない状態で紛失した場合、第三者がPC内のデータに容易にアクセスでき、情報漏えいのリスクが最も深刻な懸念となる。",
  },
  {
    id: "FE-B-PRACTICE-0012", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "B社では，全従業員が共通の管理者アカウントを使って業務システムにログインし，個々の操作ログを記録していなかった。ある日，顧客データの不正な持ち出しが発覚したが，誰が操作したのかを特定できなかった。この事案から得られる教訓として，最も適切な再発防止策はどれか。",
    choices: [
      "パスワードの文字数を長くする。", "従業員ごとに個別のアカウントを発行し，操作ログを記録・追跡できるようにする。",
      "業務システムのサーバを増設する。", "全従業員に同じ研修を実施する。",
    ], correctIndex: 1,
    explanation: "共通アカウントの使用は、個々の操作の追跡（アカウンタビリティ）を不可能にする。個別アカウントの発行とログ記録によって、誰がいつ何を行ったかを追跡できるようにすることが再発防止の基本となる。",
  },
  {
    id: "FE-B-PRACTICE-0013", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "C社の従業員が，取引先を装った偽の請求書メールを受け取り，記載された口座に振込みを行ってしまった。この攻撃手法に最も近いものはどれか。",
    choices: ["ビジネスメール詐欺（BEC）", "ポートスキャン", "総当たり攻撃", "ゼロデイ攻撃"], correctIndex: 0,
    explanation: "ビジネスメール詐欺（BEC）は、取引先や経営者になりすましたメールを送り、偽の口座への振込みなどを行わせる詐欺手法である。",
  },
  {
    id: "FE-B-PRACTICE-0014", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "D社は，Webアプリケーションの開発において，利用者が入力した文字列をそのままSQL文に組み込んで実行していた。この結果，悪意のある入力によってデータベースの内容が不正に取得される脆弱性が発見された。この問題を根本的に解決する対策として，最も適切なものはどれか。",
    choices: [
      "入力欄の文字数制限を厳しくする。", "プレースホルダ（バインド機構）を用いてSQL文を組み立てる。",
      "サーバのOSを最新版に更新する。", "利用者にパスワードの定期変更を求める。",
    ], correctIndex: 1,
    explanation: "SQLインジェクション対策として最も根本的なのは、プレースホルダ（バインド機構）を使って入力値をSQL文の構造とは分離して扱う方法である。文字数制限だけでは根本的な対策にならない。",
  },
  {
    id: "FE-B-PRACTICE-0015", section: "B", topic: "情報セキュリティ", difficulty: "MEDIUM",
    body: "E社では，退職した従業員のアカウントが退職後も1か月以上有効なまま放置されていたことが監査で発覚した。この状況が示す情報セキュリティ上の問題点として，最も適切なものはどれか。",
    choices: [
      "アカウントのライフサイクル管理（退職時の速やかな無効化）が徹底されていない。",
      "パスワードの暗号化強度が不足している。", "ネットワーク回線の帯域が不足している。",
      "バックアップの頻度が不足している。",
    ], correctIndex: 0,
    explanation: "退職者のアカウントが放置されることは、アカウントのライフサイクル管理（発行・変更・無効化のプロセス）が徹底されていないことを示しており、不正アクセスの温床となり得る。",
  },
  {
    id: "FE-B-PRACTICE-0016", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    body: "F社は，社内の全PCにウイルス対策ソフトを導入しているが，パターンファイル（定義ファイル）の自動更新設定を無効にしていたため，新種のマルウェアに感染する被害が発生した。この事案における主な原因はどれか。",
    choices: [
      "ウイルス対策ソフトの導入台数が少なかったこと", "パターンファイルが最新の状態に保たれておらず，新種のマルウェアを検知できなかったこと",
      "従業員の人数が多すぎたこと", "社内ネットワークの速度が遅かったこと",
    ], correctIndex: 1,
    explanation: "ウイルス対策ソフトは、パターンファイルが最新でなければ新種のマルウェアを検知できない。自動更新を無効にしていたことが、検知漏れの主な原因である。",
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} original practice questions...`);
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
