import app from "./app";

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`✅ Users service listening on http://localhost:${PORT}`);
});
