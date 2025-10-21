function convertYYYYMMDDToExcelSerial(yyyymmdd) {
  if (!yyyymmdd || !/^\d{4}-\d{2}-\d{2}$/.test(yyyymmdd)) return null;
  const [y, m, d] = yyyymmdd.split("-").map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d));
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  return Math.floor((dateObj - excelEpoch) / (24 * 60 * 60 * 1000));
}
module.exports = { convertYYYYMMDDToExcelSerial };
