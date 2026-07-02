import { useEffect, useMemo, useState } from "react";
import { Cup } from "@/components/Cup";

type Stage =
  | "landing"
  | "intro"
  | "prepare"
  | "pick"
  | "reveal-win"
  | "reveal-lose"
  | "final"
  | "register"
  | "profile"
  | "vsl";

const TOTAL_ROUNDS = 12;
const WINS_TOTAL = 3;
const REWARDS = [30000];

function buildOutcomes(): boolean[] {
  const arr = Array(TOTAL_ROUNDS).fill(false);
  // 1 vitória no meio (rodada 6 ou 7) e 2 vitórias no fim (rodadas 11 e 12)
  const middleIndex = Math.random() < 0.5 ? 5 : 6;
  arr[middleIndex] = true;
  arr[10] = true;
  arr[11] = true;
  return arr;
}

function formatKz(n: number) {
  return n.toLocaleString("fr-FR").replace(/\u202F/g, " ");
}

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");
  const [round, setRound] = useState(1);
  const [balance, setBalance] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [winningCup, setWinningCup] = useState(0);
  const [pickedCup, setPickedCup] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [outcomes, setOutcomes] = useState<boolean[]>(() => buildOutcomes());

  useEffect(() => {
    if (stage !== "prepare") return;
    setCountdown(3);
    const id = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(id);
          setWinningCup(Math.floor(Math.random() * 3));
          setPickedCup(null);
          setStage("pick");
          return 0;
        }
        return c - 1;
      });
    }, 800);
    return () => clearInterval(id);
  }, [stage]);

  const startGame = () => {
    setBalance(0);
    setRound(1);
    setOutcomes(buildOutcomes());
    setStage("intro");
  };

  const beginRound = () => {
    setWinningCup(Math.floor(Math.random() * 3));
    setPickedCup(null);
    setStage("pick");
  };

  const onPickCup = (i: number) => {
    setPickedCup(i);
    const shouldWin = outcomes[round - 1];
    if (shouldWin) {
      setWinningCup(i);
    } else if (i === winningCup) {
      setWinningCup((i + 1) % 3);
    }
    setTimeout(() => {
      if (shouldWin) {
        const reward = REWARDS[Math.floor(Math.random() * REWARDS.length)];
        setLastWin(reward);
        setBalance((b) => b + reward);
        setStage("reveal-win");
      } else {
        setStage("reveal-lose");
      }
    }, 600);
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setStage("final");
      return;
    }
    setRound((r) => r + 1);
    setStage("prepare");
  };

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col">
      {(stage === "pick" || stage === "prepare" || stage === "reveal-win" || stage === "reveal-lose") && (
        <GameHeader balance={balance} />
      )}

      {stage === "landing" && <Landing onStart={() => setStage("intro")} />}
      {stage === "intro" && <IntroModal onPlay={beginRound} onClose={() => setStage("landing")} />}
      {stage === "prepare" && <Prepare round={round} countdown={countdown} />}
      {stage === "pick" && (
        <Pick round={round} pickedCup={pickedCup} winningCup={winningCup} onPick={onPickCup} />
      )}
      {stage === "reveal-win" && <RevealWin amount={lastWin} onNext={nextRound} />}
      {stage === "reveal-lose" && <RevealLose onNext={nextRound} />}
      {stage === "final" && <FinalPrize amount={balance} onContinue={() => setStage("register")} />}
      {stage === "register" && <RegisterIntro amount={balance} onContinue={() => setStage("profile")} />}
      {stage === "profile" && (
        <ProfileFlow balance={balance} onDone={() => setStage("vsl")} onBack={() => setStage("register")} />
      )}
      {stage === "vsl" && <VslStage amount={balance} onRestart={startGame} />}

      <Footer />
    </main>
  );
}

/* ---------- Components ---------- */

