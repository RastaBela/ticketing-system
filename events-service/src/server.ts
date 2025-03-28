import app from "./app";

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);
});
