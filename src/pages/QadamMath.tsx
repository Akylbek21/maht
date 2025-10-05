import * as React from "react";
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Stack, Grid,
  TextField, InputAdornment, CssBaseline, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, CircularProgress,
  ListSubheader, Autocomplete
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { motion, useReducedMotion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { createRegistration, type RegistrationRequest } from "@/api/registrations";

// PNG
import IconCap   from "../../img/cap.png";
import IconBooks from "../../img/books.png";
import IconGift  from "../../img/gift.png";
import IconPhone from "../../img/phone.png";
import LogoOzat  from "../../img/LOGO.webp";

import "@fontsource-variable/dm-sans";
import "@fontsource/barlow/700.css";

/* ================= THEME ================= */
const CORAL = "#FA5C44";
const DARK  = "#1F1F22";

const theme = createTheme({
  palette: {
    mode: "light",
    primary:   { main: CORAL },
    secondary: { main: "#0F0F10" },
    text:      { primary: "#121316", secondary: "#61646B" },
    background:{ default: "#ffffff", paper: "#ffffff" },
  },
  shape: { borderRadius: 16 },
  typography: {
    fontFamily: "DM Sans Variable, -apple-system, Segoe UI, Roboto, Inter, system-ui, sans-serif",
    h1: { fontWeight: 900, letterSpacing: -0.5 },
    h2: { fontWeight: 900, letterSpacing: -0.3 },
    h3: { fontWeight: 800 },
    button: { textTransform: "none", fontWeight: 800, letterSpacing: 0.1 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            `radial-gradient(1000px 380px at 8% -10%, rgba(250,92,68,.06), transparent 40%),
             radial-gradient(1000px 420px at 110% 110%, rgba(47,47,47,.06), transparent 40%),
             #fff`,
        },
        "::selection": { backgroundColor: CORAL, color: "#fff" },
        "@keyframes float": {
          "0%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
          "100%": { transform: "translateY(0px)" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 24,
          height: 48,
          position: "relative",
          boxShadow: "0 10px 28px rgba(0,0,0,.10)",
          transition: "transform .18s ease, box-shadow .22s ease, background-color .22s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 16px 44px rgba(0,0,0,.16)",
          },
          "&:active": { transform: "translateY(0px) scale(.99)" }
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,.16), 0 2px 0 1px rgba(0,0,0,.03) inset",
          overflow: "hidden",
        },
        list: { paddingTop: 0, paddingBottom: 0 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transition: "box-shadow .2s ease, transform .12s ease",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: CORAL },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: CORAL },
          "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(250,92,68,.15)" },
        },
      },
    },
  },
});

/* ====== CITY OPTIONS FOR AUTOCOMPLETE ====== */
const CITY_GROUPS = [
  { label: "Қалалар (республикалық маңызы)", items: ["Алматы қ.", "Астана қ.", "Шымкент қ."] },
  {
    label: "Облыстар",
    items: [
      "Абай облысы", "Ақмола облысы", "Ақтөбе облысы", "Алматы облысы",
      "Атырау облысы", "Шығыс Қазақстан облысы", "Жамбыл облысы", "Жетісу облысы",
      "Батыс Қазақстан облысы", "Қарағанды облысы", "Қостанай облысы", "Қызылорда облысы",
      "Маңғыстау облысы", "Павлодар облысы", "Солтүстік Қазақстан облысы",
      "Түркістан облысы", "Ұлытау облысы",
    ],
  },
  { label: "Өзге", items: ["Өзге"] },
];

type CityOption = { label: string; group: string };
const CITY_OPTIONS: CityOption[] = CITY_GROUPS.flatMap(g => g.items.map(i => ({ label: i, group: g.label })));

