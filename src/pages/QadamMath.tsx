import * as React from "react";
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Stack, Grid,
  Card, CardContent, TextField, InputAdornment, CssBaseline, Chip, Divider,
  Select, MenuItem, FormControl, InputLabel, Snackbar, Alert, CircularProgress
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { keyframes } from "@emotion/react";
import { motion } from "framer-motion";
import { createRegistration, type RegistrationRequest } from "@/api/registrations";

// PNG-иконки (клади в qadam-math-landing/img)
import IconCap   from "../../img/cap.png";
import IconBooks from "../../img/books.png";
import IconGift  from "../../img/gift.png";
import IconPhone from "../../img/phone.png";
import LogoOzat  from "../../img/LOGO.webp";

// Fonts
import "@fontsource-variable/dm-sans";
import "@fontsource/barlow/700.css";

// === THEME ===
const CORAL = "#FA5C44";
const DARK = "#2F2F2F";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: CORAL },
    secondary: { main: "#000000" },
    text: { primary: "#111", secondary: "#606060" },
    background: { default: "#fff", paper: "#fff" },
  },
  shape: { borderRadius: 3 },
  typography: {
    fontFamily:
      "DM Sans Variable, -apple-system, Segoe UI, Roboto, Inter, system-ui, sans-serif",
    h1: { fontWeight: 900, letterSpacing: -0.5 },
    h2: { fontWeight: 900 },
    h3: { fontWeight: 800 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            `radial-gradient(1200px 400px at 10% -20%, rgba(250,92,68,.06), transparent 40%),
             radial-gradient(1000px 400px at 100% 120%, rgba(47,47,47,.06), transparent 40%),
             #fff`,
        },
        "::selection": { backgroundColor: CORAL, color: "#fff" },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 22,
          height: 44,
          boxShadow: "0 8px 24px rgba(0,0,0,.08)",
          "&:hover": { boxShadow: "0 10px 28px rgba(0,0,0,.12)" },
        },
      },
    },
    MuiCard: { styleOverrides: { root: { borderRadius: 3, boxShadow: "0 28px 90px rgba(0,0,0,.08)" } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 999, fontWeight: 700 } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: CORAL },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: CORAL },
          "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(250,92,68,.15)" },
        },
      },
    },
  },
});

// === HELPERS ===
function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "");
  const only7 = d.startsWith("7") ? d : d ? "7" + d : "";
  let out = "+7";
  if (only7.length > 1) out += " (" + only7.slice(1, 4);
  if (only7.length >= 4) out += ") ";
  if (only7.length > 4) out += only7.slice(4, 7);
  if (only7.length > 7) out += "-" + only7.slice(7, 9);
  if (only7.length > 9) out += "-" + only7.slice(9, 11);
  return out;
}