function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const fontSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-xl";
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="flex items-center">
        <span className="inline-block h-5 w-1.5 rounded-sm bg-primary" />
        <span className={`${fontSize} font-extrabold tracking-tight text-foreground`}>BANTU</span>
        <span className={`${fontSize} font-extrabold tracking-tight text-primary`}>bet</span>
        <span className="ml-1 inline-flex items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">5</span>
      </div>
    </div>
  );
}

function GameHeader({ balance }: { balance: number }) {
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-3">
      <Logo size="sm" />
      <div className="flex items-center gap-3">
        <div className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm font-bold backdrop-blur">
          <span className="text-foreground">{formatKz(balance)}</span>
          <span className="ml-1 text-muted-foreground">Kz</span>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-card text-muted-foreground">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <p className="mt-auto px-6 pb-6 pt-10 text-center text-[11px] text-muted-foreground/70">
      © 2026 Todos os direitos reservados — Acerta e Ganha · +18
    </p>
  );
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center px-5 pt-6">
      <div className="w-full rounded-full border border-success/50 bg-success/10 px-4 py-2 text-center">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-success" />
          EVENTO OFICIAL BANTUBET · 5 ANOS
        </span>
      </div>

      <div className="mt-12 flex justify-center">
        <Logo size="md" />
      </div>

      <h1 className="mt-10 text-center text-[34px] font-extrabold leading-[1.1] tracking-tight">
        Celebre connosco e <span className="text-primary">ganhe</span> prémios reais
      </h1>

      <p className="mt-5 max-w-sm text-center text-[15px] leading-relaxed text-muted-foreground">
        Descubra recompensas exclusivas no nosso jogo de copos. Cada rodada é uma chance real de levantar prémios em Kwanzas.
      </p>

      <button onClick={onStart} className="btn-primary btn-primary-hover mt-10 w-full max-w-sm py-4 text-lg">
        Participar no evento
      </button>

      <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-3">
        <StatCard value="5" label="Anos de BantuBet" />
        <StatCard value="+1M" label="Jogadores" />
        <StatCard value="24/7" label="Suporte" />
      </div>
    </section>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/70 px-3 py-4 text-center">
      <div className="text-xl font-extrabold text-primary">{value}</div>
      <div className="mt-1 text-[11px] leading-tight text-muted-foreground">{label}</div>
    </div>
  );
}

function IntroModal({ onPlay, onClose }: { onPlay: () => void; onClose: () => void }) {
  return (
    <section className="flex flex-1 flex-col px-5 pt-6">
      <div className="w-full rounded-full border border-success/30 bg-card/40 px-4 py-2 text-center">
        <span className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[0.18em] text-muted-foreground/80">
          <span className="inline-block h-2 w-2 rounded-full bg-success/60" />
          EVENTO OFICIAL BANTUBET · 5 ANOS
        </span>
      </div>

      <div className="mt-6 rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-[0.25em] text-muted-foreground">5 ANOS · BANTUBET</span>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-muted-foreground hover:text-foreground" aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="mt-5 flex justify-center">
          <div className="rounded-xl bg-black/30 px-3 py-2">
            <Logo size="md" />
          </div>
        </div>

        <h2 className="mt-5 text-center text-3xl font-extrabold tracking-tight">Acerta e Ganha</h2>

        <p className="mt-3 text-center text-[15px] leading-relaxed text-foreground/90">
          <span className="font-bold">{TOTAL_ROUNDS} rodadas grátis</span> para celebrar os{" "}
          <span className="font-bold">5 anos da BantuBet</span>.
        </p>

        <div className="mt-7 flex items-end justify-center gap-4">
          <Cup size={70} />
          <Cup size={100} glow />
          <Cup size={70} />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Acerta no copo certo e leva o prémio. Boa sorte!
        </p>

        <button
          onClick={onPlay}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-white py-4 text-base font-bold text-background shadow-lg transition hover:bg-white/90"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-white">▶</span>
          Resgatar e jogar
        </button>
      </div>
    </section>
  );
}

