import * as React from "react";
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Stack, Grid,
  TextField, InputAdornment, CssBaseline, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, CircularProgress,
  Autocomplete
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { keyframes } from "@emotion/react";
import { motion, useReducedMotion } from "framer-motion";
import { createRegistration, type RegistrationRequest } from "@/api/registrations";

import IconCap   from "../../img/cap.png";
import IconBooks from "../../img/books.png";
import IconGift  from "../../img/gift.png";
import IconPhone from "../../img/phone.png";
import LogoOzat  from "../../img/LOGO.webp";

import "@fontsource-variable/dm-sans";
import "@fontsource/barlow/700.css";

import type { SxProps, Theme } from "@mui/material/styles";

/* ===== CONSTS ===== */
const LEFT_GUTTER = 28;
const CORAL = "#FF6A3D";
const DARK  = "#1F1F22";
const R = 8; // минимальный радиус — ровные прямые блоки

/* ===== THEME ===== */
const theme = createTheme({
  palette: {
    mode: "light",
    primary:   { main: CORAL },
    secondary: { main: "#0F0F10" },
    text:      { primary: "#121316", secondary: "#61646B" },
    background:{ default: "#ffffff", paper: "#ffffff" },
  },
  shape: { borderRadius: R },
  typography: {
    fontFamily: "DM Sans Variable, -apple-system, Segoe UI, Roboto, Inter, system-ui, sans-serif",
    h2: { fontWeight: 900, letterSpacing: -0.4, lineHeight: 1.12, fontSize: "clamp(26px,4.8vw,36px)" },
    h4: { fontWeight: 900, letterSpacing: -0.2, lineHeight: 1.15, fontSize: "clamp(22px,5vw,28px)" },
    button: { textTransform: "none", fontWeight: 900 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "::selection": { backgroundColor: CORAL, color: "#fff" },
        "@keyframes float": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
          "100%": { transform: "translateY(0)" },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          height: 48,
          boxShadow: "0 18px 40px rgba(0,0,0,.18)",
          "&:hover": { transform: "translateY(-1px)" },
          "&:active": { transform: "translateY(1px)" }
        },
      },
    },
  },
});

/* ===== CITY OPTIONS ===== */
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

/* ===== HELPERS ===== */
const inputAlignSx: SxProps<Theme> = {
  "& .MuiInputBase-input": { paddingLeft: `${LEFT_GUTTER}px`, fontSize: 16, lineHeight: 1.25 },
  "& .MuiSelect-select":   { paddingLeft: `${LEFT_GUTTER}px`, fontSize: 16, lineHeight: 1.25 },
  "& .MuiAutocomplete-input": { paddingLeft: `${LEFT_GUTTER}px !important`, fontSize: 16, lineHeight: 1.25 },
  "& .MuiInputLabel-root": { left: `${LEFT_GUTTER}px`, fontSize: 14, color: "rgba(0,0,0,.56)" },
  "& .MuiInputBase-root::after":  { borderBottomColor: CORAL },
  "& .MuiInputBase-root:hover:not(.Mui-disabled)::before": { borderBottomColor: `${CORAL}80` },
};

const bgSlide = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;
const shimmer = keyframes`
  0% { background-position: 0% 50% }
  100% { background-position: 200% 50% }
`;

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
  return `+${d.slice(0, 11)}`;
}
async function fireConfetti(opts?: any) {
  // @ts-ignore
  if (typeof window !== "undefined" && (window as any).confetti) {
    // @ts-ignore
    (window as any).confetti(opts ?? { particleCount: 90, spread: 65, origin: { y: 0.2 } });
    return;
  }
}

/* ===== RectCard (прямые углы) ===== */
type RectCardProps = React.ComponentProps<typeof Box> & { pAll?: number; contentSx?: any; };
function RectCard({ children, pAll = 3, contentSx, sx, ...rest }: RectCardProps) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: R,
        bgcolor: "#fff",
        boxShadow: "0 18px 50px rgba(0,0,0,.12)",
        overflow: "hidden",
        ...sx,
      }}
      {...rest}
    >
      <Box sx={{ p: pAll, ...contentSx }}>{children}</Box>
    </Box>
  );
}
/* ===== PrizesCard (тёмная карточка с призами) ===== */
function PrizeChip({
  label,
  sx,
  multiline = false,
}: {
  label: string;
  sx?: any;
  multiline?: boolean;
}) {
  return (
    <Chip
      label={label}
      sx={{
        bgcolor: CORAL,
        color: "#fff",
        borderRadius: 999,
        boxShadow: "0 8px 18px rgba(255,106,61,.30)",
        height: "auto",
        ...sx,
        "& .MuiChip-label": {
          px: 1.6,
          py: 0.8,
          fontWeight: 800,
          fontSize: 14,
          lineHeight: 1.1,
          whiteSpace: multiline ? "pre-wrap" : "nowrap",
          textAlign: "center",
        },
      }}
    />
  );
}