/* ================= HELPERS & ANIMATIONS ================= */
const fadeUp = (dm: boolean, delay = 0) => ({
  initial: { opacity: 0, y: dm ? 0 : 26 },
  whileInView: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", delay } },
  viewport: { once: true, amount: 0.25 }
});
const appear = (dm: boolean) => ({
  initial: { opacity: 0, scale: dm ? 1 : 0.98 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.6 } },
});
const bgSlide = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const shimmer = keyframes`
  0% { background-position: 0% 50% }
  100% { background-position: 200% 50% }
`;

/* ---------- Утилиты ---------- */
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function formatPhoneStable(prev: string, next: string, selectionStart: number | null): { value: string; caret?: number } {
  const digits = next.replace(/\D/g, "");
  const raw = digits.startsWith("7") ? digits : digits ? "7" + digits : "";
  let out = "+7";
  if (raw.length > 1) out += " (" + raw.slice(1, 4);
  if (raw.length >= 4) out += ") ";
  if (raw.length > 4) out += raw.slice(4, 7);
  if (raw.length > 7) out += "-" + raw.slice(7, 9);
  if (raw.length > 9) out += "-" + raw.slice(9, 11);

  if (selectionStart != null) {
    const rightCount = prev.length - selectionStart;
    const caret = Math.max(0, out.length - rightCount);
    return { value: out, caret };
  }
  return { value: out };
}

function toE164KZ(masked: string): string {
  const d = masked.replace(/\D/g, "");
  if (d.length >= 11) return `+${d.slice(0, 11)}`;
  return `+${d}`;
}

async function fireConfetti(opts?: any) {
  // @ts-ignore
  if (typeof window !== "undefined" && (window as any).confetti) {
    // @ts-ignore
    (window as any).confetti(opts ?? { particleCount: 90, spread: 65, origin: { y: 0.2 } });
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const id = "confetti-cdn-script";
    if (document.getElementById(id)) return resolve();
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Confetti CDN failed"));
    document.head.appendChild(s);
  });
  // @ts-ignore
  if ((window as any).confetti) {
    // @ts-ignore
    (window as any).confetti(opts ?? { particleCount: 90, spread: 65, origin: { y: 0.2 } });
  }
}

// === GlowCard ===
type GlowCardProps = React.ComponentProps<typeof Box> & {
  bg?: string;
  /** цвет мягкого свечения по периметру, либо false чтобы вовсе отключить */
  glow?: string | false;
  pAll?: number;
  /** клиповать содержимое по скруглению; чтобы иконки выходили — ставим false */
  clipContent?: boolean;
  contentSx?: any;
};

function GlowCard({
  children,
  bg = "#fff",
  glow = false,
  pAll = 3,
  clipContent = true,
  contentSx,
  sx,
  ...rest
}: GlowCardProps) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 7,
        bgcolor: bg,
        boxShadow: "0 28px 90px rgba(0,0,0,.08)",
        overflow: "visible", // даём элементам выходить наружу
        // статичное мягкое свечение (без вращения). Если glow=false — не рисуем вовсе
        ...(glow
          ? {
              "&::before": {
                content: '""',
                position: "absolute",
                inset: -2,
                borderRadius: 9,
                background: `radial-gradient(120% 120% at 0% 0%, ${glow}33, transparent 60%),
                             radial-gradient(120% 120% at 100% 0%, ${glow}33, transparent 60%),
                             radial-gradient(120% 120% at 100% 100%, ${glow}33, transparent 60%),
                             radial-gradient(120% 120% at 0% 100%, ${glow}33, transparent 60%)`,
                filter: "blur(10px)",
                zIndex: 0,
                pointerEvents: "none",
              },
            }
          : {}),
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          boxShadow: "0 40px 120px rgba(0,0,0,.12)",
          zIndex: 0,
          pointerEvents: "none",
        },
        ...sx,
      }}
      {...rest}
    >
      {/* внутренняя чаша */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          borderRadius: "inherit",
          ...(clipContent
            ? { overflow: "hidden", clipPath: "inset(0 round 28px)" }
            : {}),
        }}
      >
        <Box sx={{ p: pAll, ...contentSx }}>{children}</Box>
      </Box>
    </Box>
  );
}




