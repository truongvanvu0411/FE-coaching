import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

/**
 * The component gallery from the rebuild spec (phase 2.11).
 *
 * Its point is to make the design system reviewable in one place instead of
 * rediscovering the same defect on fourteen screens — and to make the states
 * that mockups never show (disabled, loading, empty, overflow) as visible as the
 * happy path.
 *
 * Development only. Shipping a page that enumerates the UI is free
 * reconnaissance for anyone probing the app, and it is not a product surface.
 */
export default function DevUiPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10">
      <header className="space-y-2">
        <p className="text-caption font-bold uppercase text-primary">Design system</p>
        <h1 className="font-heading text-display font-bold tracking-[-0.03em]">Component gallery</h1>
        <p className="text-body text-muted-foreground">
          Toggle the theme and the locale in the shell to review both. Every value
          below comes from a token — nothing here is hardcoded.
        </p>
      </header>

      <Section title="Surfaces">
        <div className="grid gap-4 sm:grid-cols-3">
          <Swatch label="page" className="bg-background" />
          <Swatch label="surface-sheet" className="bg-surface-sheet" />
          <Swatch label="card" className="bg-card shadow-card" />
          <Swatch label="surface-read" className="bg-surface-read" />
          <Swatch label="surface-rail" className="bg-surface-rail text-surface-rail-foreground" />
          <Swatch label="muted" className="bg-muted" />
        </div>
      </Section>

      <Section title="Meaning colours">
        <div className="flex flex-wrap gap-3">
          <Dot label="section-a" className="bg-section-a" />
          <Dot label="section-b" className="bg-section-b" />
          <Dot label="state-correct" className="bg-state-correct" />
          <Dot label="state-incorrect" className="bg-state-incorrect" />
          <Dot label="state-bookmark" className="bg-state-bookmark" />
          <Dot label="state-obsolete" className="bg-state-obsolete" />
        </div>
      </Section>

      <Section title="Type scale">
        <div className="space-y-3">
          <p className="text-display font-bold tracking-[-0.03em]">text-display — Chế độ luyện tập</p>
          <p className="text-title font-bold">text-title — Chọn nội dung muốn luyện</p>
          <p className="text-body">text-body — Latin and Vietnamese prose: đầy đủ dấu thanh, ế ữ ợ ỗ.</p>
          <p className="text-body-ja">text-body-ja — 基本情報技術者試験の問題文はこの大きさで表示されます。</p>
          <p className="text-label font-semibold">text-label — Form label</p>
          <p className="text-caption font-bold uppercase text-muted-foreground">text-caption — eyebrow</p>
        </div>
        <p className="mt-4 text-body text-muted-foreground">
          The two scripts sit together here on purpose. A Vietnamese interface
          routinely wraps a Japanese question, and the pair has to look deliberate.
        </p>
      </Section>

      <Section title="Button — every state">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">Small</Button>
          <Button size="lg" className="shadow-fab">Large + fab shadow</Button>
        </div>
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge className="bg-section-a/12 text-section-a">Section A</Badge>
          <Badge className="bg-section-b/12 text-section-b">Section B</Badge>
        </div>
      </Section>

      <Section title="Form">
        <div className="grid max-w-md gap-4">
          <div className="grid gap-2">
            <Label htmlFor="g-email">Email</Label>
            <Input id="g-email" placeholder="admin@fecoach.local" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-disabled">Disabled</Label>
            <Input id="g-disabled" disabled value="Không sửa được" readOnly />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="g-area">Textarea</Label>
            <Textarea id="g-area" placeholder="この問題について質問する" />
          </div>
          <div className="flex items-center gap-3">
            <Switch id="g-switch" />
            <Label htmlFor="g-switch">Switch</Label>
          </div>
        </div>
      </Section>

      <Section title="Progress">
        <div className="max-w-md space-y-3">
          <Progress value={0} aria-label="0%" />
          <Progress value={45} aria-label="45%" />
          <Progress value={100} aria-label="100%" />
        </div>
      </Section>

      <Section title="Loading and empty">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border-0 bg-card shadow-card">
            <CardHeader><CardTitle className="text-title">Loading</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </CardContent>
          </Card>
          <Card className="border-0 bg-card shadow-card">
            <CardHeader><CardTitle className="text-title">Empty</CardTitle></CardHeader>
            <CardContent className="text-body text-muted-foreground">
              Chưa có câu hỏi nào được lưu.
            </CardContent>
          </Card>
        </div>
      </Section>

      <Section title="Overflow — the real extremes from the database">
        <p className="mb-3 text-body text-muted-foreground">
          The longest question body is 1,394 characters and the longest single
          choice is 675. Both have to stay readable and answerable, including at
          375px, so they belong in the gallery rather than in a surprise.
        </p>
        <Card className="border-0 bg-card shadow-card">
          <CardContent className="space-y-4 p-5">
            <p className="text-body-ja whitespace-pre-wrap">{LONG_JA}</p>
            <Separator />
            <button
              type="button"
              className="flex min-h-14 w-full items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-all hover:border-primary/40 hover:bg-muted"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold">ア</span>
              <span className="text-body-ja">{LONG_JA.slice(0, 380)}</span>
            </button>
          </CardContent>
        </Card>
      </Section>

      <Section title="Answer states">
        <div className="max-w-xl space-y-2">
          <AnswerRow label="Default" className="border" />
          <AnswerRow label="Chosen, not yet submitted" className="border-primary ring-1 ring-primary/30" />
          <AnswerRow label="Correct" className="border-success bg-success/10" />
          <AnswerRow label="Wrong" className="border-destructive bg-destructive/10" />
        </div>
      </Section>
    </div>
  );
}

const LONG_JA =
  "コンピュータシステムの性能評価において、応答時間とスループットはしばしばトレードオフの関係にあるとされる。" +
  "ある基幹システムでは、同時実行するトランザクション数を増加させるとスループットは向上するが、" +
  "個々のトランザクションの応答時間は悪化する傾向が観測された。この現象を説明するモデルとして最も適切なものはどれか。" +
  "なお、システムは単一のCPUと十分な容量の主記憶を備えており、入出力待ちが発生する割合は一定であるものとする。" +
  "また、トランザクションの到着はポアソン過程に従い、サービス時間は指数分布に従うと仮定してよい。";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-heading text-title font-bold">{title}</h2>
      {children}
    </section>
  );
}

function Swatch({ label, className }: { label: string; className: string }) {
  return (
    <div className={`flex h-24 items-end rounded-2xl border border-border p-3 ${className}`}>
      <span className="text-label font-semibold">{label}</span>
    </div>
  );
}

function Dot({ label, className }: { label: string; className: string }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5">
      <span className={`size-3 rounded-full ${className}`} />
      <span className="text-label">{label}</span>
    </span>
  );
}

function AnswerRow({ label, className }: { label: string; className: string }) {
  return (
    <div className={`flex min-h-14 items-center gap-3 rounded-xl px-4 py-3.5 ${className}`}>
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted font-semibold">ア</span>
      <span className="text-body">{label}</span>
    </div>
  );
}