function ProgressDots({ round }: { round: number }) {
  return (
    <div className="mt-4 flex items-center justify-center gap-1.5">
      {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => {
        const isCurrent = i === round - 1;
        const isDone = i < round - 1;
        return (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              isCurrent ? "w-7 bg-primary" : isDone ? "w-4 bg-white" : "w-4 bg-white/15"
            }`}
          />
        );
      })}
    </div>
  );
}

function Prepare({ round, countdown }: { round: number; countdown: number }) {
  return (
    <section className="flex flex-1 flex-col px-5">
      <div className="text-center">
        <p className="mt-2 text-xs font-semibold tracking-[0.25em] text-muted-foreground">
          RODADA {round} DE {TOTAL_ROUNDS}
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Prepara-te…</h2>
        <ProgressDots round={round} />
      </div>

      <div className="mt-12 flex items-end justify-center gap-6">
        <Cup size={90} />
        <Cup size={90} />
        <Cup size={90} />
      </div>

      <div className="mt-auto mb-8 px-2">
        <div className="rounded-full px-6 py-5 text-center btn-primary">
          <div className="text-xs font-semibold tracking-[0.25em] text-white/90">PRÓXIMA RODADA EM</div>
          <div className="mt-1 text-4xl font-extrabold text-white">{countdown}</div>
        </div>
      </div>
    </section>
  );
}

type PickPhase = "show" | "shuffle" | "choose" | "revealed";

function Pick({
  round,
  pickedCup,
  winningCup,
  onPick,
}: {
  round: number;
  pickedCup: number | null;
  winningCup: number;
  onPick: (i: number) => void;
}) {
  const [slotOf, setSlotOf] = useState<[number, number, number]>([0, 1, 2]);
  const [phase, setPhase] = useState<PickPhase>("show");

  useEffect(() => {
    setSlotOf([0, 1, 2]);
    setPhase("show");
    const showTimer = setTimeout(() => setPhase("shuffle"), 1300);
    return () => clearTimeout(showTimer);
  }, [round]);

  useEffect(() => {
    if (phase !== "shuffle") return;
    let swaps = 0;
    const maxSwaps = 7 + Math.floor(Math.random() * 4);
    const id = setInterval(() => {
      setSlotOf((prev) => {
        const a = Math.floor(Math.random() * 3);
        let b = Math.floor(Math.random() * 3);
        if (b === a) b = (a + 1) % 3;
        const next = [...prev] as [number, number, number];
        for (let i = 0; i < 3; i++) {
          if (prev[i] === a) next[i] = b;
          else if (prev[i] === b) next[i] = a;
        }
        return next;
      });
      swaps++;
      if (swaps >= maxSwaps) {
        clearInterval(id);
        setTimeout(() => setPhase("choose"), 420);
      }
    }, 380);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (pickedCup !== null) setPhase("revealed");
  }, [pickedCup]);

  const locked = pickedCup !== null || phase !== "choose";

  const heading =
    phase === "show"
      ? "Observa o copo!"
      : phase === "shuffle"
      ? "A misturar…"
      : phase === "choose"
      ? "Escolhe um copo!"
      : "Revelando…";

  return (
    <section className="flex flex-1 flex-col px-5">
      <div className="text-center">
        <p className="mt-2 text-xs font-semibold tracking-[0.25em] text-muted-foreground">
          RODADA {round} DE {TOTAL_ROUNDS}
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight">{heading}</h2>
        <ProgressDots round={round} />
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {phase === "show" && "A bola está debaixo deste copo. Segue-a!"}
        {phase === "shuffle" && "Mantém o olho no copo certo…"}
        {phase === "choose" && "Toca no copo onde achas que está a bola."}
        {phase === "revealed" && " "}
      </p>

      <div className="relative mx-auto mt-10 h-[180px] w-full max-w-[360px]">
        {[0, 1, 2].map((cupId) => {
          const slot = slotOf[cupId];
          const isWinning = cupId === winningCup;
          const lifted = phase === "show" && isWinning;
          const revealHere = phase === "revealed" && isWinning;
          const isPicked = pickedCup === cupId;
          return (
            <button
              key={cupId}
              onClick={() => phase === "choose" && onPick(cupId)}
              disabled={locked}
              style={{
                transform: `translateX(${slot * 120}px) translateY(${lifted ? -28 : 0}px)`,
                transition: "transform 360ms cubic-bezier(.4,.0,.2,1)",
              }}
              className={`absolute left-0 top-2 flex h-[150px] w-[110px] flex-col items-center justify-end rounded-2xl border-2 p-2 ${
                isPicked
                  ? "border-primary bg-primary/10"
                  : phase === "choose"
                  ? "border-primary/60 bg-card/40 hover:border-primary cursor-pointer"
                  : "border-border bg-card/30 cursor-default"
              }`}
            >
              {(lifted || revealHere) && (
                <span
                  className="absolute bottom-3 grid h-9 w-9 place-items-center rounded-full bg-yellow-400 text-base shadow-lg"
                  style={{ boxShadow: "0 0 24px oklch(0.85 0.18 90 / 0.7)" }}
                >
                  💰
                </span>
              )}
              <Cup size={90} glow={lifted || revealHere} />
            </button>
          );
        })}
      </div>

      <div className="mt-auto mb-10" />
    </section>
  );
}

function RevealWin({ amount, onNext }: { amount: number; onNext: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-5">
      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto -mt-16 grid h-16 w-16 place-items-center rounded-full bg-primary/20 text-3xl">
          🎉
        </div>
        <h3 className="mt-4 text-3xl font-extrabold text-primary">Ganhaste!</h3>
        <p className="mt-1 text-xs font-semibold tracking-[0.3em] text-muted-foreground">RECOMPENSA</p>

        <div className="mt-5 flex items-center justify-center gap-2 text-4xl font-extrabold">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-yellow-400 text-base">💰</span>
          <span className="text-foreground">+{formatKz(amount)}</span>
          <span className="text-lg text-muted-foreground">Kz</span>
        </div>

        <button onClick={onNext} className="btn-primary btn-primary-hover mt-7 w-full py-4 text-base">
          ↻ Próxima rodada
        </button>
      </div>
    </section>
  );
}

function RevealLose({ onNext }: { onNext: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-5">
      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-muted text-2xl">😔</div>
        <h3 className="mt-4 text-2xl font-extrabold">Não acertaste!</h3>
        <p className="mt-1 text-sm text-muted-foreground">Tenta na próxima rodada!</p>
        <button onClick={onNext} className="btn-primary btn-primary-hover mt-6 w-full py-4 text-base">
          ↻ Próxima rodada
        </button>
      </div>
    </section>
  );
}

function FinalPrize({ amount, onContinue }: { amount: number; onContinue: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center px-5">
      <div className="w-full rounded-3xl border border-border bg-card p-8 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary/20 text-3xl">🎊</div>
        <h3 className="mt-4 text-2xl font-extrabold text-primary">Parabéns!</h3>
        <p className="mt-2 text-sm text-muted-foreground">Concluíste as {TOTAL_ROUNDS} rodadas.</p>
        <div className="mt-5 text-4xl font-extrabold">
          {formatKz(amount)} <span className="text-lg text-muted-foreground">Kz</span>
        </div>
        <button onClick={onContinue} className="btn-primary btn-primary-hover mt-6 w-full py-4">
          Levantar prémio
        </button>
      </div>
    </section>
  );
}

function RegisterIntro({ amount, onContinue }: { amount: number; onContinue: () => void }) {
  return (
    <section className="flex flex-1 flex-col px-5 pt-6">
      <div className="overflow-hidden rounded-3xl btn-primary p-7 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-white text-primary">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><circle cx="10" cy="8" r="4"/><path d="M2 21a8 8 0 0 1 16 0"/><path d="M19 8v6M16 11h6"/></svg>
        </div>
        <p className="mt-4 text-xs font-bold tracking-[0.3em] text-white/90">ULTIMO PASSO</p>
        <h2 className="mt-2 text-2xl font-extrabold text-[#3a1a02]">Cria a tua conta para receber</h2>
        <div className="mt-2 text-5xl font-extrabold text-[#3a1a02]">{formatKz(amount)} Kz</div>
      </div>

      <p className="mt-5 text-center text-sm leading-relaxed text-muted-foreground">
        É rápido e <span className="font-bold text-foreground">só leva 30 segundos</span>. Precisamos apenas dos teus dados para enviar os ganhos para a tua conta.
      </p>

      <div className="mt-5 space-y-3">
        <Benefit icon="⚡" label="Cadastro simples em poucos passos" />
        <Benefit icon="🛡️" label="Dados seguros e protegidos" />
        <Benefit icon="⏱️" label="Levantamento direto na tua conta" />
      </div>

      <button onClick={onContinue} className="btn-primary btn-primary-hover mt-6 w-full py-4 text-base">
        ➕ Cadastrar e levantar
      </button>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Ao continuar, aceitas os termos da BantuBet.
      </p>
    </section>
  );
}

function Benefit({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-full border border-border bg-card/70 px-4 py-3">
      <span className="grid h-9 w-9 place-items-center rounded-full btn-primary text-base">{icon}</span>
      <span className="text-[15px] font-semibold">{label}</span>
    </div>
  );
}

const PROVINCIAS = [
  "Luanda", "Benguela", "Huíla", "Huambo", "Bié", "Cabinda", "Cuando-Cubango",
  "Cuanza-Norte", "Cuanza-Sul", "Cunene", "Lunda-Norte", "Lunda-Sul",
  "Malanje", "Moxico", "Namibe", "Uíge", "Zaire", "Bengo",
];

type Metodo = "" | "express" | "iban";

function ProfileFlow({ balance, onDone, onBack }: { balance: number; onDone: () => void; onBack: () => void }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    nome: "",
    telemovel: "",
    provincia: "",
    email: "",
    idade: "",
    metodo: "" as Metodo,
    conta: "",
    confirmar: false,
  });

  const baseSteps = useMemo(() => [
    { key: "nome", title: "Nome completo", label: "NOME COMPLETO", placeholder: "Ex: Daniel da Silva", icon: "👤", kind: "text" as const },
    { key: "telemovel", title: "Número de telemóvel", label: "TELEMOVEL", placeholder: "Ex: 923 456 789", icon: "📱", kind: "tel" as const },
    { key: "provincia", title: "Província", label: "SELECIONA A TUA PROVINCIA", placeholder: "Seleciona uma província", icon: "📍", kind: "select" as const },
    { key: "email", title: "Email", label: "ENDEREÇO DE EMAIL", placeholder: "exemplo@email.com", icon: "✉️", kind: "email" as const },
    { key: "idade", title: "Idade", label: "A TUA IDADE", placeholder: "Ex: 25", icon: "🎂", kind: "number" as const },
    { key: "metodo", title: "Metodo de levantamento", label: "ESCOLHE COMO QUERES RECEBER OS TEUS GANHOS", placeholder: "", icon: "💳", kind: "metodo" as const },
    {
      key: "conta",
      title: data.metodo === "iban" ? "Numero IBAN" : "Numero Express",
      label: data.metodo === "iban" ? "IBAN" : "NUMERO EXPRESS",
      placeholder: data.metodo === "iban" ? "Ex: AO06000600000000000000000" : "Ex: 923456789",
      icon: data.metodo === "iban" ? "💳" : "📱",
      kind: "conta" as const,
    },
    { key: "confirmar", title: "Confirmação", label: "CONFIRMA OS TEUS DADOS", placeholder: "", icon: "✅", kind: "confirm" as const },
  ], [data.metodo]);

  const steps = baseSteps;
  const current = steps[step];
  const total = steps.length;
  const rawValue = data[current.key as keyof typeof data];
  const value = typeof rawValue === "string" ? rawValue : "";

  const contaValid = data.metodo === "iban"
    ? data.conta.replace(/\s/g, "").length === 21
    : /^9\d{8}$/.test(data.conta.replace(/\s/g, ""));

  const canContinue =
    current.kind === "confirm"
      ? data.confirmar
      : current.kind === "metodo"
      ? data.metodo !== ""
      : current.kind === "conta"
      ? contaValid
      : !!value && value.toString().trim().length > 0;

  const handleNext = () => {
    if (step >= total - 1) {
      onDone();
      return;
    }
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) onBack();
    else setStep((s) => s - 1);
  };

  const isLast = step >= total - 1;
  const finalLabel = current.kind === "conta" ? "Levantar os meus ganhos" : isLast ? "Finalizar" : "Continuar";

  return (
    <section className="flex flex-1 flex-col px-5 pt-6">
      <div className="flex items-center justify-between">
        <button onClick={handleBack} className="grid h-9 w-9 place-items-center rounded-full bg-card text-foreground">
          ‹
        </button>
        <div className="rounded-full border border-success/40 bg-card/60 px-3 py-1.5 text-sm font-bold">
          <span className="inline-block h-2 w-2 rounded-full bg-success align-middle" />{" "}
          <span className="align-middle">{formatKz(balance)} Kz</span>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-card text-foreground">⌂</div>
      </div>

      <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight">Completar Perfil</h2>

      <div className="mt-4 flex items-center justify-center gap-1.5">
        {steps.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === step ? "w-7 bg-primary" : i < step ? "w-4 bg-primary/70" : "w-4 bg-white/15"
            }`}
          />
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card/70 p-5">
        <p className="text-xs font-bold tracking-[0.25em] text-muted-foreground">PASSO {step + 1}/{total}</p>
        <h3 className="mt-1 text-xl font-bold">{current.title}</h3>

        <p className="mt-2 text-sm text-muted-foreground">
          {current.kind === "metodo" && "Escolhe como queres receber os teus ganhos."}
          {current.kind === "conta" && (data.metodo === "iban"
            ? "Introduz o teu IBAN (21 digitos)."
            : "Introduz o teu numero Express (9 digitos, começa pelo 9).")}
        </p>

        {current.kind !== "metodo" && (
          <label className="mt-5 block text-[11px] font-bold tracking-[0.2em] text-muted-foreground">
            {current.label}
          </label>
        )}

        <div className="mt-2">
          {current.kind === "select" ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-input/40 px-3">
              <span className="text-muted-foreground">{current.icon}</span>
              <select
                value={data.provincia}
                onChange={(e) => setData({ ...data, provincia: e.target.value })}
                className="w-full bg-transparent py-3 text-foreground outline-none"
              >
                <option value="" disabled className="bg-card">{current.placeholder}</option>
                {PROVINCIAS.map((p) => <option key={p} value={p} className="bg-card">{p}</option>)}
              </select>
            </div>
          ) : current.kind === "metodo" ? (
            <div className="mt-3 space-y-3">
              {([
                { id: "express", icon: "📱", title: "Express", desc: "Pagamento movel (9 digitos)" },
                { id: "iban", icon: "💳", title: "IBAN", desc: "Transferencia bancaria (21 digitos)" },
              ] as const).map((opt) => {
                const active = data.metodo === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setData({ ...data, metodo: opt.id, conta: "" })}
                    className={`flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-left transition ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-input/30 hover:border-primary/60"
                    }`}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-card/80 text-xl">
                      {opt.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block text-lg font-bold text-foreground">{opt.title}</span>
                      <span className="block text-sm text-muted-foreground">{opt.desc}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          ) : current.kind === "conta" ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-input/40 px-3">
              <span className="text-muted-foreground">{current.icon}</span>
              <input
                type="text"
                inputMode={data.metodo === "iban" ? "text" : "numeric"}
                maxLength={data.metodo === "iban" ? 30 : 12}
                value={data.conta}
                onChange={(e) => setData({ ...data, conta: e.target.value })}
                placeholder={current.placeholder}
                className="w-full bg-transparent py-3 text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          ) : current.kind === "confirm" ? (
            <div className="space-y-2 rounded-xl border border-border bg-input/30 p-4 text-sm">
              <Row k="Nome" v={data.nome} />
              <Row k="Telemóvel" v={data.telemovel} />
              <Row k="Província" v={data.provincia} />
              <Row k="Email" v={data.email} />
              <Row k="Idade" v={data.idade} />
              <Row k="Metodo" v={data.metodo === "iban" ? "IBAN" : data.metodo === "express" ? "Express" : ""} />
              <Row k={data.metodo === "iban" ? "IBAN" : "Numero"} v={data.conta} />
              <label className="mt-3 flex items-center gap-2 pt-2 text-foreground">
                <input
                  type="checkbox"
                  checked={data.confirmar}
                  onChange={(e) => setData({ ...data, confirmar: e.target.checked })}
                  className="h-4 w-4 accent-[oklch(0.72_0.18_55)]"
                />
                Confirmo que os dados estão corretos.
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-input/40 px-3">
              <span className="text-muted-foreground">{current.icon}</span>
              <input
                type={current.kind}
                inputMode={current.kind === "tel" ? "tel" : current.kind === "number" ? "numeric" : undefined}
                maxLength={120}
                value={value}
                onChange={(e) => setData({ ...data, [current.key]: e.target.value })}
                placeholder={current.placeholder}
                className="w-full bg-transparent py-3 text-foreground outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          )}
        </div>
      </div>

      <button
        disabled={!canContinue}
        onClick={handleNext}
        className={`mt-auto mb-6 w-full rounded-full py-4 text-base font-bold transition ${
          canContinue ? "btn-primary btn-primary-hover" : "bg-card text-muted-foreground/60"
        }`}
      >
        {finalLabel}
      </button>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="truncate text-right font-semibold">{v || "—"}</span>
    </div>
  );
}

function VslStage({ amount }: { amount: number; onRestart: () => void }) {
  useEffect(() => {
    const id = "converteai-smartplayer-sdk";
    if (!document.getElementById(id)) {
      const s = document.createElement("script");
      s.id = id;
      s.src = "https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
      s.async = true;
      document.head.appendChild(s);
    }
  }, []);

  const iframeSrc =
    "https://scripts.converteai.net/220eed4f-7bc0-4763-844a-46ae45601574/players/6a4411099f833d59d0f25a77/v4/embed.html" +
    (typeof window !== "undefined" ? (window.location.search || "?") : "?") +
    "&vl=" +
    encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");

  return (
    <section className="flex flex-1 flex-col px-4 pt-4 pb-8">
      <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full bg-black/40 border border-white/10 px-4 py-1.5 text-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold">{formatKz(amount)} Kz</span>
        <span className="text-muted-foreground">aguardando</span>
      </div>
      <h2 className="text-center text-base font-extrabold leading-snug px-2">
        Veja agora como registar a sua conta BantuBet e liberar os seus ganhos em menos de{" "}
        <span className="text-primary">2 minutos</span>
      </h2>

      <div
        id="ifr_6a4411099f833d59d0f25a77_wrapper"
        style={{ margin: "16px auto 0", width: "100%", maxWidth: 400 }}
      >
        <div
          id="ifr_6a4411099f833d59d0f25a77_aspect"
          style={{ position: "relative", padding: "178.21782178217822% 0 0 0" }}
        >
          <iframe
            frameBorder={0}
            allowFullScreen
            src={iframeSrc}
            id="ifr_6a4411099f833d59d0f25a77"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            referrerPolicy="origin"
          />
        </div>
      </div>
    </section>
  );
}