function PrizesCard() {
  return (
    <Box sx={{ py: { xs: 3, md: 4 } }}>
      <Container maxWidth="sm">
        <Box
          sx={{
            position: "relative",
            mx: "auto",
            bgcolor: DARK,
            color: "#fff",
            borderRadius: { xs: 4, md: 4 },     // мягкие углы
            px: { xs: 2.4, md: 3.4 },
            py: { xs: 3.2, md: 3.8 },
            boxShadow: "0 30px 80px rgba(0,0,0,.22)",
            overflow: "visible",                  // ⬅️ даём вылезать за рамку
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          {/* подарок — выступает за правый верхний край */}
          <Box
  component="img"
  src={IconGift}
  alt=""
  loading="lazy"
  decoding="async"
  sx={{
    position: "absolute",
    top: { xs: 30, md: 2 },     // ↓ было отрицательное значение — опустили чуть внутрь
    right: { xs: -25, md: -22 }, // остаётся немного за правым краем
    width: { xs: 92, md: 106 },  // можно оставить как было; немного уменьшил «агрессию»
    height: "auto",
    zIndex: 2,
    filter: "drop-shadow(0 12px 22px rgba(0,0,0,.35))",
    pointerEvents: "none",
  }}
/>

          {/* телефон — выступает за левый нижний край */}
          <Box
            component="img"
            src={IconPhone}
            alt=""
            loading="lazy"
            decoding="async"
            sx={{
              position: "absolute",
              left: { xs: -30, md: -38 },        // ⬅️ вынесено наружу
              bottom: { xs: -34, md: -42 },
              width: { xs: 124, md: 148 },       // ⬅️ крупнее
              height: "auto",
              transform: "rotate(-12deg)",
              zIndex: 2,
              filter: "drop-shadow(0 12px 24px rgba(0,0,0,.35))",
              pointerEvents: "none",
            }}
          />

          {/* контент */}
          <Stack spacing={1.2} alignItems="center" sx={{ position: "relative", zIndex: 1 }}>
            <Typography align="center" sx={{ fontWeight: 900, fontSize: { xs: 20, md: 22 }, lineHeight: 1.2 }}>
              Qadam Math ауқымды
              <br /> республикалық олимпиадасы
            </Typography>

            <Typography align="center" sx={{ fontWeight: 800, mt: 0.5, mb: 0.5, opacity: 0.95 }}>
              Жүлделер:
            </Typography>

            <Stack direction="row" justifyContent="center" flexWrap="wrap" gap={1} sx={{ maxWidth: 300 }}>
              <PrizeChip label="iPhone 16" />
              <PrizeChip label="Apple Airpods 3" />
              <PrizeChip label="Ақылды яндекс станциясы 2 (Алиса)" sx={{ maxWidth: 300 }} />
              <PrizeChip label="Ozat Online-да тегін оқу" />
              <PrizeChip label={"Оқуға\nжеңілдіктер"} sx={{ maxWidth: 200 }} multiline />
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}


/* ===== State ===== */
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
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [lead, setLead] = React.useState<LeadState>({
    parent: "", child: "", phone: "", grade: "3", city: "Алматы қ.", target: "-",
  });

  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{ open: boolean; msg: string; type: "success" | "error" }>({
    open: false, msg: "", type: "success",
  });

  const parentRef = React.useRef<HTMLInputElement>(null);
  const childRef  = React.useRef<HTMLInputElement>(null);
  const phoneRef  = React.useRef<HTMLInputElement>(null);

  const validate = React.useCallback((): string | null => {
    if (!lead.parent.trim()) { parentRef.current?.focus(); return "Ата-ананың аты-жөні қажет"; }
    if (!lead.child.trim())  { childRef.current?.focus();  return "Баланың аты-жөні қажет"; }
    const digits = lead.phone.replace(/\D/g, "");
    if (digits.length < 11)  { phoneRef.current?.focus();  return "Телефон нөмірі дұрыс емес"; }
    return null;
  }, [lead.parent, lead.child, lead.phone]);

  const handlePhoneChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target as HTMLInputElement;
      const { value, selectionStart } = input;
      const { value: masked, caret } = formatPhoneStable(lead.phone, value, selectionStart);
      setLead((s) => ({ ...s, phone: masked }));
      requestAnimationFrame(() => { if (caret != null) input.setSelectionRange(caret, caret); });
    }, [lead.phone]
  );

  const onSubmit = React.useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const err = validate();
      if (err) { setToast({ open: true, msg: err, type: "error" }); return; }
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
    }, [lead, validate]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* NAV */}
      <AppBar position="sticky" elevation={0} color="transparent"
        sx={{ backdropFilter: "saturate(1.8) blur(10px)", backgroundColor: "rgba(255,255,255,.85)", borderBottom: "1px solid #eee" }}>
        <Toolbar sx={{ gap: 2, px: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>Qadam Math</Typography>
          <Button onClick={() => scrollToId("register")} variant="contained" color="secondary">ТІРКЕЛУ</Button>
        </Toolbar>
      </AppBar>


{/* HERO (иконки выступают за края, ozat больше) */}
<Box sx={{ pt: { xs: 3, md: 4 }, pb: { xs: 4, md: 6 } }}>
  <Container disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
    {/* бейдж ozat сверху по центру — чуть больше */}
    <Box sx={{ display: "flex", justifyContent: "center", mb: { xs: 1.5, md: 2 } }}>
      <Box
        component="img"
        src={LogoOzat}
        alt="ozat"
        loading="lazy"
        decoding="async"
        sx={{
          height: { xs: 36, md: 44 },          // ⬅️ стало крупнее
          width: "auto",
          filter: "drop-shadow(0 6px 12px rgba(0,0,0,.15))",
        }}
      />
    </Box>

    <RectCard
      pAll={0}
      sx={{
        position: "relative",
        bgcolor: CORAL,
        color: "#fff",
        borderRadius: { xs: 4, md: 4 },      // ⬅️ более круглые углы
        px: { xs: 2.8, md: 6 },
        py: { xs: 4.2, md: 6 },
        boxShadow: "0 30px 80px rgba(255,106,61,.35), 0 10px 30px rgba(0,0,0,.15)",
        overflow: "visible",                   // ⬅️ важное: даём иконкам выходить за рамку
        textAlign: "center",
      }}
    >
      {/* декор: шапка — выступает за правый верхний край */}
      <Box
        component="img"
        src={IconCap}
        alt=""
        loading="lazy"
        decoding="async"
        sx={{
          position: "absolute",
          top: { xs: -24, md: -30 },           // ⬅️ вынесено наружу
          right: { xs: -22, md: -26 },
          width: { xs: 96, md: 120 },          // ⬅️ крупнее
          height: "auto",
          zIndex: 2,
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,.35))",
          pointerEvents: "none",
        }}
      />

      {/* декор: книги — выступают за левый нижний край */}
      <Box
        component="img"
        src={IconBooks}
        alt=""
        loading="lazy"
        decoding="async"
        sx={{
          position: "absolute",
          left: { xs: -28, md: -36 },          // ⬅️ вынесено наружу
          bottom: { xs: -28, md: -34 },
          width: { xs: 120, md: 140 },         // ⬅️ крупнее
          height: "auto",
          zIndex: 2,
          transform: "rotate(-6deg)",
          filter: "drop-shadow(0 10px 20px rgba(0,0,0,.35))",
          pointerEvents: "none",
        }}
      />

      <Stack spacing={1.25} alignItems="center">
        <Typography sx={{ fontWeight: 800, opacity: 0.95, fontSize: { xs: 13, md: 15 } }}>
          Республикалық онлайн олимпиада
        </Typography>

        <Typography
          sx={{
            fontFamily: "Barlow, DM Sans Variable, sans-serif",
            fontWeight: 900,
            fontSize: { xs: 36, md: 64 },
            lineHeight: 1.06,
            letterSpacing: -0.5,
          }}
        >
          Qadam Math
        </Typography>

        <Typography sx={{ fontWeight: 700, opacity: 0.92 }}>
          Жүлде қоры
        </Typography>

        <Typography sx={{ fontWeight: 900, fontSize: { xs: 32, md: 56 }, lineHeight: 1.1 }}>
          1 500 000 ₸
        </Typography>

        <Button
          onClick={() => scrollToId("register")}
          variant="contained"
          disableElevation
          sx={{
            mt: 1,
            bgcolor: "#000",
            color: "#fff",
            borderRadius: 999,
            px: { xs: 3.2, md: 3.6 },
            height: { xs: 40, md: 44 },
            fontWeight: 900,
            letterSpacing: 0.6,
            "&:hover": { bgcolor: "#111" },
          }}
        >
          ТІРКЕЛУ
        </Button>
      </Stack>
    </RectCard>
  </Container>
