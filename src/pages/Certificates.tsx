import * as React from "react";
import {
  Container,
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Paper,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Tabs,
  Tab,
  Chip,
  Divider,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import PersonIcon from "@mui/icons-material/Person";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import PhoneIcon from "@mui/icons-material/Phone";
import { motion, AnimatePresence } from "framer-motion";
import { searchCertificates, downloadCertificate, type Registration } from "@/api/certificates";

const CORAL = "#FA5C44";

/* ====== Animations ====== */
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
};

type SearchTab = "name" | "iin" | "phone";

export default function CertificatesPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = React.useState<SearchTab>("name");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [results, setResults] = React.useState<Registration[]>([]);
  const [downloadingId, setDownloadingId] = React.useState<number | null>(null);

  // Іздеу формасы
  const [lastName, setLastName] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [fullName, setFullName] = React.useState("");
  const [iin, setIin] = React.useState("");
  const [phone, setPhone] = React.useState("");

  // Іздеу
  const handleSearch = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    setResults([]);

    try {
      let params: any = {};
      
      if (activeTab === "name") {
        if (fullName.trim()) {
          params.fullName = fullName.trim();
        } else if (lastName.trim() || firstName.trim()) {
          params.lastName = lastName.trim();
          params.firstName = firstName.trim();
        } else {
          setError("Тегі мен есімін немесе толық аты-жөнін енгізіңіз");
          setLoading(false);
          return;
        }
      } else if (activeTab === "iin") {
        if (!iin.trim()) {
          setError("ЖСН енгізіңіз");
          setLoading(false);
          return;
        }
        params.iin = iin.trim();
      } else if (activeTab === "phone") {
        if (!phone.trim()) {
          setError("Телефон номерін енгізіңіз");
          setLoading(false);
          return;
        }
        let phoneNumber = phone.trim();
        // Заменяем +7 на 8 для поиска в базе
        if (phoneNumber.startsWith("+7")) {
          phoneNumber = "8" + phoneNumber.substring(2);
        }
        params.phone = phoneNumber;
      }

      const data = await searchCertificates(params);
      const registrations = Array.isArray(data) ? data : [data];
      setResults(registrations);
      
      if (registrations.length === 0) {
        setError("Тіркелгі табылмады");
      }
    } catch (err: any) {
      setError(err?.message || "Іздеу кезінде қате");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, lastName, firstName, fullName, iin, phone]);

  // Сертификатты жүктеп алу
  const handleDownload = React.useCallback(async (id: number, studentName: string) => {
    setDownloadingId(id);
    try {
      const blob = await downloadCertificate(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate_${studentName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err?.message || "Сертификатты жүктеп алу кезінде қате");
    } finally {
      setDownloadingId(null);
    }
  }, []);

  // Табты ауыстырғанда форманы тазалау
  React.useEffect(() => {
    setLastName("");
    setFirstName("");
    setFullName("");
    setIin("");
    setPhone("");
    setResults([]);
    setError(null);
  }, [activeTab]);

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* Тақырып */}
      <Stack alignItems="center" sx={{ mb: 3 }}>
        <Box
          component={motion.div}
          variants={fadeUp}
          initial="initial"
          animate="animate"
          sx={{
            bgcolor: CORAL,
            color: "#fff",
            borderRadius: 6,
            px: 3,
            py: 1.2,
            fontWeight: 800,
            textAlign: "center",
            boxShadow: "0 10px 30px rgba(250,92,68,.35)",
          }}
        >
          Сертификат алу
        </Box>
      </Stack>

      <Paper
        component={motion.div}
        variants={fade}
        initial="initial"
        animate="animate"
        elevation={0}
        sx={{
          position: "relative",
          borderRadius: 3,
          border: "6px solid transparent",
          background:
            "radial-gradient(900px 300px at 100% 120%, rgba(47,47,47,.03), transparent 40%) #fff",
          boxShadow: { xs: "0 12px 28px rgba(250,92,68,.14)", md: "0 24px 70px rgba(250,92,68,.18)" },
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            padding: "6px",
            borderRadius: "inherit",
            background: `linear-gradient(135deg, ${CORAL}, rgba(250,92,68,.15))`,
            WebkitMask:
              "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            pointerEvents: "none",
          },
        }}
      >
        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant={isXs ? "scrollable" : "fullWidth"}
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: { xs: "0.875rem", md: "1rem" },
              },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              label="Аты-жөні бойынша"
              value="name"
            />
            <Tab
              icon={<CreditCardIcon />}
              iconPosition="start"
              label="ЖСН бойынша"
              value="iin"
            />
            <Tab
              icon={<PhoneIcon />}
              iconPosition="start"
              label="Телефон бойынша"
              value="phone"
            />
          </Tabs>
        </Box>

        {/* Іздеу формасы */}
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={2}>
            {/* Аты-жөні бойынша іздеу */}
            {activeTab === "name" && (
              <Stack spacing={2}>
                <TextField
                  fullWidth
                  label="Толық аты-жөні"
                  placeholder="Аты-жөні"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSearch();
                  }}
                  helperText="Немесе төмендегі жеке өрістерді пайдаланыңыз"
                />
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Тегі"
                    placeholder="Тегі"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Есімі"
                    placeholder="Есімі"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                  />
                </Stack>
              </Stack>
            )}

            {/* ЖСН бойынша іздеу */}
            {activeTab === "iin" && (
              <TextField
                fullWidth
                label="ЖСН"
                placeholder="123456789012"
                value={iin}
                onChange={(e) => setIin(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                inputProps={{ maxLength: 12 }}
              />
            )}

            {/* Телефон бойынша іздеу */}
            {activeTab === "phone" && (
              <TextField
                fullWidth
                label="Телефон номері"
                placeholder="87001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
              />
            )}

            {/* Іздеу батырмасы */}
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              startIcon={<SearchIcon />}
              component={motion.button as any}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              sx={{
                bgcolor: CORAL,
                color: "#fff",
                borderRadius: 999,
                px: 3,
                py: 1.5,
                fontWeight: 700,
                boxShadow: "0 8px 24px rgba(250,92,68,.3)",
                "&:hover": {
                  bgcolor: "#E04A32",
                  boxShadow: "0 10px 28px rgba(250,92,68,.4)",
                },
              }}
            >
              Іздеу
            </Button>
          </Stack>
        </Box>

        {/* Loading bar */}
        {loading && (
          <LinearProgress sx={{ "& .MuiLinearProgress-bar": { transition: "transform .2s" } }} />
        )}

        {/* Error */}
        {error && !loading && (
          <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Results */}
        {results.length > 0 && (
          <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Табылды: {results.length}
            </Typography>
            <Stack spacing={2}>
              <AnimatePresence>
                {results.map((registration) => (
                  <Card
                    key={registration.id}
                    component={motion.div}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3 }}
                    sx={{
                      boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                      borderRadius: 2,
                      "&:hover": {
                        boxShadow: "0 12px 32px rgba(250,92,68,.15)",
                      },
                    }}
                  >
                    <CardContent>
                      <Stack spacing={1.5}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                              {registration.studentFullName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              ID: {registration.id}
                            </Typography>
                          </Box>
                          <Chip
                            label={registration.studentGrade}
                            size="small"
                            sx={{
                              bgcolor: CORAL,
                              color: "#fff",
                              fontWeight: 700,
                            }}
                          />
                        </Stack>

                        <Stack spacing={0.5}>
                          <Typography variant="body2">
                            <strong>Ата-ана:</strong> {registration.parentFullName}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Қала:</strong> {registration.city || "—"}
                          </Typography>
                          {registration.iin && (
                            <Typography variant="body2">
                              <strong>ЖСН:</strong> {registration.iin}
                            </Typography>
                          )}
                        </Stack>

                        <Button
                          variant="contained"
                          fullWidth
                          startIcon={<DownloadIcon />}
                          onClick={() => handleDownload(registration.id, registration.studentFullName)}
                          disabled={downloadingId === registration.id}
                          component={motion.button as any}
                          whileTap={{ scale: 0.98 }}
                          sx={{
                            mt: 1,
                            bgcolor: CORAL,
                            color: "#fff",
                            borderRadius: 999,
                            py: 1.2,
                            fontWeight: 700,
                            boxShadow: "0 8px 24px rgba(250,92,68,.3)",
                            "&:hover": {
                              bgcolor: "#E04A32",
                              boxShadow: "0 10px 28px rgba(250,92,68,.4)",
                            },
                          }}
                        >
                          {downloadingId === registration.id ? "Жүктелуде..." : "Сертификатты жүктеп алу"}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </AnimatePresence>
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
}