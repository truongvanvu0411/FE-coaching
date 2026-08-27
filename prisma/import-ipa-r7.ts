/**
 * Imports the officially published FE 令和7年度 (2025) 公開問題 sets — 科目A (20 released
 * of 60) and 科目B (6 released of 20). Source:
 * https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/2025r07.html
 *
 * Excluded: 科目A Q14 (PERT/arrow diagram — topology not reliably recoverable from text).
 * 科目A Q3 (binary search tree) is included: the tree is a simple 2-level complete
 * structure (root a; children b,c; leaves d,e,f,g under b,c respectively) fully
 * determined by the layout, and BST in-order logic was checked against the answer key.
 * 科目B Q1/Q4 required simulating the pseudocode in JS to resolve apparent inconsistencies
 * in a hand trace (in both cases the hand trace had a subtle bug, not the source); 科目B
 * Q5's two blanks were resolved as the (row1,col1) and (row2,col2) cells of the 2x2
 * theoretical-frequency table — the only placement consistent with the official answer.
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg(process.env.DATABASE_URL!);
const prisma = new PrismaClient({ adapter });

const YEAR = 2025;
const KEY_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"] as const;

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

const BASE = "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att";
const A_URL = `${BASE}/2025r07_fe_kamoku_a_qs.pdf`;
const B_URL = `${BASE}/2025r07_fe_kamoku_b_qs.pdf`;

const QUESTIONS: Q[] = [
  {
    id: "FE-A-IPA-2025-Q01", section: "A", topic: "基礎理論", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "2", questionNumber: "問1",
    body: "大規模言語モデルを用いた自然言語処理において，事前学習済みのモデルに対して行う，ファインチューニングに関する記述として，最も適切なものはどれか。",
    choices: [
      "強化学習を行い，最適な結果が得られるようにする。",
      "事前学習と同じデータを繰り返し用いて学習を行い，モデルの精度を高めるようにする。",
      "大量のテキストデータを用いて学習を行い，モデルの精度を高めるようにする。",
      "特定のデータを用いて追加で学習を行い，目的とするタスクに適用できるようにする。",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q02", section: "A", topic: "基礎理論", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "2", questionNumber: "問2",
    body: "浮動小数点形式で表現された数値の演算結果における丸め誤差の説明はどれか。",
    choices: [
      "演算結果がコンピュータの扱える最大値を超えることによって生じる誤差である。",
      "数表現のけた数に限度があるので，最下位けたより小さい部分について四捨五入や切上げ，切捨てを行うことによって生じる誤差である。",
      "乗除算において，指数部が小さい方の数値の仮数部の下位部分が失われることによって生じる誤差である。",
      "絶対値がほぼ等しい数値の加減算において，上位の有効数字が失われることによって生じる誤差である。",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2025-Q03", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "3", questionNumber: "問3",
    body: "次の木構造は2分探索木である。根をa，aの子をb（左）とc（右），bの子をd（左）とe（右），cの子をf（左）とg（右）とする。a～gの値の大小関係として，適切なものはどれか。ここで，a～gの値は重複しないものとする。",
    choices: [
      "a ＜ b ＜ d ＜ e ＜ c ＜ f ＜ g",
      "d ＜ b ＜ e ＜ a ＜ f ＜ c ＜ g",
      "d ＜ e ＜ f ＜ g ＜ b ＜ c ＜ a",
      "g ＜ f ＜ c ＜ e ＜ d ＜ b ＜ a",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2025-Q04", section: "A", topic: "システム構成要素", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "3", questionNumber: "問4",
    body: "MTBFは4,000時間，MTTRは1,000時間の装置がある。今後の6年間は，予防保守によってMTBFを前年に比べて毎年100時間ずつ改善し，遠隔保守によってMTTRを前年に比べて毎年100時間ずつ改善していく計画である。6年経過後の稼働率は幾らか。",
    choices: ["0.88", "0.90", "0.92", "0.94"], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2025-Q05", section: "A", topic: "システム開発技術", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "4", questionNumber: "問5",
    body: "ローコード開発ツールを用いたソフトウェア開発の説明はどれか。",
    choices: [
      "アプリケーションソフトウェアの開発基盤の上で，用意された部品やテンプレートをGUIを用いた操作で組み合わせたり，必要に応じて一部の処理のソースコードを記述したりすることによって，アプリケーションソフトウェアを作成する。",
      "アプリケーションソフトウェアの開発基盤の上で，用意された部品やテンプレートをGUIを用いた操作で組み合わせるだけで，ソースコードを記述せずに，アプリケーションソフトウェアを作成する。",
      "アプリケーションソフトウェアの定型的な枠組みを参照して，独自の処理のソースコードを記述することによって，アプリケーションソフトウェアを作成する。",
      "利用者がシステムを利用して行う作業を自動化ツールに代行させるために，利用者によるシステムの操作手順をツールに登録する。",
    ], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2025-Q06", section: "A", topic: "データベース", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問6",
    body: "「商品」表（商品ID，商品名称，仕入先ID，単価の列を持つ）に対する次のSQL文と同じ結果が得られるSELECT文はどれか。\n〔SQL文〕\nSELECT * FROM 商品 WHERE 仕入先ID IN ('M002', 'M004')",
    choices: [
      "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' AND 仕入先ID = 'M004'",
      "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' INTERSECT SELECT * FROM 商品 WHERE 仕入先ID = 'M004'",
      "SELECT * FROM 商品 WHERE 仕入先ID = 'M002' OR 仕入先ID = 'M004'",
      "SELECT * FROM 商品 WHERE 仕入先ID BETWEEN 'M002' AND 'M004'",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2025-Q07", section: "A", topic: "ネットワーク", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "5", questionNumber: "問7",
    body: "1Gバイトの動画データを40Mビット／秒の回線を使用してダウンロードしたところ，5分掛かった。このときの回線利用率はおよそ何％か。ここで，ダウンロード時には動画データに20％の制御情報が付加されるものとする。",
    choices: ["10", "53", "67", "80"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q08", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "6", questionNumber: "問8",
    body: "HTTPとHTTPSを比較した場合において，HTTPSだけがもつ特徴を示したものはどれか。",
    choices: [
      "cookieに保存されている情報を用いたセッション管理が可能である。",
      "IDとパスワードによって利用者の認証を行うことが可能である。",
      "Webブラウザでキャッシュさせることによって通信量を減らすことが可能である。",
      "通信相手先サーバをサーバ証明書によって確認することが可能である。",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q09", section: "A", topic: "セキュリティ", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "6", questionNumber: "問9",
    body: "暗号の危殆化に該当するものはどれか。",
    choices: [
      "あるCAでデジタル証明書の署名に使っている公開鍵のデジタル証明書の有効期限が切れた。",
      "ある暗号アルゴリズムの秘密鍵が不正アクセスによって漏えいした。",
      "あるハッシュ関数においてハッシュ値が同じになるデータの組みを現実的な時間内で発見する方法が見つかった。",
      "あるランサムウェアの一種で暗号化されたファイルの復号鍵が公開された。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2025-Q10", section: "A", topic: "セキュリティ", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "6", questionNumber: "問10",
    body: "WAFの説明はどれか。",
    choices: [
      "Webサイトに対するアクセス内容を監視し，攻撃とみなされるパターンを検知したときに当該アクセスを遮断する。",
      "Wi-Fiアライアンスが認定した無線LANの暗号化方式の規格であり，AES暗号に対応している。",
      "様々なシステムの動作ログを一元的に蓄積，管理し，セキュリティ上の脅威となる事象をいち早く検知，分析する。",
      "ファイアウォール機能を有し，マルウェア対策機能，侵入検知機能などの複数のセキュリティ機能を連携させ，統合的に管理する。",
    ], correctIndex: 0,
  },
  {
    id: "FE-A-IPA-2025-Q11", section: "A", topic: "データベース", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問11",
    body: "E-Rモデルにおけるエンティティの特徴はどれか。",
    choices: [
      "エンティティとインスタンスとは，1対1の対応関係をとる。",
      "エンティティとなり得るものは，物的に実現するものである。",
      "エンティティは，特性を表すための属性（アトリビュート）をもつ。",
      "異なった種類のエンティティ間の関係は，主として状態遷移として表現される。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2025-Q12", section: "A", topic: "アルゴリズムとプログラミング", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問12",
    body: "オブジェクト指向プログラミングの特徴のうち，異なるクラスのオブジェクトを同一のインタフェースで操作したときに，操作対象クラスに応じた異なる動作を可能にすることを何と呼ぶか。",
    choices: ["委譲", "継承", "コンポジション", "多相性"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q13", section: "A", topic: "システム開発技術", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "7", questionNumber: "問13",
    body: "アジャイル開発手法の一つであるスクラムにおいて，プロダクトバックログアイテムの内容や並び順を決定する役割をもつのは誰か。",
    choices: ["開発者", "顧客", "スクラムマスタ", "プロダクトオーナ"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q14", section: "A", topic: "マネジメント系", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "8", questionNumber: "問15",
    body: "サーバ室の物理的な安全対策の状況について，情報セキュリティ管理基準（平成28年）に照らして，情報セキュリティ監査を行って判明した状況のうち，監査人が，指摘事項として監査報告書に記載すべきものはどれか。",
    choices: [
      "サーバが設置されている施設の無人領域では，営業時間中でも，警報装置が作動するようになっている。",
      "サーバ室に非常口，避難器具，誘導灯などを設置している。",
      "社外からサーバ室へ直接出入りするドアを設置しているが，出入りを考慮して常時施錠していない。",
      "場所が分からないように，サーバ室の所在を室外に表示していない。",
    ], correctIndex: 2,
  },
  {
    id: "FE-A-IPA-2025-Q15", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問16",
    body: "データマイニングの手法の一つであって，POSなどの蓄積データから「一緒に買われる商品」の組合せを発見する分析手法はどれか。",
    choices: ["3C分析", "ABC分析", "コンジョイント分析", "マーケットバスケット分析"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q16", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問17",
    body: "インターネット上の生成AIサービスを利用する際に，オプトアウトを設定することはどのような場合に有効か。",
    choices: [
      "個々の利用者が，自身が生成AIから得た情報に対して，著作権を主張したい場合",
      "個々の利用者が入力した情報を，生成AIの学習に利用させたくない場合",
      "個々の利用者が入力した情報を，生成AIを通じて，他の利用者にも知ってほしい場合",
      "生成AIから得た情報の信ぴょう性を高めたい場合",
    ], correctIndex: 1,
  },
  {
    id: "FE-A-IPA-2025-Q17", section: "A", topic: "ストラテジ系", difficulty: "MEDIUM",
    sourceUrl: A_URL, sourcePage: "9", questionNumber: "問18",
    body: "物販事業において，ロングテールをビジネスとして成功させるために必要な施策はどれか。",
    choices: [
      "多くの有名ブランド店が出店するショッピングモールの構築",
      "交通の利便性が高い地域に対する，生活必需品を広く浅く取りそろえた出店計画",
      "店舗で購入した商品を近隣地域に無償で配送するサービスの実施",
      "豊富な品ぞろえと，在庫コストや配送費用を抑えるための大規模な物流センタの構築や活用",
    ], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q18", section: "A", topic: "ストラテジ系", difficulty: "HARD",
    sourceUrl: A_URL, sourcePage: "10", questionNumber: "問19",
    body: "次の条件で喫茶店を開業したい。月10万円の利益を出すためには，1客席当たり1日平均何人の客が必要か。\n客1人当たりの売上高：500円\n客1人当たりの変動費：100円\n固定費：300,000円／月\n1か月の営業日数：20日\n客席数：10席",
    choices: ["3.75", "4", "4.2", "5"], correctIndex: 3,
  },
  {
    id: "FE-A-IPA-2025-Q19", section: "A", topic: "ストラテジ系", difficulty: "EASY",
    sourceUrl: A_URL, sourcePage: "10", questionNumber: "問20",
    body: "カーボンフットプリントの説明として，適切なものはどれか。",
    choices: [
      "温室効果ガスの排出量から吸収量と除去量を差し引いた合計をゼロにする取組",
      "原材料調達から廃棄・リサイクルに至るまでのライフサイクル全体を通して排出される温室効果ガスの排出量を，CO2量に換算して，その値を商品やサービスに表示すること",
      "自動車のエンジンから排出される一酸化炭素，窒素酸化物や炭化水素類などの大気汚染物質の排出量の定め",
      "商品がどのような場所で作られて，流通し，販売されているかを把握するための仕組み",
    ], correctIndex: 1,
  },

  // ---- 科目B ----
  {
    id: "FE-B-IPA-2025-Q01", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "4", questionNumber: "問1",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。\n関数 function1 が受け取る引数と，関数 function2 が受け取る引数とが同じとき，二つの関数は同じ値を返す。ここで，引数nと引数mは正の整数であり，引数mは引数nよりも10以上大きい数とする。\n〔プログラム〕\n○整数型: function1(整数型: n, 整数型: m)\n　整数型: count ← 0\n　整数型: i\n　for (i を n から m まで 1 ずつ増やす)\n　　if ((i mod 4)が0と等しい)\n　　　count ← count ＋ 1\n　　endif\n　endfor\n　return count\n○整数型: function2(整数型: n, 整数型: m)\n　整数型: count ← 0\n　整数型: tempN ← n\n　整数型: i, j\n　for (［ a ］)\n　　if ((tempN mod 4)が0と等しい)\n　　　繰返し処理を終了する\n　　endif\n　　tempN ← tempN ＋ 1\n　endfor\n　for (［ b ］)\n　　count ← count ＋ 1\n　endfor\n　return count",
    choices: [
      "a: iを1から2まで1ずつ増やす／b: jをnから始めてmを超えない範囲でtempNずつ増やす",
      "a: iを1から2まで1ずつ増やす／b: jをtempNからmまで1ずつ増やす",
      "a: iを1から2まで1ずつ増やす／b: jをtempNから始めてmを超えない範囲で4ずつ増やす",
      "a: iを1から3まで1ずつ増やす／b: jをnから始めてmを超えない範囲でtempNずつ増やす",
      "a: iを1から3まで1ずつ増やす／b: jをtempNからmまで1ずつ増やす",
      "a: iを1から3まで1ずつ増やす／b: jをtempNから始めてmを超えない範囲で4ずつ増やす",
    ], correctIndex: 5,
  },
  {
    id: "FE-B-IPA-2025-Q02", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "6", questionNumber: "問2",
    body: "次のプログラム中の［　　］に入れる正しい答えを，解答群の中から選べ。\n関数 change は，10より大きい整数を引数nで受け取り，1円玉，5円玉，10円玉を使ってちょうどn円にする組合せの総数を返す。\n例えば，12円にする組合せは，次のように数えられる。10円玉を使わない場合には，1円玉と5円玉だけでちょうど12円にすることになる。その組合せは，使える5円玉の枚数が0以上(12÷5の商)以下なので，(12÷5の商)＋1＝3通りある。同様に，10円玉を1枚使う場合には，1円玉と5円玉だけでちょうど2円にすることになり，その組合せは(2÷5の商)＋1＝1通りある。10円玉を2枚以上使う組合せはない。よって，1円玉，5円玉，10円玉を使ってちょうど12円にする組合せは，3＋1＝4通りである。\n〔プログラム〕\n○整数型: change(整数型: n)\n　整数型: count ← 0\n　整数型: rest ← n\n　while (［　　］)\n　　count ← count ＋ (rest ÷ 5 の商) ＋ 1\n　　rest ← rest － 10\n　endwhile\n　return count",
    choices: ["rest ≧ 0", "rest ≧ 5", "rest ≧ 10", "rest ＞ 0", "rest ＞ 5", "rest ＞ 10"],
    correctIndex: 0,
  },
  {
    id: "FE-B-IPA-2025-Q03", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "8", questionNumber: "問3",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 push は，引数で与えられた整数をスタックに格納する。格納できた場合はtrueを返し，格納できなかった場合はfalseを返す。\n関数 pop は，スタックから値を取り出して返す。スタックが空のときは未定義の値を返す。\nスタックを，要素数が4である大域の整数型の配列 stack，及び次に値を格納する位置を示す大域の変数 stackPos で表現する。スタックの初期状態は，要素番号1,2に4,3が格納済みで，stackPosは3（未格納の先頭位置）を指している。\n〔プログラム〕\n大域: 整数型: stackPos ← 3\n大域: 整数型の配列: stack ← {4, 3, 未定義の値, 未定義の値}\n○論理型: push(整数型: inputData)\n　if (stackPos ≦ stackの要素数)\n　　stack[［ a ］] ← inputData\n　　stackPos ← stackPos ＋ 1\n　　return true\n　else\n　　return false\n　endif\n○整数型: pop()\n　整数型: popData ← 未定義の値\n　if (stackPos ＞ 1)\n　　stackPos ← ［ b ］\n　　popData ← stack[stackPos]\n　　stack[stackPos] ← 未定義の値\n　endif\n　return popData",
    choices: [
      "a: stackPos／b: stackPos ＋ 1",
      "a: stackPos／b: stackPos － 1",
      "a: stackPos － 1／b: stackPos ＋ 1",
      "a: stackPos － 1／b: stackPos － 1",
    ], correctIndex: 1,
  },
  {
    id: "FE-B-IPA-2025-Q04", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "10", questionNumber: "問4",
    body: "次の記述中の［　　］に入れる正しい答えを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n関数 search は，二つの文字型の配列を，それぞれ引数 data 及び key で受け取り，dataから，keyの要素の並びと同じ並びを全て探し，その先頭の要素番号を全て格納した配列を返す。見つからなければ，要素数0の配列を返す。\n関数 search を search({\"a\", \"b\", \"a\", \"b\", \"c\", \"a\", \"b\", \"c\"}, {\"a\", \"b\", \"c\"}) として呼び出すと，/*** β ***/の行の条件式が真となる回数は［　　］回である。\n〔プログラム〕\n/* keyは，要素数1以上の配列である */\n○整数型の配列: search(文字型の配列: data, 文字型の配列: key)\n　整数型: i, j, lenData, lenKey\n　整数型の配列: result ← {} // 要素数0の配列\n　lenData ← dataの要素数\n　lenKey ← keyの要素数\n　/* (lenData － lenKey ＋ 1) が0以下のときは繰返し処理を実行しない */\n　for (i を 1 から (lenData － lenKey ＋ 1) まで 1 ずつ増やす)\n　　for (j を 1 から lenKey まで 1 ずつ増やす) // α\n　　　if (data[i ＋ j － 1] が key[j] と等しい) /*** β ***/\n　　　　if (j が lenKey と等しい)\n　　　　　resultの末尾 に iの値 を追加する\n　　　　endif\n　　　else\n　　　　αの行から始まる繰返し処理を終了する\n　　　endif\n　　endfor\n　endfor\n　return result",
    choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    correctIndex: 7,
  },
  {
    id: "FE-B-IPA-2025-Q05", section: "B", topic: "アルゴリズム（擬似言語）", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "12", questionNumber: "問5",
    body: "次のプログラム中の［ a ］と［ b ］に入れる正しい答えの組合せを，解答群の中から選べ。ここで，配列の要素番号は1から始まる。\n予防接種の病気Xに対する予防効果を調査するために集めたデータの集計結果を基に，病気Xにかかるかどうかが，予防接種の有無に影響されないと仮定した場合の人数を計算する。この人数を理論度数という。\n表1 集計結果の例（単位：人）\n　　　　　　　　　　病気Xにかからなかった　病気Xにかかった\n予防接種を受けた　　　82　　　　　　　　　6\n予防接種を受けていない　58　　　　　　　　8\n\n表2 表1を基に計算した理論度数（単位：人）。表2は2行2列で，(予防接種を受けた，かからなかった)のセルが［ a ］，(予防接種を受けていない，かかった)のセルが［ b ］であり，残り2セルは（網掛けで）表示されていない。\n関数fは，引数dataで受け取った集計結果を基に計算した理論度数を返す。引数と戻り値は二次元配列で，その行が表の行，その列が表の列に対応する。\n〔プログラム〕\n○実数型の二次元配列: f(実数型の二次元配列: data)\n　実数型: t ← dataの要素の和\n　整数型: row ← dataの行数\n　整数型: col ← dataの列数\n　実数型の二次元配列: result ← {row行col列の 未定義の値}\n　整数型: r, c\n　for (r を 1 から row まで 1 ずつ増やす)\n　　for (c を 1 から col まで 1 ずつ増やす)\n　　　result[r, c] ← (dataの行番号rの要素の和) × (dataの列番号cの要素の和) ÷ t\n　　endfor\n　endfor\n　return result",
    choices: ["44，33", "58，8", "70，7", "75，2", "80，6", "80，8", "82，6"],
    correctIndex: 4,
  },
  {
    id: "FE-B-IPA-2025-Q06", section: "B", topic: "情報セキュリティ", difficulty: "HARD",
    sourceUrl: B_URL, sourcePage: "14", questionNumber: "問6",
    body: "A社は従業員200名の電子機器メーカーである。東京に本社があり，新潟に工場がある。\nA社では，ファイルサーバを本社と工場のサーバルームに設置し，磁気テープでバックアップを取得している。土曜日の午前2時からフルバックアップを取得し，翌週の火曜日と木曜日の午前2時から増分バックアップを取得している。フルバックアップからのリストアには平均4時間，1回の増分バックアップからのリストアには平均0.25時間掛かる。ファイルサーバは，72時間の目標復旧時点（RPO）と120時間の目標復旧時間（RTO）が要求事項として定められている。\nA社はISMS認証を取得しており，最高情報セキュリティ責任者（CISO）を中心に情報セキュリティに取り組んでいる。ISMS認証基準がJIS Q 27001:2023に改正されたことを受け，情報セキュリティリーダーのBさんは，移行審査前の内部監査で，内部監査室から次の質問を受け，回答した。\n1. 「例えば，金曜日の正午に障害が発生した場合，少なくとも［ a1 ］の時点のデータは復元しなければならない。」（RPO＝72時間から算出）\n2. 「例えば，木曜日の正午に障害が発生し，ファイルサーバの全データが消失したとすると，バックアップからのリストアには［ a2 ］時間掛かると予想される。」（木曜午前2時の増分バックアップは既に取得済みであることに注意）\n3. 「ICT継続の計画書は，［ a3 ］が承認している。」\n表2中の［ a1 ］～［ a3 ］に入れる字句の適切な組合せを，解答群の中から選べ。",
    choices: [
      "a1: 月曜日の正午／a2: 4.25／a3: CISO",
      "a1: 月曜日の正午／a2: 4.25／a3: 情報システム部の担当者",
      "a1: 月曜日の正午／a2: 4.25／a3: 内部監査室長",
      "a1: 月曜日の正午／a2: 4.50／a3: CISO",
      "a1: 月曜日の正午／a2: 4.50／a3: 情報システム部の担当者",
      "a1: 火曜日の正午／a2: 4.25／a3: 情報システム部の担当者",
      "a1: 火曜日の正午／a2: 4.25／a3: 内部監査室長",
      "a1: 火曜日の正午／a2: 4.50／a3: CISO",
      "a1: 火曜日の正午／a2: 4.50／a3: 情報システム部の担当者",
      "a1: 火曜日の正午／a2: 4.50／a3: 内部監査室長",
    ], correctIndex: 7,
  },
];

async function main() {
  console.log(`Importing ${QUESTIONS.length} IPA R7(2025) public questions...`);
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