</Box>


{/* DARK PRIZES CARD */}
<PrizesCard />

      {/* ABOUT — как на макете */}
<Box sx={{ pb: { xs: 3, md: 5 } }}>
  <Container disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
    <Typography
      align="center"
      sx={{
        fontFamily: 'Barlow, DM Sans Variable, sans-serif',
        fontWeight: 900,
        letterSpacing: -0.6,
        fontSize: { xs: 32, md: 48 },
        lineHeight: 1.05,
        mb: 1.5,
      }}
    >
      Олимпиада туралы
    </Typography>

    <Box
      sx={{
        position: "relative",
        bgcolor: DARK,
        color: "#fff",
        borderRadius: 4,
        px: { xs: 2.5, md: 5 },
        py: { xs: 4, md: 4.5 },
        boxShadow: "0 20px 60px rgba(0,0,0,.25)",
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* внутренняя белая окантовка */}
      <Box
        sx={{
          position: "absolute",
          inset: { xs: 6, md: 8 },
          borderRadius: "inherit",
          border: { xs: "4px solid #fff", md: "5px solid #fff" },
          pointerEvents: "none",
        }}
      />

      {/* белая pill с коралловым текстом */}
      <Box
        sx={{
          position: "relative",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: { xs: 2.5, md: 3 },
          mt: { xs: -3, md: -3.5 }, // слегка «врезаем» в верхнюю окантовку
          background: "#fff",
          color: CORAL,
          borderRadius: 999,
          px: { xs: 2.2, md: 3 },
          py: { xs: 0.8, md: 1.0 },
          fontWeight: 900,
          fontSize: { xs: 16, md: 18 },
          border: { xs: `4px solid ${DARK}`, md: `6px solid ${DARK}` },
          boxShadow: "0 10px 20px rgba(0,0,0,.12)",
        }}
      >
        Qadam Math Республикалық Онлайн олимпиадасы
      </Box>

      {/* текст внутри карточки */}
      <Stack spacing={1.25} sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontWeight: 900, opacity: 0.95 }}>
          Математика пәні бойынша өтеді.
        </Typography>

        <Typography sx={{ fontWeight: 900 }}>
          Олимпиаданы өткізудің негізгі мақсаттарының бірі Қазақстандағы балалар арасындағы
          Олимпиада қозғалысын дамыту болып табылады.
        </Typography>

        <Typography sx={{ opacity: 0.95 }}>
          Біз жас оқушылардың ой-өрісін кеңейтіп және білімге деген ұмтылысын ынталандырып,
          интеллектуалдық жарыстарға белсенді қатысуға шабыттандыруға тырысамыз.
        </Typography>

        <Typography sx={{ opacity: 0.95 }}>
          Олимпиадалық қозғалыс балаларға өз әлеуетін көрсетуге, күшті жақтарын анықтауға және
          болашақ табыстары үшін құнды тәжірибе болатын, аналитикалық және сынни дағдыларды
          дамытуға бірегей мүмкіндік береді.
        </Typography>
      </Stack>
    </Box>
  </Container>