// === ANIMATIONS ===
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const appear = { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.6 } } };
const bgSlide = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export default function App() {
  const [lead, setLead] = React.useState({
    parent: "", child: "", phone: "",
    grade: "3", city: "Алматы қ.", target: "-"
  });

  const [loading, setLoading] = React.useState(false);
  const [toast, setToast] = React.useState<{open: boolean; msg: string; type: "success"|"error"}>({
    open: false, msg: "", type: "success"
  });

  // Валидация простая — можно расширить по желанию
  function validate(): string | null {
    if (!lead.parent.trim()) return "Ата-ананың аты-жөні қажет";
    if (!lead.child.trim()) return "Баланың аты-жөні қажет";
    if (lead.phone.replace(/\D/g, "").length < 11) return "Телефон нөмірі дұрыс емес";
    return null;
  }

  async function onSubmit() {
    const err = validate();
    if (err) {
      setToast({ open: true, msg: err, type: "error" });
      return;
    }

    const payload: RegistrationRequest = {
      parentFullName: lead.parent.trim(),
      studentFullName: lead.child.trim(),
      studentPhone: lead.phone.trim(),
      studentGrade: lead.grade,
      city: lead.city, // при необходимости можешь нормализовать тут
      wantsSelectiveSchool: lead.target === "Иә",
    };

    try {
      setLoading(true);
      const res = await createRegistration(payload);
      setToast({
        open: true,
        msg: `Өтінім қабылданды! ID: ${res.id}`,
        type: "success",
      });
      // очистим форму (по желанию)
      setLead((s) => ({ ...s, parent: "", child: "", phone: "" }));
      scrollToId("register");
    } catch (e: any) {
      setToast({
        open: true,
        msg: e?.message ?? "Жіберу мүмкін болмады",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      {/* NAVBAR */}
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: "saturate(1.8) blur(8px)",
          backgroundColor: "rgba(255,255,255,.72)",
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
          <Typography variant="h6" sx={{ fontWeight: 900, flexGrow: 1 }}>Qadam Math</Typography>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={() => scrollToId("register")} variant="contained" color="secondary">
              ТІРКЕЛУ
            </Button>
          </motion.div>
        </Toolbar>
      </AppBar>

      {/* HERO (как на макете) */}
      <Box sx={{ py: { xs: 5, md: 8 } }}>
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={9}>
              <motion.div variants={appear} initial="initial" animate="animate">
                <Box
                  sx={{
                    position: "relative",
                    borderRadius: 6,
                    bgcolor: CORAL,
                    color: "#fff",
                    px: { xs: 3, md: 8 },
                    py: { xs: 5, md: 7 },
                    boxShadow: "0 50px 140px rgba(250,92,68,.35)",
                    overflow: "visible",
                  }}
                >
                  {/* ozat pill (логотип) */}
                  <Box
                    component="img"
                    src={LogoOzat}
                    alt="ozat"
                    sx={{
                      position: "absolute",
                      left: "50%",
                      top: { xs: -26, md: -32 },
                      transform: "translateX(-50%)",
                      width: { xs: 120, md: 160 },
                      height: "auto",
                      filter: "drop-shadow(0 10px 22px rgba(0,0,0,.22))",
                      zIndex: 2,
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />

                  {/* Декор PNG — выступают за края */}
                  <Box component="img" src={IconCap} alt="cap"
                       sx={{ position: "absolute", right: -6, top: -8, width: { xs: 100, md: 100 }, height: "auto",
                             filter: "drop-shadow(0 8px 16px rgba(0,0,0,.35))", pointerEvents: "none" }}/>
                  <Box component="img" src={IconBooks} alt="books"
                       sx={{ position: "absolute", left: -6, bottom: -6, width: { xs: 100, md: 100 }, height: "auto",
                             filter: "drop-shadow(0 8px 16px rgba(0,0,0,.35))", pointerEvents: "none" }}/>

                  <Stack spacing={1.2} alignItems="center">
                    <Typography component={motion.div} variants={fadeUp} initial="initial" animate="animate"
                                sx={{ opacity: 0.95, fontSize: { xs: 14, md: 16 } }}>
                      Республикалық онлайн олимпиада
                    </Typography>

                    <Typography component={motion.div} variants={fadeUp} initial="initial" animate="animate"
                                transition={{ delay: 0.05 }}
                                sx={{
                                  fontFamily: "Barlow, DM Sans Variable, sans-serif",
                                  fontWeight: 900,
                                  fontSize: { xs: 44, md: 70 },
                                  lineHeight: 1.05, letterSpacing: -0.5,
                                }}>
                      Qadam Math
                    </Typography>

                    <Typography component={motion.div} variants={fadeUp} initial="initial" animate="animate"
                                transition={{ delay: 0.1 }} sx={{ opacity: 0.9 }}>
                      Жүлде қоры
                    </Typography>

                    <Typography component={motion.div} variants={fadeUp} initial="initial" animate="animate"
                                transition={{ delay: 0.15 }}
                                sx={{
                                  fontWeight: 900,
                                  fontSize: { xs: 40, md: 64 },
                                  lineHeight: 1.15,
                                  backgroundImage: "linear-gradient(90deg,#fff,#FFE6E1,#fff)",
                                  WebkitBackgroundClip: "text",
                                  color: "transparent",
                                  backgroundSize: "200% 100%",
                                  animation: `${bgSlide} 6s ease-in-out infinite`,
                                }}>
                      1 500 000 ₸
                    </Typography>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button onClick={() => scrollToId("register")} variant="contained" color="secondary"
                              sx={{ mt: 1, px: 3.5, borderRadius: 999 }}>
                        ТІРКЕЛУ
                      </Button>
                    </motion.div>
                  </Stack>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* DARK PRIZES STRIP (как на макете) */}
      <Box sx={{ pb: { xs: 5, md: 7 } }}>
        <Container>
          <Grid container justifyContent="center">
            <Grid item xs={12} md={10} lg={9}>
              <Card
                component={motion.div}
                variants={fadeUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true, amount: 0.3 }}
                sx={{
                  bgcolor: DARK, color: "#fff",
                  position: "relative",
                  overflow: "visible",
                  borderRadius: 6,
                  boxShadow: "0 40px 120px rgba(0,0,0,.25)"
                }}
              >
                <CardContent sx={{ pb: 4 }}>
                  <Box component="img" src={IconGift} alt="gift"
                       sx={{ position: "absolute", right: -8, top: -10, width: { xs: 100, md: 100 }, height: "auto",
                             filter: "drop-shadow(0 10px 20px rgba(0,0,0,.35))", pointerEvents: "none" }}/>
                  <Box component="img" src={IconPhone} alt="phone"
                       sx={{ position: "absolute", left: -10, bottom: -14, width: { xs: 100, md: 100 }, height: "auto",
                             transform: "rotate(-12deg)",
                             filter: "drop-shadow(0 10px 20px rgba(0,0,0,.35))", pointerEvents: "none" }}/>

                  <Stack spacing={0.4} alignItems="center" sx={{ mb: 2.2 }}>
                    <Typography align="center"
                      sx={{ fontWeight: 900, fontSize: { xs: 22, md: 26 }, lineHeight: 1.2 }}>
                      Qadam Math ауқымды<br/>республикалық олимпиадасы
                    </Typography>
                    <Typography align="center" sx={{ opacity: 0.95, mt: 1 }}>Жүлделер:</Typography>
                  </Stack>

                  <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1.2}>
                    {[
                      "iPhone 16",
                      "Ақылды яндекс станциясы 2 (Алиса)",
                      "Apple Airpods 3",
                      "Ozat Online-да тегін оқу",
                      "Оқуға жеңілдіктер",
                    ].map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        sx={{
                          bgcolor: CORAL,
                          color: "#fff",
                          fontWeight: 700,
                          px: 1.2,
                          boxShadow: "0 6px 16px rgba(0,0,0,.18)"
                        }}
                      />
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ABOUT + RULES */}
      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <Container>
          <Typography variant="h2" align="center" sx={{ mb: 3 }}>Олимпиада туралы</Typography>

          <Stack alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ bgcolor: CORAL, color: "#fff", borderRadius: 6, px: 3, py: 2, fontWeight: 800, textAlign: "center",
                       boxShadow: "0 10px 30px rgba(250,92,68,.35)" }}>
              Qadam Math Республикалық Онлайн олимпиадасы
            </Box>
          </Stack>

          <Grid container justifyContent="center" sx={{ mb: 4 }}>
            <Grid item xs={12} md={10} lg={9}>
              <Box sx={{
                position: "relative",
                bgcolor: DARK, color: "#fff",
                borderRadius: 6, p: { xs: 2.5, md: 4 },
                boxShadow: "0 18px 50px rgba(0,0,0,.18)",
              }}>
                <Stack spacing={2}>
                  <Typography align="center" sx={{ opacity: 0.95 }}>Математика пәні бойынша өтеді.</Typography>
                  <Typography>
                    Олимпиаданы өткізудің негізгі мақсаттарының бірі Қазақстандағы балалар арасындағы
                    Олимпиада қозғалысын дамыту болып табылады.
                  </Typography>
                  <Typography>
                    Біз жас оқушылардың ой-өрісін кеңейтіп және білімге деген ұмтылысын ынталандырып,
                    интеллектуалдық жарыстарға белсенді қатысуға шабыттандыруға тырысамыз.
                  </Typography>
                  <Typography>
                    Олимпиадалық қозғалыс балаларға өз әлеуетін көрсетуге, күшті жақтарын анықтауға және
                    болашақ табыстары үшін құнды тәжірибе болатын, аналитикалық және сынни дағдыларды
                    дамытуға бірегей мүмкіндік береді.
                  </Typography>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          <Stack alignItems="center" sx={{ mb: 2 }}>
            <Box sx={{ bgcolor: CORAL, color: "#fff", borderRadius: 6, px: 3, py: 1.2, fontWeight: 800, textAlign: "center",
                       boxShadow: "0 10px 30px rgba(250,92,68,.35)" }}>
              Қатысу ережелері мен шарттары
            </Box>
          </Stack>

          <Typography align="center" sx={{ fontWeight: 800, mb: 2 }}>
            3-4-5 сынып оқушылары қатысады!
          </Typography>
          <Typography align="center" sx={{ mb: 2, opacity: 0.9 }}>
            Жүлделі орындар:
          </Typography>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
            {[
              { t: "1 орын", s: "iPhone 16" },
              { t: "2 орын", s: "Яндекс Алиса Мини Станция 2 ақылды колонкасы" },
              { t: "3 орын", s: "Apple AirPods 3 құлаққаптары" },
            ].map((x) => (
              <Grid key={x.t} item xs={12} sm={6} md={4}>
                <Box component={motion.div} whileHover={{ y: -6, scale: 1.02 }}
                     transition={{ type: "spring", stiffness: 250, damping: 20 }}
                     sx={{ bgcolor: DARK, color: "#fff", borderRadius: 6, p: 3, textAlign: "center",
                           boxShadow: "0 18px 50px rgba(0,0,0,.18)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{x.t}</Typography>
                  <Typography sx={{ mt: 0.5 }}>{x.s}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={2} justifyContent="center" sx={{ mb: 3 }}>
            {[
              { t: "4-10 орын", s: "Ozat Online-да тегін бір жылдық оқу" },
              { t: "11-50 орын", s: "Ozat Online онлайн-курстарына 50% жеңілдік" },
            ].map((x) => (
              <Grid key={x.t} item xs={12} md={6}>
                <Box component={motion.div} whileHover={{ y: -6, scale: 1.02 }}
                     transition={{ type: "spring", stiffness: 250, damping: 20 }}
                     sx={{ bgcolor: DARK, color: "#fff", borderRadius: 6, p: 3, textAlign: "center",
                           boxShadow: "0 18px 50px rgba(0,0,0,.18)" }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>{x.t}</Typography>
                  <Typography sx={{ mt: 0.5 }}>{x.s}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Stack alignItems="center" sx={{ mb: 1 }}>
            <Box sx={{ bgcolor: CORAL, color: "#fff", borderRadius:6, px: 3, py: 1, fontWeight: 800, textAlign: "center",
                       boxShadow: "0 10px 30px rgba(250,92,68,.35)" }}>
              Өтінімдер 2025 жыл 17 қазан 18:00-ге дейін қабылданады.
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* REGISTER */}
      <Box id="register" sx={{ py: { xs: 4, md: 6 } }}>
        <Container maxWidth="sm">
          <Box sx={{
            position: "relative",
            border: "6px solid " + CORAL,
            borderRadius: 6,
            p: { xs: 2.5, md: 4 },
            boxShadow: "0 24px 70px rgba(250,92,68,.25)",
            background: "#fff",
          }}>
            <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: 900 }}>
              Олимпиадаға тіркелу
            </Typography>
            <Typography align="center" color="text.secondary" sx={{ mb: 3 }}>
              Тіркелгеннен кейін сізді біздің telegram-арнаға жібереді, ол жерде олимпиаданың барлық жаңалықтары жарияланады.
              Ақпаратты жіберіп алмау үшін міндетті түрде жазылу қажет
            </Typography>

            <Stack spacing={2}>
              <TextField label="Ата-ананың аты-жөні" value={lead.parent}
                         onChange={(e) => setLead((s) => ({ ...s, parent: e.target.value }))} fullWidth />
              <TextField label="Баланың аты-жөні" value={lead.child}
                         onChange={(e) => setLead((s) => ({ ...s, child: e.target.value }))} fullWidth />
              <TextField label="Сіздің телефоныңыз" value={lead.phone}
                         onChange={(e) => setLead((s) => ({ ...s, phone: formatPhone(e.target.value) }))} fullWidth
                         InputProps={{ startAdornment: (
                           <InputAdornment position="start"><span role="img" aria-label="flag">🇰🇿</span></InputAdornment>
                         ) }} />

              <FormControl fullWidth>
                <InputLabel id="grade">Бала қай сыныпта оқиды</InputLabel>
                <Select labelId="grade" label="Бала қай сыныпта оқиды" value={lead.grade}
                        onChange={(e) => setLead((s) => ({ ...s, grade: e.target.value as string }))}>
                  {["3","4","5"].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="city">Сіз қай қалада тұрасыз?</InputLabel>
                <Select labelId="city" label="Сіз қай қалада тұрасыз?" value={lead.city}
                        onChange={(e) => setLead((s) => ({ ...s, city: e.target.value as string }))}>
                  {["Алматы қ.","Астана қ.","Шымкент қ.","Қарағанды қ.","Орал қ.","Өзге"]
                    .map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel id="target">Балаңыздың еліміздің үздік мектептеріне (НЗМ, БИЛ, РФММ) түсуін қалайсыз ба?</InputLabel>
                <Select
                  labelId="target"
                  label="Балаңыздың еліміздің үздік мектептеріне (НЗМ, БИЛ, РФММ) түсуін қалайсыз ба?"
                  value={lead.target}
                  onChange={(e) => setLead((s) => ({ ...s, target: e.target.value as string }))}
                >
                  {["-","Иә","Жоқ","Әлі білмеймін"].map((o) => (
                    <MenuItem key={o} value={o}>{o}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="large"
                  variant="contained"
                  disabled={loading}
                  onClick={onSubmit}
                  sx={{ bgcolor: CORAL, "&:hover": { bgcolor: "#EE5038" }, borderRadius: 999, minWidth: 140 }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: "#fff" }} /> : "Тіркелу"}
                </Button>
              </motion.div>
            </Stack>
          </Box>
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
                <Box key={t} component={motion.div} whileHover={{ y: -1, scale: 1.04 }} whileTap={{ scale: 0.98 }}>
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
        onClose={() => setToast((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setToast((s) => ({ ...s, open: false }))}
          severity={toast.type}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.msg}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}
