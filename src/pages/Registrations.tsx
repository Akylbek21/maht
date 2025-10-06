import * as React from "react";
import {
  Container, Box, Stack, Typography, TextField, IconButton, Button,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, LinearProgress,
  TablePagination, Tooltip, Chip, Divider, InputAdornment
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { motion, AnimatePresence } from "framer-motion";
import { listRegistrations, type Registration } from "@/api/registrations";

type Row = Registration & { createdAt?: string; updatedAt?: string };

const CORAL = "#FA5C44";
// const DARK = "#2F2F2F";

/* ====== Animations ====== */
const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};
const fade = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.35 } },
};
const tableStagger = {
  animate: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } },
};
const rowAnim = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.25 } },
};

/* ====== Helpers ====== */
function toCSVExcel(data: Row[]) {
  const header = [
    ,
    "Parent",
    "Student",
    "Phone",
    "Grade",
    "City",
    "WantsSelectiveSchool",
    "CreatedAt",
  ];

  const body = data.map((r) => [
    r.id ?? "",
    r.parentFullName ?? "",
    r.studentFullName ?? "",
    r.studentPhone ? `="${String(r.studentPhone)}"` : "",
    r.studentGrade ?? "",
    r.city ?? "",
    r.wantsSelectiveSchool ? "Yes" : "No",
    r.createdAt ?? "",
  ]);

  const escape = (s: unknown) => {
    const v = String(s ?? "");
    const need = /[",\n\r]/.test(v);
    const safe = v.replace(/"/g, '""');
    return need ? `"${safe}"` : safe;
  };

  const sepLine = "sep=,";
  const rowsCsv = [header, ...body].map((r) => r.map(escape).join(",")).join("\r\n");
  return "\uFEFF" + sepLine + "\r\n" + rowsCsv; // BOM + CRLF + sep
}

export default function RegistrationsPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [q, setQ] = React.useState("");
  const [debouncedQ, setDebouncedQ] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  // --- debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [q]);

  // --- load
  const load = React.useCallback(async () => {
    const ac = new AbortController();
    setLoading(true);
    setError(null);
    try {
      const data = await listRegistrations(ac.signal);
      const sorted = [...data].sort((a, b) => {
        const aT = (a as Row).createdAt ? Date.parse((a as Row).createdAt!) : 0;
        const bT = (b as Row).createdAt ? Date.parse((b as Row).createdAt!) : 0;
        if (aT !== bT) return bT - aT;
        return (b.id ?? 0) - (a.id ?? 0);
      }) as Row[];
      setRows(sorted);
      setPage(0);
    } catch (e: any) {
      if (e?.name !== "AbortError") setError(e?.message || "Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
    return () => ac.abort();
  }, []);

  React.useEffect(() => {
    const p = load();
    return () => {
      p.then((cancel) => {
        if (typeof cancel === "function") cancel();
      }).catch(() => { /* ignore */ });
    };
  }, [load]);

  // --- filter
  const filtered = React.useMemo(() => {
    if (!debouncedQ) return rows;
    return rows.filter((r) =>
      [r.parentFullName, r.studentFullName, r.studentPhone, r.studentGrade, r.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(debouncedQ))
    );
  }, [debouncedQ, rows]);

  // --- paginate
  const paginated = React.useMemo(() => {
    const start = page * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  // --- csv
  function downloadCSV() {
    const csv = toCSVExcel(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const skeletonRows = Array.from({ length: Math.min(rowsPerPage, 8) });

  return (
    <Container sx={{ py: { xs: 4, md: 6 } }}>
      {/* Coral chip title */}
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
          Заявки на участие
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
        {/* Toolbar */}
        <Box
          component={motion.div}
          variants={fadeUp}
          initial="initial"
          animate="animate"
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            display: "flex",
            gap: 2,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #f0f0f0",
            background:
              "radial-gradient(900px 300px at 0% -20%, rgba(250,92,68,.05), transparent 40%), #fff",
          }}
        >
          <Typography variant={isXs ? "h6" : "h5"} fontWeight={900} sx={{ letterSpacing: -0.2 }}>
            Заявки
          </Typography>

          {/* responsive controls */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="flex-end"
            flexWrap="wrap"
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            <TextField
              size="small"
              fullWidth={isXs}
              placeholder="Поиск: имя, телефон, город…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              inputProps={{ "aria-label": "Поиск заявок" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ opacity: 0.7 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                minWidth: { xs: "100%", sm: 240, md: 280 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 999,
                  transition: "box-shadow .2s ease, transform .12s ease",
                  boxShadow: "0 8px 24px rgba(0,0,0,.06)",
                  "&:hover": { transform: "translateY(-1px)" },
                  "&.Mui-focused": { boxShadow: "0 0 0 4px rgba(250,92,68,.15)" },
                },
              }}
            />

            <Tooltip title="Обновить">
              <span>
                <IconButton
                  onClick={load}
                  disabled={loading}
                  aria-label="Обновить"
                  component={motion.button as any}
                  whileTap={{ scale: 0.96 }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  sx={{
                    alignSelf: { xs: "flex-end", sm: "center" },
                    borderRadius: 999,
                    boxShadow: "0 8px 24px rgba(0,0,0,.06)",
                    "&:hover": { boxShadow: "0 10px 28px rgba(0,0,0,.12)" },
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Button
              onClick={downloadCSV}
              variant="contained"
              color="secondary"
              fullWidth={isXs}
              component={motion.button as any}
              whileTap={{ scale: 0.98 }}
              whileHover={{ y: -1 }}
              startIcon={<DownloadIcon />}
              sx={{
                borderRadius: 999,
                px: 2.5,
                boxShadow: "0 8px 24px rgba(0,0,0,.08)",
                "&:hover": { boxShadow: "0 10px 28px rgba(0,0,0,.12)" },
              }}
            >
              Экспорт CSV
            </Button>
          </Stack>
        </Box>

        {/* Top loading bar */}
        {loading && (
          <LinearProgress sx={{ "& .MuiLinearProgress-bar": { transition: "transform .2s" } }} />
        )}

        {/* Error stripe */}
        {error && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ px: { xs: 2, md: 3 }, py: 1.5, color: "error.main", borderTop: "1px dashed #eee" }}
          >
            <ErrorOutlineIcon fontSize="small" />
            <Typography variant="body2" sx={{ mr: 1 }}>
              {error}
            </Typography>
            <Button size="small" onClick={load}>
              Повторить
            </Button>
          </Stack>
        )}

        {/* Table (desktop/tablet) */}
        <Box sx={{ px: { xs: 1, md: 2 }, pb: 1, backgroundColor: "#fff", display: { xs: "none", sm: "block" } }}>
          <Table
            size="small"
            aria-label="Таблица заявок"
            sx={{
              tableLayout: "fixed",
              "& thead th": {
                fontWeight: 800,
                letterSpacing: 0.1,
                color: "text.secondary",
                bgcolor: "#F7F9FC",
                borderBottomColor: "divider",
              },
              "& tbody tr:hover": {
                background: "linear-gradient(90deg, rgba(250,92,68,.06), transparent 60%)",
              },
            }}
          >
            <TableHead>
              <TableRow>
                
                <TableCell>Ата-ана</TableCell>
                <TableCell>Оқушы</TableCell>
                <TableCell>Телефон</TableCell>
                <TableCell sx={{ width: 100 }}>Сынып</TableCell>
                <TableCell>Қала</TableCell>
                <TableCell sx={{ width: 140 }}>НЗМ/БИЛ/РФММ?</TableCell>
                <TableCell sx={{ width: 170 }}>Создано</TableCell>
              </TableRow>
            </TableHead>

            <TableBody component={motion.tbody} variants={tableStagger} initial="initial" animate="animate">
              {/* skeleton */}
              {loading && rows.length === 0 &&
                Array.from({ length: Math.min(rowsPerPage, 8) }).map((_, i) => (
                  <TableRow key={`sk-${i}`}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <TableCell key={j}>
                        <Box
                          sx={{
                            height: 18,
                            borderRadius: 1,
                            background:
                              "linear-gradient(90deg, #f1f3f6 25%, #e9edf3 37%, #f1f3f6 63%)",
                            backgroundSize: "400% 100%",
                            animation: "shimmer 1.4s ease infinite",
                            "@keyframes shimmer": {
                              "0%": { backgroundPosition: "100% 0" },
                              "100%": { backgroundPosition: "-100% 0" },
                            },
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {/* rows */}
              <AnimatePresence initial={false}>
                {paginated.map((r) => (
                  <TableRow
                    key={r.id ?? `${r.parentFullName}-${r.studentPhone}`}
                    component={motion.tr}
                    variants={rowAnim}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    whileHover={{ scale: 1.002 }}
                    transition={{ type: "spring", stiffness: 250, damping: 22 }}
                    sx={{ "& td": { borderBottomColor: "rgba(0,0,0,0.06)" } }}
                  >
                    
                    <TableCell>
                      <Typography fontWeight={600}>{r.parentFullName}</Typography>
                    </TableCell>
                    <TableCell>{r.studentFullName}</TableCell>
                    <TableCell>{r.studentPhone}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={r.studentGrade}
                        sx={{
                          bgcolor: CORAL,
                          color: "#fff",
                          fontWeight: 700,
                          "& .MuiChip-label": { px: 0.8 },
                        }}
                      />
                    </TableCell>
                    <TableCell>{r.city}</TableCell>
                    <TableCell>{r.wantsSelectiveSchool ? "Иә" : "Жоқ"}</TableCell>
                    <TableCell>
                      {r.createdAt ? r.createdAt.slice(0, 19).replace("T", " ") : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </AnimatePresence>

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Box
                      component={motion.div}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35 }}
                      sx={{ p: 6, textAlign: "center", opacity: 0.9 }}
                    >
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 72, height: 72,
                          borderRadius: "50%",
                          mb: 1.5,
                          background: "radial-gradient(400px 120px at 50% 20%, rgba(250,92,68,.12), transparent 40%)",
                          border: `2px dashed ${CORAL}`,
                        }}
                      >
                        <SearchIcon sx={{ color: CORAL }} />
                      </Box>
                      <Typography variant="h6" fontWeight={800} gutterBottom>
                        Ничего не найдено
                      </Typography>
                      <Typography color="text.secondary">
                        Измени запрос поиска или обнови список заявок.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        {/* Mobile list (cards) */}
        <Box sx={{ display: { xs: "block", sm: "none" }, px: 1, pb: 1, backgroundColor: "#fff" }}>
          <Stack spacing={1.25}>
            {loading && rows.length === 0 &&
              skeletonRows.map((_, i) => (
                <Box key={`msk-${i}`} sx={{ p: 2, borderRadius: 2, bgcolor: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,.06)" }}>
                  <Box sx={{ height: 16, mb: 1, borderRadius: 1, bgcolor: "#f1f3f6" }} />
                  <Box sx={{ height: 14, mb: .8, borderRadius: 1, bgcolor: "#f1f3f6" }} />
                  <Box sx={{ height: 14, width: "70%", borderRadius: 1, bgcolor: "#f1f3f6" }} />
                </Box>
              ))
            }

            {!loading && paginated.map((r) => (
              <Box
                key={r.id ?? `${r.parentFullName}-${r.studentPhone}`}
                component={motion.div}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: .25 }}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "#fff",
                  boxShadow: "0 10px 26px rgba(0,0,0,.08)",
                  border: "1px solid #f1f3f6",
                }}
              >
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography fontWeight={800}>#{r.id}</Typography>
                    <Chip size="small" label={r.studentGrade || "—"} sx={{ bgcolor: CORAL, color: "#fff", fontWeight: 700 }} />
                  </Stack>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>Ата-ана</Typography>
                  <Typography fontWeight={600}>{r.parentFullName || "—"}</Typography>

                  <Typography variant="body2" sx={{ color: "text.secondary", mt: .5 }}>Оқушы</Typography>
                  <Typography>{r.studentFullName || "—"}</Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: .5, flexWrap: "wrap" }}>
                    <Chip size="small" variant="outlined" label={r.city || "Қала жоқ"} />
                    <Chip size="small" variant="outlined" label={r.wantsSelectiveSchool ? "Иә" : "Жоқ"} />
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: .5 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>Телефон:</Typography>
                    <Typography variant="body2">{r.studentPhone || "—"}</Typography>
                  </Stack>

                  <Typography variant="caption" sx={{ color: "text.secondary", mt: .5 }}>
                    {r.createdAt ? r.createdAt.slice(0,19).replace("T"," ") : "—"}
                  </Typography>
                </Stack>
              </Box>
            ))}

            {!loading && filtered.length === 0 && (
              <Box sx={{ p: 3, textAlign: "center", opacity: .9 }}>
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64, height: 64,
                    borderRadius: "50%",
                    mb: 1.5,
                    background: "radial-gradient(400px 120px at 50% 20%, rgba(250,92,68,.12), transparent 40%)",
                    border: `2px dashed ${CORAL}`,
                  }}
                >
                  <SearchIcon sx={{ color: CORAL }} />
                </Box>
                <Typography variant="subtitle1" fontWeight={800} gutterBottom>
                  Ничего не найдено
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Измени запрос или обнови список заявок.
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <Divider />

        {/* Footer bar with pagination */}
        <Box
          component={motion.div}
          variants={fadeUp}
          initial="initial"
          animate="animate"
          sx={{
            px: { xs: .5, md: 2 },
            py: 0.5,
            display: "flex",
            justifyContent: { xs: "center", sm: "flex-end" },
            background: "radial-gradient(900px 300px at 100% 120%, rgba(47,47,47,.06), transparent 40%), #fff",
          }}
        >
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_e, p) => setPage(p)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50, 100]}
            labelRowsPerPage={isXs ? undefined : "Строк на странице"}
          />
        </Box>
      </Paper>
    </Container>
  );
}