</Box>

      {/* ===== RULES + PRIZES (точно как на макете) ===== */}
<Box sx={{ py: { xs: 4, md: 6 } }}>
  <Container disableGutters sx={{ px: { xs: 2, sm: 3 } }}>
    {/* верхняя оранжевая пилюля */}
    <Box sx={{ display: "grid", placeItems: "center", mb: 2 }}>
      <Box
        sx={{
          bgcolor: CORAL,
          color: "#fff",
          fontWeight: 900,
          px: 3,
          py: 1.2,
          borderRadius: 999,
          boxShadow: "0 16px 40px rgba(255,106,61,.45)",
        }}
      >
        Қатысу ережелері мен шарттары
      </Box>
    </Box>

    <Typography align="center" sx={{ fontWeight: 900, mb: 2 }}>
      3-4-5 сынып оқушылары қатысады!
    </Typography>
    <Typography align="center" sx={{ mb: 2, opacity: 0.9 }}>
      Жүлделі орындар:
    </Typography>

    {/* плашки с призами */}
    <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
      {[
        { t: "1 орын", s: "iPhone 16" },
        { t: "2 орын", s: "Яндекс Алиса Мини Станция 2 ақылды колонкасы" },
        { t: "3 орын", s: "Apple AirPods 3 құлаққаптары" },
        { t: "4-10 орын", s: "Ozat Online-да тегін бір жылдық оқу" },
        { t: "11 - 50 орын", s: "Ozat Online онлайн-курстарына 50% жеңілдік" },
      ].map(({ t, s }, i) => {
        // первые 3 — по 1/3 ширины на md, нижние 2 — по 1/2
        const md = i < 3 ? 4 : 6;
        return (
          <Grid key={t} item xs={12} sm={6} md={md}>
            <Box
              sx={{
                bgcolor: DARK,
                color: "#fff",
                borderRadius: 4,
                textAlign: "center",
                px: 3,
                py: 2.4,
                boxShadow: "0 20px 60px rgba(0,0,0,.22)",
              }}
            >
              <Typography sx={{ fontWeight: 900 }}>{t}</Typography>
              <Typography sx={{ opacity: 0.95, mt: 0.6 }}>{s}</Typography>
            </Box>
          </Grid>
        );
      })}
    </Grid>

    {/* нижняя оранжевая пилюля */}
    <Box sx={{ display: "grid", placeItems: "center", mb: 1 }}>
      <Box
        sx={{
          bgcolor: CORAL,
          color: "#fff",
          fontWeight: 900,
          px: 3,
          py: 1.2,
          borderRadius: 999,
          boxShadow: "0 16px 40px rgba(255,106,61,.45)",
        }}
      >
        Өтінімдер 2025 жыл 17 қазан 18:00-ге дейін қабылданады.
      </Box>
    </Box>
  </Container>
