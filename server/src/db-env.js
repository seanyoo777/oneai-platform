function useDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

module.exports = { useDatabase };