/* =============== COMPONENT =============== */
type LeadState = {
  parent: string;
  child: string;
  phone: string;
  grade: string;
  city: string;
  target: "-" | "Иә" | "Жоқ" | "Әлі білмеймін";
};

export default function App() {
  const reduce = useReducedMotion();

  const [lead, setLead] = React.useState<LeadState>({
    parent: "",
    child: "",
    phone: "",
    grade: "3",
    city: "Алматы қ.",
    target: "-",
  });

  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; type: "success" | "error" }>({
    open: false,
    msg: "",
    type: "success",
  });

  // refs для фокуса при ошибке
  const parentRef = React.useRef<HTMLInputElement>(null);
  const childRef = React.useRef<HTMLInputElement>(null);
  const phoneRef = React.useRef<HTMLInputElement>(null);

  const validate = React.useCallback((): string | null => {
    if (!lead.parent.trim()) {
      parentRef.current?.focus();
      return "Ата-ананың аты-жөні қажет";
    }
    if (!lead.child.trim()) {
      childRef.current?.focus();
      return "Баланың аты-жөні қажет";
    }
    const digits = lead.phone.replace(/\D/g, "");
    if (digits.length < 11) {
      phoneRef.current?.focus();
      return "Телефон нөмірі дұрыс емес";
    }
    return null;
  }, [lead.parent, lead.child, lead.phone]);

  const handlePhoneChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target as HTMLInputElement;
      const { value, selectionStart } = input;
      const { value: masked, caret } = formatPhoneStable(lead.phone, value, selectionStart);
      setLead((s) => ({ ...s, phone: masked }));
      requestAnimationFrame(() => {
        if (caret != null) input.setSelectionRange(caret, caret);
      });
    },
    [lead.phone]
  );

  const onSubmit = React.useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const err = validate();
      if (err) {
        setToast({ open: true, msg: err, type: "error" });
        return;
      }
      const payload: RegistrationRequest = {
        parentFullName: lead.parent.trim(),
        studentFullName: lead.child.trim(),
        studentPhone: toE164KZ(lead.phone),
        studentGrade: lead.grade,
        city: lead.city,
        wantsSelectiveSchool: lead.target === "Иә",
      };
      try {
        setLoading(true);
        const res = await createRegistration(payload);
        setToast({ open: true, msg: `Өтінім қабылданды! ID: ${res.id}`, type: "success" });
        fireConfetti().catch(() => {});
        setLead((s) => ({ ...s, parent: "", child: "", phone: "" }));
        scrollToId("register");
      } catch (err: any) {
        setToast({ open: true, msg: err?.message ?? "Жіберу мүмкін болмады", type: "error" });
      } finally {
        setLoading(false);
      }
    },
    [lead, validate]
  );
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
   {/* TOP-CENTER OZAT BADGE (над всем контентом) */}
<Box
  sx={{
    position: "fixed",
    top: { xs: 10, md: 14 },
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: (t) => t.zIndex.appBar + 2,
    display: "flex",
    alignItems: "center",
    gap: { xs: 1.2, md: 1.4 },
    px: { xs: 2.2, md: 2.8 },     // больше паддинги
    py: { xs: 0.8, md: 1.0 },     // выше “высота капсулы”
    borderRadius: 999,
    background: "linear-gradient(90deg,#ff4f73,#ffb24d)",
    boxShadow: "0 14px 28px rgba(0,0,0,.22)",
    border: "2.5px solid rgba(255,255,255,.9)",
    pointerEvents: "none",
    userSelect: "none",
  }}
>
  <Box
    component="img"
    src={LogoOzat}
    alt="ozat"
    loading="lazy"
    decoding="async"
    sx={{
      height: { xs: 32, md: 40 }, // было ~22–26 → сделать крупнее
      width: "auto",
      display: "block",
    }}
  />