</Box>


      {/* REGISTER — прямоугольная карточка с обычной рамкой */}
      <Box id="register" sx={{ py: { xs: 6, md: 9 }, scrollMarginTop: 80 }}>
        <Container disableGutters maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              position: "relative",
              borderRadius: R,
              background: "#fff",
              boxShadow: "0 18px 60px rgba(0,0,0,.18)",
              border: `6px solid ${CORAL}`,   // вместо псевдо-колец
            }}
          >
            <Box sx={{ px: { xs: 3, md: 4 }, pt: { xs: 4, md: 5 }, pb: { xs: 2, md: 2.5 }, textAlign: "center" }}>
              <Typography variant="overline" sx={{ letterSpacing: 1.2, color: "text.secondary" }}>
                Qadam Math • Онлайн-олимпиада
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.5 }}>Олимпиадаға тіркелу</Typography>
              <Typography color="text.secondary" sx={{ mt: 1, fontSize: 14 }}>
                Тіркелгеннен кейін сіз біздің telegram-арнаға жіберіледі, ол жерде олимпиаданың барлық жаңалықтары жарияланады.
                <Box component="strong" sx={{ display: "block", mt: 1.1, color: "text.primary", fontWeight: 900 }}>
                  Ақпаратты жіберіп алмау үшін міндетті түрде жазылу қажет
                </Box>
              </Typography>
            </Box>

            <Divider />

            <Box component="form" noValidate onSubmit={onSubmit} sx={{ p: { xs: 3, md: 4 } }}>
              <Stack spacing={2.4}>
                <Grid container spacing={1.8}>
                  <Grid item xs={12}>
                    <TextField variant="standard" inputRef={parentRef} label="Ата-ананың аты-жөні"
                      value={lead.parent} onChange={(e) => setLead((s) => ({ ...s, parent: e.target.value }))}
                      autoComplete="name" required fullWidth placeholder="Ерлан Нұрбекұлы" sx={inputAlignSx}/>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField variant="standard" inputRef={childRef} label="Баланың аты-жөні"
                      value={lead.child} onChange={(e) => setLead((s) => ({ ...s, child: e.target.value }))}
                      autoComplete="name" required fullWidth placeholder="Айша Ерланқызы" sx={inputAlignSx}/>
                  </Grid>
                </Grid>

                <TextField
                  variant="standard" inputRef={phoneRef} label="Сіздің телефоныңыз"
                  value={lead.phone} onChange={handlePhoneChange} inputMode="tel" autoComplete="tel"
                  required fullWidth placeholder="+7 (000) 000-00-00"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ fontSize: 18, mr: 0, minWidth: LEFT_GUTTER, justifyContent: "center" }}>
                        <span role="img" aria-label="Kazakhstan flag">🇰🇿</span>
                      </InputAdornment>
                    ),
                    inputProps: { inputMode: "tel", pattern: "[0-9]*", autoCapitalize: "off", autoCorrect: "off" },
                  }}
                  helperText="WhatsApp қолжетімді нөмірді көрсетіңіз"
                  sx={inputAlignSx}
                />

                <Grid container spacing={1.8}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required variant="standard" sx={inputAlignSx}>
                      <InputLabel id="grade">Бала қай сыныпта оқиды</InputLabel>
                      <Select labelId="grade" value={lead.grade} onChange={(e) => setLead((s) => ({ ...s, grade: e.target.value as string }))}>
                        {["3","4","5"].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Autocomplete<CityOption, false, false, false>
                      fullWidth options={CITY_OPTIONS} groupBy={(o)=>o.group} getOptionLabel={(o)=>o.label}
                      value={CITY_OPTIONS.find((o)=>o.label===lead.city) ?? null}
                      isOptionEqualToValue={(a,b)=>a.label===b.label}
                      onChange={(_, val)=>setLead((s)=>({...s, city: val?.label ?? ""}))}
                      autoHighlight blurOnSelect disablePortal includeInputInList handleHomeEndKeys={false}
                      renderInput={(params)=>(<TextField {...params} variant="standard" label="Сіз қай қалада тұрасыз?" required sx={inputAlignSx}/>)}
                      popupIcon={null}
                    />
                  </Grid>
                </Grid>

                <FormControl fullWidth variant="standard" sx={inputAlignSx}>
                  <InputLabel id="target">Балаңыздың еліміздің үздік мектептеріне (НЗМ, БИЛ, РФММ) түсуін қалайсыз ба?</InputLabel>
                  <Select labelId="target" value={lead.target} onChange={(e)=>setLead((s)=>({...s, target: e.target.value as LeadState["target"]}))}>
                    {[,"Иә","Жоқ",].map((o)=>(<MenuItem key={o} value={o}>{o}</MenuItem>))}
                  </Select>
                </FormControl>

                <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center" }}>
                  <Button type="submit" size="large" variant="contained" disabled={loading}
                    sx={{ bgcolor: CORAL, "&:hover": { bgcolor: "#F35F34" }, px: 5, minHeight: 52 }}>
                    {loading ? <CircularProgress size={22} sx={{ color: "#fff" }}/> : "Тіркелу"}
                  </Button>
                </Box>

                <Typography variant="caption" align="center" color="text.secondary">
                  Өтінішті жіберу арқылы сіз{" "}
                  <Box component="span" sx={{ textDecoration: "underline" }}>дербес деректерді өңдеуге келісім бересіз</Box>.
                </Typography>
              </Stack>

              {/* Sticky CTA (mobile) */}
              <Box sx={{ display: { xs: "block", md: "none" }, position: "sticky", bottom: 0, left: 0, right: 0, mt: 2, pt: 1.25, pb: 1.75, background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #fff 30%)", borderTop: "1px solid #eee" }}>
                <Button fullWidth type="submit" size="large" variant="contained" disabled={loading}
                  sx={{ bgcolor: CORAL, "&:hover": { bgcolor: "#F35F34" }, minHeight: 52 }}>
                  {loading ? <CircularProgress size={22} sx={{ color: "#fff" }}/> : "Тіркелу"}
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* TOASTS */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={() => setToast((s)=>({ ...s, open:false }))} anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
        <Alert onClose={() => setToast((s)=>({ ...s, open:false }))} severity={toast.type} variant="filled" sx={{ width:"100%" }}>
          {toast.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
