import * as React from "react";
import {
  Container, Box, Stack, Typography, TextField, IconButton, Button,
  Table, TableHead, TableBody, TableRow, TableCell, Paper, LinearProgress,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import { listRegistrations, type Registration } from "@/api/registrations";

export default function RegistrationsPage() {
  const [data, setData] = React.useState<Registration[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [q, setQ] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const rows = await listRegistrations();
      // На всякий случай сортируем по id
      setData(rows.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)));
    } catch (e: any) {
      setError(e?.message || "Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = React.useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return data;
    return data.filter((r) =>
      [r.parentFullName, r.studentFullName, r.studentPhone, r.studentGrade, r.city]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(s))
    );
  }, [q, data]);

  function toCSV(rows: Registration[]) {
    const header = [
      "ID",
      "Parent",
      "Student",
      "Phone",
      "Grade",
      "City",
      "WantsSelectiveSchool",
    ];
    const body = rows.map((r) => [
      r.id ?? "",
      r.parentFullName ?? "",
      r.studentFullName ?? "",
      r.studentPhone ?? "",
      r.studentGrade ?? "",
      r.city ?? "",
      r.wantsSelectiveSchool ? "Yes" : "No",
    ]);
    return [header, ...body].map((row) =>
      row
        .map((v) => {
          const s = String(v ?? "");
          // Экранируем запятые и кавычки
          const needsQuotes = /[",\n]/.test(s);
          const safe = s.replace(/"/g, '""');
          return needsQuotes ? `"${safe}"` : safe;
        })
        .join(",")
    ).join("\n");
  }

  function downloadCSV() {
    const csv = toCSV(filtered);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "registrations.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={900}>Заявки</Typography>
        <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Поиск: имя, телефон, город…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} />,
              }}
            />
            <IconButton onClick={load} title="Обновить">
              <RefreshIcon />
            </IconButton>
            <Button onClick={downloadCSV} variant="outlined" startIcon={<DownloadIcon />}>
              Экспорт CSV
            </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ border: "1px solid #eee" }}>
        {loading && <LinearProgress />}
        {error && (
          <Box sx={{ p: 2, color: "error.main" }}>{error}</Box>
        )}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ата-ана</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Оқушы</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Телефон</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Сынып</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Қала</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>НЗМ/БИЛ/РФММ?</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id ?? `${r.parentFullName}-${r.studentPhone}`}>
                <TableCell>{r.id}</TableCell>
                <TableCell>{r.parentFullName}</TableCell>
                <TableCell>{r.studentFullName}</TableCell>
                <TableCell>{r.studentPhone}</TableCell>
                <TableCell>{r.studentGrade}</TableCell>
                <TableCell>{r.city}</TableCell>
                <TableCell>{r.wantsSelectiveSchool ? "Иә" : "Жоқ"}</TableCell>
              </TableRow>
            ))}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7}>
                  <Box sx={{ p: 3, textAlign: "center", opacity: 0.7 }}>
                    Ничего не найдено.
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