</Box>


      {/* NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: "saturate(1.8) blur(10px)",
          backgroundColor: "rgba(255,255,255,.65)",
          borderBottom: "1px solid #eee",
          "&:after": {
            content: '""',
            position: "absolute",
            left: 0, right: 0, bottom: 0, height: 2,
            background: `linear-gradient(90deg, ${CORAL}, transparent)`,
            opacity: .6,
          },
        }}
      >
        
        <Toolbar sx={{ gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 900, letterSpacing: -0.2, flexGrow: 1 }}>
            Qadam Math
          </Typography>
          <motion.div whileHover={!reduce ? { scale: 1.02 } : undefined} whileTap={!reduce ? { scale: 0.98 } : undefined}>
            <Button onClick={() => scrollToId("register")} variant="contained" color="secondary" aria-label="Тіркелу секциясына өту">
              ТІРКЕЛУ
            </Button>
          </motion.div>
        </Toolbar>
      </AppBar>

      {/* HERO */}
      <Box sx={{ py: { xs: 5, md: 8 } }}>
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={9}>
              <motion.div {...appear(reduce)} initial="initial" animate="animate">
                <GlowCard  bg={CORAL}
  glow={false}
  clipContent={false}
  pAll={0}
  sx={{ color: "#fff", px: { xs: 3, md: 8 }, py: { xs: 5, md: 7 } }}
>
                  {/* логотип */}
                

                  {/* декоративные PNG */}
                  <Box component="img" src={IconCap} alt="" loading="lazy" decoding="async"
                       sx={{ position: "absolute", right: -6, top: -8, width: { xs: 100, md: 100 }, height: "auto",
                             filter: "drop-shadow(0 8px 16px rgba(0,0,0,.35))", pointerEvents: "none",
                             animation: !reduce ? "float 7s ease-in-out infinite" : "none" }}/>
                  <Box component="img" src={IconBooks} alt="" loading="lazy" decoding="async"
                       sx={{ position: "absolute", left: -6, bottom: -6, width: { xs: 100, md: 100 }, height: "auto",
                             filter: "drop-shadow(0 8px 16px rgba(0,0,0,.35))", pointerEvents: "none",
                             animation: !reduce ? "float 8s ease-in-out -2s infinite" : "none" }}/>

                  <Stack spacing={1.2} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
                    <Typography component={motion.div} {...fadeUp(reduce)} sx={{ opacity: 0.95, fontSize: { xs: 14, md: 16 } }}>
                      Республикалық онлайн олимпиада
                    </Typography>

                    <Typography
                      component={motion.div}
                      {...fadeUp(reduce, .05)}
                      sx={{
                        fontFamily: "Barlow, DM Sans Variable, sans-serif",
                        fontWeight: 900,
                        fontSize: { xs: 44, md: 70 },
                        lineHeight: 1.05, letterSpacing: -0.5,
                        backgroundImage: "linear-gradient(100deg,#fff,#ffffffb3,#fff)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        backgroundSize: "200% 100%",
                        animation: !reduce ? `${shimmer} 6s linear infinite` : "none",
                      }}
                    >
                      Qadam Math
                    </Typography>

                    <Typography component={motion.div} {...fadeUp(reduce, .1)} sx={{ opacity: 0.92 }}>
                      Жүлде қоры
                    </Typography>

                    <Typography
                      component={motion.div}
                      {...fadeUp(reduce, .15)}
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: 40, md: 64 },
                        lineHeight: 1.15,
                        backgroundImage: "linear-gradient(90deg,#fff,#FFE6E1,#fff)",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        backgroundSize: "200% 100%",
                        animation: !reduce ? `${bgSlide} 6s ease-in-out infinite` : "none",
                      }}
                    >
                      1 500 000 ₸
                    </Typography>

                    <motion.div whileHover={!reduce ? { scale: 1.02, y: -1 } : undefined} whileTap={!reduce ? { scale: 0.98 } : undefined}>
                      <Button
                        onClick={() => scrollToId("register")}
                        variant="contained"
                        color="secondary"
                        sx={{ mt: 1, px: 3.8, borderRadius: 999, background: `linear-gradient(90deg,#101114, #191B20)`,
                              "&:hover": { background: "linear-gradient(90deg,#0F1114,#191B20)" } }}
                        aria-label="Тіркелу формасына өту"
                      >
                        ТІРКЕЛУ
                      </Button>
                    </motion.div>
                  </Stack>
                </GlowCard>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* DARK PRIZES STRIP */}
      <Box sx={{ pb: { xs: 5, md: 7 } }}>
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={9}>
              <GlowCard  bg={DARK}
  glow={false}
  clipContent={false}
  pAll={0}
  sx={{ color: "#fff" }}
>
                <Box sx={{ p: { xs: 2.5, md: 4 }, position: "relative" }}>
                  <Box component="img" src={IconGift} alt="" loading="lazy" decoding="async"
                       sx={{ position: "absolute", right: -8, top: -10, width: { xs: 100, md: 100 },
                             filter: "drop-shadow(0 10px 20px rgba(0,0,0,.35))", pointerEvents: "none",
                             animation: !reduce ? "float 7s ease-in-out infinite" : "none" }}/>
                  <Box component="img" src={IconPhone} alt="" loading="lazy" decoding="async"
                       sx={{ position: "absolute", left: -10, bottom: -14, width: { xs: 100, md: 100 },
                             transform: "rotate(-12deg)", filter: "drop-shadow(0 10px 20px rgba(0,0,0,.35))",
                             pointerEvents: "none", animation: !reduce ? "float 8s ease-in-out -2s infinite" : "none" }}/>

                  <Stack spacing={0.4} alignItems="center" sx={{ mb: 2.2 }}>
                    <Typography align="center" sx={{ fontWeight: 900, fontSize: { xs: 22, md: 26 }, lineHeight: 1.2 }}>
                      Qadam Math ауқымды<br/>республикалық олимпиадасы
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.95, mt: 1 }}>Жүлделер:</Typography>
                  </Stack>

                  <Stack
                    component={motion.div}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, amount: 0.2 }}
                    variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
                    direction="row" flexWrap="wrap" justifyContent="center" gap={1.2}
                  >
                    {["iPhone 16","Ақылды Яндекс Станция 2 (Алиса)","Apple AirPods 3","Ozat Online-да тегін оқу","Оқуға жеңілдіктер"]
                      .map((t) => (
                      <motion.div key={t}
                        variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                        whileHover={!reduce ? { y: -2, scale: 1.04 } : undefined}
                        transition={{ type: "spring", stiffness: 300, damping: 18 }}>
                        <Chip label={t} sx={{ bgcolor: CORAL, color: "#fff", fontWeight: 700, px: 1.2 }} />
                      </motion.div>
                    ))}
                  </Stack>
                </Box>
              </GlowCard>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ABOUT + RULES */}
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container>
          <Typography variant="h2" align="center" sx={{ mb: 3 }}>Олимпиада туралы</Typography>

          <Stack alignItems="center" sx={{ mb: 2 }}>
            <Box component={motion.div} {...fadeUp(reduce)}
                 sx={{ bgcolor: CORAL, color: "#fff", borderRadius: 7, px: 3, py: 2, fontWeight: 800, textAlign: "center",
                       boxShadow: "0 10px 26px rgba(0,0,0,.12)" }}>
              Qadam Math Республикалық Онлайн олимпиадасы
            </Box>
          </Stack>

          <Grid container justifyContent="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={10} lg={9}>
              <GlowCard bg={DARK} glow={CORAL}>
                <Stack spacing={2} sx={{ color: "#fff" }}>
                  <Typography align="center" sx={{ opacity: 0.95 }}>Математика пәні бойынша өтеді.</Typography>
                  <Typography>Олимпиаданы өткізудің негізгі мақсаттарының бірі Қазақстандағы балалар арасындағы Олимпиада қозғалысын дамыту болып табылады.</Typography>
                  <Typography>Біз жас оқушылардың ой-өрісін кеңейтіп және білімге деген ұмтылысын ынталандырып, интеллектуалдық жарыстарға белсенді қатысуға шабыттандыруға тырысамыз.</Typography>
                  <Typography>Олимпиадалық қозғалыс балаларға өз әлеуетін көрсетуге, күшті жақтарын анықтауға және болашақ табыстары үшін құнды тәжірибе болатын, аналитикалық және сынни дағдыларды дамытуға бірегей мүмкіндік береді.</Typography>
                </Stack>
              </GlowCard>
            </Grid>
          </Grid>

          <Stack alignItems="center" sx={{ mb: 2 }}>
            <Box component={motion.div} {...fadeUp(reduce)}
                 sx={{ bgcolor: CORAL, color: "#fff", borderRadius: 7, px: 3, py: 1.2, fontWeight: 800, textAlign: "center",
                       boxShadow: "0 10px 26px rgba(0,0,0,.12)" }}>
              Қатысу ережелері мен шарттары
            </Box>
          </Stack>

          <Typography align="center" sx={{ fontWeight: 800, mb: 2 }}>3-4-5 сынып оқушылары қатысады!</Typography>
          <Typography align="center" sx={{ mb: 2, opacity: 0.9 }}>Жүлделі орындар:</Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
            {[{ t: "1 орын", s: "iPhone 16" },{ t: "2 орын", s: "Яндекс Алиса Мини Станция 2 ақылды колонкасы" },{ t: "3 орын", s: "Apple AirPods 3 құлаққаптары" }].map((x) => (
              <Grid key={x.t} item xs={12} sm={6} md={4}>
                <GlowCard bg={DARK} glow={CORAL} pAll={3} tilt>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>{x.t}</Typography>
                  <Typography sx={{ mt: 0.5, color: "#fff" }}>{x.s}</Typography>
                </GlowCard>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            {[{ t: "4-10 орын", s: "Ozat Online-да тегін бір жылдық оқу" },{ t: "11-50 орын", s: "Ozat Online онлайн-курстарына 50% жеңілдік" }].map((x) => (
              <Grid key={x.t} item xs={12} md={6}>
                <GlowCard bg={DARK} glow={CORAL} pAll={3} tilt>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: "#fff" }}>{x.t}</Typography>
                  <Typography sx={{ mt: 0.5, color: "#fff" }}>{x.s}</Typography>
                </GlowCard>
              </Grid>
            ))}
          </Grid>

          <Stack alignItems="center" sx={{ mb: 1 }}>
            <Box component={motion.div} {...fadeUp(reduce)}
                 sx={{ bgcolor: CORAL, color: "#fff", borderRadius: 7, px: 3, py: 1, fontWeight: 800, textAlign: "center",
                       boxShadow: "0 10px 26px rgba(0,0,0,.12)" }}>
              Өтінімдер 2025 жыл 17 қазан 18:00-ге дейін қабылданады.
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* REGISTER */}
      <Box id="register" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="sm">
          <GlowCard bg="#fff" glow={CORAL} pAll={0}>
            <Box sx={{ p: { xs: 2.5, md: 4 } }}>
              <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 900 }}>
                Олимпиадаға тіркелу
              </Typography>
              <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
                Тіркелгеннен кейін сізді біздің telegram-арнаға жібереді, ол жерде олимпиаданың барлық жаңалықтары жарияланады.
                Ақпаратты жіберіп алмау үшін міндетті түрде жазылу қажет.
              </Typography>

              <Box component="form" noValidate onSubmit={onSubmit}>
                <Stack spacing={2}>
                  <TextField
                    inputRef={parentRef}
                    label="Ата-ананың аты-жөні"
                    value={lead.parent}
                    onChange={(e) => setLead((s) => ({ ...s, parent: e.target.value }))}
                    autoComplete="name"
                    fullWidth
                    required
                  />
                  <TextField
                    inputRef={childRef}
                    label="Баланың аты-жөні"
                    value={lead.child}
                    onChange={(e) => setLead((s) => ({ ...s, child: e.target.value }))}
                    autoComplete="name"
                    fullWidth
                    required
                  />
                  <TextField
                    inputRef={phoneRef}
                    label="Сіздің телефоныңыз"
                    value={lead.phone}
                    onChange={handlePhoneChange}
                    inputMode="tel"
                    autoComplete="tel"
                    fullWidth
                    required
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span role="img" aria-label="Kazakhstan flag">🇰🇿</span>
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl fullWidth required>
                    <InputLabel id="grade">Бала қай сыныпта оқиды</InputLabel>
                    <Select
                      labelId="grade"
                      label="Бала қай сыныпта оқиды"
                      value={lead.grade}
                      onChange={(e) => setLead((s) => ({ ...s, grade: e.target.value as string }))}
                    >
                      {["3", "4", "5"].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                    </Select>
                  </FormControl>

                  {/* --- CITY: AUTOCOMPLETE WITH GROUPS --- */}
                  <Autocomplete<CityOption, false, false, false>
                    options={CITY_OPTIONS}
                    groupBy={(opt) => opt.group}
                    getOptionLabel={(opt) => opt.label}
                    value={CITY_OPTIONS.find(o => o.label === lead.city) ?? null}
                    onChange={(_, val) => setLead(s => ({ ...s, city: val?.label ?? "" }))}
                    renderInput={(params) => (
                      <TextField {...params} label="Сіз қай қалада/облыста тұрасыз?" required />
                    )}
                    ListboxProps={{
                      sx: {
                        maxHeight: 360,
                        "& .MuiListSubheader-root": { fontWeight: 800, color: "#121316" },
                      }
                    }}
                    popupIcon={null}
                  />

                  <FormControl fullWidth>
                    <InputLabel id="target">Балаңыздың еліміздің үздік мектептеріне (НЗМ, БИЛ, РФММ) түсуін қалайсыз ба?</InputLabel>
                    <Select
                      labelId="target"
                      label="Балаңыздың еліміздің үздік мектептеріне (НЗМ, БИЛ, РФММ) түсуін қалайсыз ба?"
                      value={lead.target}
                      onChange={(e) => setLead((s) => ({ ...s, target: e.target.value as LeadState["target"] }))}
                    >
                      {["-", "Иә", "Жоқ", "Әлі білмеймін"].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </Select>
                  </FormControl>

                  <motion.div whileHover={!reduce ? { y: -2, scale: 1.02 } : undefined} whileTap={!reduce ? { scale: 0.98 } : undefined}>
                    <Button
                      size="large"
                      type="submit"
                      variant="contained"
                      disabled={loading}
                      sx={{ bgcolor: CORAL, "&:hover": { bgcolor: "#EE5038" }, borderRadius: 999, minWidth: 140,
                            boxShadow: "0 10px 28px rgba(0,0,0,.10)" }}
                    >
                      {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Тіркелу"}
                    </Button>
                  </motion.div>
                </Stack>
              </Box>
            </Box>
          </GlowCard>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box component="footer" sx={{ py: 2 }}>
        <Container>
          <Divider sx={{ mb: 3 }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}
                 alignItems={{ xs: "flex-start", sm: "center" }}
                 justifyContent="space-between">
            <Typography>© {new Date().getFullYear()} Qadam Math</Typography>
            <Stack direction="row" spacing={2}>
              {["Политика конфиденциальности","Публичная оферта"].map((t) => (
                <Box key={t} component={motion.div} whileHover={!reduce ? { y: -1, scale: 1.04 } : undefined} whileTap={!reduce ? { scale: 0.98 } : undefined}>
                  <Chip label={t} variant="outlined" />
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* TOASTS */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((s) => ({ ...s, open: false })) }
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setToast((s) => ({ ...s, open: false }))} severity={toast.type} variant="filled" sx={{ width: "100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
